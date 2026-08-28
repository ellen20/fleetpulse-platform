/**
 * Shift guard flow (multi-context E2E).
 *
 * Validates the two-step "End Shift" confirmation guard in the driver app:
 * clicking End Shift reveals a confirm/cancel pair rather than ending the
 * shift immediately, Cancel safely dismisses the guard and keeps the shift
 * running, and Confirm actually completes the shift.
 *
 * Flow: manager assigns vehicle → driver starts shift → driver clicks End
 * Shift (guard appears) → driver cancels (shift stays active) → driver
 * clicks End Shift again and confirms → shift completes → driver returns
 * home to a clean state.
 */
import { test, expect, type Browser } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';
import { DashboardPage } from '../pages/DashboardPage';
import { DriverAppPage } from '../pages/DriverAppPage';
import { resetAssignments } from '../helpers/cleanup';
import { captureDialogs } from '../helpers/dialogs';
import { MANAGER, TEST_DRIVER } from '../fixtures/users';

test.describe('Shift guard flow — two-step end-shift confirmation', () => {
  test.setTimeout(90_000);

  test('End Shift button is guarded: cancel keeps shift active, confirm ends it', async (
    { browser }: { browser: Browser },
    testInfo
  ) => {
    const managerCtx = await browser.newContext({ baseURL: 'http://localhost:5173' });
    const driverCtx  = await browser.newContext({ baseURL: 'http://localhost:5174' });

    await managerCtx.tracing.start({ screenshots: true, snapshots: true });
    await driverCtx.tracing.start({ screenshots: true, snapshots: true });

    const managerPage = await managerCtx.newPage();
    const driverPage  = await driverCtx.newPage();

    const loginPage     = new LoginPage(managerPage);
    const dashboardPage = new DashboardPage(managerPage);
    const driverAppPage = new DriverAppPage(driverPage);

    try {
      await resetAssignments();

      // ── PHASE 1: Manager assigns a vehicle to the test driver ──────────────
      await loginPage.goto();
      await loginPage.login(MANAGER.email, MANAGER.password);
      await expect(managerPage).toHaveURL('/dashboard');
      await expect(managerPage.getByText(MANAGER.name)).toBeVisible();
      await dashboardPage.gotoTab('assignments');
      await expect(managerPage.getByTestId('tab-content-assignments')).toBeVisible();

      const firstAssignBtn = managerPage.getByTestId(/^assign-btn-/).first();
      await expect(firstAssignBtn).toBeVisible();
      const vehicleCode = (await firstAssignBtn.getAttribute('data-testid'))!.replace('assign-btn-', '');
      const vehicleRow  = managerPage.getByTestId(`vehicle-row-${vehicleCode}`);

      await firstAssignBtn.click();
      await expect(managerPage.getByTestId('driver-selection-modal')).toBeVisible();
      const driverCard = managerPage.getByTestId(/^driver-card-/).filter({ hasText: TEST_DRIVER.name }).first();
      await expect(driverCard).toBeVisible();
      const driverId = (await driverCard.getAttribute('data-testid'))!.replace('driver-card-', '');

      const assignDialogs = captureDialogs(managerPage);
      await managerPage.getByTestId(`assign-driver-btn-${driverId}`).click();
      await expect(managerPage.getByTestId('driver-selection-modal')).not.toBeVisible();
      assignDialogs.stop();

      expect(assignDialogs.messages.confirm).toContain(vehicleCode);
      expect(assignDialogs.messages.confirm).toContain(TEST_DRIVER.name);
      expect(assignDialogs.messages.alert).toContain(vehicleCode);
      expect(assignDialogs.messages.alert).toContain(TEST_DRIVER.name);

      await expect(vehicleRow.getByTestId(`driver-contact-btn-${vehicleCode}`))
        .toContainText(TEST_DRIVER.name);

      // ── PHASE 2: Driver logs in ─────────────────────────────────────────────
      await driverAppPage.goto();
      await expect(driverAppPage.loginScreen).toBeVisible();
      await driverAppPage.login(TEST_DRIVER.email, TEST_DRIVER.pin);
      await expect(driverAppPage.homeScreen).toBeVisible();

      // ── PHASE 3: Driver opens assignment — baseline button states ──────────
      const assignmentCard = driverPage.getByTestId(/^driver-assignment-card-/).first();
      await expect(assignmentCard).toBeVisible();
      const cardTestId = await assignmentCard.getAttribute('data-testid');
      await driverAppPage.openAssignment(cardTestId!.replace('driver-assignment-card-', ''));

      await expect(driverAppPage.assignmentScreen).toBeVisible();
      await expect(driverAppPage.vehicleCode).toContainText(vehicleCode);
      await expect(driverAppPage.startShiftBtn).toBeVisible();
      await expect(driverAppPage.endShiftBtn).not.toBeVisible();
      await expect(driverAppPage.confirmEndBtn).not.toBeVisible();
      await expect(driverAppPage.cancelEndBtn).not.toBeVisible();

      // ── PHASE 4: Driver starts shift ────────────────────────────────────────
      await driverAppPage.startShiftBtn.click();
      await expect(driverAppPage.tripTimer).toBeVisible();
      await expect(driverAppPage.endShiftBtn).toBeVisible();
      await expect(driverAppPage.startShiftBtn).not.toBeVisible();

      // Dashboard reflects Active while the guard interactions below happen
      await expect(vehicleRow.getByTestId(`assignment-status-${vehicleCode}`))
        .toContainText('Active', { ignoreCase: true, timeout: 15_000 });

      // ── PHASE 5: Driver clicks End Shift — confirm guard appears ────────────
      await driverAppPage.endShiftBtn.click();
      await expect(driverAppPage.confirmEndBtn).toBeVisible();
      await expect(driverAppPage.cancelEndBtn).toBeVisible();
      // End Shift button itself is replaced by the confirm/cancel pair
      await expect(driverAppPage.endShiftBtn).not.toBeVisible();
      // Shift is not yet ended — timer keeps running behind the guard
      await expect(driverAppPage.tripTimer).toBeVisible();

      // ── PHASE 6: Driver clicks Cancel — guard dismissed, shift stays active ─
      await driverAppPage.cancelEndBtn.click();
      await expect(driverAppPage.endShiftBtn).toBeVisible();
      await expect(driverAppPage.confirmEndBtn).not.toBeVisible();
      await expect(driverAppPage.cancelEndBtn).not.toBeVisible();
      await expect(driverAppPage.tripTimer).toBeVisible();

      // Dashboard still shows Active — cancelling the guard had no side effect
      await expect(vehicleRow.getByTestId(`assignment-status-${vehicleCode}`))
        .toContainText('Active', { ignoreCase: true });

      // ── PHASE 7: Driver clicks End Shift again and confirms ─────────────────
      await driverAppPage.endShiftBtn.click();
      await expect(driverAppPage.confirmEndBtn).toBeVisible();
      await driverAppPage.confirmEndBtn.click();

      // Shift complete card appears; timer and End Shift button are gone
      await expect(driverAppPage.shiftComplete).toBeVisible();
      await expect(driverAppPage.backHomeBtn).toBeVisible();
      await expect(driverAppPage.tripTimer).not.toBeVisible();
      await expect(driverAppPage.endShiftBtn).not.toBeVisible();

      // ── PHASE 8: Driver returns home — clean state ──────────────────────────
      await driverAppPage.backHomeBtn.click();
      await expect(driverAppPage.homeScreen).toBeVisible();
      await expect(driverAppPage.noAssignments).toBeVisible();
      await expect(driverAppPage.statusLabel).toContainText('Available', { ignoreCase: true });

      // ── PHASE 9: Dashboard reflects the vehicle freed up ────────────────────
      await expect(managerPage.getByTestId(`driver-cell-${vehicleCode}`))
        .toContainText('—', { timeout: 15_000 });
      await expect(managerPage.getByTestId(`assign-btn-${vehicleCode}`)).toBeVisible();

    } finally {
      if (testInfo.status !== testInfo.expectedStatus) {
        await managerCtx.tracing.stop({ path: 'test-results/shift-guard-manager-trace.zip' });
        await driverCtx.tracing.stop({ path: 'test-results/shift-guard-driver-trace.zip' });
      } else {
        await managerCtx.tracing.stop();
        await driverCtx.tracing.stop();
      }
      await managerCtx.close();
      await driverCtx.close();
    }
  });
});