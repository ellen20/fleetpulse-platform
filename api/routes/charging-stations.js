const express = require("express");
const pool = require("../db/connection");
const router = express.Router();

// GET /api/charging-stations — list all charging stations
router.get("/", async (req, res) => {
  try {
    const { status } = req.query;
    let query = "SELECT * FROM charging_stations ORDER BY id";
    const params = [];

    if (status) {
      query = "SELECT * FROM charging_stations WHERE status = $1 ORDER BY id";
      params.push(status);
    }

    const { rows } = await pool.query(query, params);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/charging-stations/:id — get single charging station
router.get("/:id", async (req, res) => {
  try {
    const { rows } = await pool.query(
      "SELECT * FROM charging_stations WHERE id = $1",
      [req.params.id]
    );
    if (rows.length === 0) return res.status(404).json({ error: "Charging station not found" });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PATCH /api/charging-stations/:id — update available ports
router.patch("/:id", async (req, res) => {
  try {
    const { available_ports, status } = req.body;
    const updates = [];
    const values = [];
    let i = 1;

    if (available_ports !== undefined) {
      updates.push(`available_ports = $${i}`);
      values.push(available_ports);
      i++;
    }
    if (status) {
      updates.push(`status = $${i}`);
      values.push(status);
      i++;
    }

    if (updates.length === 0) {
      return res.status(400).json({ error: "No valid fields to update" });
    }

    values.push(req.params.id);
    const query = `UPDATE charging_stations SET ${updates.join(", ")} WHERE id = $${i} RETURNING *`;
    const { rows } = await pool.query(query, values);

    if (rows.length === 0) return res.status(404).json({ error: "Charging station not found" });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;