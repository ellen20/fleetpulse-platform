// Page Object Model for Login Page

class LoginPage {
  // ─── Selectors ───────────────────────────────────────────
  get pageContainer(): Cypress.Chainable<JQuery<HTMLElement>> { return cy.get('[data-testid="login-page"]') }
  get emailInput(): Cypress.Chainable<JQuery<HTMLElement>> { return cy.get('[data-testid="email-input"]') }
  get passwordInput(): Cypress.Chainable<JQuery<HTMLElement>> { return cy.get('[data-testid="password-input"]') }
  get submitButton(): Cypress.Chainable<JQuery<HTMLElement>> { return cy.get('[data-testid="login-submit"]') }
  get errorMessage(): Cypress.Chainable<JQuery<HTMLElement>> { return cy.get('[data-testid="login-error"]') }
  get togglePassword(): Cypress.Chainable<JQuery<HTMLElement>> { return cy.get('[data-testid="toggle-password"]') }
  get demoManager(): Cypress.Chainable<JQuery<HTMLElement>> { return cy.get('[data-testid="demo-manager"]') }
  get demoViewer(): Cypress.Chainable<JQuery<HTMLElement>> { return cy.get('[data-testid="demo-viewer"]') }

  // ─── Actions ─────────────────────────────────────────────
  visit(): void {
    cy.visit('/login')
    this.pageContainer.should('exist')
  }

  typeEmail(email: string): void {
    this.emailInput.clear().type(email)
  }

  typePassword(password: string): void {
    this.passwordInput.clear().type(password)
  }

  submit(): void {
    this.submitButton.click()
  }

  login(email: string, password: string): void {
    this.typeEmail(email)
    this.typePassword(password)
    this.submit()
  }

  loginAsManager(): void {
    this.login('manager@fleetpulse.com', 'manager123')
  }

  loginAsViewer(): void {
    this.login('viewer@fleetpulse.com', 'viewer123')
  }

  clickDemoManager(): void {
    this.demoManager.click()
  }

  clickDemoViewer(): void {
    this.demoViewer.click()
  }

  togglePasswordVisibility(): void {
    this.togglePassword.click()
  }

  // ─── Assertions ──────────────────────────────────────────
  shouldBeVisible(): void {
    this.pageContainer.should('be.visible')
    cy.url().should('include', '/login')
  }

  shouldShowError(message: string): void {
    this.errorMessage.should('be.visible').and('contain', message)
  }

  shouldNotShowError(): void {
    this.errorMessage.should('not.exist')
  }

  shouldShowPasswordText(): void {
    this.passwordInput.should('have.attr', 'type', 'text')
  }

  shouldShowPasswordMasked(): void {
    this.passwordInput.should('have.attr', 'type', 'password')
  }

  shouldHaveEmailFilled(email: string): void {
    this.emailInput.should('have.value', email)
  }

  shouldHavePasswordFilled(password: string): void {
    this.passwordInput.should('have.value', password)
  }

  shouldBeLoading(): void {
    this.submitButton.should('contain', 'Signing in...')
  }
}

export default new LoginPage()
