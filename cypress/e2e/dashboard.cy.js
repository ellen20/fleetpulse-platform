/**
 * FleetPulse - Dashboard UI Tests
 *
 * Coverage:
 *  - Header: branding, navigation, vehicle/driver count, user name, logout
 *  - Stat Cards: all four cards visible, total equals sum of statuses
 *  - Fleet Map: status filtering, vehicle list, pagination
 */

describe('Dashboard - Header', () => {

  beforeEach(() => {
    cy.loginAs('manager')
  })

  it('displays FleetPulse branding', () => {
    cy.contains('FleetPulse').should('be.visible')
    cy.contains('Fleet Management Dashboard').should('be.visible')
  })

  it('displays navigation buttons', () => {
    cy.contains('Fleet Map').should('be.visible')
    cy.contains('Assignments').should('be.visible')
  })

  it('displays vehicle and driver count', () => {
    cy.get('[data-testid="status-count-all"]').invoke('text').then((vehicleCount) => {
      cy.contains(`${vehicleCount.trim()} Vehicles`).should('be.visible')
    })
    cy.contains(/\d+ Drivers/).should('be.visible')
  })

  it('displays logged in user name', () => {
    cy.fixture('users').then((users) => {
      cy.contains(users.manager.name).should('be.visible')
    })
  })

  it('logout button redirects to login page', () => {
    cy.get('[data-testid="logout-btn"]').click()
    cy.url().should('include', '/login')
    cy.get('[data-testid="login-page"]').should('be.visible')
  })
})

describe('Dashboard - Stat Cards', () => {

  beforeEach(() => {
    cy.loginAs('manager')
  })

  it('displays all four stat cards', () => {
    cy.get('[data-testid="status-card-all"]').should('be.visible')
    cy.get('[data-testid="status-card-available"]').should('be.visible')
    cy.get('[data-testid="status-card-charging"]').should('be.visible')
    cy.get('[data-testid="status-card-maintenance"]').should('be.visible')
  })

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

  it('stat cards still visible on Assignments view', () => {
    cy.get('[data-testid="tab-assignments"]').click()
    cy.get('[data-testid="status-card-all"]').should('be.visible')
    cy.get('[data-testid="status-card-available"]').should('be.visible')
    cy.get('[data-testid="status-card-charging"]').should('be.visible')
    cy.get('[data-testid="status-card-maintenance"]').should('be.visible')
  })
})

describe('Dashboard - Fleet Map', () => {

  beforeEach(() => {
    cy.loginAs('manager')
    cy.get('[data-testid="tab-map"]').click()
  })

  it('default shows all vehicles with pagination', () => {
    cy.get('[data-testid^="vehicle-list-item-"]').should('have.length', 10)
    cy.contains(/1-10 of \d+/).should('be.visible')
  })

  it('clicking Total Fleet restores full list', () => {
    cy.get('[data-testid="status-card-charging"]').click()
    cy.get('[data-testid="status-card-all"]').click()
    cy.get('[data-testid="status-count-all"]').invoke('text').then((total) => {
      const totalCount = parseInt(total)
      if (totalCount > 10) {
        cy.get('[data-testid^="vehicle-list-item-"]').should('have.length', 10)
      } else {
        cy.get('[data-testid^="vehicle-list-item-"]').should('have.length', totalCount)
      }
    })
  })

  it('clicking Available filters to available vehicles only', () => {
    cy.get('[data-testid="status-card-available"]').click()
    cy.get('[data-testid="status-count-available"]').invoke('text').then((count) => {
      const availableCount = parseInt(count)
      cy.get('[data-testid^="vehicle-list-item-"]').should('have.length',
        availableCount > 10 ? 10 : availableCount)
      cy.get('[data-testid^="vehicle-list-item-"]').each(($el) => {
        cy.wrap($el).contains(/available/i).should('be.visible')
      })
    })
  })

  it('clicking Charging filters to charging vehicles only', () => {
    cy.get('[data-testid="status-card-charging"]').click()
    cy.get('[data-testid="status-count-charging"]').invoke('text').then((count) => {
      const chargingCount = parseInt(count)
      cy.get('[data-testid^="vehicle-list-item-"]').should('have.length',
        chargingCount > 10 ? 10 : chargingCount)
      cy.get('[data-testid^="vehicle-list-item-"]').each(($el) => {
        cy.wrap($el).contains(/charging/i).should('be.visible')
      })
    })
  })

  it('clicking Maintenance filters to maintenance vehicles only', () => {
    cy.get('[data-testid="status-card-maintenance"]').click()
    cy.get('[data-testid="status-count-maintenance"]').invoke('text').then((count) => {
      const maintenanceCount = parseInt(count)
      cy.get('[data-testid^="vehicle-list-item-"]').should('have.length',
        maintenanceCount > 10 ? 10 : maintenanceCount)
      cy.get('[data-testid^="vehicle-list-item-"]').each(($el) => {
        cy.wrap($el).contains(/maintenance/i).should('be.visible')
      })
    })
  })

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