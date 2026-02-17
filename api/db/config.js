// Single source of truth for database configuration.
// Change credentials here — all db files (connection, init, seed) use this.

const config = {
  host: process.env.DB_HOST || "localhost",
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || "fleetpulse",
  user: process.env.DB_USER || "postgres",
  password: process.env.DB_PASSWORD || "postgres",
};

module.exports = config;