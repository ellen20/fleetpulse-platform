export {}

interface UserCredentials {
  email: string
  password: string
  name: string
  role: string
}

interface UsersFixture {
  manager: UserCredentials
  viewer: UserCredentials
}

declare global {
  namespace Cypress {
    interface Chainable {
      loginAs(role: keyof UsersFixture): Chainable<void>
    }
  }
}

Cypress.Commands.add('loginAs', (role: keyof UsersFixture) => {
  cy.fixture<UsersFixture>('users').then((users) => {
    const user = users[role]
    cy.visit('http://localhost:5173/login')
    cy.get('[data-testid="email-input"]').type(user.email)
    cy.get('[data-testid="password-input"]').type(user.password)
    cy.intercept('GET', '/api/vehicles').as('getVehicles')
    cy.get('[data-testid="login-submit"]').click()
    cy.url().should('include', '/dashboard')
    cy.wait('@getVehicles')
  })
})
