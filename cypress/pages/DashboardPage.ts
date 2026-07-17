// Page Object Model for Dashboard Page (auth-related elements)

class DashboardPage {
  // ─── Selectors ───────────────────────────────────────────
  get logoutButton(): Cypress.Chainable<JQuery<HTMLElement>> { return cy.get('[data-testid="logout-btn"]') }
  get authLoading(): Cypress.Chainable<JQuery<HTMLElement>> { return cy.get('[data-testid="auth-loading"]') }
  get fleetMapTab(): Cypress.Chainable<JQuery<HTMLElement>> { return cy.get('[data-testid="tab-map"]') }
  get assignmentsTab(): Cypress.Chainable<JQuery<HTMLElement>> { return cy.get('[data-testid="tab-assignments"]') }
  get statusCards(): Cypress.Chainable<JQuery<HTMLElement>> { return cy.get('[data-testid="status-cards"]') }

  // ─── Actions ─────────────────────────────────────────────
  visit(): void {
    cy.visit('/dashboard')
  }

  logout(): void {
    this.logoutButton.click()
  }

  // ─── Assertions ──────────────────────────────────────────
  shouldBeVisible(): void {
    cy.url().should('include', '/dashboard')
  }

  shouldRedirectToLogin(): void {
    cy.url().should('include', '/login')
  }

  shouldShowLogoutButton(): void {
    this.logoutButton.should('be.visible')
  }

  shouldShowUserName(name: string): void {
    cy.contains(name).should('be.visible')
  }

  shouldShowUserRole(role: string): void {
    cy.contains(role).should('be.visible')
  }
}

export default new DashboardPage()
