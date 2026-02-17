const express = require("express");
const pool = require("../db/connection");
const router = express.Router();

// GET /api/vehicles — list all vehicles
router.get("/", async (req, res) => {
  try {
    const { status } = req.query;
    let query = "SELECT * FROM vehicles ORDER BY id";
    const params = [];

    if (status) {
      query = "SELECT * FROM vehicles WHERE status = $1 ORDER BY id";
      params.push(status);
    }

    const { rows } = await pool.query(query, params);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/vehicles/:id — get single vehicle
router.get("/:id", async (req, res) => {
  try {
    const { rows } = await pool.query("SELECT * FROM vehicles WHERE id = $1", [req.params.id]);
    if (rows.length === 0) return res.status(404).json({ error: "Vehicle not found" });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PATCH /api/vehicles/:id — update vehicle fields
router.patch("/:id", async (req, res) => {
  try {
    const allowed = ["status", "current_battery_pct", "range_miles", "lat", "lng", "cabin_temp_f", "odometer"];
    const updates = [];
    const values = [];
    let i = 1;

    for (const [key, val] of Object.entries(req.body)) {
      if (allowed.includes(key)) {
        updates.push(`${key} = $${i}`);
        values.push(val);
        i++;
      }
    }

    if (updates.length === 0) return res.status(400).json({ error: "No valid fields to update" });

    values.push(req.params.id);
    const query = `UPDATE vehicles SET ${updates.join(", ")} WHERE id = $${i} RETURNING *`;
    const { rows } = await pool.query(query, values);

    if (rows.length === 0) return res.status(404).json({ error: "Vehicle not found" });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
