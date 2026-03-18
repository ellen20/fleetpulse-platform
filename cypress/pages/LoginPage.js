// cypress/pages/LoginPage.js
// Page Object Model for Login Page

class LoginPage {
  // ─── Selectors ───────────────────────────────────────────
  get pageContainer()    { return cy.get('[data-testid="login-page"]'); }
  get emailInput()       { return cy.get('[data-testid="email-input"]'); }
  get passwordInput()    { return cy.get('[data-testid="password-input"]'); }
  get submitButton()     { return cy.get('[data-testid="login-submit"]'); }
  get errorMessage()     { return cy.get('[data-testid="login-error"]'); }
  get togglePassword()   { return cy.get('[data-testid="toggle-password"]'); }
  get demoManager()      { return cy.get('[data-testid="demo-manager"]'); }
  get demoViewer()       { return cy.get('[data-testid="demo-viewer"]'); }

  // ─── Actions ─────────────────────────────────────────────
  visit() {
    cy.visit('/login');
    this.pageContainer.should('exist');
  }

  typeEmail(email) {
    this.emailInput.clear().type(email);
  }

  typePassword(password) {
    this.passwordInput.clear().type(password);
  }

  submit() {
    this.submitButton.click();
  }

  login(email, password) {
    this.typeEmail(email);
    this.typePassword(password);
    this.submit();
  }

  loginAsManager() {
    this.login('manager@fleetpulse.com', 'manager123');
  }

  loginAsViewer() {
    this.login('viewer@fleetpulse.com', 'viewer123');
  }

  clickDemoManager() {
    this.demoManager.click();
  }

  clickDemoViewer() {
    this.demoViewer.click();
  }

  togglePasswordVisibility() {
    this.togglePassword.click();
  }

  // ─── Assertions ──────────────────────────────────────────
  shouldBeVisible() {
    this.pageContainer.should('be.visible');
    cy.url().should('include', '/login');
  }

  shouldShowError(message) {
    this.errorMessage.should('be.visible').and('contain', message);
  }

  shouldNotShowError() {
    this.errorMessage.should('not.exist');
  }

  shouldShowPasswordText() {
    this.passwordInput.should('have.attr', 'type', 'text');
  }

  shouldShowPasswordMasked() {
    this.passwordInput.should('have.attr', 'type', 'password');
  }

  shouldHaveEmailFilled(email) {
    this.emailInput.should('have.value', email);
  }

  shouldHavePasswordFilled(password) {
    this.passwordInput.should('have.value', password);
  }

  shouldBeLoading() {
    this.submitButton.should('contain', 'Signing in...');
  }
}

export default new LoginPage();