require('dotenv').config();

const { Pool } = require("pg");
const readline = require("readline");
const config = require("./config");

// Connect to default 'postgres' DB to create our database
const adminPool = new Pool({ ...config, database: "postgres" });

const DB_NAME = config.database;

const dropSchema = `
  -- Drop all tables (CASCADE removes dependencies)
  DROP TABLE IF EXISTS telemetry CASCADE;
  DROP TABLE IF EXISTS assignments CASCADE;
  DROP TABLE IF EXISTS drivers CASCADE;
  DROP TABLE IF EXISTS vehicles CASCADE;
  DROP TABLE IF EXISTS charging_stations CASCADE;
`;

const schema = `
  -- Vehicles table
  CREATE TABLE IF NOT EXISTS vehicles (
    id            SERIAL PRIMARY KEY,
    vehicle_code  VARCHAR(20) UNIQUE NOT NULL,   -- e.g. EV-1001
    make          VARCHAR(50) NOT NULL,
    model         VARCHAR(100) NOT NULL,
    year          INTEGER NOT NULL,
    vin           VARCHAR(17) UNIQUE NOT NULL,
    battery_capacity_kwh  DECIMAL(6,2) NOT NULL,
    current_battery_pct   INTEGER DEFAULT 100,
    range_miles           INTEGER DEFAULT 0,
    odometer              INTEGER DEFAULT 0,
    status        VARCHAR(20) DEFAULT 'available',  -- available, assigned, charging, maintenance
    lat           DECIMAL(10,7),
    lng           DECIMAL(10,7),
    cabin_temp_f  INTEGER DEFAULT 70,
    created_at    TIMESTAMP DEFAULT NOW()
  );

  -- Drivers table
  CREATE TABLE IF NOT EXISTS drivers (
    id              SERIAL PRIMARY KEY,
    name            VARCHAR(100) NOT NULL,
    email           VARCHAR(150) UNIQUE NOT NULL,
    phone           VARCHAR(20),
    license_number  VARCHAR(30) NOT NULL,
    status          VARCHAR(20) DEFAULT 'available',  -- available, on_trip, off_duty
    pin             VARCHAR(6) DEFAULT '0000',         -- simple PIN for driver PWA login
    created_at      TIMESTAMP DEFAULT NOW()
  );

  -- Assignments: links a vehicle to a driver for a shift/trip
  CREATE TABLE IF NOT EXISTS assignments (
    id            SERIAL PRIMARY KEY,
    vehicle_id    INTEGER REFERENCES vehicles(id) ON DELETE CASCADE,
    driver_id     INTEGER REFERENCES drivers(id) ON DELETE CASCADE,
    status        VARCHAR(20) DEFAULT 'pending',  -- pending, active, completed, cancelled
    assigned_at   TIMESTAMP DEFAULT NOW(),
    started_at    TIMESTAMP,
    completed_at  TIMESTAMP,
    notes         TEXT
  );

  -- Telemetry: EV sensor data snapshots
  CREATE TABLE IF NOT EXISTS telemetry (
    id              SERIAL PRIMARY KEY,
    vehicle_id      INTEGER REFERENCES vehicles(id) ON DELETE CASCADE,
    assignment_id   INTEGER REFERENCES assignments(id) ON DELETE SET NULL,
    battery_pct     INTEGER,
    speed_mph       INTEGER DEFAULT 0,
    lat             DECIMAL(10,7),
    lng             DECIMAL(10,7),
    odometer        INTEGER,
    cabin_temp_f    INTEGER,
    charging        BOOLEAN DEFAULT FALSE,
    recorded_at     TIMESTAMP DEFAULT NOW()
  );

  -- Charging Stations: EV charging infrastructure
  CREATE TABLE IF NOT EXISTS charging_stations (
    id               SERIAL PRIMARY KEY,
    name             VARCHAR(100) NOT NULL,
    location         VARCHAR(200),
    lat              DECIMAL(10,7) NOT NULL,
    lng              DECIMAL(11,7) NOT NULL,
    total_ports      INTEGER NOT NULL,
    available_ports  INTEGER NOT NULL,
    power_kw         INTEGER NOT NULL,           -- charging power in kilowatts (e.g., 150, 350)
    status           VARCHAR(20) DEFAULT 'operational',  -- operational, maintenance, offline
    created_at       TIMESTAMP DEFAULT NOW()
  );

  -- Indexes for common queries
  CREATE INDEX IF NOT EXISTS idx_assignments_status ON assignments(status);
  CREATE INDEX IF NOT EXISTS idx_assignments_driver ON assignments(driver_id);
  CREATE INDEX IF NOT EXISTS idx_assignments_vehicle ON assignments(vehicle_id);
  CREATE INDEX IF NOT EXISTS idx_telemetry_vehicle ON telemetry(vehicle_id);
  CREATE INDEX IF NOT EXISTS idx_telemetry_recorded ON telemetry(recorded_at);
  CREATE INDEX IF NOT EXISTS idx_charging_stations_status ON charging_stations(status);
`;

// Helper function to prompt user
function askQuestion(query) {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  return new Promise((resolve) => {
    rl.question(query, (answer) => {
      rl.close();
      resolve(answer);
    });
  });
}

async function checkTablesExist(pool) {
  const { rows } = await pool.query(`
    SELECT tablename FROM pg_tables 
    WHERE schemaname = 'public' 
    AND tablename IN ('vehicles', 'drivers', 'assignments', 'telemetry', 'charging_stations')
  `);
  return rows.length > 0;
}

async function init() {
  try {
    console.log("\n🔧 FleetPulse Database Initialization");
    console.log("=====================================\n");

    // Create database if it doesn't exist
    const existing = await adminPool.query(
      "SELECT 1 FROM pg_database WHERE datname = $1", [DB_NAME]
    );
    
    if (existing.rows.length === 0) {
      await adminPool.query(`CREATE DATABASE ${DB_NAME}`);
      console.log(`✅ Database "${DB_NAME}" created\n`);
    } else {
      console.log(`ℹ️  Database "${DB_NAME}" already exists\n`);
    }
    await adminPool.end();

    // Connect to our database
    const appPool = new Pool(config);

    // Check if tables exist
    const tablesExist = await checkTablesExist(appPool);
    let freshStart = false;

    if (tablesExist) {
      console.log("⚠️  Existing tables detected!\n");
      console.log("Choose an option:");
      console.log("  1) Keep existing data (safe - only add missing tables)");
      console.log("  2) Fresh start (⚠️  DELETE ALL DATA and recreate)\n");
      
      const answer = await askQuestion("Enter choice (1 or 2): ");
      
      if (answer.trim() === "2") {
        console.log("\n⚠️  Are you sure? This will DELETE ALL DATA!");
        const confirm = await askQuestion("Type 'yes' to confirm: ");
        
        if (confirm.trim().toLowerCase() === "yes") {
          freshStart = true;
          console.log("\n🗑️  Dropping all tables...");
          await appPool.query(dropSchema);
          console.log("✅ Tables dropped\n");
        } else {
          console.log("\n❌ Cancelled. Keeping existing data.\n");
        }
      } else {
        console.log("\n✅ Safe mode - keeping existing data\n");
      }
    } else {
      console.log("ℹ️  No existing tables found. Creating new schema...\n");
      freshStart = true;
    }

    // Create/update schema
    await appPool.query(schema);
    
    if (freshStart) {
      console.log("✅ Fresh schema created successfully!");
    } else {
      console.log("✅ Schema updated (existing data preserved)");
    }
    
    console.log("\n📊 Database ready with tables:");
    console.log("   - vehicles");
    console.log("   - drivers");
    console.log("   - assignments");
    console.log("   - telemetry");
    console.log("   - charging_stations");
    
    if (freshStart) {
      console.log("\n💡 Next step: Run 'node db/seed.js' to load demo data");
    }
    console.log("");
    
    await appPool.end();
  } catch (err) {
    console.error("❌ Init failed:", err.message);
    process.exit(1);
  }
}

init();