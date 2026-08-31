/**
 * Cross-app assignment cancellation (multi-context E2E).
 *
 * Validates that a manager can cancel a *pending* assignment (before the
 * driver starts their shift) and that the cancellation propagates correctly
 * to both sides: the dashboard reverts the vehicle to unassigned/available,
 * and the driver app removes the assignment on refresh.
 *
 * Flow: manager assigns vehicle → driver sees pending assignment → manager
 * cancels → dashboard reverts (Assign button restored, driver cell cleared)
 * → driver refreshes and sees no active assignments.
 *
 * Uses two isolated browser contexts (one per app) to exercise the true
 * cross-origin behavior a single-context runner cannot cover.
 */
import { test, expect, type Browser } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';
import { DashboardPage } from '../pages/DashboardPage';
import { DriverAppPage } from '../pages/DriverAppPage';
import { resetAssignments } from '../helpers/cleanup';
import { captureDialogs } from '../helpers/dialogs';
import { MANAGER, TEST_DRIVER } from '../fixtures/users';

test.describe('Cancel flow — manager cancels before driver starts', () => {
  test.setTimeout(60_000);

  test('cancelled assignment clears from dashboard and driver app', async (
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

      // ── PHASE 1: Manager logs in and navigates to assignments ─────────────
      await loginPage.goto();
      await loginPage.login(MANAGER.email, MANAGER.password);
      await expect(managerPage).toHaveURL('/dashboard');
      await expect(managerPage.getByText(MANAGER.name)).toBeVisible();

      await dashboardPage.gotoTab('assignments');
      await expect(managerPage.getByTestId('tab-content-assignments')).toBeVisible();

      // ── PHASE 2: Pick first available vehicle and confirm baseline state ──
      const firstAssignBtn = managerPage.getByTestId(/^assign-btn-/).first();
      await expect(firstAssignBtn).toBeVisible();
      const vehicleCode = (await firstAssignBtn.getAttribute('data-testid'))!.replace('assign-btn-', '');

      const vehicleRow = managerPage.getByTestId(`vehicle-row-${vehicleCode}`);
      await expect(vehicleRow.getByTestId(`vehicle-status-${vehicleCode}`))
        .toContainText('available', { ignoreCase: true });
      await expect(vehicleRow.getByTestId(`driver-cell-${vehicleCode}`)).toContainText('—');
      await expect(vehicleRow.getByTestId(`cancel-btn-${vehicleCode}`)).not.toBeVisible();

      // ── PHASE 3: Assign the vehicle to the test driver ─────────────────────
      await firstAssignBtn.click();
      await expect(managerPage.getByTestId('driver-selection-modal')).toBeVisible();
      await expect(managerPage.getByText(`Assign ${vehicleCode} to an available driver`)).toBeVisible();

      const driverCard = managerPage.getByTestId(/^driver-card-/).filter({ hasText: TEST_DRIVER.name }).first();
      await expect(driverCard).toBeVisible();
      const driverId = (await driverCard.getAttribute('data-testid'))!.replace('driver-card-', '');

      const assignDialogs = captureDialogs(managerPage);
      await managerPage.getByTestId(`assign-driver-btn-${driverId}`).click();
      await expect(managerPage.getByTestId('driver-selection-modal')).not.toBeVisible();
      assignDialogs.stop();

      // Assign confirm + success dialogs named the correct vehicle and driver
      expect(assignDialogs.messages.confirm).toContain(vehicleCode);
      expect(assignDialogs.messages.confirm).toContain(TEST_DRIVER.name);
      expect(assignDialogs.messages.alert).toContain(vehicleCode);
      expect(assignDialogs.messages.alert).toContain(TEST_DRIVER.name);

      // Dashboard shows Pending, driver name, and a Cancel button (Assign hidden)
      await expect(vehicleRow.getByTestId(`assignment-status-${vehicleCode}`))
        .toContainText('Pending', { ignoreCase: true });
      await expect(vehicleRow.getByTestId(`driver-contact-btn-${vehicleCode}`))
        .toContainText(TEST_DRIVER.name);
      await expect(vehicleRow.getByTestId(`assign-btn-${vehicleCode}`)).not.toBeVisible();
      await expect(vehicleRow.getByTestId(`cancel-btn-${vehicleCode}`)).toBeVisible();
      await expect(vehicleRow.getByTestId(`vehicle-status-${vehicleCode}`))
        .toContainText('available', { ignoreCase: true });

      // ── PHASE 4: Driver logs in and confirms the pending assignment ────────
      await driverAppPage.goto();
      await expect(driverAppPage.loginScreen).toBeVisible();
      await driverAppPage.login(TEST_DRIVER.email, TEST_DRIVER.pin);
      await expect(driverAppPage.homeScreen).toBeVisible();

      const assignmentCard = driverPage.getByTestId(/^driver-assignment-card-/).first();
      await expect(assignmentCard).toBeVisible();
      await expect(assignmentCard).toContainText(vehicleCode);
      await expect(assignmentCard).toContainText('Pending', { ignoreCase: true });

      // ── PHASE 5: Manager cancels the pending assignment ────────────────────
      // cancel triggers: window.confirm → then alert("✅ Assignment cancelled")
      const cancelDialogs = captureDialogs(managerPage);
      await managerPage.getByTestId(`cancel-btn-${vehicleCode}`).click();

      // Wait for dashboard to revert after fetchAllData()
      await expect(vehicleRow.getByTestId(`assign-btn-${vehicleCode}`))
        .toBeVisible({ timeout: 10_000 });
      cancelDialogs.stop();

      // Cancel confirm dialog and success alert have correct copy
      expect(cancelDialogs.messages.confirm).toContain('Cancel this assignment?');
      expect(cancelDialogs.messages.confirm.toLowerCase()).toContain('has not accepted yet');
      expect(cancelDialogs.messages.alert.toLowerCase()).toContain('cancelled');

      // ── PHASE 6: Dashboard fully reverted to unassigned state ──────────────
      await expect(vehicleRow.getByTestId(`driver-cell-${vehicleCode}`)).toContainText('—');
      await expect(vehicleRow.getByTestId(`cancel-btn-${vehicleCode}`)).not.toBeVisible();
      await expect(vehicleRow.getByTestId(`assignment-status-${vehicleCode}`)).not.toBeVisible();
      await expect(vehicleRow.getByTestId(`vehicle-status-${vehicleCode}`))
        .toContainText('available', { ignoreCase: true });

      // ── PHASE 7: Driver refreshes and sees no active assignments ───────────
      await driverAppPage.refreshBtn.click();
      await expect(driverAppPage.noAssignments).toBeVisible({ timeout: 10_000 });
      await expect(driverAppPage.statusLabel).toContainText('Available', { ignoreCase: true });

    } finally {
      // Save traces only on failure to keep artifacts small
      if (testInfo.status !== testInfo.expectedStatus) {
        await managerCtx.tracing.stop({ path: 'test-results/cancel-manager-trace.zip' });
        await driverCtx.tracing.stop({ path: 'test-results/cancel-driver-trace.zip' });
      } else {
        await managerCtx.tracing.stop();
        await driverCtx.tracing.stop();
      }
      await managerCtx.close();
      await driverCtx.close();
    }
  });
});