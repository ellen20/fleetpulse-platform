import { Page, Locator } from '@playwright/test';

export class LoginPage {
  readonly page: Page;
  readonly emailInput: Locator;
  readonly passwordInput: Locator;
  readonly loginButton: Locator;
  readonly errorMessage: Locator;
  readonly togglePassword: Locator;
  readonly demoManagerButton: Locator;
  readonly demoViewerButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.emailInput = page.getByTestId('email-input');
    this.passwordInput = page.getByTestId('password-input');
    this.loginButton = page.getByTestId('login-submit');
    this.errorMessage = page.getByTestId('login-error');
    this.togglePassword = page.getByTestId('toggle-password');
    this.demoManagerButton = page.getByTestId('demo-manager');
    this.demoViewerButton = page.getByTestId('demo-viewer');
  }

  async goto() {
    await this.page.goto('/login');
  }

  async login(email: string, password: string) {
    await this.emailInput.fill(email);
    await this.passwordInput.fill(password);
    await this.loginButton.click();
  }

  async loginAsManager() {
    await this.demoManagerButton.click();
    await this.loginButton.click();
  }

  async loginAsViewer() {
    await this.demoViewerButton.click();
    await this.loginButton.click();
  }

  async getErrorMessage(): Promise<string> {
    return await this.errorMessage.innerText();
  }
}