const express = require("express");
const pool = require("../db/connection");
const router = express.Router();

// GET /api/assignments — list assignments with vehicle and driver info
router.get("/", async (req, res) => {
  try {
    const { status, driver_id } = req.query;
    let query = `
      SELECT a.*,
        v.vehicle_code, v.make, v.model AS vehicle_model, v.current_battery_pct,
        d.name AS driver_name, d.email AS driver_email
      FROM assignments a
      JOIN vehicles v ON a.vehicle_id = v.id
      JOIN drivers d ON a.driver_id = d.id
    `;
    const conditions = [];
    const params = [];

    if (status) {
      params.push(status);
      conditions.push(`a.status = $${params.length}`);
    } else {
      // By default, only return pending and active assignments (exclude completed/cancelled)
      conditions.push(`a.status IN ('pending', 'active')`);
    }
    
    if (driver_id) {
      params.push(driver_id);
      conditions.push(`a.driver_id = $${params.length}`);
    }

    if (conditions.length > 0) {
      query += " WHERE " + conditions.join(" AND ");
    }
    query += " ORDER BY a.assigned_at DESC";

    const { rows } = await pool.query(query, params);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/assignments/:id — get single assignment with details
router.get("/:id", async (req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT a.*,
        v.vehicle_code, v.make, v.model AS vehicle_model, v.current_battery_pct,
        v.range_miles, v.lat, v.lng,
        d.name AS driver_name, d.email AS driver_email, d.phone AS driver_phone
      FROM assignments a
      JOIN vehicles v ON a.vehicle_id = v.id
      JOIN drivers d ON a.driver_id = d.id
      WHERE a.id = $1`,
      [req.params.id]
    );
    if (rows.length === 0) return res.status(404).json({ error: "Assignment not found" });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/assignments — assign a vehicle to a driver
router.post("/", async (req, res) => {
  const client = await pool.connect();
  try {
    const { vehicle_id, driver_id, notes } = req.body;
    if (!vehicle_id || !driver_id) {
      return res.status(400).json({ error: "vehicle_id and driver_id are required" });
    }

    await client.query("BEGIN");

    // Check vehicle is available
    const { rows: vehicleRows } = await client.query(
      "SELECT * FROM vehicles WHERE id = $1", [vehicle_id]
    );
    if (vehicleRows.length === 0) {
      await client.query("ROLLBACK");
      return res.status(404).json({ error: "Vehicle not found" });
    }
    if (vehicleRows[0].status !== "available") {
      await client.query("ROLLBACK");
      return res.status(409).json({ error: `Vehicle is currently ${vehicleRows[0].status}` });
    }

    // Check driver is available
    const { rows: driverRows } = await client.query(
      "SELECT * FROM drivers WHERE id = $1", [driver_id]
    );
    if (driverRows.length === 0) {
      await client.query("ROLLBACK");
      return res.status(404).json({ error: "Driver not found" });
    }
    if (driverRows[0].status !== "available") {
      await client.query("ROLLBACK");
      return res.status(409).json({ error: `Driver is currently ${driverRows[0].status}` });
    }

    // Check for existing pending/active assignments for this driver
    const { rows: existingRows } = await client.query(
      "SELECT id FROM assignments WHERE driver_id = $1 AND status IN ('pending', 'active')",
      [driver_id]
    );
    if (existingRows.length > 0) {
      await client.query("ROLLBACK");
      return res.status(409).json({ error: "Driver already has a pending or active assignment" });
    }

    // Create assignment
    const { rows: assignment } = await client.query(
      `INSERT INTO assignments (vehicle_id, driver_id, status, notes)
       VALUES ($1, $2, 'pending', $3) RETURNING *`,
      [vehicle_id, driver_id, notes || null]
    );

    // NOTE: We do NOT change vehicle.status to 'assigned'
    // Vehicle status only reflects physical state (available/charging/maintenance)
    // Assignment status is tracked separately in assignments table

    await client.query("COMMIT");

    res.status(201).json({
      ...assignment[0],
      message: `${vehicleRows[0].vehicle_code} assigned to ${driverRows[0].name}`,
    });
  } catch (err) {
    await client.query("ROLLBACK");
    res.status(500).json({ error: err.message });
  } finally {
    client.release();
  }
});

// PATCH /api/assignments/:id/start — driver starts their shift
router.patch("/:id/start", async (req, res) => {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    const { rows } = await client.query(
      "SELECT * FROM assignments WHERE id = $1", [req.params.id]
    );
    if (rows.length === 0) {
      await client.query("ROLLBACK");
      return res.status(404).json({ error: "Assignment not found" });
    }
    if (rows[0].status !== "pending") {
      await client.query("ROLLBACK");
      return res.status(409).json({ error: `Cannot start — assignment is ${rows[0].status}` });
    }

    // Update assignment
    const { rows: updated } = await client.query(
      "UPDATE assignments SET status = 'active', started_at = NOW() WHERE id = $1 RETURNING *",
      [req.params.id]
    );

    // Update driver status
    await client.query("UPDATE drivers SET status = 'on_trip' WHERE id = $1", [rows[0].driver_id]);

    await client.query("COMMIT");
    res.json({ ...updated[0], message: "Shift started" });
  } catch (err) {
    await client.query("ROLLBACK");
    res.status(500).json({ error: err.message });
  } finally {
    client.release();
  }
});

// PATCH /api/assignments/:id/complete — driver ends their shift
router.patch("/:id/complete", async (req, res) => {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    const { rows } = await client.query(
      "SELECT * FROM assignments WHERE id = $1", [req.params.id]
    );
    if (rows.length === 0) {
      await client.query("ROLLBACK");
      return res.status(404).json({ error: "Assignment not found" });
    }
    if (rows[0].status !== "active") {
      await client.query("ROLLBACK");
      return res.status(409).json({ error: `Cannot complete — assignment is ${rows[0].status}` });
    }

    // Update assignment
    const { rows: updated } = await client.query(
      "UPDATE assignments SET status = 'completed', completed_at = NOW() WHERE id = $1 RETURNING *",
      [req.params.id]
    );

    // NOTE: We do NOT change vehicle.status
    // Vehicle status only reflects physical state (available/charging/maintenance)
    
    // Release driver
    await client.query("UPDATE drivers SET status = 'available' WHERE id = $1", [rows[0].driver_id]);

    await client.query("COMMIT");
    res.json({ ...updated[0], message: "Shift completed" });
  } catch (err) {
    await client.query("ROLLBACK");
    res.status(500).json({ error: err.message });
  } finally {
    client.release();
  }
});

// PATCH /api/assignments/:id/cancel — cancel a pending assignment
router.patch("/:id/cancel", async (req, res) => {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    const { rows } = await client.query(
      "SELECT * FROM assignments WHERE id = $1", [req.params.id]
    );
    if (rows.length === 0) {
      await client.query("ROLLBACK");
      return res.status(404).json({ error: "Assignment not found" });
    }
    if (rows[0].status !== "pending" && rows[0].status !== "active") {
      await client.query("ROLLBACK");
      return res.status(409).json({ error: `Cannot cancel — assignment is ${rows[0].status}` });
    }

    // Update assignment to cancelled
    await client.query(
      "UPDATE assignments SET status = 'cancelled' WHERE id = $1", [req.params.id]
    );
    
    // NOTE: We do NOT change vehicle.status
    // Vehicle status only reflects physical state (available/charging/maintenance)
    // Cancelling assignment doesn't change where the vehicle is physically
    
    // Release driver back to available
    await client.query("UPDATE drivers SET status = 'available' WHERE id = $1", [rows[0].driver_id]);

    await client.query("COMMIT");
    res.json({ message: "Assignment cancelled" });
  } catch (err) {
    await client.query("ROLLBACK");
    res.status(500).json({ error: err.message });
  } finally {
    client.release();
  }
});

module.exports = router;