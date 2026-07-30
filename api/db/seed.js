require('dotenv').config();

const { Pool } = require("pg");
const config = require("./config");

const pool = new Pool(config);

async function seed() {
  try {
    await pool.query("TRUNCATE telemetry, assignments, drivers, vehicles, charging_stations RESTART IDENTITY CASCADE");

    // ---- Vehicles (50 total) ----
    // [vehicle_code, make, model, year, vin, battery_capacity_kwh, current_battery_pct, range_miles, odometer, status, lat, lng, cabin_temp_f]
    const vehicles = [
      // ── Available — no assignment (10) ──────────────────────────────────
      ["EV-1001", "Tesla",          "Model 3",          2024, "5YJ3E1EA1PF000101", 75.0,   78, 198, 34521, "available",    29.7604, -95.3698, 72],
      ["EV-1002", "Ford",           "F-150 Lightning",  2024, "1FTVW1EL5PWG00202", 131.0,  91, 273, 27845, "available",    29.7866, -95.3388, 74],
      ["EV-1003", "Chevrolet",      "Bolt EUV",         2023, "1G1FY6S07P4100303", 65.0,   65, 169, 41230, "available",    29.7355, -95.3611, 70],
      ["EV-1004", "Rivian",         "R1S",              2024, "7FCTHAAL0PN000404", 135.0,  82, 280, 19870, "available",    29.8000, -95.4000, 73],
      ["EV-1005", "Hyundai",        "Ioniq 5",          2024, "KM8KRDAF0PU000505", 77.4,   55, 143, 22480, "available",    29.7500, -95.3200, 71],
      ["EV-1006", "BMW",            "iX xDrive50",      2024, "WB523CF00PCK00606", 111.5,  73, 244, 31005, "available",    29.7580, -95.3630, 69],
      ["EV-1007", "Kia",            "EV6",              2024, "KNDC3DLC5P5000707", 77.4,   88, 229, 15234, "available",    29.7320, -95.3950, 71],
      ["EV-1008", "Tesla",          "Model Y",          2024, "5YJYGDEE5PF000808", 75.0,   94, 330,  8456, "available",    29.7890, -95.3450, 69],
      ["EV-1009", "Nissan",         "Ariya",            2024, "5N1DR3BA5PC000909", 87.0,   67, 213, 18920, "available",    29.7150, -95.4100, 70],
      ["EV-1010", "Volkswagen",     "ID.4",             2024, "1V2WR2CA0PC001010", 82.0,   79, 270, 12340, "available",    29.7720, -95.4400, 68],

      // ── Available — pending assignment (8) ──────────────────────────────
      ["EV-1011", "Tesla",          "Cybertruck",       2024, "5YJSA1E20PF001111", 123.0,  71, 320,  5200, "available",    29.7630, -95.3720, 72],
      ["EV-1012", "GMC",            "Hummer EV",        2024, "1GKS2AELXMU001212", 212.7,  85, 314,  7830, "available",    29.7410, -95.3580, 74],
      ["EV-1013", "Ford",           "Mustang Mach-E",   2024, "3FMTK3SU0PMA01313", 91.0,   62, 247, 28600, "available",    29.7830, -95.3910, 70],
      ["EV-1014", "Hyundai",        "Ioniq 6",          2024, "KMHM34AC1PA001414", 77.4,   77, 266, 11450, "available",    29.7290, -95.3670, 73],
      ["EV-1015", "Mercedes-Benz",  "EQS",              2024, "W1K2G5KB5PA001515", 107.8,  88, 350,  9200, "available",    29.7660, -95.4150, 71],
      ["EV-1016", "Audi",           "e-tron GT",        2024, "WAUZZZF4XPN001616", 93.4,   73, 238, 16750, "available",    29.7530, -95.3480, 69],
      ["EV-1017", "Rivian",         "R1T",              2024, "7FCTVAAL1PN001717", 135.0,  59, 198, 31200, "available",    29.7180, -95.4050, 70],
      ["EV-1018", "Chevrolet",      "Silverado EV",     2024, "1GCPACED4RU001818", 200.0,  91, 450,  4100, "available",    29.7800, -95.3340, 68],

      // ── Available — active assignment (12) ──────────────────────────────
      ["EV-1019", "Tesla",          "Model S",          2024, "5YJSA1DNXPF001919", 100.0,  44, 287, 52100, "available",    29.7950, -95.3250, 75],
      ["EV-1020", "Lucid",          "Air",              2024, "ZL1AZEAE0PB002020", 118.0,  37, 367, 18920, "available",    29.7080, -95.3880, 73],
      ["EV-1021", "BMW",            "i4 eDrive40",      2024, "WBS31AF00PCF02121", 83.9,   56, 300, 23450, "available",    29.7340, -95.3760, 70],
      ["EV-1022", "Kia",            "EV9",              2024, "KNDCR3LE5P5002222", 99.8,   62, 304, 14680, "available",    29.7680, -95.4220, 71],
      ["EV-1023", "Ford",           "E-Transit",        2023, "1FTBF2X84PKA02323", 67.0,   48, 126, 38900, "available",    29.7120, -95.4320, 69],
      ["EV-1024", "Tesla",          "Model 3",          2023, "5YJ3E1EA1PF002424", 75.0,   71, 260, 44300, "available",    29.7440, -95.3530, 72],
      ["EV-1025", "Hyundai",        "Ioniq 5",          2023, "KM8KRDAF0PU002525", 77.4,   53, 138, 35670, "available",    29.7890, -95.3560, 70],
      ["EV-1026", "Rivian",         "R1S",              2023, "7FCTHAAL0PN002626", 135.0,  41, 232, 47800, "available",    29.7260, -95.4180, 68],
      ["EV-1027", "Chevrolet",      "Equinox EV",       2024, "KL79MRSL0PB002727", 85.0,   88, 319,  3200, "available",    29.7610, -95.3820, 73],
      ["EV-1028", "Tesla",          "Model Y",          2023, "5YJYGDEE5MF002828", 75.0,   65, 283, 39100, "available",    29.7390, -95.3440, 71],
      ["EV-1029", "Ford",           "F-150 Lightning",  2023, "1FTVW1EL5PWG02929", 131.0,  77, 240, 29400, "available",    29.7750, -95.3970, 69],
      ["EV-1030", "Porsche",        "Taycan",           2024, "WP0AC2Y1XPS003030", 93.4,   33, 248, 21300, "available",    29.7480, -95.4080, 72],

      // ── Charging (12) ────────────────────────────────────────────────────
      ["EV-1031", "Tesla",          "Model 3",          2024, "5YJ3E1EA1PF003131", 75.0,   22,  58, 28100, "charging",     29.7380, -95.4620, 68],
      ["EV-1032", "Rivian",         "R1T",              2024, "7FCTVAAL1PN003232", 135.0,  31, 105, 16200, "charging",     29.7420, -95.3830, 67],
      ["EV-1033", "Ford",           "Mustang Mach-E",   2023, "3FMTK3SU0NMA03333", 91.0,   17,  42, 45600, "charging",     29.7580, -95.3630, 69],
      ["EV-1034", "Hyundai",        "Ioniq 6",          2023, "KMHM34AC1NA003434", 77.4,   25,  67, 32100, "charging",     29.7720, -95.4400, 68],
      ["EV-1035", "BMW",            "i4 eDrive40",      2024, "WBS31AF00PCF03535", 83.9,   14,  42, 58900, "charging",     29.7560, -95.3520, 70],
      ["EV-1036", "Kia",            "EV6",              2023, "KNDC3DLC5N5003636", 77.4,   28,  64, 41200, "charging",     29.7330, -95.4280, 67],
      ["EV-1037", "Nissan",         "Ariya",            2023, "5N1DR3BA5NC003737", 87.0,   19,  41, 29700, "charging",     29.7640, -95.3760, 68],
      ["EV-1038", "Tesla",          "Model Y",          2024, "5YJYGDEE5PF003838", 75.0,   35, 115, 11500, "charging",     29.7180, -95.4120, 69],
      ["EV-1039", "Volkswagen",     "ID.4",             2023, "1V2WR2CA0NC003939", 82.0,    8,  22, 67800, "charging",     29.7820, -95.3680, 68],
      ["EV-1040", "Chevrolet",      "Bolt EUV",         2024, "1G1FY6S07P4104040", 65.0,   21,  35, 17200, "charging",     29.7460, -95.3910, 67],
      ["EV-1041", "Mercedes-Benz",  "EQS",              2023, "W1K2G5KB5NA004141", 107.8,  11,  39, 44100, "charging",     29.7680, -95.4330, 68],
      ["EV-1042", "Audi",           "e-tron GT",        2023, "WAUZZZF4XNA004242", 93.4,   27,  64, 38500, "charging",     29.7290, -95.3590, 69],

      // ── Maintenance (8) ──────────────────────────────────────────────────
      ["EV-1043", "Tesla",          "Model 3",          2023, "5YJ3E1EA1NF004343", 75.0,    0,   0, 72300, "maintenance",  29.6830, -95.4100, 66],
      ["EV-1044", "Ford",           "F-150 Lightning",  2022, "1FTVW1EL5NWG04444", 131.0,  45, 110, 88900, "maintenance",  29.7100, -95.4250, 65],
      ["EV-1045", "Rivian",         "R1S",              2022, "7FCTHAAL0NN004545", 135.0,   0,   0, 92400, "maintenance",  29.7220, -95.4380, 66],
      ["EV-1046", "Chevrolet",      "Bolt EUV",         2022, "1G1FY6S07N4104646", 65.0,   23,  60, 81200, "maintenance",  29.6950, -95.3870, 65],
      ["EV-1047", "BMW",            "iX xDrive50",      2023, "WB523CF00NCK04747", 111.5,  67, 225, 51000, "maintenance",  29.7060, -95.4150, 67],
      ["EV-1048", "Hyundai",        "Ioniq 5",          2022, "KM8KRDAF0NU004848", 77.4,    0,   0,103700, "maintenance",  29.6880, -95.4020, 65],
      ["EV-1049", "Kia",            "EV6",              2022, "KNDC3DLC5N5004949", 77.4,   38,  99, 79400, "maintenance",  29.7140, -95.4310, 66],
      ["EV-1050", "Tesla",          "Model Y",          2022, "5YJYGDEE5NF005050", 75.0,    0,   0, 95100, "maintenance",  29.6990, -95.4190, 65],
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

    // ---- Drivers (50 total) ----
    // [name, email, phone, license_number, status, pin]
    const drivers = [
      // ── Available — no assignment (20) ──────────────────────────────────
      ["Marcus Chen",       "marcus.chen@fleetpulse.dev",       "713-555-0101", "TX-DL-82910", "available", "1234"],
      ["Sarah Kim",         "sarah.kim@fleetpulse.dev",         "713-555-0102", "TX-DL-73821", "available", "2345"],
      ["James Wright",      "james.wright@fleetpulse.dev",      "713-555-0103", "TX-DL-64732", "available", "3456"],
      ["Diana Reyes",       "diana.reyes@fleetpulse.dev",       "713-555-0104", "TX-DL-55643", "available", "4567"],
      ["Tom O'Brien",       "tom.obrien@fleetpulse.dev",        "713-555-0105", "TX-DL-28376", "available", "5678"],
      ["Lisa Tran",         "lisa.tran@fleetpulse.dev",         "713-555-0106", "TX-DL-19287", "available", "6789"],
      ["Kevin Rodriguez",   "kevin.rodriguez@fleetpulse.dev",   "713-555-0107", "TX-DL-10198", "available", "7890"],
      ["Maya Patel",        "maya.patel@fleetpulse.dev",        "713-555-0108", "TX-DL-01209", "available", "8901"],
      ["Ryan Thompson",     "ryan.thompson@fleetpulse.dev",     "713-555-0109", "TX-DL-92318", "available", "9012"],
      ["Aisha Johnson",     "aisha.johnson@fleetpulse.dev",     "713-555-0110", "TX-DL-83427", "available", "0123"],
      ["Carlos Rivera",     "carlos.rivera@fleetpulse.dev",     "713-555-0111", "TX-DL-74536", "available", "1111"],
      ["Emma Davis",        "emma.davis@fleetpulse.dev",        "713-555-0112", "TX-DL-65645", "available", "2222"],
      ["Wei Liu",           "wei.liu@fleetpulse.dev",           "713-555-0113", "TX-DL-56754", "available", "3333"],
      ["Sofia Santos",      "sofia.santos@fleetpulse.dev",      "713-555-0114", "TX-DL-47863", "available", "4444"],
      ["Nathan Brown",      "nathan.brown@fleetpulse.dev",      "713-555-0115", "TX-DL-38972", "available", "5555"],
      ["Yuki Tanaka",       "yuki.tanaka@fleetpulse.dev",       "713-555-0116", "TX-DL-30081", "available", "6666"],
      ["Leila Hassan",      "leila.hassan@fleetpulse.dev",      "713-555-0117", "TX-DL-21190", "available", "7777"],
      ["Michael O'Connor",  "michael.oconnor@fleetpulse.dev",   "713-555-0118", "TX-DL-12209", "available", "8888"],
      ["Fatima Al-Rashid",  "fatima.alrashid@fleetpulse.dev",   "713-555-0119", "TX-DL-03318", "available", "9999"],
      ["Derek Washington",  "derek.washington@fleetpulse.dev",  "713-555-0120", "TX-DL-94427", "available", "1010"],

      // ── Available — with pending assignment (8) ──────────────────────────
      ["Olivia Chen",       "olivia.chen@fleetpulse.dev",       "713-555-0121", "TX-DL-85536", "available", "2121"],
      ["Jamal Williams",    "jamal.williams@fleetpulse.dev",    "713-555-0122", "TX-DL-76645", "available", "3232"],
      ["Rosa Martinez",     "rosa.martinez@fleetpulse.dev",     "713-555-0123", "TX-DL-67754", "available", "4343"],
      ["Patrick Murphy",    "patrick.murphy@fleetpulse.dev",    "713-555-0124", "TX-DL-58863", "available", "5454"],
      ["Zara Ahmed",        "zara.ahmed@fleetpulse.dev",        "713-555-0125", "TX-DL-49972", "available", "6565"],
      ["Tyler Jackson",     "tyler.jackson@fleetpulse.dev",     "713-555-0126", "TX-DL-41081", "available", "7676"],
      ["Mei Wong",          "mei.wong@fleetpulse.dev",          "713-555-0127", "TX-DL-32190", "available", "8787"],
      ["Andre Dubois",      "andre.dubois@fleetpulse.dev",      "713-555-0128", "TX-DL-23209", "available", "9898"],

      // ── On trip — with active assignment (12) ────────────────────────────
      ["Priya Sharma",      "priya.sharma@fleetpulse.dev",      "713-555-0129", "TX-DL-37465", "on_trip",   "1122"],
      ["Jordan Lee",        "jordan.lee@fleetpulse.dev",        "713-555-0130", "TX-DL-92310", "on_trip",   "2233"],
      ["Alex Carter",       "alex.carter@fleetpulse.dev",       "713-555-0131", "TX-DL-83421", "on_trip",   "3344"],
      ["Bianca Torres",     "bianca.torres@fleetpulse.dev",     "713-555-0132", "TX-DL-74532", "on_trip",   "4455"],
      ["Devon Mitchell",    "devon.mitchell@fleetpulse.dev",    "713-555-0133", "TX-DL-65643", "on_trip",   "5566"],
      ["Hana Yamamoto",     "hana.yamamoto@fleetpulse.dev",     "713-555-0134", "TX-DL-56754", "on_trip",   "6677"],
      ["Isaiah Freeman",    "isaiah.freeman@fleetpulse.dev",    "713-555-0135", "TX-DL-47865", "on_trip",   "7788"],
      ["Kristina Petrov",   "kristina.petrov@fleetpulse.dev",   "713-555-0136", "TX-DL-38976", "on_trip",   "8899"],
      ["Lorenzo Bianchi",   "lorenzo.bianchi@fleetpulse.dev",   "713-555-0137", "TX-DL-30087", "on_trip",   "9900"],
      ["Nadia Okafor",      "nadia.okafor@fleetpulse.dev",      "713-555-0138", "TX-DL-21198", "on_trip",   "1001"],
      ["Oscar Hernandez",   "oscar.hernandez@fleetpulse.dev",   "713-555-0139", "TX-DL-12209", "on_trip",   "2002"],
      ["Pearl Nguyen",      "pearl.nguyen@fleetpulse.dev",      "713-555-0140", "TX-DL-03310", "on_trip",   "3003"],

      // ── Off duty (10) ────────────────────────────────────────────────────
      ["Alex Park",         "alex.park@fleetpulse.dev",         "713-555-0141", "TX-DL-46554", "off_duty",  "4004"],
      ["Chris Martinez",    "chris.martinez@fleetpulse.dev",    "713-555-0142", "TX-DL-37665", "off_duty",  "5005"],
      ["Quinn Foster",      "quinn.foster@fleetpulse.dev",      "713-555-0143", "TX-DL-28776", "off_duty",  "6006"],
      ["Riley Kim",         "riley.kim@fleetpulse.dev",         "713-555-0144", "TX-DL-19887", "off_duty",  "7007"],
      ["Sam Cooper",        "sam.cooper@fleetpulse.dev",        "713-555-0145", "TX-DL-10998", "off_duty",  "8008"],
      ["Tara Singh",        "tara.singh@fleetpulse.dev",        "713-555-0146", "TX-DL-02109", "off_duty",  "9009"],
      ["Uma Kapoor",        "uma.kapoor@fleetpulse.dev",        "713-555-0147", "TX-DL-93210", "off_duty",  "1100"],
      ["Victor Reyes",      "victor.reyes@fleetpulse.dev",      "713-555-0148", "TX-DL-84321", "off_duty",  "2200"],
      ["Wendy Cho",         "wendy.cho@fleetpulse.dev",         "713-555-0149", "TX-DL-75432", "off_duty",  "3300"],
      ["Xander Brooks",     "xander.brooks@fleetpulse.dev",     "713-555-0150", "TX-DL-66543", "off_duty",  "4400"],
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
      ["Hub A - Galleria",        "5085 Westheimer Rd, Houston",       29.7380, -95.4620, 8,  4, 150, "operational"],
      ["Hub B - Midtown",         "3100 Louisiana St, Houston",        29.7420, -95.3830, 6,  2, 350, "operational"],
      ["Hub C - Downtown",        "1200 McKinney St, Houston",         29.7580, -95.3630, 6,  1, 150, "operational"],
      ["Hub D - Energy Corridor", "15550 Voss Rd, Houston",            29.7720, -95.4400, 10, 5, 350, "operational"],
      ["Hub E - Pearland",        "11200 Broadway St, Pearland",       29.5636, -95.2860, 4,  2, 150, "operational"],
      ["Hub F - The Woodlands",   "1201 Lake Woodlands Dr, Woodlands", 30.1580, -95.4613, 6,  3, 350, "operational"],
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
    // Vehicle IDs 1-10: available, no assignment
    // Vehicle IDs 11-18: available, pending assignment  → driver IDs 21-28
    // Vehicle IDs 19-30: available, active assignment   → driver IDs 29-40
    // [vehicle_id, driver_id, status, assigned_at, started_at, completed_at, notes]
    const now = new Date();
    const d = (hoursAgo) => new Date(now.getTime() - hoursAgo * 3600000).toISOString();

    const assignments = [
      // ── Completed (historical) ───────────────────────────────────────────
      [1,  1,  "completed", d(48), d(47.5), d(39),   "Morning downtown route"],
      [2,  2,  "completed", d(47), d(46.8), d(38.5), "US-59 corridor deliveries"],
      [3,  3,  "completed", d(72), d(71.7), d(63),   "Energy corridor route"],
      [4,  4,  "completed", d(96), d(95.7), d(87),   "Pearland delivery run"],
      [5,  5,  "completed", d(120),d(119.8),d(111),  "East Houston morning route"],
      [6,  6,  "completed", d(24), d(23.7), d(15.5), "Galleria area pickups"],
      [7,  7,  "completed", d(36), d(35.8), d(27.5), "Medical center route"],
      [8,  8,  "completed", d(60), d(59.7), d(51.5), "Heights neighborhood loop"],
      [9,  9,  "completed", d(84), d(83.8), d(75.5), "Midtown late-night run"],
      [10, 10, "completed", d(108),d(107.8),d(99.5), "Katy Freeway express route"],
      [1,  11, "completed", d(12), d(11.8), d(3.5),  "Cross-town afternoon shift"],
      [2,  12, "completed", d(18), d(17.8), d(9.5),  "Airport connector route"],
      [3,  13, "completed", d(30), d(29.8), d(21.5), "Suburban delivery circuit"],
      [4,  14, "completed", d(54), d(53.8), d(45.5), "Convention center run"],
      [5,  15, "completed", d(78), d(77.8), d(69.5), "Port of Houston logistics"],

      // ── Cancelled (historical) ───────────────────────────────────────────
      [6,  16, "cancelled", d(20), null,    null,     "Driver called in sick"],
      [7,  17, "cancelled", d(33), null,    null,     "Vehicle needed maintenance"],
      [8,  18, "cancelled", d(45), null,    null,     "Route change — rescheduled"],
      [9,  19, "cancelled", d(57), null,    null,     "Customer cancellation"],
      [10, 20, "cancelled", d(69), null,    null,     "Weather delay"],

      // ── Pending (assigned, not started) — vehicles 11-18, drivers 21-28 ──
      [11, 21, "pending", d(1),   null, null, "Galleria morning delivery"],
      [12, 22, "pending", d(0.8), null, null, "Midtown corporate shuttle"],
      [13, 23, "pending", d(0.6), null, null, "Medical center supply run"],
      [14, 24, "pending", d(0.5), null, null, "Heights neighborhood loop"],
      [15, 25, "pending", d(0.4), null, null, "Downtown express route"],
      [16, 26, "pending", d(0.3), null, null, "East Houston depot pickup"],
      [17, 27, "pending", d(0.2), null, null, "Pearland residential delivery"],
      [18, 28, "pending", d(0.1), null, null, "Energy corridor freight"],

      // ── Active (in progress) — vehicles 19-30, drivers 29-40 ─────────────
      [19, 29, "active", d(3),   d(2.8), null, "Heights neighborhood deliveries"],
      [20, 30, "active", d(2.5), d(2.3), null, "Medical center area route"],
      [21, 31, "active", d(2),   d(1.8), null, "Midtown corporate circuit"],
      [22, 32, "active", d(1.5), d(1.3), null, "Galleria shopping district"],
      [23, 33, "active", d(4),   d(3.8), null, "Port logistics run"],
      [24, 34, "active", d(3.5), d(3.3), null, "Pearland suburban route"],
      [25, 35, "active", d(1),   d(0.8), null, "Downtown express delivery"],
      [26, 36, "active", d(5),   d(4.8), null, "Katy Freeway freight haul"],
      [27, 37, "active", d(0.5), d(0.3), null, "Sugar Land connector"],
      [28, 38, "active", d(2),   d(1.7), null, "Greenway Plaza corporate"],
      [29, 39, "active", d(1.5), d(1.2), null, "Memorial Park area loop"],
      [30, 40, "active", d(3),   d(2.7), null, "Westheimer corridor"],
    ];

    for (const a of assignments) {
      await pool.query(
        `INSERT INTO assignments (vehicle_id, driver_id, status, assigned_at, started_at, completed_at, notes)
         VALUES ($1,$2,$3,$4,$5,$6,$7)`,
        a
      );
    }
    console.log(`✅ Seeded ${assignments.length} assignments`);

    // ---- Sample Telemetry (active trips) ----
    for (let i = 0; i < 12; i++) {
      const vehicleId = 19 + i;
      const assignmentId = 21 + i; // assignments array: pending 8 + completed 15 + cancelled 5 = 28 before active; active start at index 29 → id 29
      // assignment IDs: completed 1-15, cancelled 16-20, pending 21-28, active 29-40
      const activeAssignmentId = 29 + i;
      await pool.query(
        `INSERT INTO telemetry (vehicle_id, assignment_id, battery_pct, speed_mph, lat, lng, odometer, cabin_temp_f, recorded_at)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,NOW())`,
        [vehicleId, activeAssignmentId,
         vehicles[18 + i][6],          // current_battery_pct
         20 + Math.floor(Math.random() * 50),
         vehicles[18 + i][11],          // lat
         vehicles[18 + i][12],          // lng
         vehicles[18 + i][8],           // odometer
         vehicles[18 + i][13]]          // cabin_temp_f
      );
    }
    console.log(`✅ Seeded telemetry records`);

    const available   = vehicles.filter(v => v[9] === "available").length;
    const charging    = vehicles.filter(v => v[9] === "charging").length;
    const maintenance = vehicles.filter(v => v[9] === "maintenance").length;
    const onTrip      = drivers.filter(d => d[4] === "on_trip").length;
    const offDuty     = drivers.filter(d => d[4] === "off_duty").length;
    const avail_d     = drivers.filter(d => d[4] === "available").length;
    const completed   = assignments.filter(a => a[2] === "completed").length;
    const cancelled   = assignments.filter(a => a[2] === "cancelled").length;
    const pending     = assignments.filter(a => a[2] === "pending").length;
    const active      = assignments.filter(a => a[2] === "active").length;

    console.log("\n🎉 Database seeded successfully!");
    console.log("\n📊 Summary:");
    console.log(`   Vehicles : ${vehicles.length}  (${available} available, ${charging} charging, ${maintenance} maintenance)`);
    console.log(`   Drivers  : ${drivers.length}  (${avail_d} available, ${onTrip} on_trip, ${offDuty} off_duty)`);
    console.log(`   Assignments: ${assignments.length} (${completed} completed, ${active} active, ${pending} pending, ${cancelled} cancelled)`);
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
