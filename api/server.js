require('dotenv').config();

const express = require("express");
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Request logging
app.use((req, res, next) => {
  const start = Date.now();
  res.on("finish", () => {
    const ms = Date.now() - start;
    const color = res.statusCode >= 400 ? "\x1b[31m" : "\x1b[32m";
    console.log(`${color}${req.method}\x1b[0m ${req.path} → ${res.statusCode} (${ms}ms)`);
  });
  next();
});

// Routes
app.use("/api/vehicles", require("./routes/vehicles"));
app.use("/api/drivers", require("./routes/drivers"));
app.use("/api/assignments", require("./routes/assignments"));
app.use("/api/telemetry", require("./routes/telemetry"));
app.use("/api/charging-stations", require("./routes/charging-stations")); 

// Health check
app.get("/api/health", async (req, res) => {
  const pool = require("./db/connection");
  try {
    const { rows } = await pool.query("SELECT NOW() as time");
    res.json({
      status: "ok",
      database: "connected",
      time: rows[0].time,
      uptime: process.uptime(),
    });
  } catch (err) {
    res.status(503).json({ status: "error", database: "disconnected", error: err.message });
  }
});

// Export app for testing
module.exports = app;

// API overview
app.get("/api", (req, res) => {
  res.json({
    name: "FleetPulse API",
    version: "1.0.0",
    endpoints: {
      vehicles: {
        "GET /api/vehicles": "List all vehicles (?status=available|assigned|charging|maintenance)",
        "GET /api/vehicles/:id": "Get vehicle by ID",
        "PATCH /api/vehicles/:id": "Update vehicle fields",
      },
      drivers: {
        "GET /api/drivers": "List all drivers (?status=available|on_trip|off_duty)",
        "GET /api/drivers/:id": "Get driver by ID",
        "POST /api/drivers/login": "Driver login { email, pin }",
        "PATCH /api/drivers/:id": "Update driver status",
      },
      assignments: {
        "GET /api/assignments": "List assignments (?status=pending|active|completed&driver_id=N)",
        "GET /api/assignments/:id": "Get assignment details",
        "POST /api/assignments": "Create assignment { vehicle_id, driver_id, notes? }",
        "PATCH /api/assignments/:id/start": "Start shift",
        "PATCH /api/assignments/:id/complete": "End shift",
        "PATCH /api/assignments/:id/cancel": "Cancel pending assignment",
      },
      telemetry: {
        "GET /api/telemetry/:vehicleId": "Get telemetry (?limit=N&assignment_id=N)",
        "GET /api/telemetry/:vehicleId/latest": "Get latest snapshot",
        "POST /api/telemetry": "Record telemetry { vehicle_id, battery_pct, speed_mph, lat, lng, ... }",
      },
      system: {
        "GET /api/health": "Health check",
        "GET /api": "This overview",
      },
    },
  });
});

// 404
app.use((req, res) => {
  res.status(404).json({ error: `Route not found: ${req.method} ${req.path}` });
});

// Only start server if this file is run directly (not imported in tests)
if (require.main === module) {
  const PORT = process.env.PORT || 3001;
  app.listen(PORT, () => {
    console.log(`⚡ FleetPulse API running on http://localhost:${PORT}`);
    console.log(`📡 API overview: http://localhost:${PORT}/api`);
    console.log(`💚 Health check: http://localhost:${PORT}/api/health\n`);
  });
}