/**
 * FleetPulse - RBAC (Role-Based Access Control) Tests
 *
 * Coverage:
 *  - Manager role: full access to assign and cancel actions
 *  - Viewer role: read-only access, no action buttons visible
 *
 * AAA Pattern used throughout:
 *  - Arrange: set up preconditions (login, navigate)
 *  - Act:     perform the user action being tested
 *  - Assert:  verify the expected outcome
 *
 * These tests verify that role-based access control is correctly
 * enforced in the dashboard UI based on the authenticated user's role.
 * Credentials are managed centrally in cypress/fixtures/users.json.
 */

// ─────────────────────────────────────────────────────────────
// MANAGER ROLE — Full Access
// ─────────────────────────────────────────────────────────────
describe('RBAC - Manager Role', () => {

  beforeEach(() => {
    // Arrange — log in as manager and navigate to assignments tab
    cy.loginAs('manager')
    cy.get('[data-testid="tab-assignments"]').click()
  })

  it('manager can see Assign button for available vehicles', () => {
    // Arrange — manager is on assignments tab (handled by beforeEach)

    // Act — no action needed; verifying rendered state

    // Assert — assign button exists for available vehicles
    cy.get('[data-testid^="assign-btn-"]').should('exist')
  })

  it('manager can see Cancel button for pending assignments', () => {
    // Arrange — manager is on assignments tab (handled by beforeEach)

    // Act — no action needed; verifying rendered state

    // Assert — cancel button exists for pending assignments
    cy.get('[data-testid^="cancel-btn-"]').should('exist')
  })

  it('manager can open driver selection modal', () => {
    // Arrange — manager is on assignments tab (handled by beforeEach)

    // Act — click the first available assign button
    cy.get('[data-testid^="assign-btn-"]').first().click()

    // Assert — driver selection modal opens successfully
    cy.get('[data-testid="driver-selection-modal"]').should('be.visible')
  })

  it('manager does not see View only text', () => {
    // Arrange — manager is on assignments tab (handled by beforeEach)

    // Act — no action needed; verifying what is NOT rendered

    // Assert — "View only" text must not exist for manager role
    cy.contains('View only').should('not.exist')
  })

  it('manager name is displayed in header', () => {
    // Arrange — manager is logged in (handled by beforeEach)

    // Act — read manager credentials from fixture file
    cy.fixture('users').then((users) => {

      // Assert — manager name is visible in the dashboard header
      cy.contains(users.manager.name).should('be.visible')
    })
  })
})

// ─────────────────────────────────────────────────────────────
// VIEWER ROLE — Read-Only Access
// ─────────────────────────────────────────────────────────────
describe('RBAC - Viewer Role', () => {

  beforeEach(() => {
    // Arrange — log in as viewer and navigate to assignments tab
    cy.loginAs('viewer')
    cy.get('[data-testid="tab-assignments"]').click()
  })

  it('viewer cannot see Assign button', () => {
    // Arrange — viewer is on assignments tab (handled by beforeEach)

    // Act — no action needed; verifying what is NOT rendered

    // Assert — assign button must not exist for viewer role
    cy.get('[data-testid^="assign-btn-"]').should('not.exist')
  })

  it('viewer cannot see Cancel button', () => {
    // Arrange — viewer is on assignments tab (handled by beforeEach)

    // Act — no action needed; verifying what is NOT rendered

    // Assert — cancel button must not exist for viewer role
    cy.get('[data-testid^="cancel-btn-"]').should('not.exist')
  })

  it('viewer sees View only text instead of action buttons', () => {
    // Arrange — viewer is on assignments tab (handled by beforeEach)

    // Act — no action needed; verifying fallback text is rendered

    // Assert — "View only" placeholder text is shown in actions column
    cy.contains('View only').should('be.visible')
  })

  it('viewer can still see all vehicles in table', () => {
    // Arrange — viewer is on assignments tab (handled by beforeEach)

    // Act — read total vehicle count from stat card
    cy.get('[data-testid="status-count-all"]').invoke('text').then((total) => {

      // Assert — all vehicles are displayed in the assignments table
      cy.get('[data-testid="assignments-table-body"]')
        .find('tr')
        .should('have.length', parseInt(total))
    })
  })

  it('viewer can still see all stat cards', () => {
    // Arrange — viewer is on assignments tab (handled by beforeEach)

    // Act — no action needed; verifying stat cards are visible

    // Assert — all four stat cards remain visible for viewer role
    cy.get('[data-testid="status-card-all"]').should('be.visible')
    cy.get('[data-testid="status-card-available"]').should('be.visible')
    cy.get('[data-testid="status-card-charging"]').should('be.visible')
    cy.get('[data-testid="status-card-maintenance"]').should('be.visible')
  })

  it('viewer can still filter vehicles by status on fleet map', () => {
    // Arrange — navigate to fleet map tab where vehicle list is visible
    cy.get('[data-testid="tab-map"]').click()

    // Act — click the Available status filter card
    cy.get('[data-testid="status-card-available"]').click()

    // Assert — vehicle list updates to show available vehicles only
    cy.get('[data-testid^="vehicle-list-item-"]').should('have.length.greaterThan', 0)
  })

  it('viewer can see driver contact buttons', () => {
    // Arrange — viewer is on assignments tab (handled by beforeEach)

    // Act — no action needed; verifying contact buttons are visible

    // Assert — driver contact buttons exist for assigned vehicles
    cy.get('[data-testid^="driver-contact-btn-"]').should('have.length.greaterThan', 0)
  })

  it('viewer name is displayed in header', () => {
    // Arrange — viewer is logged in (handled by beforeEach)

    // Act — read viewer credentials from fixture file
    cy.fixture('users').then((users) => {

      // Assert — viewer name is visible in the dashboard header
      cy.contains(users.viewer.name).should('be.visible')
    })
  })

  it('viewer can logout successfully', () => {
    // Arrange — viewer is logged in (handled by beforeEach)

    // Act — click the logout button
    cy.get('[data-testid="logout-btn"]').click()

    // Assert — user is redirected to login page
    cy.url().should('include', '/login')
  })
})