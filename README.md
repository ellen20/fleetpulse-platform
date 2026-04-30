# FleetPulse ⚡

> Real-Time EV Fleet Management System — Track vehicles, manage driver assignments, and monitor charging stations from a single dashboard.

![E2E Tests](https://img.shields.io/badge/E2E%20tests-80%2B%20passing-brightgreen)
![Pact](https://img.shields.io/badge/pact-verified-brightgreen)
![Cypress](https://img.shields.io/badge/cypress-tested-brightgreen)
![Node](https://img.shields.io/badge/node-%3E%3D18-green)
![License](https://img.shields.io/badge/license-MIT-blue)
![RBAC](https://img.shields.io/badge/RBAC-manager%20%7C%20viewer-orange)

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
- 🔐 **Authentication** — Session-based login with protected routes and logout
- 🛡️ **Role-Based Access Control (RBAC)** — Manager can assign/cancel; Viewer has read-only access enforced in UI

---

## 🏗️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Backend | Node.js, Express |
| Database | PostgreSQL |
| Frontend | React, Vite |
| E2E Testing | Playwright, Cypress |
| Contract Testing | Pact (Consumer + Provider) |
| Auth | Session-based auth, RBAC, Protected Routes |
| CI/CD | GitHub Actions |

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
│   │   ├── context/
│   │   │   └── AuthContext.jsx       # Auth state, login/logout, role management
│   │   ├── pages/
│   │   │   ├── LoginPage.jsx         # Login form with demo credentials
│   │   │   └── DashboardPage.jsx     # Fleet Map + Assignments with RBAC
│   │   └── main.jsx
│   ├── tests/pact/
│   │   └── fleetpulse.pact.test.js   # Pact consumer tests
│   └── vite.config.js
├── driver-app/                       # Driver-facing React app (port 5174)
│   ├── src/
│   │   ├── App.jsx                   # Driver portal (login, home, assignment screens)
│   │   └── main.jsx                  # React entry point
│   └── index.html
├── cypress/                          # Cypress E2E test suite
│   ├── e2e/
│   │   ├── auth.cy.js               # 9 authentication tests
│   │   ├── dashboard.cy.js          # 14 header, stat cards, fleet map tests
│   │   ├── assignments.cy.js        # 14 assignment workflow tests
│   │   ├── rbac.cy.js               # 12 role-based access control tests
│   │   ├── driver-app.cy.js         # 20+ driver app tests
│   │   └── api-errors.cy.js         # 15+ API error handling tests
│   ├── fixtures/
│   │   └── users.json               # Centralized test credentials (manager + viewer)
│   └── support/
│       └── commands.js              # cy.loginAs() custom command
├── pacts/                            # Generated Pact contract files
├── tests/
│   └── assignment-workflow.spec.js   # Playwright E2E tests
├── .github/
│   └── workflows/
│       └── cypress.yml               # GitHub Actions CI/CD pipeline
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
git clone https://github.com/ellen20/fleetpulse-platform.git
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

### 5. Set up and start the dashboard

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
| PATCH | `/api/assignments/:id/start` | Start assignment |
| PATCH | `/api/assignments/:id/complete` | Complete assignment |

### Charging Stations
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/charging-stations` | List all stations |

---

## 🧪 Testing

### E2E Tests (Cypress) — 80+ tests

Both the dashboard and driver app must be running before executing Cypress tests.

```bash
# Install Cypress
npm install cypress --save-dev

# Open Cypress Test Runner (interactive)
npx cypress open

# Run all tests headlessly
npx cypress run

# Run a specific file
npx cypress run --spec "cypress/e2e/rbac.cy.js"
```

#### Test credentials are managed centrally in `cypress/fixtures/users.json`
#### Reusable `cy.loginAs('manager')` and `cy.loginAs('viewer')` custom commands

---

#### auth.cy.js — 9 tests
- ✅ Login page renders correctly
- ✅ Demo credentials fill form on click
- ✅ Password toggle shows and hides password
- ✅ Invalid credentials show error message
- ✅ Empty fields show error message
- ✅ Manager can login and reach dashboard
- ✅ Viewer can login and reach dashboard
- ✅ Logout redirects to login page
- ✅ Authenticated user redirected away from login page

#### dashboard.cy.js — 14 tests
- ✅ Header branding and navigation buttons
- ✅ Vehicle and driver count displayed
- ✅ Logged in user name displayed in header
- ✅ Logout button redirects to login
- ✅ All four stat cards visible
- ✅ Total fleet equals sum of all statuses (business logic validation)
- ✅ Stat cards persist on Assignments view
- ✅ Default shows all vehicles with pagination
- ✅ Status filtering: Available, Charging, Maintenance
- ✅ Pagination page 2 loads remaining vehicles

#### assignments.cy.js — 14 tests
- ✅ Assignment management header visible
- ✅ All required table columns present
- ✅ All vehicles displayed in table
- ✅ At least one action button visible
- ✅ Fleet map elements hidden on assignments tab
- ✅ Assign button opens driver selection modal
- ✅ Modal shows available drivers only
- ✅ Modal shows driver details (email, phone, license)
- ✅ Closing modal with X dismisses it
- ✅ Assigning a driver closes the modal
- ✅ Cancel shows confirmation dialog
- ✅ Confirming cancel removes the assignment
- ✅ Driver contact modal opens and shows details
- ✅ Active assignment warning shown in contact modal

#### rbac.cy.js — 12 tests
- ✅ Manager can see Assign button for available vehicles
- ✅ Manager can see Cancel button for pending assignments
- ✅ Manager can open driver selection modal
- ✅ Manager does not see "View only" text
- ✅ Manager name displayed in header
- ✅ Viewer cannot see Assign button
- ✅ Viewer cannot see Cancel button
- ✅ Viewer sees "View only" text instead of action buttons
- ✅ Viewer can still see all vehicles in table
- ✅ Viewer can still filter vehicles by status
- ✅ Viewer name displayed in header
- ✅ Viewer can logout successfully

#### driver-app.cy.js — 20+ tests
- ✅ Login page UI and branding
- ✅ Form validation and disabled button states
- ✅ Invalid credentials error handling
- ✅ Successful login and dashboard redirect
- ✅ Driver dashboard: greeting, date, trip status
- ✅ Current assignments display and refresh
- ✅ Logout and session clearing

#### api-errors.cy.js — 15+ tests
- ✅ Zero counts shown when vehicles API fails
- ✅ Dashboard layout intact on API failure
- ✅ HTTP 500 and 404 errors handled gracefully
- ✅ Partial API failure: app stable when individual endpoints fail
- ✅ Slow API response: 3 second delay stability test
- ✅ Page refresh recovery after API comes back online
- ✅ Driver app: login, dashboard, and refresh failure handling

---

### Security & Auth Tests

**Authentication & Authorization:**
- ✅ Login flow with valid/invalid credentials
- ✅ Protected route enforcement — unauthenticated redirect
- ✅ RBAC validation — manager vs viewer role access enforced in UI
- ✅ Session persistence and logout clearing

> **Future Improvement:** API error tests will be expanded once error message UI (toast notifications, retry buttons, loading spinners) is implemented.

---

### E2E Tests (Playwright)

```bash
# From project root - backend + frontend must be running
npm install
npx playwright install chromium
npx playwright test
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

### CI/CD (GitHub Actions)

Cypress tests run automatically on every push and pull request to `main`:

```yaml
on:
  push:
    branches: [main]
  pull_request:
    branches: [main]
```

- ✅ PostgreSQL service spun up automatically
- ✅ Database initialized and seeded
- ✅ API server started
- ✅ Dashboard built and served
- ✅ Cypress tests executed headlessly
- ✅ Screenshots uploaded on failure

---

## 🛡️ Role-Based Access Control (RBAC)

FleetPulse enforces two roles in the dashboard:

| Feature | Manager | Viewer |
|---------|---------|--------|
| View fleet map | ✅ | ✅ |
| View vehicle list | ✅ | ✅ |
| View stat cards | ✅ | ✅ |
| Filter by status | ✅ | ✅ |
| View assignments table | ✅ | ✅ |
| View driver contact info | ✅ | ✅ |
| **Assign driver to vehicle** | ✅ | ❌ |
| **Cancel pending assignment** | ✅ | ❌ |

**Demo credentials:**
| Role | Email | Password |
|------|-------|----------|
| Manager | manager@fleetpulse.com | manager123 |
| Viewer | viewer@fleetpulse.com | viewer123 |

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
- [x] Role-Based Access Control — manager vs viewer enforced in UI
- [x] RBAC Cypress test coverage with fixtures-based credentials
- [x] GitHub Actions CI/CD pipeline
- [ ] Error message UI (toast notifications, retry buttons)
- [ ] WebSocket real-time updates
- [ ] Route optimization
- [ ] Maintenance scheduling

---

## 📝 License

MIT — see [LICENSE](LICENSE) for details.

---

**Made with ⚡ by Jingling Jin**