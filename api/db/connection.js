const { Pool } = require("pg");
const config = require("./config");

const pool = new Pool(config);

// Test connection on startup
pool.query("SELECT NOW()")
  .then(() => console.log("✅ Connected to PostgreSQL"))
  .catch((err) => console.error("❌ Database connection failed:", err.message));

module.exports = pool;