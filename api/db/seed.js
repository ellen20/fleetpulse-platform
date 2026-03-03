require('dotenv').config();

const { Pool } = require("pg");
const config = require("./config");

const pool = new Pool(config);

async function seed() {
  try {
    // Clear existing data
    await pool.query("TRUNCATE telemetry, assignments, drivers, vehicles, charging_stations RESTART IDENTITY CASCADE");

    // ---- Vehicles ----
    const vehicles = [
      // Available vehicles (no assignments)
      ["EV-1001", "Tesla",   "Model 3",          2024, "5YJ3E1EA1PF000101", 75.0,  78, 198, 34521, "available", 29.7604, -95.3698, 72],
      ["EV-1003", "Ford",    "F-150 Lightning",  2024, "1FTVW1EL5PWG00303", 131.0, 91, 273, 27845, "available", 29.7866, -95.3388, 74],
      ["EV-1004", "Chevy",   "Bolt EUV",         2023, "1G1FY6S07P4100404", 65.0,  65, 169, 41230, "available", 29.7355, -95.3611, 70],
      ["EV-1008", "Kia",     "EV6",              2024, "KNDC3DLC5P5000808", 77.4,  82, 214, 19870, "available", 29.8000, -95.4000, 73],
      ["EV-1009", "Tesla",   "Model X",          2024, "5YJSA1E20PF000909", 100.0, 88, 308, 15234, "available", 29.7320, -95.3950, 71],
      ["EV-1010", "Nissan",  "Ariya",            2024, "5N1DR3BA5PC001010", 87.0,  72, 216, 8456,  "available", 29.7890, -95.3450, 69],
      
      // Vehicles with pending assignments (still available physical state)
      ["EV-1006", "Hyundai", "Ioniq 5",          2024, "KM8KRDAF0PU000606", 77.4,  83, 216, 22480, "available",  29.7500, -95.3200, 71],
      ["EV-1011", "Rivian",  "R1T",              2024, "7FCTVAAL1PN001111", 135.0, 76, 228, 12340, "available",  29.7150, -95.4100, 70],
      
      // Vehicles with active assignments (still available physical state)
      ["EV-1012", "Tesla",   "Model Y",          2023, "5YJYGDEE5MF001212", 75.0,  55, 143, 52100, "available",  29.7950, -95.3250, 75],
      ["EV-1013", "Ford",    "Mustang Mach-E",   2024, "3FMTK3SU0PMA01313", 88.0,  68, 204, 18920, "available",  29.7080, -95.3880, 73],
      
      // Charging vehicles (physical state)
      ["EV-1002", "Rivian",  "R1S",              2024, "7FCTGAAL0PN000202", 135.0, 25, 75,  18203, "charging",  29.7380, -95.4620, 68],
      ["EV-1007", "BMW",     "iX xDrive50",      2024, "WB523CF00PCK00707", 111.5, 18, 54,  31005, "charging",  29.7580, -95.3630, 69],
      
      // Maintenance vehicle (physical state)
      ["EV-1005", "Tesla",   "Model 3",          2023, "5YJYGDEE5MF000505", 75.0,  0,  0,   52100, "maintenance", 29.6830, -95.4100, 66],
    ];

    for (const v of vehicles) {
      await pool.query(
        `INSERT INTO vehicles (vehicle_code, make, model, year, vin, battery_capacity_kwh,
         current_battery_pct, range_miles, odometer, status, lat, lng, cabin_temp_f)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13)`,
        v
      );
    }
    console.log(`✅ Seeded ${vehicles.length} vehicles`);

    // ---- Drivers ----
    const drivers = [
      // Available drivers
      ["Marcus Chen",    "marcus.chen@fleetpulse.dev",    "713-555-0101", "TX-DL-82910", "available", "1234"],
      ["Sarah Kim",      "sarah.kim@fleetpulse.dev",      "713-555-0102", "TX-DL-73821", "available", "2345"],
      ["James Wright",   "james.wright@fleetpulse.dev",   "713-555-0103", "TX-DL-64732", "available", "3456"],
      ["Diana Reyes",    "diana.reyes@fleetpulse.dev",    "713-555-0104", "TX-DL-55643", "available", "4567"],
      ["Tom O'Brien",    "tom.obrien@fleetpulse.dev",     "713-555-0107", "TX-DL-28376", "available", "7890"],
      ["Lisa Tran",      "lisa.tran@fleetpulse.dev",      "713-555-0108", "TX-DL-19287", "available", "8901"],
      ["Kevin Rodriguez","kevin.rodriguez@fleetpulse.dev","713-555-0109", "TX-DL-10198", "available", "9012"],
      ["Maya Patel",     "maya.patel@fleetpulse.dev",     "713-555-0110", "TX-DL-01209", "available", "0123"],
      
      // On trip drivers
      ["Priya Sharma",   "priya.sharma@fleetpulse.dev",   "713-555-0106", "TX-DL-37465", "on_trip",   "6789"],
      ["Jordan Lee",     "jordan.lee@fleetpulse.dev",     "713-555-0111", "TX-DL-92310", "on_trip",   "1123"],
      
      // Off duty drivers
      ["Alex Park",      "alex.park@fleetpulse.dev",      "713-555-0105", "TX-DL-46554", "off_duty",  "5678"],
      ["Chris Martinez", "chris.martinez@fleetpulse.dev", "713-555-0112", "TX-DL-83421", "off_duty",  "2234"],
    ];

    for (const d of drivers) {
      await pool.query(
        `INSERT INTO drivers (name, email, phone, license_number, status, pin)
         VALUES ($1,$2,$3,$4,$5,$6)`,
        d
      );
    }
    console.log(`✅ Seeded ${drivers.length} drivers`);

    // ---- Charging Stations ----
    const chargingStations = [
      ["Hub A - Galleria",        "5085 Westheimer Rd, Houston",      29.7380, -95.4620, 8,  4, 150, "operational"],
      ["Hub B - Midtown",         "3100 Louisiana St, Houston",       29.7420, -95.3830, 6,  2, 350, "operational"],
      ["Hub C - Downtown",        "1200 McKinney St, Houston",        29.7580, -95.3630, 6,  1, 150, "operational"],
      ["Hub D - Energy Corridor", "15550 Voss Rd, Houston",           29.7720, -95.4400, 10, 5, 350, "operational"],
      ["Hub E - Pearland",        "11200 Broadway St, Pearland",      29.5636, -95.2860, 4,  2, 150, "operational"],
      ["Hub F - The Woodlands",   "1201 Lake Woodlands Dr, Woodlands",30.1580, -95.4613, 6,  3, 350, "operational"],
    ];

    for (const station of chargingStations) {
      await pool.query(
        `INSERT INTO charging_stations (name, location, lat, lng, total_ports, available_ports, power_kw, status)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8)`,
        station
      );
    }
    console.log(`✅ Seeded ${chargingStations.length} charging stations`);

    // ---- Assignments ----
    const assignments = [
      // Completed assignments (historical)
      [1,  1,  "completed", "2025-02-11 07:00:00", "2025-02-11 07:15:00", "2025-02-11 16:30:00", "Morning downtown route"],
      [3,  3,  "completed", "2025-02-11 08:00:00", "2025-02-11 08:10:00", "2025-02-11 17:00:00", "US-59 corridor deliveries"],
      [8,  4,  "completed", "2025-02-10 06:00:00", "2025-02-10 06:20:00", "2025-02-10 15:45:00", "Energy corridor route"],
      
      // Active assignments (currently in progress)
      [12, 9,  "active",    "2025-02-12 06:00:00", "2025-02-12 06:15:00", null,                   "Heights neighborhood deliveries"],
      [13, 10, "active",    "2025-02-12 07:30:00", "2025-02-12 07:45:00", null,                   "Medical center area route"],
      
      // Pending assignments (assigned but not started)
      [7,  6,  "pending",   "2025-02-12 08:00:00", null,                   null,                   "East Houston morning route"],
      [11, 7,  "pending",   "2025-02-12 09:00:00", null,                   null,                   "Pearland delivery run"],
      
      // Cancelled assignment (example)
      [4,  5,  "cancelled", "2025-02-11 14:00:00", null,                   null,                   "Afternoon route - driver called in sick"],
    ];

    for (const a of assignments) {
      await pool.query(
        `INSERT INTO assignments (vehicle_id, driver_id, status, assigned_at, started_at, completed_at, notes)
         VALUES ($1,$2,$3,$4,$5,$6,$7)`,
        a
      );
    }
    console.log(`✅ Seeded ${assignments.length} assignments`);

    // ---- Sample Telemetry ----
    // Add telemetry for completed trip (EV-1001, assignment_id=1)
    const baseTime = new Date("2025-02-11T07:15:00");
    const route = [
      { min: 0,   bat: 95, spd: 0,  lat: 29.7604, lng: -95.3698, odo: 34480 },
      { min: 15,  bat: 92, spd: 45, lat: 29.7700, lng: -95.3600, odo: 34490 },
      { min: 30,  bat: 89, spd: 62, lat: 29.7800, lng: -95.3500, odo: 34500 },
      { min: 60,  bat: 85, spd: 58, lat: 29.7900, lng: -95.3400, odo: 34510 },
      { min: 120, bat: 82, spd: 40, lat: 29.7750, lng: -95.3550, odo: 34515 },
      { min: 240, bat: 78, spd: 0,  lat: 29.7604, lng: -95.3698, odo: 34521 },
    ];

    for (const point of route) {
      const t = new Date(baseTime.getTime() + point.min * 60000);
      await pool.query(
        `INSERT INTO telemetry (vehicle_id, assignment_id, battery_pct, speed_mph, lat, lng, odometer, cabin_temp_f, recorded_at)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)`,
        [1, 1, point.bat, point.spd, point.lat, point.lng, point.odo, 72, t]
      );
    }

    // Add live telemetry for active trips
    const now = new Date();
    
    // EV-1012 active trip telemetry (vehicle_id=12, assignment_id=4)
    await pool.query(
      `INSERT INTO telemetry (vehicle_id, assignment_id, battery_pct, speed_mph, lat, lng, odometer, cabin_temp_f, recorded_at)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)`,
      [12, 4, 55, 48, 29.7950, -95.3250, 52100, 75, now]
    );

    // EV-1013 active trip telemetry (vehicle_id=13, assignment_id=5)
    await pool.query(
      `INSERT INTO telemetry (vehicle_id, assignment_id, battery_pct, speed_mph, lat, lng, odometer, cabin_temp_f, recorded_at)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)`,
      [13, 5, 68, 35, 29.7080, -95.3880, 18920, 73, now]
    );

    console.log(`✅ Seeded telemetry records`);

    console.log("\n🎉 Database seeded successfully!");
    console.log("\n📊 Summary:");
    console.log(`   Vehicles: ${vehicles.length} (6 available, 4 assigned, 2 charging, 1 maintenance)`);
    console.log(`   Drivers: ${drivers.length} (8 available, 2 on_trip, 2 off_duty)`);
    console.log(`   Assignments: ${assignments.length} (3 completed, 2 active, 2 pending, 1 cancelled)`);
    console.log(`   Charging Stations: ${chargingStations.length}`);
    console.log("\n");
    
    await pool.end();
  } catch (err) {
    console.error("❌ Seed failed:", err.message);
    console.error(err);
    process.exit(1);
  }
}

seed();