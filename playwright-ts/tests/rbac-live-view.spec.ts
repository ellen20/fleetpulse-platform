/**
 * RBAC live view (multi-context E2E).
 *
 * Validates that a read-only "viewer" role sees assignment changes made by
 * a manager in near-real-time via the dashboard's polling, while never
 * exposing action controls (assign/cancel buttons) regardless of assignment
 * state.
 *
 * Flow: manager and viewer both log in and open the assignments tab →
 * viewer confirmed action-free and labeled "View only" → manager assigns a
 * vehicle → viewer's dashboard polls and reflects Pending + driver name
 * → viewer still has no action buttons and the "View only" label persists.
 */
import { test, expect, type Browser } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';
import { DashboardPage } from '../pages/DashboardPage';
import { resetAssignments } from '../helpers/cleanup';
import { captureDialogs } from '../helpers/dialogs';
import { MANAGER, VIEWER } from '../fixtures/users';

// Dashboard polls every 10 s — allow one full cycle
const POLL_TIMEOUT = 15_000;

test.describe('RBAC live view — viewer watches manager assign in real time', () => {
  test.setTimeout(60_000);

  test('viewer sees live Pending badge but has no action buttons', async (
    { browser }: { browser: Browser },
    testInfo
  ) => {
    const managerCtx = await browser.newContext({ baseURL: 'http://localhost:5173' });
    const viewerCtx  = await browser.newContext({ baseURL: 'http://localhost:5173' });

    await managerCtx.tracing.start({ screenshots: true, snapshots: true });
    await viewerCtx.tracing.start({ screenshots: true, snapshots: true });

    const managerPage = await managerCtx.newPage();
    const viewerPage  = await viewerCtx.newPage();

    const managerLogin = new LoginPage(managerPage);
    const viewerLogin  = new LoginPage(viewerPage);
    const managerDash  = new DashboardPage(managerPage);
    const viewerDash   = new DashboardPage(viewerPage);

    try {
      await resetAssignments();

      // ── PHASE 1: Both users log in and navigate to assignments tab ────────
      await managerLogin.goto();
      await managerLogin.login(MANAGER.email, MANAGER.password);
      await expect(managerPage).toHaveURL('/dashboard');
      await expect(managerPage.getByText(MANAGER.name)).toBeVisible();
      await managerDash.gotoTab('assignments');
      await expect(managerPage.getByTestId('tab-content-assignments')).toBeVisible();

      await viewerLogin.goto();
      await viewerLogin.login(VIEWER.email, VIEWER.password);
      await expect(viewerPage).toHaveURL('/dashboard');
      await viewerDash.gotoTab('assignments');
      await expect(viewerPage.getByTestId('tab-content-assignments')).toBeVisible();

      // ── PHASE 2: Viewer baseline — read-only, no action buttons anywhere ───
      await expect(viewerPage.getByText('View only').first()).toBeVisible();
      await expect(viewerPage.getByTestId(/^assign-btn-/).first()).not.toBeVisible();
      await expect(viewerPage.getByTestId(/^cancel-btn-/).first()).not.toBeVisible();

      // ── PHASE 3: Manager assigns a vehicle ──────────────────────────────────
      const firstAssignBtn = managerPage.getByTestId(/^assign-btn-/).first();
      await expect(firstAssignBtn).toBeVisible();
      const vehicleCode = (await firstAssignBtn.getAttribute('data-testid'))!.replace('assign-btn-', '');
      const managerRow  = managerPage.getByTestId(`vehicle-row-${vehicleCode}`);
      const viewerRow   = viewerPage.getByTestId(`vehicle-row-${vehicleCode}`);

      await firstAssignBtn.click();
      await expect(managerPage.getByTestId('driver-selection-modal')).toBeVisible();

      const assignDialogs = captureDialogs(managerPage);
      await managerPage.getByTestId(/^assign-driver-btn-/).first().click();
      await expect(managerPage.getByTestId('driver-selection-modal')).not.toBeVisible();
      assignDialogs.stop();

      expect(assignDialogs.messages.confirm).toContain(vehicleCode);
      expect(assignDialogs.messages.alert).toContain(vehicleCode);

      // Manager sees Pending immediately
      await expect(managerRow.getByTestId(`assignment-status-${vehicleCode}`))
        .toContainText('Pending', { ignoreCase: true });

      // ── PHASE 4: Viewer's dashboard auto-polls and reflects the change ─────
      await expect(viewerRow.getByTestId(`assignment-status-${vehicleCode}`))
        .toContainText('Pending', { ignoreCase: true, timeout: POLL_TIMEOUT });

      // Viewer sees the driver name
      await expect(viewerRow.getByTestId(`driver-contact-btn-${vehicleCode}`)).toBeVisible();

      // ── PHASE 5: Viewer still has zero action buttons post-assignment ──────
      await expect(viewerRow.getByTestId(`assign-btn-${vehicleCode}`)).not.toBeVisible();
      await expect(viewerRow.getByTestId(`cancel-btn-${vehicleCode}`)).not.toBeVisible();
      await expect(viewerPage.getByText('View only').first()).toBeVisible();

      // Vehicle physical status is visible to viewer and unchanged
      await expect(viewerRow.getByTestId(`vehicle-status-${vehicleCode}`))
        .toContainText('available', { ignoreCase: true });

    } finally {
      if (testInfo.status !== testInfo.expectedStatus) {
        await managerCtx.tracing.stop({ path: 'test-results/rbac-manager-trace.zip' });
        await viewerCtx.tracing.stop({ path: 'test-results/rbac-viewer-trace.zip' });
      } else {
        await managerCtx.tracing.stop();
        await viewerCtx.tracing.stop();
      }
      await managerCtx.close();
      await viewerCtx.close();
    }
  });
});