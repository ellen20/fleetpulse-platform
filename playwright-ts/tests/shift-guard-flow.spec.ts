import { test, expect, type Dialog, type Browser } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';
import { DashboardPage } from '../pages/DashboardPage';
import { DriverAppPage } from '../pages/DriverAppPage';
import { resetAssignments } from '../helpers/cleanup';

const MANAGER = { email: 'manager@fleetpulse.com', password: 'manager123' };

const TEST_DRIVER = { name: 'Marcus Chen', email: 'marcus.chen@fleetpulse.dev', pin: '1234' };

test.describe('Shift guard flow — two-step end-shift confirmation', () => {
  test.setTimeout(90_000);

  test('End Shift button is guarded: cancel keeps shift active, confirm ends it', async ({ browser }: { browser: Browser }) => {
    const managerCtx  = await browser.newContext({ baseURL: 'http://localhost:5173' });
    const driverCtx   = await browser.newContext({ baseURL: 'http://localhost:5174' });
    const managerPage = await managerCtx.newPage();
    const driverPage  = await driverCtx.newPage();

    const loginPage     = new LoginPage(managerPage);
    const dashboardPage = new DashboardPage(managerPage);
    const driverAppPage = new DriverAppPage(driverPage);

    try {
      await resetAssignments();

      // ── Manager assigns a vehicle ─────────────────────────────────────────
      await loginPage.goto();
      await loginPage.login(MANAGER.email, MANAGER.password);
      await expect(managerPage).toHaveURL('/dashboard');
      await dashboardPage.gotoTab('assignments');

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

      await expect(managerPage.getByTestId(`driver-contact-btn-${vehicleCode}`))
        .toContainText(TEST_DRIVER.name);

      // ── Driver logs in ────────────────────────────────────────────────────
      await driverAppPage.goto();
      await driverAppPage.login(TEST_DRIVER.email, TEST_DRIVER.pin);
      await expect(driverAppPage.homeScreen).toBeVisible();

      // ── Driver opens assignment — Start Shift visible, End Shift not ──────
      const assignmentCard = driverPage.getByTestId(/^driver-assignment-card-/).first();
      await expect(assignmentCard).toBeVisible();
      const cardTestId = await assignmentCard.getAttribute('data-testid');
      await driverAppPage.openAssignment(cardTestId!.replace('driver-assignment-card-', ''));

      await expect(driverAppPage.assignmentScreen).toBeVisible();
      await expect(driverAppPage.startShiftBtn).toBeVisible();
      await expect(driverAppPage.endShiftBtn).not.toBeVisible();
      await expect(driverAppPage.confirmEndBtn).not.toBeVisible();
      await expect(driverAppPage.cancelEndBtn).not.toBeVisible();

      // ── Driver starts shift — End Shift appears, Start Shift disappears ───
      await driverAppPage.startShiftBtn.click();
      await expect(driverAppPage.tripTimer).toBeVisible();
      await expect(driverAppPage.endShiftBtn).toBeVisible();
      await expect(driverAppPage.startShiftBtn).not.toBeVisible();

      // ── Driver clicks End Shift — confirm guard appears ───────────────────
      await driverAppPage.endShiftBtn.click();
      await expect(driverAppPage.confirmEndBtn).toBeVisible();
      await expect(driverAppPage.cancelEndBtn).toBeVisible();
      // End Shift button itself is replaced by the confirm/cancel pair
      await expect(driverAppPage.endShiftBtn).not.toBeVisible();

      // ── Driver clicks Cancel — guard dismissed, shift stays active ────────
      await driverAppPage.cancelEndBtn.click();
      await expect(driverAppPage.endShiftBtn).toBeVisible();
      await expect(driverAppPage.confirmEndBtn).not.toBeVisible();
      await expect(driverAppPage.cancelEndBtn).not.toBeVisible();
      // Trip timer is still running
      await expect(driverAppPage.tripTimer).toBeVisible();

      // ── Driver clicks End Shift again and confirms ────────────────────────
      await driverAppPage.endShiftBtn.click();
      await expect(driverAppPage.confirmEndBtn).toBeVisible();
      await driverAppPage.confirmEndBtn.click();

      // Shift complete card appears
      await expect(driverAppPage.shiftComplete).toBeVisible();
      await expect(driverAppPage.backHomeBtn).toBeVisible();

      // Trip timer is gone after completion
      await expect(driverAppPage.tripTimer).not.toBeVisible();
      await expect(driverAppPage.endShiftBtn).not.toBeVisible();

      // ── Driver returns home — no active assignments ───────────────────────
      await driverAppPage.backHomeBtn.click();
      await expect(driverAppPage.homeScreen).toBeVisible();
      await expect(driverAppPage.noAssignments).toBeVisible();

    } finally {
      await managerCtx.close();
      await driverCtx.close();
    }
  });
});
