import { Page, Locator } from '@playwright/test';

export class DashboardPage {
  readonly page: Page;
  readonly logoutButton: Locator;
  readonly statusCards: Locator;
  readonly vehicleList: Locator;
  readonly assignmentsTable: Locator;

  constructor(page: Page) {
    this.page = page;
    this.logoutButton = page.getByTestId('logout-btn');
    this.statusCards = page.getByTestId('status-cards').first();
    this.vehicleList = page.getByTestId('vehicle-list');
    this.assignmentsTable = page.getByTestId('assignments-table');
  }

  async gotoTab(tab: string) {
    await this.page.getByTestId(`tab-${tab}`).click();
  }

  assignButton(vehicleCode: string): Locator {
    return this.page.getByTestId(`assign-btn-${vehicleCode}`);
  }

  cancelButton(vehicleCode: string): Locator {
    return this.page.getByTestId(`cancel-btn-${vehicleCode}`);
  }

  vehicleRow(vehicleCode: string): Locator {
    return this.page.getByTestId(`vehicle-row-${vehicleCode}`);
  }

  async logout() {
    await this.logoutButton.click();
  }
}