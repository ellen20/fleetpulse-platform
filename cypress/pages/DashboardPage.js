// cypress/pages/DashboardPage.js
// Page Object Model for Dashboard Page (auth-related elements)

class DashboardPage {
  // ─── Selectors ───────────────────────────────────────────
  get logoutButton()    { return cy.get('[data-testid="logout-btn"]'); }
  get authLoading()     { return cy.get('[data-testid="auth-loading"]'); }
  get fleetMapTab()     { return cy.get('[data-testid="tab-map"]'); }
  get assignmentsTab()  { return cy.get('[data-testid="tab-assignments"]'); }
  get statusCards()     { return cy.get('[data-testid="status-cards"]'); }

  // ─── Actions ─────────────────────────────────────────────
  visit() {
    cy.visit('/dashboard');
  }

  logout() {
    this.logoutButton.click();
  }

  // ─── Assertions ──────────────────────────────────────────
  shouldBeVisible() {
    cy.url().should('include', '/dashboard');
  }

  shouldRedirectToLogin() {
    cy.url().should('include', '/login');
  }

  shouldShowLogoutButton() {
    this.logoutButton.should('be.visible');
  }

  shouldShowUserName(name) {
    cy.contains(name).should('be.visible');
  }

  shouldShowUserRole(role) {
    cy.contains(role).should('be.visible');
  }
}

export default new DashboardPage();