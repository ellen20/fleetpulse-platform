# FleetPulse ⚡

> Real-Time EV Fleet Management System — Track vehicles, manage driver assignments, and monitor charging stations from a single dashboard.

![Tests](https://img.shields.io/badge/E2E%20tests-3%20passing-brightgreen)
![Pact](https://img.shields.io/badge/pact-verified-brightgreen)
![Node](https://img.shields.io/badge/node-%3E%3D18-green)
![License](https://img.shields.io/badge/license-MIT-blue)

---

## 📸 Overview

FleetPulse is a full-stack portfolio project demonstrating real-world QA engineering practices — including contract testing with Pact and end-to-end testing with Playwright.

**Fleet Map Tab** — Live vehicle locations, status filtering, charging station visibility, paginated vehicle list

**Assignments Tab** — Assign drivers to vehicles, cancel pending assignments, view driver contact details

---

## ✨ Features

- 🗺️ **Interactive Fleet Map** — SVG map with color-coded vehicle pins and live status
- 📋 **Assignment Management** — Full workflow: assign → pending → active → cancel
- ⚡ **Charging Station Monitor** — Port availability and power output per station
- 🔄 **Status Filtering** — Filter by available / charging / maintenance
- 🚫 **Double-Booking Prevention** — Database transactions prevent duplicate assignments
- 🔁 **Auto-Refresh** — Data refreshes every 10 seconds
- 📄 **Pagination** — Vehicle list shows 10 per page

---

## 🏗️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Backend | Node.js, Express |
| Database | PostgreSQL |
| Frontend | React, Vite |
| E2E Testing | Playwright |
| Contract Testing | Pact (Consumer + Provider) |

---

## 📁 Project Structure

```
fleetpulse-platform/
├── api/                              # Backend
│   ├── db/
│   │   ├── config.js                 # Database configuration
│   │   ├── connection.js             # PostgreSQL pool
│   │   ├── init.js                   # Schema creation
│   │   └── seed.js                   # Sample data (13 vehicles, 12 drivers)
│   ├── routes/
│   │   ├── vehicles.js
│   │   ├── drivers.js
│   │   ├── assignments.js
│   │   ├── charging-stations.js
│   │   └── telemetry.js
│   ├── tests/pact/
│   │   └── provider.verify.test.js   # Pact provider verification
│   ├── .env.example
│   └── server.js
├── dashboard/                        # Frontend React app
│   ├── src/
│   │   ├── App.jsx                   # Main dashboard (Fleet Map + Assignments)
│   │   └── main.jsx
│   ├── tests/pact/
│   │   └── fleetpulse.pact.test.js  # Pact consumer tests
│   ├── index.html
│   └── vite.config.js
├── driver-app/                       # Driver-facing app (coming soon)
├── pacts/                            # Generated Pact contract files
├── tests/
│   └── assignment-workflow.spec.js   # Playwright E2E tests
├── .gitignore
├── package.json
├── playwright.config.js
└── README.md
```

---

## 🚀 Getting Started

### Prerequisites

- Node.js >= 18
- PostgreSQL >= 14

### 1. Clone the repo

```bash
git clone https://github.com/yourusername/fleetpulse-platform.git
cd fleetpulse-platform
```

### 2. Set up the backend

```bash
cd api
npm install
cp .env.example .env
# Edit .env with your PostgreSQL credentials
```

### 3. Initialize the database

```bash
node db/init.js --fresh
node db/seed.js
# Seeds 13 vehicles, 12 drivers, 6 charging stations
```

### 4. Start the API

```bash
node server.js
# Running on http://localhost:3001
```

### 5. Set up and start the frontend

```bash
cd dashboard
npm install
npm run dev
# Running on http://localhost:5173
```

---

## 🔌 API Reference

### Vehicles
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/vehicles` | List all vehicles |
| GET | `/api/vehicles/:id` | Get vehicle by ID |

### Drivers
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/drivers` | List all drivers |
| GET | `/api/drivers/:id` | Get driver by ID |

### Assignments
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/assignments` | List active assignments |
| POST | `/api/assignments` | Create assignment |
| PATCH | `/api/assignments/:id/cancel` | Cancel assignment |
| PATCH | `/api/assignments/:id/accept` | Accept assignment |
| PATCH | `/api/assignments/:id/complete` | Complete assignment |

### Charging Stations
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/charging-stations` | List all stations |

---

## 🧪 Testing

### E2E Tests (Playwright)

```bash
# From project root - backend + frontend must be running
npm install
npx playwright install chromium
npm run test:assignment
```

**Covers:**
- ✅ Full assignment creation workflow
- ✅ Cancel pending assignment
- ✅ Fleet Map displays correctly after assignment

### Contract Tests (Pact)

```bash
# Step 1: Generate pact file (consumer side)
cd dashboard
npm run test:pact

# Step 2: Verify against running API (provider side)
cd api
npm run test:pact:verify
```

**Contracts verified:**
- ✅ `GET /api/drivers` — returns array with correct fields
- ✅ `GET /api/vehicles` — returns array with correct fields
- ✅ `POST /api/assignments` — creates with snake_case fields, returns pending status

---

## 🗄️ Data Model

### Vehicle Status (Physical State)
| Status | Meaning |
|--------|---------|
| `available` | Ready to be assigned |
| `charging` | At a charging station |
| `maintenance` | Out of service |

### Assignment Status (Operational State)
| Status | Meaning |
|--------|---------|
| `pending` | Assigned by manager, awaiting driver |
| `active` | Driver accepted, trip in progress |
| `completed` | Trip finished |
| `cancelled` | Assignment cancelled |

> A vehicle can be `charging` AND have a `pending` assignment — physical state and operational state are intentionally separate.

---

## 🔒 Environment Variables

Create `api/.env` based on `api/.env.example`:

```bash
DB_HOST=localhost
DB_PORT=5432
DB_NAME=fleetpulse
DB_USER=postgres
DB_PASSWORD=your_password
PORT=3001
```

---

## 🗺️ Roadmap

- [x] Fleet Map with vehicle pins
- [x] Assignment management workflow
- [x] Charging station monitoring
- [x] Playwright E2E tests
- [x] Pact contract tests (consumer + provider)
- [ ] WebSocket real-time updates
- [ ] Driver mobile app
- [ ] Route optimization
- [ ] Maintenance scheduling

---

## 📝 License

MIT — see [LICENSE](LICENSE) for details.

---

**Made with ⚡ by Jingling Jin**