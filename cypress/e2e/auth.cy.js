/**
 * FleetPulse - Authentication Tests
 *
 * Coverage:
 *  - Login page renders correctly
 *  - Demo credentials fill form
 *  - Password toggle visibility
 *  - Invalid/empty credentials show error
 *  - Manager and Viewer can login
 *  - Logout redirects to login
 *  - Authenticated user redirected from login page
 */

describe('Authentication', () => {

  it('login page loads correctly', () => {
    cy.visit('http://localhost:5173/login')
    cy.get('[data-testid="login-page"]').should('be.visible')
    cy.get('[data-testid="email-input"]').should('be.visible')
    cy.get('[data-testid="password-input"]').should('be.visible')
    cy.get('[data-testid="login-submit"]').should('be.visible')
  })

  it('demo credentials fill form on click', () => {
    cy.visit('http://localhost:5173/login')
    cy.get('[data-testid="demo-manager"]').click()
    cy.fixture('users').then((users) => {
      cy.get('[data-testid="email-input"]')
        .should('have.value', users.manager.email)
    })
  })

  it('password toggle shows and hides password', () => {
    cy.visit('http://localhost:5173/login')
    cy.get('[data-testid="password-input"]').type('testpassword')
    cy.get('[data-testid="password-input"]').should('have.attr', 'type', 'password')
    cy.get('[data-testid="toggle-password"]').click()
    cy.get('[data-testid="password-input"]').should('have.attr', 'type', 'text')
  })

  it('shows error with invalid credentials', () => {
    cy.visit('http://localhost:5173/login')
    cy.get('[data-testid="email-input"]').type('wrong@email.com')
    cy.get('[data-testid="password-input"]').type('wrongpassword')
    cy.get('[data-testid="login-submit"]').click()
    cy.get('[data-testid="login-error"]').should('be.visible')
  })

  it('shows error with empty fields', () => {
    cy.visit('http://localhost:5173/login')
    cy.get('[data-testid="login-submit"]').click()
    cy.get('[data-testid="login-error"]').should('be.visible')
  })

  it('manager can login and reach dashboard', () => {
    cy.loginAs('manager')
    cy.url().should('include', '/dashboard')
    cy.get('[data-testid="tab-map"]').should('be.visible')
  })

  it('viewer can login and reach dashboard', () => {
    cy.loginAs('viewer')
    cy.url().should('include', '/dashboard')
    cy.get('[data-testid="tab-map"]').should('be.visible')
  })

  it('logout redirects to login page', () => {
    cy.loginAs('manager')
    cy.get('[data-testid="logout-btn"]').click()
    cy.url().should('include', '/login')
    cy.get('[data-testid="login-page"]').should('be.visible')
  })

  it('authenticated user is redirected away from login page', () => {
    cy.loginAs('manager')
    cy.visit('http://localhost:5173/login')
    cy.url().should('include', '/dashboard')
  })
})