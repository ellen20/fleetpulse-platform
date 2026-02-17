const express = require("express");
const pool = require("../db/connection");
const router = express.Router();

// GET /api/drivers — list all drivers
router.get("/", async (req, res) => {
  try {
    const { status } = req.query;
    let query = "SELECT id, name, email, phone, license_number, status, created_at FROM drivers ORDER BY id";
    const params = [];

    if (status) {
      query = "SELECT id, name, email, phone, license_number, status, created_at FROM drivers WHERE status = $1 ORDER BY id";
      params.push(status);
    }

    const { rows } = await pool.query(query, params);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/drivers/:id — get single driver
router.get("/:id", async (req, res) => {
  try {
    const { rows } = await pool.query(
      "SELECT id, name, email, phone, license_number, status, created_at FROM drivers WHERE id = $1",
      [req.params.id]
    );
    if (rows.length === 0) return res.status(404).json({ error: "Driver not found" });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/drivers/login — simple PIN-based login for driver PWA
router.post("/login", async (req, res) => {
  try {
    const { email, pin } = req.body;
    if (!email || !pin) return res.status(400).json({ error: "Email and PIN required" });

    const { rows } = await pool.query(
      "SELECT id, name, email, status FROM drivers WHERE email = $1 AND pin = $2",
      [email, pin]
    );

    if (rows.length === 0) return res.status(401).json({ error: "Invalid credentials" });
    res.json({ driver: rows[0], message: "Login successful" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PATCH /api/drivers/:id — update driver status
router.patch("/:id", async (req, res) => {
  try {
    const { status } = req.body;
    const validStatuses = ["available", "on_trip", "off_duty"];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: `Status must be: ${validStatuses.join(", ")}` });
    }

    const { rows } = await pool.query(
      "UPDATE drivers SET status = $1 WHERE id = $2 RETURNING id, name, email, status",
      [status, req.params.id]
    );

    if (rows.length === 0) return res.status(404).json({ error: "Driver not found" });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
