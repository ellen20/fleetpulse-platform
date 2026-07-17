/**
 * FleetPulse - RBAC Tests
 *
 * Verifies role-based access control is enforced in the dashboard UI.
 * Manager role has full access; Viewer role is read-only.
 *
 * Credentials: cypress/fixtures/users.json
 * Custom command: cy.loginAs(role)
 */

describe('RBAC - Manager Role', () => {

  beforeEach(() => {
    cy.loginAs('manager')
    cy.get('[data-testid="tab-assignments"]').click()
  })

  it('can see Assign button for available vehicles', () => {
    cy.get('[data-testid^="assign-btn-"]').should('exist')
  })

  it('can see Cancel button for pending assignments', () => {
    cy.get('[data-testid^="cancel-btn-"]').should('exist')
  })

  it('can open driver selection modal', () => {
    cy.get('[data-testid^="assign-btn-"]').first().click()
    cy.get('[data-testid="driver-selection-modal"]').should('be.visible')
  })

  it('does not see View only text', () => {
    cy.contains('View only').should('not.exist')
  })

  it('name is displayed in header', () => {
    cy.fixture('users').then((users) => {
      cy.contains(users.manager.name).should('be.visible')
    })
  })
})

describe('RBAC - Viewer Role', () => {

  beforeEach(() => {
    cy.loginAs('viewer')
    cy.get('[data-testid="tab-assignments"]').click()
  })

  it('cannot see Assign button', () => {
    cy.get('[data-testid^="assign-btn-"]').should('not.exist')
  })

  it('cannot see Cancel button', () => {
    cy.get('[data-testid^="cancel-btn-"]').should('not.exist')
  })

  it('sees View only text instead of action buttons', () => {
    cy.contains('View only').should('be.visible')
  })

  it('can still see all vehicles in table', () => {
    cy.get('[data-testid="status-count-all"]').invoke('text').then((total) => {
      cy.get('[data-testid="assignments-table-body"]')
        .find('tr')
        .should('have.length', parseInt(total))
    })
  })

  it('can still see all stat cards', () => {
    cy.get('[data-testid="status-card-all"]').should('be.visible')
    cy.get('[data-testid="status-card-available"]').should('be.visible')
    cy.get('[data-testid="status-card-charging"]').should('be.visible')
    cy.get('[data-testid="status-card-maintenance"]').should('be.visible')
  })

  it('can still filter vehicles by status on fleet map', () => {
    cy.get('[data-testid="tab-map"]').click()
    cy.get('[data-testid="status-card-available"]').click()
    cy.get('[data-testid^="vehicle-list-item-"]').should('have.length.greaterThan', 0)
  })

  it('can see driver contact buttons', () => {
    cy.get('[data-testid^="driver-contact-btn-"]').should('have.length.greaterThan', 0)
  })

  it('name is displayed in header', () => {
    cy.fixture('users').then((users) => {
      cy.contains(users.viewer.name).should('be.visible')
    })
  })

  it('can logout successfully', () => {
    cy.get('[data-testid="logout-btn"]').click()
    cy.url().should('include', '/login')
  })
})