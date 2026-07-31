import { type Page, type Locator } from '@playwright/test';

export class DriverAppPage {
  readonly page: Page;

  // Login screen
  readonly loginScreen: Locator;
  readonly emailInput: Locator;
  readonly pinInput: Locator;
  readonly loginBtn: Locator;
  readonly loginError: Locator;

  // Home screen
  readonly homeScreen: Locator;
  readonly logoutBtn: Locator;
  readonly statusCard: Locator;
  readonly statusLabel: Locator;
  readonly noAssignments: Locator;
  readonly refreshBtn: Locator;

  // Assignment detail screen
  readonly assignmentScreen: Locator;
  readonly backBtn: Locator;
  readonly assignmentId: Locator;
  readonly vehicleCode: Locator;
  readonly batteryPct: Locator;
  readonly tripTimer: Locator;
  readonly shiftComplete: Locator;
  readonly assignmentError: Locator;
  readonly startShiftBtn: Locator;
  readonly endShiftBtn: Locator;
  readonly confirmEndBtn: Locator;
  readonly cancelEndBtn: Locator;
  readonly backHomeBtn: Locator;

  constructor(page: Page) {
    this.page = page;

    // Login
    this.loginScreen  = page.getByTestId('driver-login-screen');
    this.emailInput   = page.getByTestId('driver-email-input');
    this.pinInput     = page.getByTestId('driver-pin-input');
    this.loginBtn     = page.getByTestId('driver-login-btn');
    this.loginError   = page.getByTestId('driver-login-error');

    // Home
    this.homeScreen    = page.getByTestId('driver-home-screen');
    this.logoutBtn     = page.getByTestId('driver-logout-btn');
    this.statusCard    = page.getByTestId('driver-status-card');
    this.statusLabel   = page.getByTestId('driver-status-label');
    this.noAssignments = page.getByTestId('driver-no-assignments');
    this.refreshBtn    = page.getByTestId('driver-refresh-btn');

    // Assignment detail
    this.assignmentScreen = page.getByTestId('driver-assignment-screen');
    this.backBtn          = page.getByTestId('driver-back-btn');
    this.assignmentId     = page.getByTestId('driver-assignment-id');
    this.vehicleCode      = page.getByTestId('driver-vehicle-code');
    this.batteryPct       = page.getByTestId('driver-battery-pct');
    this.tripTimer        = page.getByTestId('driver-trip-timer');
    this.shiftComplete    = page.getByTestId('driver-shift-complete');
    this.assignmentError  = page.getByTestId('driver-assignment-error');
    this.startShiftBtn    = page.getByTestId('driver-start-shift-btn');
    this.endShiftBtn      = page.getByTestId('driver-end-shift-btn');
    this.confirmEndBtn    = page.getByTestId('driver-confirm-end-btn');
    this.cancelEndBtn     = page.getByTestId('driver-cancel-end-btn');
    this.backHomeBtn      = page.getByTestId('driver-back-home-btn');
  }

  async goto() {
    await this.page.goto('http://localhost:5174');
  }

  async login(email: string, pin: string) {
    await this.emailInput.fill(email);
    await this.pinInput.fill(pin);
    await this.loginBtn.click();
  }

  assignmentCard(assignmentId: number | string): Locator {
    return this.page.getByTestId(`driver-assignment-card-${assignmentId}`);
  }

  async openAssignment(assignmentId: number | string) {
    await this.assignmentCard(assignmentId).click();
  }

  async startShift() {
    await this.startShiftBtn.click();
  }

  async endShift() {
    await this.endShiftBtn.click();
    await this.confirmEndBtn.click();
  }
}
