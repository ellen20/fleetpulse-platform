/**
 * Cross-app assignment lifecycle (multi-context E2E).
 *
 * Validates that an assignment created in the Manager dashboard (:5173)
 * propagates correctly to the Driver app (:5174), and that state changes
 * driven from the driver side sync back to the dashboard via its polling.
 *
 * Flow: manager assigns vehicle → driver sees pending assignment (correct
 * vehicle + driver name) → driver starts shift → dashboard reflects Active →
 * driver ends shift → dashboard shows the vehicle freed and re-assignable.
 *
 * Uses two isolated browser contexts (one per app) to exercise the true
 * cross-origin behavior a single-context runner cannot cover.
 */
import { test, expect, type Browser, type Dialog } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';
import { DashboardPage } from '../pages/DashboardPage';
import { DriverAppPage } from '../pages/DriverAppPage';
import { resetAssignments } from '../helpers/cleanup';

const MANAGER     = { email: 'manager@fleetpulse.com', password: 'manager123', name: 'Fleet Manager' };
const TEST_DRIVER = { name: 'Marcus Chen', email: 'marcus.chen@fleetpulse.dev', pin: '1234' };

const DASHBOARD_POLL_TIMEOUT = 15_000;

test.describe('Assignment flow — manager assigns, driver accepts', () => {
  test.setTimeout(90_000);

  test('full lifecycle: assign → pending → active → completed', async ({ browser }: { browser: Browser }) => {
    const managerCtx  = await browser.newContext({ baseURL: 'http://localhost:5173' });
    const driverCtx   = await browser.newContext({ baseURL: 'http://localhost:5174' });
    const managerPage = await managerCtx.newPage();
    const driverPage  = await driverCtx.newPage();

    const loginPage     = new LoginPage(managerPage);
    const dashboardPage = new DashboardPage(managerPage);
    const driverAppPage = new DriverAppPage(driverPage);

    try {
      await resetAssignments();

      // ── PHASE 1: Manager logs in ───────────────────────────────────────────
      await loginPage.goto();
      await loginPage.login(MANAGER.email, MANAGER.password);

      // URL and user name
      await expect(managerPage).toHaveURL('/dashboard');
      await expect(managerPage.getByText(MANAGER.name)).toBeVisible();

      // Wait for fleet data to load (guard against network errors showing 0)
      await expect(managerPage.getByTestId('status-count-all')).not.toHaveText('0');

      // Total fleet count is a positive number
      const totalFleet  = parseInt(await managerPage.getByTestId('status-count-all').innerText());
      expect(totalFleet).toBeGreaterThan(0);

      // available + charging + maintenance must equal total fleet
      const available   = parseInt(await managerPage.getByTestId('status-count-available').innerText());
      const charging    = parseInt(await managerPage.getByTestId('status-count-charging').innerText());
      const maintenance = parseInt(await managerPage.getByTestId('status-count-maintenance').innerText());
      expect(available + charging + maintenance).toBe(totalFleet);

      // ── PHASE 2: Navigate to Assignments tab ───────────────────────────────
      await dashboardPage.gotoTab('assignments');
      await expect(managerPage.getByTestId('tab-content-assignments')).toBeVisible();

      // Total on assignments tab must be > 0 (same guard)
      await expect(managerPage.getByTestId('assignment-count-all')).not.toHaveText('0');
      const assignmentTotal = parseInt(await managerPage.getByTestId('assignment-count-all').innerText());
      expect(assignmentTotal).toBeGreaterThan(0);

      // active + pending + unassigned must equal total
      const activeCount     = parseInt(await managerPage.getByTestId('assignment-count-active').innerText());
      const pendingCount    = parseInt(await managerPage.getByTestId('assignment-count-pending').innerText());
      const unassignedCount = parseInt(await managerPage.getByTestId('assignment-count-unassigned').innerText());
      expect(activeCount + pendingCount + unassignedCount).toBe(assignmentTotal);

      // Assignment table shows at least one row
      const tableRows = managerPage.getByTestId('assignments-table-body').locator('tr');
      await expect(tableRows.first()).toBeVisible();
      expect(await tableRows.count()).toBeGreaterThan(0);

      // ── PHASE 3: Pick a random available vehicle ───────────────────────────
      const allAssignBtns = managerPage.getByTestId(/^assign-btn-/);
      await expect(allAssignBtns.first()).toBeVisible();
      const assignBtnCount = await allAssignBtns.count();
      expect(assignBtnCount).toBeGreaterThan(0);

      const randomIdx       = Math.floor(Math.random() * assignBtnCount);
      const chosenAssignBtn = allAssignBtns.nth(randomIdx);
      const vehicleCode     = (await chosenAssignBtn.getAttribute('data-testid'))!.replace('assign-btn-', '');

      // No assignment yet, physical status is "available"
      await expect(managerPage.getByTestId(`vehicle-status-${vehicleCode}`))
        .toContainText('available', { ignoreCase: true });
      await expect(managerPage.getByTestId(`driver-cell-${vehicleCode}`)).toContainText('—');

      // ── PHASE 4: Open driver selection modal ───────────────────────────────
      await chosenAssignBtn.click();
      await expect(managerPage.getByTestId('driver-selection-modal')).toBeVisible();

      // Modal subtitle names the correct vehicle
      await expect(managerPage.getByText(`Assign ${vehicleCode} to an available driver`)).toBeVisible();

      // All driver cards show "Available" status
      await expect(managerPage.getByTestId('no-drivers-message')).not.toBeVisible();
      const allDriverCards  = managerPage.getByTestId(/^driver-card-/);
      await expect(allDriverCards.first()).toBeVisible();
      const driverCardCount = await allDriverCards.count();
      expect(driverCardCount).toBeGreaterThan(0);
      for (let i = 0; i < driverCardCount; i++) {
        await expect(allDriverCards.nth(i)).toContainText('Available', { ignoreCase: true });
      }

      // ── PHASE 5: Assign to Marcus Chen ────────────────────────────────────
      const driverCard = allDriverCards.filter({ hasText: TEST_DRIVER.name }).first();
      await expect(driverCard).toBeVisible();
      const driverId = (await driverCard.getAttribute('data-testid'))!.replace('driver-card-', '');

      // Assign button label must include the vehicle code being assigned
      const assignDriverBtn = managerPage.getByTestId(`assign-driver-btn-${driverId}`);
      await expect(assignDriverBtn).toContainText(vehicleCode);

      // Capture both the confirm dialog and the success alert
      let confirmMsg = '';
      let alertMsg   = '';
      const dialogHandler = async (dialog: Dialog) => {
        if (dialog.type() === 'confirm') { confirmMsg = dialog.message(); await dialog.accept(); }
        else                             { alertMsg   = dialog.message(); await dialog.accept(); }
      };
      managerPage.on('dialog', dialogHandler);
      await assignDriverBtn.click();
      await expect(managerPage.getByTestId('driver-selection-modal')).not.toBeVisible();
      managerPage.off('dialog', dialogHandler);

      // Confirm dialog must name the correct vehicle AND driver
      expect(confirmMsg).toContain(vehicleCode);
      expect(confirmMsg).toContain(TEST_DRIVER.name);

      // Success alert must name the correct vehicle AND driver
      expect(alertMsg).toContain(vehicleCode);
      expect(alertMsg).toContain(TEST_DRIVER.name);

      // ── PHASE 6: Assigned Driver column shows pending + driver name ─────────
      // Scope assertions to the specific vehicle row to confirm placement is correct
      const vehicleRow = managerPage.getByTestId(`vehicle-row-${vehicleCode}`);

      await expect(vehicleRow.getByTestId(`assignment-status-${vehicleCode}`))
        .toContainText('Pending', { ignoreCase: true });

      await expect(vehicleRow.getByTestId(`driver-contact-btn-${vehicleCode}`))
        .toContainText(TEST_DRIVER.name);

      // Assign button replaced by Cancel button
      await expect(managerPage.getByTestId(`assign-btn-${vehicleCode}`)).not.toBeVisible();
      await expect(managerPage.getByTestId(`cancel-btn-${vehicleCode}`)).toBeVisible();

      // Vehicle physical status unchanged
      await expect(managerPage.getByTestId(`vehicle-status-${vehicleCode}`))
        .toContainText('available', { ignoreCase: true });

      // ── PHASE 7: Driver logs into driver app ──────────────────────────────
      await driverAppPage.goto();
      await expect(driverAppPage.loginScreen).toBeVisible();
      await driverAppPage.login(TEST_DRIVER.email, TEST_DRIVER.pin);
      await expect(driverAppPage.homeScreen).toBeVisible();
      await expect(driverAppPage.statusLabel).toContainText('Available', { ignoreCase: true });

      // ── PHASE 8: Driver sees the pending assignment card ───────────────────
      const assignmentCard = driverPage.getByTestId(/^driver-assignment-card-/).first();
      await expect(assignmentCard).toBeVisible();
      await expect(assignmentCard).toContainText(vehicleCode);
      await expect(assignmentCard).toContainText('Pending', { ignoreCase: true });
      
      // ── PHASE 9: Driver opens assignment detail ────────────────────────────
      const assignmentId = (await assignmentCard.getAttribute('data-testid'))!
        .replace('driver-assignment-card-', '');
      await driverAppPage.openAssignment(assignmentId);

      await expect(driverAppPage.assignmentScreen).toBeVisible();
      await expect(driverAppPage.vehicleCode).toContainText(vehicleCode);
      await expect(driverAppPage.batteryPct).toBeVisible();
      await expect(driverAppPage.startShiftBtn).toBeVisible();
      await expect(driverAppPage.endShiftBtn).not.toBeVisible();

      // ── PHASE 10: Driver starts shift ─────────────────────────────────────
      await driverAppPage.startShiftBtn.click();
      await expect(driverAppPage.tripTimer).toBeVisible();
      await expect(driverAppPage.endShiftBtn).toBeVisible();
      await expect(driverAppPage.startShiftBtn).not.toBeVisible();

      // ── PHASE 11: Dashboard updates to ACTIVE (waits for 10 s poll) ───────
      await expect(vehicleRow.getByTestId(`assignment-status-${vehicleCode}`))
        .toContainText('Active', { ignoreCase: true, timeout: DASHBOARD_POLL_TIMEOUT });
      await expect(vehicleRow.getByTestId(`driver-contact-btn-${vehicleCode}`))
        .toContainText(TEST_DRIVER.name);
      await expect(managerPage.getByTestId(`vehicle-status-${vehicleCode}`))
        .toContainText('available', { ignoreCase: true });

      // ── PHASE 12: Driver ends shift (two-step confirm) ────────────────────
      await driverAppPage.endShiftBtn.click();
      await expect(driverAppPage.confirmEndBtn).toBeVisible();
      await expect(driverAppPage.cancelEndBtn).toBeVisible();
      await driverAppPage.confirmEndBtn.click();
      await expect(driverAppPage.shiftComplete).toBeVisible();
      await expect(driverAppPage.backHomeBtn).toBeVisible();

      // ── PHASE 13: Driver returns home ─────────────────────────────────────
      await driverAppPage.backHomeBtn.click();
      await expect(driverAppPage.homeScreen).toBeVisible();
      await expect(driverAppPage.noAssignments).toBeVisible();
      await expect(driverAppPage.statusLabel).toContainText('Available', { ignoreCase: true });

      // ── PHASE 14: Dashboard shows assignment cleared (waits for 10 s poll) ─
      await expect(managerPage.getByTestId(`driver-cell-${vehicleCode}`))
        .toContainText('—', { timeout: DASHBOARD_POLL_TIMEOUT });
      await expect(managerPage.getByTestId(`assign-btn-${vehicleCode}`))
        .toBeVisible({ timeout: DASHBOARD_POLL_TIMEOUT });
      await expect(managerPage.getByTestId(`vehicle-status-${vehicleCode}`))
        .toContainText('available', { ignoreCase: true });

    } finally {
      await managerCtx.close();
      await driverCtx.close();
    }
  });
});
