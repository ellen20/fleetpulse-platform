import { test, expect, type Dialog, type Browser } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';
import { DashboardPage } from '../pages/DashboardPage';
import { DriverAppPage } from '../pages/DriverAppPage';
import { resetAssignments } from '../helpers/cleanup';

const MANAGER = { email: 'manager@fleetpulse.com', password: 'manager123' };

const TEST_DRIVER = { name: 'Marcus Chen', email: 'marcus.chen@fleetpulse.dev', pin: '1234' };

test.describe('Cancel flow — manager cancels before driver starts', () => {
  test.setTimeout(60_000);

  test('cancelled assignment clears from dashboard and driver app', async ({ browser }: { browser: Browser }) => {
    const managerCtx = await browser.newContext({ baseURL: 'http://localhost:5173' });
    const driverCtx  = await browser.newContext({ baseURL: 'http://localhost:5174' });
    const managerPage = await managerCtx.newPage();
    const driverPage  = await driverCtx.newPage();

    const loginPage     = new LoginPage(managerPage);
    const dashboardPage = new DashboardPage(managerPage);
    const driverAppPage = new DriverAppPage(driverPage);

    try {
      await resetAssignments();

      // ── Manager logs in and navigates to assignments ───────────────────────
      await loginPage.goto();
      await loginPage.login(MANAGER.email, MANAGER.password);
      await expect(managerPage).toHaveURL('/dashboard');
      await dashboardPage.gotoTab('assignments');

      // ── Pick first available vehicle and assign a driver ──────────────────
      const firstAssignBtn = managerPage.getByTestId(/^assign-btn-/).first();
      await expect(firstAssignBtn).toBeVisible();
      const vehicleCode = (await firstAssignBtn.getAttribute('data-testid'))!.replace('assign-btn-', '');

      await firstAssignBtn.click();
      await expect(managerPage.getByTestId('driver-selection-modal')).toBeVisible();

      const driverCard = managerPage.getByTestId(/^driver-card-/).filter({ hasText: TEST_DRIVER.name }).first();
      await expect(driverCard).toBeVisible();
      const driverId = (await driverCard.getAttribute('data-testid'))!.replace('driver-card-', '');
      managerPage.once('dialog', (d: Dialog) => d.accept());
      await managerPage.getByTestId(`assign-driver-btn-${driverId}`).click();
      await expect(managerPage.getByTestId('driver-selection-modal')).not.toBeVisible();

      // Dashboard shows Pending and driver name
      await expect(managerPage.getByTestId(`assignment-status-${vehicleCode}`))
        .toContainText('Pending', { ignoreCase: true });
      await expect(managerPage.getByTestId(`driver-contact-btn-${vehicleCode}`))
        .toContainText(TEST_DRIVER.name);

      // ── Driver logs in and confirms the pending assignment is visible ──────
      await driverAppPage.goto();
      await driverAppPage.login(TEST_DRIVER.email, TEST_DRIVER.pin);
      await expect(driverAppPage.homeScreen).toBeVisible();

      const assignmentCard = driverPage.getByTestId(/^driver-assignment-card-/).first();
      await expect(assignmentCard).toBeVisible();
      await expect(assignmentCard).toContainText(vehicleCode);

      // ── Manager cancels the pending assignment (confirm + alert dialogs) ───
      // cancel triggers: window.confirm → then alert("✅ Assignment cancelled")
      const acceptAll = (d: Dialog) => d.accept();
      managerPage.on('dialog', acceptAll);
      await managerPage.getByTestId(`cancel-btn-${vehicleCode}`).click();

      // Wait for dashboard to revert after fetchAllData()
      await expect(managerPage.getByTestId(`assign-btn-${vehicleCode}`))
        .toBeVisible({ timeout: 10_000 });
      managerPage.off('dialog', acceptAll);

      // Driver cell shows no assignment, cancel button is gone
      await expect(managerPage.getByTestId(`driver-cell-${vehicleCode}`)).toContainText('—');
      await expect(managerPage.getByTestId(`cancel-btn-${vehicleCode}`)).not.toBeVisible();
      await expect(managerPage.getByTestId(`assignment-status-${vehicleCode}`)).not.toBeVisible();

      // ── Driver refreshes and sees no active assignments ───────────────────
      await driverAppPage.refreshBtn.click();
      await expect(driverAppPage.noAssignments).toBeVisible({ timeout: 10_000 });

    } finally {
      await managerCtx.close();
      await driverCtx.close();
    }
  });
});
