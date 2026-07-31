import { test, expect, type Dialog, type Browser } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';
import { DashboardPage } from '../pages/DashboardPage';
import { resetAssignments } from '../helpers/cleanup';

const MANAGER = { email: 'manager@fleetpulse.com', password: 'manager123' };
const VIEWER  = { email: 'viewer@fleetpulse.com',  password: 'viewer123' };

// Dashboard polls every 10 s — allow one full cycle
const POLL_TIMEOUT = 15_000;

test.describe('RBAC live view — viewer watches manager assign in real time', () => {
  test.setTimeout(60_000);

  test('viewer sees live Pending badge but has no action buttons', async ({ browser }: { browser: Browser }) => {
    const managerCtx = await browser.newContext({ baseURL: 'http://localhost:5173' });
    const viewerCtx  = await browser.newContext({ baseURL: 'http://localhost:5173' });
    const managerPage = await managerCtx.newPage();
    const viewerPage  = await viewerCtx.newPage();

    const managerLogin   = new LoginPage(managerPage);
    const viewerLogin    = new LoginPage(viewerPage);
    const managerDash    = new DashboardPage(managerPage);
    const viewerDash     = new DashboardPage(viewerPage);

    try {
      await resetAssignments();

      // ── Both users log in and navigate to assignments tab ─────────────────
      await managerLogin.goto();
      await managerLogin.login(MANAGER.email, MANAGER.password);
      await expect(managerPage).toHaveURL('/dashboard');
      await managerDash.gotoTab('assignments');

      await viewerLogin.goto();
      await viewerLogin.login(VIEWER.email, VIEWER.password);
      await expect(viewerPage).toHaveURL('/dashboard');
      await viewerDash.gotoTab('assignments');

      // Viewer sees "View only" label — no assign or cancel buttons exist at all
      await expect(viewerPage.getByText('View only').first()).toBeVisible();
      await expect(viewerPage.getByTestId(/^assign-btn-/).first()).not.toBeVisible();
      await expect(viewerPage.getByTestId(/^cancel-btn-/).first()).not.toBeVisible();

      // ── Manager assigns a vehicle ─────────────────────────────────────────
      const firstAssignBtn = managerPage.getByTestId(/^assign-btn-/).first();
      await expect(firstAssignBtn).toBeVisible();
      const vehicleCode = (await firstAssignBtn.getAttribute('data-testid'))!.replace('assign-btn-', '');

      await firstAssignBtn.click();
      await expect(managerPage.getByTestId('driver-selection-modal')).toBeVisible();
      managerPage.once('dialog', (d: Dialog) => d.accept());
      await managerPage.getByTestId(/^assign-driver-btn-/).first().click();
      await expect(managerPage.getByTestId('driver-selection-modal')).not.toBeVisible();

      // Manager sees Pending immediately
      await expect(managerPage.getByTestId(`assignment-status-${vehicleCode}`))
        .toContainText('Pending', { ignoreCase: true });

      // ── Viewer's dashboard auto-polls and shows Pending ───────────────────
      await expect(viewerPage.getByTestId(`assignment-status-${vehicleCode}`))
        .toContainText('Pending', { ignoreCase: true, timeout: POLL_TIMEOUT });

      // Viewer sees the driver name
      await expect(viewerPage.getByTestId(`driver-contact-btn-${vehicleCode}`)).toBeVisible();

      // Viewer still has no action buttons — even after assignment exists
      await expect(viewerPage.getByTestId(`assign-btn-${vehicleCode}`)).not.toBeVisible();
      await expect(viewerPage.getByTestId(`cancel-btn-${vehicleCode}`)).not.toBeVisible();

      // "View only" label is still present
      await expect(viewerPage.getByText('View only').first()).toBeVisible();

      // ── Vehicle physical status is visible to viewer and unchanged ─────────
      await expect(viewerPage.getByTestId(`vehicle-status-${vehicleCode}`))
        .toContainText('available', { ignoreCase: true });

    } finally {
      await managerCtx.close();
      await viewerCtx.close();
    }
  });
});
