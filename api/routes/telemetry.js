const express = require("express");
const pool = require("../db/connection");
const router = express.Router();

// GET /api/telemetry/:vehicleId — get telemetry for a vehicle
router.get("/:vehicleId", async (req, res) => {
  try {
    const { limit, assignment_id } = req.query;
    let query = "SELECT * FROM telemetry WHERE vehicle_id = $1";
    const params = [req.params.vehicleId];

    if (assignment_id) {
      params.push(assignment_id);
      query += ` AND assignment_id = $${params.length}`;
    }

    query += " ORDER BY recorded_at DESC";

    if (limit) {
      params.push(parseInt(limit));
      query += ` LIMIT $${params.length}`;
    }

    const { rows } = await pool.query(query, params);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/telemetry/:vehicleId/latest — get most recent telemetry
router.get("/:vehicleId/latest", async (req, res) => {
  try {
    const { rows } = await pool.query(
      "SELECT * FROM telemetry WHERE vehicle_id = $1 ORDER BY recorded_at DESC LIMIT 1",
      [req.params.vehicleId]
    );
    if (rows.length === 0) return res.status(404).json({ error: "No telemetry found" });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/telemetry — record a new telemetry snapshot
router.post("/", async (req, res) => {
  try {
    const { vehicle_id, assignment_id, battery_pct, speed_mph, lat, lng, odometer, cabin_temp_f, charging } = req.body;

    if (!vehicle_id) return res.status(400).json({ error: "vehicle_id is required" });

    const { rows } = await pool.query(
      `INSERT INTO telemetry (vehicle_id, assignment_id, battery_pct, speed_mph, lat, lng, odometer, cabin_temp_f, charging)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9) RETURNING *`,
      [vehicle_id, assignment_id || null, battery_pct, speed_mph || 0, lat, lng, odometer, cabin_temp_f, charging || false]
    );

    // Also update the vehicle's current state
    const vehicleUpdates = [];
    const vehicleValues = [];
    let i = 1;

    if (battery_pct !== undefined) { vehicleUpdates.push(`current_battery_pct = $${i}`); vehicleValues.push(battery_pct); i++; }
    if (lat !== undefined) { vehicleUpdates.push(`lat = $${i}`); vehicleValues.push(lat); i++; }
    if (lng !== undefined) { vehicleUpdates.push(`lng = $${i}`); vehicleValues.push(lng); i++; }
    if (odometer !== undefined) { vehicleUpdates.push(`odometer = $${i}`); vehicleValues.push(odometer); i++; }
    if (cabin_temp_f !== undefined) { vehicleUpdates.push(`cabin_temp_f = $${i}`); vehicleValues.push(cabin_temp_f); i++; }

    if (vehicleUpdates.length > 0) {
      vehicleValues.push(vehicle_id);
      await pool.query(
        `UPDATE vehicles SET ${vehicleUpdates.join(", ")} WHERE id = $${i}`,
        vehicleValues
      );
    }

    res.status(201).json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
