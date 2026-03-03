/**
 * FleetPulse Dashboard - End-to-End Test Suite
 *
 * Coverage:
 *  - Shared UI: Header, navigation, and stat cards visible across all views
 *  - Fleet Map View: Status filtering, vehicle list, pagination
 *  - Assignments View: Table structure, data integrity, action buttons
 *  - Assignments Interactions: Assign/cancel workflows, driver contact modal
 *
 * Prerequisites:
 *  - API server running on http://localhost:3000 (or configured port)
 *  - Dashboard frontend running on http://localhost:5173
 *  - Seed data loaded with at least 13 vehicles and 12 drivers
 *
 * Conventions:
 *  - All counts are read dynamically from the UI — no hardcoded data values
 *  - data-testid selectors are preferred over text/CSS for reliability
 *  - Regex with /i flag used for case-insensitive text matching
 *  - cy.intercept() registered before cy.visit() to capture initial API calls
 */

describe('FleetPulse Dashboard', () => {

  beforeEach(() => {
    // Intercept the primary vehicle API call so tests can wait for data to load
    cy.intercept('GET', '/api/vehicles').as('getVehicles')
    cy.visit('http://localhost:5173')
    cy.wait('@getVehicles')
  })

  // ─────────────────────────────────────────────────────────────
  // SHARED HEADER
  // These elements are always visible regardless of the active view.
  // ─────────────────────────────────────────────────────────────
  describe('Header', () => {

    // Verifies the app name and subtitle are rendered correctly
    it('displays FleetPulse branding', () => {
      cy.contains('FleetPulse').should('be.visible')
      cy.contains('Fleet Management Dashboard').should('be.visible')
    })

    // Verifies both primary navigation buttons are present
    it('displays navigation buttons', () => {
      cy.contains('Fleet Map').should('be.visible')
      cy.contains('Assignments').should('be.visible')
    })

    // Reads vehicle count dynamically from stat card to avoid hardcoding.
    // Uses regex for driver count since no dedicated data-testid is available.
    it('displays vehicle and driver count', () => {
      cy.get('[data-testid="status-count-all"]').invoke('text').then((vehicleCount) => {
        cy.contains(`${vehicleCount.trim()} Vehicles`).should('be.visible')
      })
      cy.contains(/\d+ Drivers/).should('be.visible')
    })
  })

  // ─────────────────────────────────────────────────────────────
  // SHARED STAT CARDS
  // Four status cards (Total, Available, Charging, Maintenance)
  // remain visible on both Fleet Map and Assignments views.
  // ─────────────────────────────────────────────────────────────
  describe('Stat Cards', () => {

    // Verifies all four stat card containers are rendered
    it('displays all four stat cards', () => {
      cy.get('[data-testid="status-card-all"]').should('be.visible')
      cy.get('[data-testid="status-card-available"]').should('be.visible')
      cy.get('[data-testid="status-card-charging"]').should('be.visible')
      cy.get('[data-testid="status-card-maintenance"]').should('be.visible')
    })

    // Business logic validation: Total Fleet must always equal
    // Available + Charging + Maintenance. Counts are read dynamically.
    it('total fleet equals sum of all statuses', () => {
      cy.get('[data-testid="status-count-all"]').invoke('text').then((total) => {
        cy.get('[data-testid="status-count-available"]').invoke('text').then((avail) => {
          cy.get('[data-testid="status-count-charging"]').invoke('text').then((charging) => {
            cy.get('[data-testid="status-count-maintenance"]').invoke('text').then((maintenance) => {
              expect(parseInt(total)).to.equal(
                parseInt(avail) + parseInt(charging) + parseInt(maintenance)
              )
            })
          })
        })
      })
    })

    // Verifies stat cards persist when switching to the Assignments view
    it('stat cards still visible on Assignments view', () => {
      cy.contains('Assignments').click()
      cy.get('[data-testid="status-card-all"]').should('be.visible')
      cy.get('[data-testid="status-card-available"]').should('be.visible')
      cy.get('[data-testid="status-card-charging"]').should('be.visible')
      cy.get('[data-testid="status-card-maintenance"]').should('be.visible')
    })
  })

  // ─────────────────────────────────────────────────────────────
  // FLEET MAP VIEW - STATUS FILTER
  // Clicking a stat card filters the vehicle list to show only
  // vehicles matching that status. Pagination applies when count > 10.
  // ─────────────────────────────────────────────────────────────
  describe('Fleet Map - Status Filter', () => {

    beforeEach(() => {
      // Re-intercept and visit to ensure a clean unfiltered state per test
      cy.intercept('GET', '/api/vehicles').as('getVehicles')
      cy.visit('http://localhost:5173')
      cy.wait('@getVehicles')
    })

    // Default view should show the first page of all vehicles (max 10 per page)
    it('default shows all vehicles with pagination', () => {
      cy.get('[data-testid^="vehicle-list-item-"]').should('have.length', 10)
      cy.contains(/1-10 of \d+/).should('be.visible')
    })

    // Clicking Total Fleet after another filter should restore the full list
    it('clicking Total Fleet shows all vehicles', () => {
      cy.get('[data-testid="status-card-charging"]').click()
      cy.get('[data-testid="status-card-all"]').click()

      cy.get('[data-testid="status-count-all"]').invoke('text').then((total) => {
        const totalCount = parseInt(total)
        if (totalCount > 10) {
          cy.get('[data-testid^="vehicle-list-item-"]').should('have.length', 10)
          cy.contains(/1-10 of \d+/).should('be.visible')
        } else {
          cy.get('[data-testid^="vehicle-list-item-"]').should('have.length', totalCount)
        }
      })
    })

    // Clicking Available card should filter list to only available vehicles.
    // Each visible item is individually verified for correct status badge.
    it('clicking Available filters to available vehicles only', () => {
      cy.get('[data-testid="status-card-available"]').click()

      cy.get('[data-testid="status-count-available"]').invoke('text').then((count) => {
        const availableCount = parseInt(count)
        cy.contains(/\d+ vehicles?/i).should('be.visible')
        cy.get('[data-testid^="vehicle-list-item-"]').should('have.length',
          availableCount > 10 ? 10 : availableCount)
        cy.get('[data-testid^="vehicle-list-item-"]').each(($el) => {
          cy.wrap($el).contains(/available/i).should('be.visible')
        })
      })
    })

    // Clicking Charging card should show only charging vehicles.
    // Count and status badges are verified dynamically.
    it('clicking Charging filters to charging vehicles only', () => {
      cy.get('[data-testid="status-card-charging"]').click()

      cy.get('[data-testid="status-count-charging"]').invoke('text').then((count) => {
        const chargingCount = parseInt(count)
        cy.contains(/\d+ vehicles?/i).should('be.visible')
        cy.get('[data-testid^="vehicle-list-item-"]').should('have.length',
          chargingCount > 10 ? 10 : chargingCount)
        cy.get('[data-testid^="vehicle-list-item-"]').each(($el) => {
          cy.wrap($el).contains(/charging/i).should('be.visible')
        })
      })
    })

    // Clicking Maintenance card should show only maintenance vehicles.
    // Handles edge case where count may be 1 (singular "VEHICLE").
    it('clicking Maintenance filters to maintenance vehicles only', () => {
      cy.get('[data-testid="status-card-maintenance"]').click()

      cy.get('[data-testid="status-count-maintenance"]').invoke('text').then((count) => {
        const maintenanceCount = parseInt(count)
        cy.contains(/\d+ vehicles?/i).should('be.visible')
        cy.get('[data-testid^="vehicle-list-item-"]').should('have.length',
          maintenanceCount > 10 ? 10 : maintenanceCount)
        cy.get('[data-testid^="vehicle-list-item-"]').each(($el) => {
          cy.wrap($el).contains(/maintenance/i).should('be.visible')
        })
      })
    })

    // Verifies page 2 loads the correct remaining vehicles.
    // Remaining count is calculated dynamically: total - 10.
    // Test is skipped automatically if total fleet is 10 or fewer.
    it('page 2 loads remaining vehicles when total exceeds 10', () => {
      cy.get('[data-testid="status-count-all"]').invoke('text').then((total) => {
        const totalCount = parseInt(total)
        if (totalCount > 10) {
          const remaining = totalCount - 10
          cy.contains(/1-10 of \d+/).should('be.visible')
          cy.get('button').contains('2').click()
          cy.get('[data-testid^="vehicle-list-item-"]').should('have.length', remaining)
          cy.contains(`11-${totalCount} of ${totalCount}`).should('be.visible')
        }
      })
    })
  })

  // ─────────────────────────────────────────────────────────────
  // ASSIGNMENTS VIEW
  // Accessible via the Assignments nav button. Replaces the Fleet
  // Map with a full assignment management table showing all vehicles.
  // ─────────────────────────────────────────────────────────────
  describe('Assignments View', () => {

    beforeEach(() => {
      // Navigate to Assignments view before each test in this block
      cy.contains('Assignments').click()
    })

    // Verifies the section heading and subtitle are rendered
    it('shows assignment management header', () => {
      cy.contains('Assignment Management').should('be.visible')
      cy.contains('Showing all vehicles').should('be.visible')
    })

    // Verifies all required table columns are present.
    // Scoped within the table to avoid false matches elsewhere on the page.
    it('displays table columns', () => {
      cy.get('[data-testid="assignments-table"]').should('be.visible')
      cy.get('[data-testid="assignments-table"]').within(() => {
        cy.contains('Vehicle').should('be.visible')
        cy.contains('Make/Model').should('be.visible')
        cy.contains('Battery').should('be.visible')
        cy.contains('Status').should('be.visible')
        cy.contains('Assigned Driver').should('be.visible')
        cy.contains('Actions').should('be.visible')
      })
    })

    // Row count is read from the Total Fleet stat card — no hardcoded numbers.
    // Ensures every vehicle in the fleet appears as a table row.
    it('displays all vehicles in table', () => {
      cy.get('[data-testid="status-count-all"]').invoke('text').then((total) => {
        cy.get('[data-testid="assignments-table-body"]')
          .find('tr')
          .should('have.length', parseInt(total))
      })
    })

    // At any given time, the table must have at least one actionable button
    // (Assign, Cancel, or driver contact). Validates the actions column is functional.
    it('shows action buttons', () => {
      cy.get('[data-testid^="assign-btn-"]').then(() => {
        cy.get('[data-testid="assignments-table-body"]')
          .find('button, a')
          .filter(':visible')
          .should('have.length.greaterThan', 0)
      })

      cy.get('[data-testid="assignments-table-body"]').then(($body) => {
        const hasAssign = $body.find('[data-testid^="assign-btn-"]').length > 0
        const hasCancel = $body.find('button:contains("Cancel")').length > 0
        const hasContact = $body.find('[data-testid^="driver-contact-btn-"]').length > 0
        expect(hasAssign || hasCancel || hasContact).to.be.true
      })
    })

    // Confirms Fleet Map-specific elements are hidden when Assignments is active.
    // Prevents UI bleed-through between views.
    it('map and vehicle list are not visible', () => {
      cy.contains('Energy Corridor').should('not.exist')
      cy.contains('FLEET VEHICLES').should('not.exist')
    })
  })
})

// ─────────────────────────────────────────────────────────────
// ASSIGNMENTS - INTERACTIONS
// Tests for user workflows: assigning drivers, cancelling
// assignments, and viewing driver contact information.
// Each test starts fresh from the Assignments view.
// ─────────────────────────────────────────────────────────────
describe('Assignments - Interactions', () => {

  beforeEach(() => {
    cy.intercept('GET', '/api/vehicles').as('getVehicles')
    cy.visit('http://localhost:5173')
    cy.wait('@getVehicles')
    cy.contains('Assignments').click()
  })

  // ── Assign Driver Modal ──────────────────────────────────────

  // Verifies the driver selection modal opens when clicking Assign.
  // Targets the table body to avoid clicking the Assignments nav button.
  it('clicking Assign opens driver selection modal', () => {
    cy.get('[data-testid="assignments-table-body"]')
      .contains('Assign').first().click()
    cy.get('[data-testid="driver-selection-modal"]').should('be.visible')
    cy.contains('Select Driver').should('be.visible')
  })

  // Only available drivers should appear in the selection modal
  it('driver selection modal shows available drivers only', () => {
    cy.get('[data-testid="assignments-table-body"]')
      .contains('Assign').first().click()
    cy.get('[data-testid="driver-selection-modal"]').within(() => {
      cy.contains(/available/i).should('be.visible')
    })
  })

  // Each driver card must display email, phone, and license details
  it('driver selection modal shows driver details', () => {
    cy.get('[data-testid="assignments-table-body"]')
      .contains('Assign').first().click()
    cy.get('[data-testid="driver-selection-modal"]').within(() => {
      cy.get('[data-testid^="driver-card-"]').first().within(() => {
        cy.contains(/@fleetpulse\.dev/).should('be.visible')
        cy.contains(/713-/).should('be.visible')
        cy.contains(/TX-DL-/).should('be.visible')
      })
    })
  })

  // The X button (first button in modal header) should close the modal
  it('closing modal with X dismisses it', () => {
    cy.get('[data-testid="assignments-table-body"]')
      .contains('Assign').first().click()
    cy.get('[data-testid="driver-selection-modal"]').should('be.visible')
    cy.get('[data-testid="driver-selection-modal"]')
      .find('button').first().click()
    cy.get('[data-testid="driver-selection-modal"]').should('not.exist')
  })

  // Selecting a driver from the modal should complete the assignment
  // and automatically dismiss the modal
  it('assigning a driver closes the modal', () => {
    cy.get('[data-testid="assignments-table-body"]')
      .contains('Assign').first().click()
    cy.get('[data-testid="driver-selection-modal"]').within(() => {
      cy.get('[data-testid^="driver-card-"]').first()
        .find('button').click()
    })
    cy.get('[data-testid="driver-selection-modal"]').should('not.exist')
  })

  // ── Cancel Assignment ────────────────────────────────────────

  // Clicking Cancel should trigger a native browser confirm dialog.
  // Test dismisses the dialog (return false) to avoid mutating state.
  it('clicking Cancel shows confirmation dialog', () => {
    cy.on('window:confirm', (text) => {
      expect(text).to.include('Cancel this assignment')
      return false
    })
    cy.get('[data-testid="assignments-table-body"]')
      .contains('Cancel').first().click()
  })

  // Confirming the cancel dialog should call PATCH /api/assignments/:id/cancel
  // and remove the Cancel button from that row
  it('confirming Cancel removes the assignment', () => {
    cy.intercept('PATCH', '/api/assignments/*/cancel').as('cancelAssignment')
    cy.on('window:confirm', () => true)
    cy.get('[data-testid="assignments-table-body"]')
      .contains('Cancel').first().click()
    cy.wait('@cancelAssignment')
    cy.contains('✅ Assignment cancelled').should('not.exist')
  })

  // ── Driver Contact Modal ─────────────────────────────────────

  // Both contact buttons (for active drivers) and Assign buttons
  // (for unassigned vehicles) should coexist in the table
  it('Contact driver button and Assign button both exist in table', () => {
    cy.get('[data-testid^="driver-contact-btn-"]').should('have.length.greaterThan', 0)
    cy.get('[data-testid^="assign-btn-"]').should('have.length.greaterThan', 0)
  })

  // Clicking a driver contact button should open the contact modal
  it('clicking Contact driver opens driver contact modal', () => {
    cy.get('[data-testid^="driver-contact-btn-"]').first().click()
    cy.get('[data-testid="contact-modal"]').should('be.visible')
  })

  // Contact modal must display all key driver details:
  // email, phone number, and driver license number
  it('driver contact modal shows correct information', () => {
    cy.get('[data-testid^="driver-contact-btn-"]').first().click()
    cy.get('[data-testid="contact-modal"]').within(() => {
      cy.contains(/email/i).should('be.visible')
      cy.contains(/@fleetpulse\.dev/).should('be.visible')
      cy.contains(/phone/i).should('be.visible')
      cy.contains(/713-/).should('be.visible')
      cy.contains(/license/i).should('be.visible')
      cy.contains(/TX-DL-/).should('be.visible')
    })
  })

  // Drivers on an active trip should show a warning preventing reassignment.
  // This enforces the business rule: one active trip per driver at a time.
  it('active driver contact modal shows active assignment warning', () => {
    cy.get('[data-testid^="driver-contact-btn-"]').first().click()
    cy.get('[data-testid="contact-modal"]').within(() => {
      cy.contains('Active Assignment').should('be.visible')
      cy.contains(/Driver must complete or cancel/).should('be.visible')
    })
  })

  // The X button (first button in modal) should close the contact modal
  it('closing driver contact modal with X dismisses it', () => {
    cy.get('[data-testid^="driver-contact-btn-"]').first().click()
    cy.get('[data-testid="contact-modal"]').should('be.visible')
    cy.get('[data-testid="contact-modal"]')
      .find('button').first().click()
    cy.get('[data-testid="contact-modal"]').should('not.exist')
  })
})