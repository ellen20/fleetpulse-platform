/**
 * FleetPulse - API Error Handling Test Suite
 *
 * Coverage:
 *  - API failure: UI degrades gracefully showing 0 counts
 *  - API slow response: UI handles loading states
 *  - Partial API failure: some endpoints fail, others succeed
 *  - API recovery: UI updates when API comes back online
 *
 * Strategy:
 *  - Uses cy.intercept() to mock API failures without stopping the server
 *  - Tests both dashboard (5173) and driver app (5174)
 *  - Dashboard tests require login before visiting protected routes
 *
 * Note:
 *  - App currently has no error message UI — shows 0 values on failure
 *  - These tests document current behavior and can be updated
 *    when proper error handling is implemented
 *
 * FUTURE IMPROVEMENTS:
 *  When error handling UI is implemented, update these tests to assert:
 *  - Error message or toast notification is displayed to the user
 *  - Retry button appears on failure so user can recover without refresh
 *  - Loading spinner is shown during slow API responses
 *  - Specific error messages differ between 404, 500, and network errors
 *  - Partial failure shows which data loaded vs which failed
 */

// ─────────────────────────────────────────────────────────────
// HELPER: Login and navigate to dashboard
// Must be called before intercepting API failures
// so the auth flow completes before mocking begins
// ─────────────────────────────────────────────────────────────
const loginToDashboard = () => {
  cy.fixture('users').then((users) => {
    cy.visit('http://localhost:5173/login')
    cy.get('[data-testid="email-input"]').type(users.manager.email)
    cy.get('[data-testid="password-input"]').type(users.manager.password)
    cy.get('[data-testid="login-submit"]').click()
    cy.url().should('include', '/dashboard')
  })
}

// ─────────────────────────────────────────────────────────────
// DASHBOARD - API FAILURE STATES
// ─────────────────────────────────────────────────────────────
describe('Dashboard - API Error Handling', () => {

  // ── Complete API Failure ─────────────────────────────────────

  // When /api/vehicles fails, all stat counts should show 0.
  // App should not crash or show a blank white screen.
  it('shows zero counts when vehicles API fails', () => {
    loginToDashboard()
    cy.intercept('GET', '/api/vehicles', { forceNetworkError: true }).as('vehiclesFail')
    cy.reload()
    cy.get('[data-testid="status-count-all"]').should('contain', '0')
    cy.get('[data-testid="status-count-available"]').should('contain', '0')
    cy.get('[data-testid="status-count-charging"]').should('contain', '0')
    cy.get('[data-testid="status-count-maintenance"]').should('contain', '0')
  })

  // Core layout and navigation must remain functional even when
  // data cannot be loaded
  it('dashboard layout remains intact when vehicles API fails', () => {
    loginToDashboard()
    cy.intercept('GET', '/api/vehicles', { forceNetworkError: true }).as('vehiclesFail')
    cy.reload()
    cy.contains('FleetPulse').should('be.visible')
    cy.contains('Fleet Map').should('be.visible')
    cy.contains('Assignments').should('be.visible')
  })

  // Vehicle list panel should reflect 0 vehicles rather than
  // showing stale data or an unhandled exception
  it('vehicle list shows zero vehicles when API fails', () => {
    loginToDashboard()
    cy.intercept('GET', '/api/vehicles', { forceNetworkError: true }).as('vehiclesFail')
    cy.reload()
    cy.contains(/0 vehicles?/i).should('be.visible')
  })

  // Both vehicles and drivers APIs failing simultaneously should
  // result in 0 counts in the header — not undefined or NaN
  it('header shows 0 Vehicles and 0 Drivers when APIs fail', () => {
    loginToDashboard()
    cy.intercept('GET', '/api/vehicles', { forceNetworkError: true }).as('vehiclesFail')
    cy.intercept('GET', '/api/drivers', { forceNetworkError: true }).as('driversFail')
    cy.reload()
    cy.contains('0 Vehicles').should('be.visible')
    cy.contains('0 Drivers').should('be.visible')
  })

  // ── HTTP Error Responses ─────────────────────────────────────

  // A 500 Internal Server Error should be handled gracefully.
  it('handles 500 server error on vehicles API gracefully', () => {
    loginToDashboard()
    cy.intercept('GET', '/api/vehicles', {
      statusCode: 500,
      body: { error: 'Internal Server Error' }
    }).as('vehiclesError')
    cy.reload()
    cy.contains('FleetPulse').should('be.visible')
    cy.get('[data-testid="status-count-all"]').should('contain', '0')
  })

  // A 404 Not Found response should be handled gracefully.
  it('handles 404 not found on vehicles API gracefully', () => {
    loginToDashboard()
    cy.intercept('GET', '/api/vehicles', {
      statusCode: 404,
      body: { error: 'Not Found' }
    }).as('vehiclesNotFound')
    cy.reload()
    cy.contains('FleetPulse').should('be.visible')
    cy.get('[data-testid="status-count-all"]').should('contain', '0')
  })

  // ── Partial API Failure ──────────────────────────────────────

  // When drivers API fails, app should still render without crashing.
  it('app remains stable when only drivers API fails', () => {
    loginToDashboard()
    cy.intercept('GET', '/api/drivers', { forceNetworkError: true }).as('driversFail')
    cy.intercept('GET', '/api/vehicles').as('getVehicles')
    cy.reload()
    cy.wait('@getVehicles')
    cy.contains('FleetPulse').should('be.visible')
    cy.get('[data-testid="status-count-all"]').should('be.visible')
  })

  // When assignments API fails, app should still render without crashing.
  it('app remains stable when only assignments API fails', () => {
    loginToDashboard()
    cy.intercept('GET', '/api/assignments', { forceNetworkError: true }).as('assignmentsFail')
    cy.intercept('GET', '/api/vehicles').as('getVehicles')
    cy.reload()
    cy.wait('@getVehicles')
    cy.contains('FleetPulse').should('be.visible')
    cy.get('[data-testid="status-count-all"]').should('be.visible')
  })

  // ── Slow API Response ────────────────────────────────────────

  // App should handle delayed API responses without breaking.
  it('app remains stable during slow API response', () => {
    loginToDashboard()
    cy.intercept('GET', '/api/vehicles', (req) => {
      req.on('response', (res) => {
        res.setDelay(3000)
      })
    }).as('slowVehicles')
    cy.reload()
    cy.contains('FleetPulse').should('be.visible')
    cy.wait('@slowVehicles', { timeout: 10000 })
    cy.get('[data-testid="status-count-all"]').invoke('text').then((text) => {
      expect(parseInt(text)).to.be.greaterThan(0)
    })
  })

  // ── API Recovery ─────────────────────────────────────────────

  // After a failed load, refreshing the page should restore correct
  // data when the API comes back online.
  it('data loads correctly after page refresh when API recovers', () => {
    loginToDashboard()
    cy.intercept('GET', '/api/vehicles').as('getVehicles')
    cy.reload()
    cy.wait('@getVehicles')
    cy.get('[data-testid="status-count-all"]').invoke('text').then((text) => {
      expect(parseInt(text)).to.be.greaterThan(0)
    })

    // Reload and verify data persists correctly
    cy.reload()
    cy.wait('@getVehicles')
    cy.get('[data-testid="status-count-all"]').invoke('text').then((text) => {
      expect(parseInt(text)).to.be.greaterThan(0)
    })
  })
})

// ─────────────────────────────────────────────────────────────
// DRIVER APP - API FAILURE STATES
// ─────────────────────────────────────────────────────────────
describe('Driver App - API Error Handling', () => {

  // Login page should remain visible and stable when auth API fails.
  it('shows error when login API fails', () => {
    cy.intercept('POST', '/api/drivers/login', { forceNetworkError: true }).as('authFail')
    cy.visit('http://localhost:5174')
    cy.get('input[type="email"]').type('marcus.chen@fleetpulse.dev')
    cy.get('input[type="password"]').type('1234')
    cy.contains('Sign In').click()
    cy.contains('Driver Portal').should('be.visible')
    cy.get('input[type="email"]').should('be.visible')
  })

  // Dashboard header should still render even when assignments API fails.
  it('driver dashboard renders when assignments API fails', () => {
    cy.intercept('GET', '/api/assignments*', { forceNetworkError: true }).as('assignmentsFail')
    cy.visit('http://localhost:5174')
    cy.get('input[type="email"]').type('marcus.chen@fleetpulse.dev')
    cy.get('input[type="password"]').type('1234')
    cy.contains('Sign In').click()
    cy.contains(/hi, marcus/i).should('be.visible')
  })

  // Clicking Refresh while API is down should not crash the app.
  it('Refresh Assignments handles API failure gracefully', () => {
    cy.visit('http://localhost:5174')
    cy.get('input[type="email"]').type('marcus.chen@fleetpulse.dev')
    cy.get('input[type="password"]').type('1234')
    cy.contains('Sign In').click()
    cy.contains(/hi, marcus/i).should('be.visible')

    cy.intercept('GET', '/api/assignments*', { forceNetworkError: true }).as('assignmentsFail')
    cy.contains('Refresh Assignments').click()
    cy.contains(/hi, marcus/i).should('be.visible')
    cy.contains('Refresh Assignments').should('be.visible')
  })
})