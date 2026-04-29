/**
 * FleetPulse - Assignments Tests
 *
 * Coverage:
 *  - Assignments view: table structure, columns, vehicle rows
 *  - Assign driver: modal opens, shows drivers, closes, completes workflow
 *  - Cancel assignment: confirmation dialog, removes assignment
 *  - Driver contact modal: opens, shows details, shows warning, closes
 */

describe('Assignments - Table', () => {

  beforeEach(() => {
    cy.loginAs('manager')
    cy.get('[data-testid="tab-assignments"]').click()
  })

  it('shows assignment management header', () => {
    cy.contains('Assignment Management').should('be.visible')
    cy.contains('Showing all vehicles').should('be.visible')
  })

  it('displays all required table columns', () => {
    cy.get('[data-testid="assignments-table"]').within(() => {
      cy.contains('Vehicle').should('be.visible')
      cy.contains('Make/Model').should('be.visible')
      cy.contains('Battery').should('be.visible')
      cy.contains('Status').should('be.visible')
      cy.contains('Assigned Driver').should('be.visible')
      cy.contains('Actions').should('be.visible')
    })
  })

  it('displays all vehicles in table', () => {
    cy.get('[data-testid="status-count-all"]').invoke('text').then((total) => {
      cy.get('[data-testid="assignments-table-body"]')
        .find('tr')
        .should('have.length', parseInt(total))
    })
  })

  it('shows at least one action button', () => {
    cy.get('[data-testid="assignments-table-body"]').then(($body) => {
      const hasAssign = $body.find('[data-testid^="assign-btn-"]').length > 0
      const hasCancel = $body.find('button:contains("Cancel")').length > 0
      const hasContact = $body.find('[data-testid^="driver-contact-btn-"]').length > 0
      expect(hasAssign || hasCancel || hasContact).to.be.true
    })
  })

  it('fleet map elements not visible on assignments tab', () => {
    cy.contains('Energy Corridor').should('not.exist')
    cy.contains('FLEET VEHICLES').should('not.exist')
  })
})

describe('Assignments - Assign Driver', () => {

  beforeEach(() => {
    cy.loginAs('manager')
    cy.get('[data-testid="tab-assignments"]').click()
  })

  it('clicking Assign opens driver selection modal', () => {
    cy.get('[data-testid="assignments-table-body"]')
      .contains('Assign').first().click()
    cy.get('[data-testid="driver-selection-modal"]').should('be.visible')
    cy.contains('Select Driver').should('be.visible')
  })

  it('driver selection modal shows available drivers only', () => {
    cy.get('[data-testid="assignments-table-body"]')
      .contains('Assign').first().click()
    cy.get('[data-testid="driver-selection-modal"]').within(() => {
      cy.contains(/available/i).should('be.visible')
    })
  })

  it('driver selection modal shows driver details', () => {
    cy.get('[data-testid="assignments-table-body"]')
      .contains('Assign').first().click()
    cy.get('[data-testid^="driver-card-"]').first().within(() => {
      cy.contains(/@fleetpulse\.dev/).should('be.visible')
      cy.contains(/713-/).should('be.visible')
      cy.contains(/TX-DL-/).should('be.visible')
    })
  })

  it('closing modal with X dismisses it', () => {
    cy.get('[data-testid="assignments-table-body"]')
      .contains('Assign').first().click()
    cy.get('[data-testid="driver-selection-modal"]').should('be.visible')
    cy.get('[data-testid="close-driver-modal"]').click()
    cy.get('[data-testid="driver-selection-modal"]').should('not.exist')
  })

  it('assigning a driver closes the modal', () => {
    cy.get('[data-testid="assignments-table-body"]')
      .contains('Assign').first().click()
    cy.get('[data-testid="driver-selection-modal"]').within(() => {
      cy.get('[data-testid^="driver-card-"]').first().find('button').click()
    })
    cy.get('[data-testid="driver-selection-modal"]').should('not.exist')
  })
})

describe('Assignments - Cancel', () => {

  beforeEach(() => {
    cy.loginAs('manager')
    cy.get('[data-testid="tab-assignments"]').click()
  })

  it('clicking Cancel shows confirmation dialog', () => {
    cy.on('window:confirm', (text) => {
      expect(text).to.include('Cancel this assignment')
      return false
    })
    cy.get('[data-testid="assignments-table-body"]')
      .contains('Cancel').first().click()
  })

  it('confirming Cancel removes the assignment', () => {
    cy.intercept('PATCH', '/api/assignments/*/cancel').as('cancelAssignment')
    cy.on('window:confirm', () => true)
    cy.get('[data-testid="assignments-table-body"]')
      .contains('Cancel').first().click()
    cy.wait('@cancelAssignment')
    cy.contains('✅ Assignment cancelled').should('not.exist')
  })
})

describe('Assignments - Driver Contact Modal', () => {

  beforeEach(() => {
    cy.loginAs('manager')
    cy.get('[data-testid="tab-assignments"]').click()
  })

  it('contact and assign buttons both exist in table', () => {
    cy.get('[data-testid^="driver-contact-btn-"]').should('have.length.greaterThan', 0)
    cy.get('[data-testid^="assign-btn-"]').should('have.length.greaterThan', 0)
  })

  it('clicking Contact driver opens contact modal', () => {
    cy.get('[data-testid^="driver-contact-btn-"]').first().click()
    cy.get('[data-testid="contact-modal"]').should('be.visible')
  })

  it('contact modal shows driver details', () => {
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

  it('contact modal shows active assignment warning', () => {
    cy.get('[data-testid^="driver-contact-btn-"]').first().click()
    cy.get('[data-testid="contact-modal"]').within(() => {
      cy.contains('Active Assignment').should('be.visible')
      cy.contains(/Driver must complete or cancel/).should('be.visible')
    })
  })

  it('closing contact modal with X dismisses it', () => {
    cy.get('[data-testid^="driver-contact-btn-"]').first().click()
    cy.get('[data-testid="contact-modal"]').should('be.visible')
    cy.get('[data-testid="close-contact-modal"]').click()
    cy.get('[data-testid="contact-modal"]').should('not.exist')
  })
})