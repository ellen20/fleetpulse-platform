/**
 * Multi-assignment independence (single-context E2E).
 *
 * Validates that two separate vehicle assignments, created one after another
 * by a single manager session, can coexist without interfering with each
 * other — and that cancelling one pending assignment has no effect on the
 * other.
 *
 * Flow: assign vehicle A to driver A → assign vehicle B to driver B → both
 * show Pending independently → cancel vehicle A → vehicle B remains
 * untouched (still Pending, driver intact, cancel button intact).
 */
import { test, expect, type Browser } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';
import { DashboardPage } from '../pages/DashboardPage';
import { resetAssignments } from '../helpers/cleanup';
import { captureDialogs } from '../helpers/dialogs';
import { MANAGER } from '../fixtures/users';

test.describe('Multi-assignment flow — two vehicles assigned simultaneously', () => {
  test.setTimeout(60_000);

  test('two pending assignments are independent; cancelling one leaves the other intact', async (
    { browser }: { browser: Browser },
    testInfo
  ) => {
    const managerCtx = await browser.newContext({ baseURL: 'http://localhost:5173' });

    await managerCtx.tracing.start({ screenshots: true, snapshots: true });

    const managerPage   = await managerCtx.newPage();
    
    const loginPage     = new LoginPage(managerPage);
    const dashboardPage = new DashboardPage(managerPage);

    try {
      await resetAssignments();

      // ── PHASE 1: Manager logs in and navigates to assignments ─────────────
      await loginPage.goto();
      await loginPage.login(MANAGER.email, MANAGER.password);
      await expect(managerPage).toHaveURL('/dashboard');
      await expect(managerPage.getByText(MANAGER.name)).toBeVisible();

      await dashboardPage.gotoTab('assignments');
      await expect(managerPage.getByTestId('tab-content-assignments')).toBeVisible();

      // ── PHASE 2: Assign first available vehicle (vehicle A) ────────────────
      const firstBtn = managerPage.getByTestId(/^assign-btn-/).first();
      await expect(firstBtn).toBeVisible();
      const vehicleCodeA = (await firstBtn.getAttribute('data-testid'))!.replace('assign-btn-', '');
      const vehicleRowA  = managerPage.getByTestId(`vehicle-row-${vehicleCodeA}`);

      await firstBtn.click();
      await expect(managerPage.getByTestId('driver-selection-modal')).toBeVisible();

      const assignDialogsA = captureDialogs(managerPage);
      await managerPage.getByTestId(/^assign-driver-btn-/).first().click();
      await expect(managerPage.getByTestId('driver-selection-modal')).not.toBeVisible();
      assignDialogsA.stop();

      // Confirm + success dialogs named vehicle A
      expect(assignDialogsA.messages.confirm).toContain(vehicleCodeA);
      expect(assignDialogsA.messages.alert).toContain(vehicleCodeA);

      await expect(vehicleRowA.getByTestId(`assignment-status-${vehicleCodeA}`))
        .toContainText('Pending', { ignoreCase: true });
      const driverNameA = (await vehicleRowA.getByTestId(`driver-contact-btn-${vehicleCodeA}`).innerText()).trim();

      // ── PHASE 3: Assign second available vehicle (vehicle B) ───────────────
      const secondBtn = managerPage.getByTestId(/^assign-btn-/).first();
      await expect(secondBtn).toBeVisible();
      const vehicleCodeB = (await secondBtn.getAttribute('data-testid'))!.replace('assign-btn-', '');
      const vehicleRowB  = managerPage.getByTestId(`vehicle-row-${vehicleCodeB}`);

      // Vehicle B must be different from vehicle A
      expect(vehicleCodeB).not.toBe(vehicleCodeA);

      await secondBtn.click();
      await expect(managerPage.getByTestId('driver-selection-modal')).toBeVisible();

      const assignDialogsB = captureDialogs(managerPage);
      await managerPage.getByTestId(/^assign-driver-btn-/).first().click();
      await expect(managerPage.getByTestId('driver-selection-modal')).not.toBeVisible();
      assignDialogsB.stop();

      // Confirm + success dialogs named vehicle B
      expect(assignDialogsB.messages.confirm).toContain(vehicleCodeB);
      expect(assignDialogsB.messages.alert).toContain(vehicleCodeB);

      await expect(vehicleRowB.getByTestId(`assignment-status-${vehicleCodeB}`))
        .toContainText('Pending', { ignoreCase: true });
      const driverNameB = (await vehicleRowB.getByTestId(`driver-contact-btn-${vehicleCodeB}`).innerText()).trim();

      // Both drivers are different (modal filtered out driver A for vehicle B)
      expect(driverNameB).not.toBe(driverNameA);

      // ── PHASE 4: Both vehicles show Pending simultaneously ──────────────────
      await expect(vehicleRowA.getByTestId(`assignment-status-${vehicleCodeA}`))
        .toContainText('Pending', { ignoreCase: true });
      await expect(vehicleRowB.getByTestId(`assignment-status-${vehicleCodeB}`))
        .toContainText('Pending', { ignoreCase: true });

      // Both have cancel buttons; neither has an assign button
      await expect(vehicleRowA.getByTestId(`cancel-btn-${vehicleCodeA}`)).toBeVisible();
      await expect(vehicleRowB.getByTestId(`cancel-btn-${vehicleCodeB}`)).toBeVisible();
      await expect(vehicleRowA.getByTestId(`assign-btn-${vehicleCodeA}`)).not.toBeVisible();
      await expect(vehicleRowB.getByTestId(`assign-btn-${vehicleCodeB}`)).not.toBeVisible();

      // Both vehicles' physical status remains "available" (assignment ≠ physical state)
      await expect(vehicleRowA.getByTestId(`vehicle-status-${vehicleCodeA}`))
        .toContainText('available', { ignoreCase: true });
      await expect(vehicleRowB.getByTestId(`vehicle-status-${vehicleCodeB}`))
        .toContainText('available', { ignoreCase: true });

      // ── PHASE 5: Cancel vehicle A — vehicle B must remain unaffected ────────
      const cancelDialogs = captureDialogs(managerPage);
      await vehicleRowA.getByTestId(`cancel-btn-${vehicleCodeA}`).click();
      await expect(vehicleRowA.getByTestId(`assign-btn-${vehicleCodeA}`))
        .toBeVisible({ timeout: 10_000 });
      cancelDialogs.stop();

      // Cancel confirm dialog and success alert have correct copy
      expect(cancelDialogs.messages.confirm).toContain('Cancel this assignment?');
      expect(cancelDialogs.messages.confirm.toLowerCase()).toContain('has not accepted yet');
      expect(cancelDialogs.messages.alert.toLowerCase()).toContain('cancelled');

      // ── PHASE 6: Vehicle A fully reverted ───────────────────────────────────
      await expect(vehicleRowA.getByTestId(`driver-cell-${vehicleCodeA}`)).toContainText('—');
      await expect(vehicleRowA.getByTestId(`assignment-status-${vehicleCodeA}`)).not.toBeVisible();
      await expect(vehicleRowA.getByTestId(`cancel-btn-${vehicleCodeA}`)).not.toBeVisible();

      // ── PHASE 7: Vehicle B is completely untouched by A's cancellation ─────
      await expect(vehicleRowB.getByTestId(`assignment-status-${vehicleCodeB}`))
        .toContainText('Pending', { ignoreCase: true });
      await expect(vehicleRowB.getByTestId(`driver-contact-btn-${vehicleCodeB}`)).toBeVisible();
      await expect(vehicleRowB.getByTestId(`driver-contact-btn-${vehicleCodeB}`)).toContainText(driverNameB);
      await expect(vehicleRowB.getByTestId(`cancel-btn-${vehicleCodeB}`)).toBeVisible();
      await expect(vehicleRowB.getByTestId(`assign-btn-${vehicleCodeB}`)).not.toBeVisible();

    } finally {
      // Save trace only on failure to keep artifacts small
      if (testInfo.status !== testInfo.expectedStatus) {
        await managerCtx.tracing.stop({ path: 'test-results/multi-assignment-trace.zip' });
      } else {
        await managerCtx.tracing.stop();
      }
      await managerCtx.close();
    }
  });
});