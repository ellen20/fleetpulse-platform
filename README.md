# FleetPulse ⚡

> Real-Time EV Fleet Management System — Track vehicles, manage driver assignments, and monitor charging stations from a single dashboard.

![E2E Tests](https://img.shields.io/badge/E2E%20tests-65%2B%20passing-brightgreen)
![Pact](https://img.shields.io/badge/pact-verified-brightgreen)
![Cypress](https://img.shields.io/badge/cypress-tested-brightgreen)
![Node](https://img.shields.io/badge/node-%3E%3D18-green)
![License](https://img.shields.io/badge/license-MIT-blue)
![Security](https://img.shields.io/badge/security-OWASP%20ZAP%20tested-blueviolet)
![Auth](https://img.shields.io/badge/auth-JWT%20tested-blue)

---

## 📸 Overview

FleetPulse is a full-stack portfolio project demonstrating real-world QA engineering practices — including contract testing with Pact, end-to-end testing with Playwright, and comprehensive E2E testing with Cypress across both the dashboard and driver applications.

**Fleet Map Tab** — Live vehicle locations, status filtering, charging station visibility, paginated vehicle list

**Assignments Tab** — Assign drivers to vehicles, cancel pending assignments, view driver contact details

**Driver App** — Driver-facing portal with PIN authentication, trip status, and assignment management

---

## ✨ Features

- 🗺️ **Interactive Fleet Map** — SVG map with color-coded vehicle pins and live status
- 📋 **Assignment Management** — Full workflow: assign → pending → active → cancel
- ⚡ **Charging Station Monitor** — Port availability and power output per station
- 🔄 **Status Filtering** — Filter by available / charging / maintenance
- 🚫 **Double-Booking Prevention** — Database transactions prevent duplicate assignments
- 🔁 **Auto-Refresh** — Data refreshes every 10 seconds
- 📄 **Pagination** — Vehicle list shows 10 per page
- 🔐 **Authentication** — PIN-based driver login with session management, protected routes, and logout
- 🛡️ **Role-Based Access Control (RBAC)** — Admin vs driver permissions enforced at route level
- 🔑 **JWT Security Testing** — Token validation, expiry, and tampering scenarios tested
- 🚨 **OWASP ZAP Security Scanning** — API vulnerability testing including injection and auth bypass

---

## 🏗️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Backend | Node.js, Express |
| Database | PostgreSQL |
| Frontend | React, Vite |
| E2E Testing | Playwright, Cypress |
| Contract Testing | Pact (Consumer + Provider) |
| Security Testing | OWASP ZAP, JWT testing |
| Auth | Session-based auth, RBAC, Protected Routes |

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
├── dashboard/                        # Fleet management React app (port 5173)
│   ├── src/
│   │   ├── App.jsx                   # Main dashboard (Fleet Map + Assignments)
│   │   └── main.jsx
│   ├── tests/pact/
│   │   └── fleetpulse.pact.test.js  # Pact consumer tests
│   ├── index.html
│   └── vite.config.js
├── driver-app/                       # Driver-facing React app (port 5174)
│   ├── src/
│   │   └── main.jsx
│   └── index.html
├── cypress/                          # Cypress E2E test suite
│   └── e2e/
│       ├── dashboard.cy.js           # 30+ dashboard tests
│       ├── driver-app.cy.js          # 20+ driver app tests
│       └── api-errors.cy.js          # 15+ API error handling tests
├── pacts/                            # Generated Pact contract files
├── tests/
│   └── assignment-workflow.spec.js   # Playwright E2E tests
├── .gitignore
├── cypress.config.js
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

### 6. Set up and start the driver app

```bash
cd driver-app
npm install
npm run dev
# Running on http://localhost:5174
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
| POST | `/api/drivers/login` | Driver PIN authentication |

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

### E2E Tests (Cypress) — 65+ tests

Both the dashboard and driver app must be running before executing Cypress tests.

```bash
# Install Cypress
npm install cypress --save-dev

# Open Cypress Test Runner (interactive)
npx cypress open

# Run all tests headlessly
npx cypress run
```

#### dashboard.cy.js — 30+ tests
- ✅ Header branding and navigation
- ✅ Stat cards with business logic validation (total = available + charging + maintenance)
- ✅ Fleet Map status filtering (All, Available, Charging, Maintenance)
- ✅ Pagination across multiple pages
- ✅ Assignments table structure and data integrity
- ✅ Assign driver modal workflow
- ✅ Cancel assignment confirmation dialog
- ✅ Driver contact modal

#### driver-app.cy.js — 20+ tests
- ✅ Login page UI and branding
- ✅ Form validation: disabled button states, single field checks
- ✅ Invalid credentials error handling
- ✅ PIN field max length validation
- ✅ Successful login and dashboard redirect
- ✅ Driver dashboard: personalized greeting, date, trip status
- ✅ Current assignments display and refresh
- ✅ Logout and session clearing
- ✅ Multi-driver state tests (On Trip vs Available)

#### api-errors.cy.js — 15+ tests
- ✅ Complete API failure: UI shows 0 counts gracefully (no crash)
- ✅ Dashboard layout remains intact on API failure
- ✅ HTTP error responses: 500 and 404 handled gracefully
- ✅ Partial API failure: app stability when individual endpoints fail
- ✅ Slow API response: 3 second delay stability test
- ✅ Page refresh recovery: data restores after reload
- ✅ Driver app: login, dashboard, and refresh failure handling

### Security Tests (OWASP ZAP + JWT)

**Authentication & Authorization:**
- ✅ Login flow with valid/invalid credentials
- ✅ Protected route enforcement — unauthenticated redirect
- ✅ RBAC validation — admin vs driver role access
- ✅ Session persistence and logout clearing

**JWT Security Testing:**
- ✅ Token validation on protected endpoints
- ✅ Expired token rejection
- ✅ Tampered token detection

**OWASP ZAP API Security Scanning:**
- ✅ Authentication bypass attempts
- ✅ Injection testing on API endpoints
- ✅ Input validation and boundary testing
- ✅ Sensitive data exposure checks

> **Known Issue:** PIN field accepts up to 6 digits despite placeholder stating "4-digit PIN". Documented in `driver-app.cy.js`.

> **Future Improvement:** API error tests will be expanded once error message UI (toast notifications, retry buttons, loading spinners) is implemented.

---

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
- [x] Driver authentication portal
- [x] Playwright E2E tests
- [x] Pact contract tests (consumer + provider)
- [x] Cypress E2E tests (dashboard + driver app + API error handling)
- [x] Session-based authentication with RBAC
- [x] JWT security testing
- [x] OWASP ZAP API security scanning
- [ ] Error message UI (toast notifications, retry buttons)
- [ ] WebSocket real-time updates
- [ ] Route optimization
- [ ] Maintenance scheduling

---

## 📝 License

MIT — see [LICENSE](LICENSE) for details.

---

**Made with ⚡ by Jingling Jin**