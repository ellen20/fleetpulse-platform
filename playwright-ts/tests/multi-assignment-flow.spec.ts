import { test, expect, type Dialog, type Browser } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';
import { DashboardPage } from '../pages/DashboardPage';
import { resetAssignments } from '../helpers/cleanup';

const MANAGER = { email: 'manager@fleetpulse.com', password: 'manager123' };

test.describe('Multi-assignment flow — two vehicles assigned simultaneously', () => {
  test.setTimeout(60_000);

  test('two pending assignments are independent; cancelling one leaves the other intact', async ({ browser }: { browser: Browser }) => {
    const managerCtx  = await browser.newContext({ baseURL: 'http://localhost:5173' });
    const managerPage = await managerCtx.newPage();
    const loginPage   = new LoginPage(managerPage);
    const dashboardPage = new DashboardPage(managerPage);

    try {
      await resetAssignments();

      // ── Manager logs in ───────────────────────────────────────────────────
      await loginPage.goto();
      await loginPage.login(MANAGER.email, MANAGER.password);
      await expect(managerPage).toHaveURL('/dashboard');
      await dashboardPage.gotoTab('assignments');

      // ── Assign first available vehicle ────────────────────────────────────
      const firstBtn = managerPage.getByTestId(/^assign-btn-/).first();
      await expect(firstBtn).toBeVisible();
      const vehicleCodeA = (await firstBtn.getAttribute('data-testid'))!.replace('assign-btn-', '');

      await firstBtn.click();
      await expect(managerPage.getByTestId('driver-selection-modal')).toBeVisible();
      managerPage.once('dialog', (d: Dialog) => d.accept());
      await managerPage.getByTestId(/^assign-driver-btn-/).first().click();
      await expect(managerPage.getByTestId('driver-selection-modal')).not.toBeVisible();

      await expect(managerPage.getByTestId(`assignment-status-${vehicleCodeA}`))
        .toContainText('Pending', { ignoreCase: true });
      const driverNameA = (await managerPage.getByTestId(`driver-contact-btn-${vehicleCodeA}`).innerText()).trim();

      // ── Assign second available vehicle (first btn is now vehicle B) ───────
      const secondBtn = managerPage.getByTestId(/^assign-btn-/).first();
      await expect(secondBtn).toBeVisible();
      const vehicleCodeB = (await secondBtn.getAttribute('data-testid'))!.replace('assign-btn-', '');

      // Vehicle B must be different from vehicle A
      expect(vehicleCodeB).not.toBe(vehicleCodeA);

      await secondBtn.click();
      await expect(managerPage.getByTestId('driver-selection-modal')).toBeVisible();
      managerPage.once('dialog', (d: Dialog) => d.accept());
      await managerPage.getByTestId(/^assign-driver-btn-/).first().click();
      await expect(managerPage.getByTestId('driver-selection-modal')).not.toBeVisible();

      await expect(managerPage.getByTestId(`assignment-status-${vehicleCodeB}`))
        .toContainText('Pending', { ignoreCase: true });
      const driverNameB = (await managerPage.getByTestId(`driver-contact-btn-${vehicleCodeB}`).innerText()).trim();

      // Both drivers are different (modal filtered out driver A for vehicle B)
      expect(driverNameB).not.toBe(driverNameA);

      // ── Both vehicles show Pending simultaneously ─────────────────────────
      await expect(managerPage.getByTestId(`assignment-status-${vehicleCodeA}`))
        .toContainText('Pending', { ignoreCase: true });
      await expect(managerPage.getByTestId(`assignment-status-${vehicleCodeB}`))
        .toContainText('Pending', { ignoreCase: true });

      // Both have cancel buttons; neither has an assign button
      await expect(managerPage.getByTestId(`cancel-btn-${vehicleCodeA}`)).toBeVisible();
      await expect(managerPage.getByTestId(`cancel-btn-${vehicleCodeB}`)).toBeVisible();
      await expect(managerPage.getByTestId(`assign-btn-${vehicleCodeA}`)).not.toBeVisible();
      await expect(managerPage.getByTestId(`assign-btn-${vehicleCodeB}`)).not.toBeVisible();

      // ── Cancel vehicle A — vehicle B must remain unaffected ───────────────
      const acceptAll = (d: Dialog) => d.accept();
      managerPage.on('dialog', acceptAll);
      await managerPage.getByTestId(`cancel-btn-${vehicleCodeA}`).click();
      await expect(managerPage.getByTestId(`assign-btn-${vehicleCodeA}`))
        .toBeVisible({ timeout: 10_000 });
      managerPage.off('dialog', acceptAll);

      // Vehicle A reverted
      await expect(managerPage.getByTestId(`driver-cell-${vehicleCodeA}`)).toContainText('—');
      await expect(managerPage.getByTestId(`assignment-status-${vehicleCodeA}`)).not.toBeVisible();

      // Vehicle B is still Pending and still has its driver and cancel button
      await expect(managerPage.getByTestId(`assignment-status-${vehicleCodeB}`))
        .toContainText('Pending', { ignoreCase: true });
      await expect(managerPage.getByTestId(`driver-contact-btn-${vehicleCodeB}`)).toBeVisible();
      await expect(managerPage.getByTestId(`cancel-btn-${vehicleCodeB}`)).toBeVisible();

    } finally {
      await managerCtx.close();
    }
  });
});
