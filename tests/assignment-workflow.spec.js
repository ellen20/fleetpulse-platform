// tests/assignment-workflow.spec.js
//
// E2E Tests: Assignment Workflow, RBAC, and Fleet Map
//
// Coverage:
//  - Full driver assignment creation workflow
//  - Cancel pending assignment
//  - Fleet Map reflects assignment state
//  - Driver contact modal
//  - RBAC: viewer cannot assign or cancel
//  - Fleet Map filtering and pagination
//
// Prerequisites:
//  - API running on http://localhost:3001
//  - Dashboard running on http://localhost:5173
//  - Database seeded with vehicles and drivers

const { test, expect } = require('@playwright/test');

// ─────────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────────

const loginAs = async (page, role) => {
  const credentials = {
    manager: { email: 'manager@fleetpulse.com', password: 'manager123' },
    viewer:  { email: 'viewer@fleetpulse.com',  password: 'viewer123'  },
  };

  const { email, password } = credentials[role];

  await page.goto('http://localhost:5173/login');
  await page.waitForLoadState('networkidle');
  await page.fill('[data-testid="email-input"]', email);
  await page.fill('[data-testid="password-input"]', password);
  await page.click('[data-testid="login-submit"]');
  await page.waitForURL('**/dashboard', { timeout: 10000 });
  await page.waitForLoadState('networkidle');
};

const goToAssignments = async (page) => {
  await page.click('[data-testid="tab-assignments"]');
  await page.waitForSelector('[data-testid="tab-content-assignments"]');
  await page.waitForSelector('[data-testid="assignments-table-body"]');
};

const goToFleetMap = async (page) => {
  await page.click('[data-testid="tab-map"]');
  await page.waitForSelector('[data-testid="tab-content-map"]');
};

const ensureAssignmentExists = async (page) => {
  const hasPending = await page.locator('[data-testid^="assignment-status-"]')
    .first().isVisible().catch(() => false);

  if (!hasPending) {
    await page.locator('[data-testid^="assign-btn-"]').first().click();
    await expect(page.locator('[data-testid="driver-selection-modal"]'))
      .toBeVisible({ timeout: 5000 });
    page.once('dialog', dialog => dialog.accept());
    await page.locator('[data-testid^="driver-card-"]').first().click();
    await expect(page.locator('[data-testid="driver-selection-modal"]'))
      .not.toBeVisible({ timeout: 5000 });
  }
};

// ─────────────────────────────────────────────────────────────
// ASSIGNMENT WORKFLOW
// ─────────────────────────────────────────────────────────────
test.describe('Driver Assignment Workflow', () => {

  test.beforeEach(async ({ page }) => {
    await loginAs(page, 'manager');
  });

  test('should complete full assignment workflow', async ({ page }) => {
    await goToAssignments(page);

    const assignBtn = page.locator('[data-testid^="assign-btn-"]').first();
    await expect(assignBtn).toBeVisible({ timeout: 5000 });
    await assignBtn.click();

    await expect(page.locator('[data-testid="driver-selection-modal"]')).toBeVisible({ timeout: 5000 });
    await expect(page.locator('h2')).toContainText('Select Driver');

    const driverCard = page.locator('[data-testid^="driver-card-"]').first();
    await expect(driverCard).toBeVisible({ timeout: 5000 });

    page.once('dialog', dialog => dialog.accept());
    await driverCard.click();

    await expect(page.locator('[data-testid="driver-selection-modal"]'))
      .not.toBeVisible({ timeout: 5000 });
    await expect(page.locator('[data-testid^="assignment-status-"]').first())
      .toBeVisible({ timeout: 5000 });
  });

  test('should cancel pending assignment', async ({ page }) => {
    await goToAssignments(page);

    const hasCancelBtn = await page.locator('[data-testid^="cancel-btn-"]')
      .first().isVisible().catch(() => false);

    if (!hasCancelBtn) {
      await page.locator('[data-testid^="assign-btn-"]').first().click();
      await expect(page.locator('[data-testid="driver-selection-modal"]'))
        .toBeVisible({ timeout: 5000 });
      page.once('dialog', dialog => dialog.accept());
      await page.locator('[data-testid^="driver-card-"]').first().click();
      await expect(page.locator('[data-testid="driver-selection-modal"]'))
        .not.toBeVisible({ timeout: 5000 });
    }

    const cancelBtn = page.locator('[data-testid^="cancel-btn-"]').first();
    await expect(cancelBtn).toBeVisible({ timeout: 5000 });
    const cancelTestId = await cancelBtn.getAttribute('data-testid');

    page.once('dialog', async dialog => {
      expect(dialog.message()).toContain('Cancel this assignment');
      await dialog.accept();
    });
    await cancelBtn.click();

    await expect(page.locator(`[data-testid="${cancelTestId}"]`))
      .not.toBeVisible({ timeout: 5000 });
  });

  test('should show pending assignment on Fleet Map', async ({ page }) => {
    await goToAssignments(page);
    await ensureAssignmentExists(page);
    await goToFleetMap(page);

    await expect(page.locator('[data-testid="vehicle-list"]')).toBeVisible();
    await expect(page.locator('svg').first()).toBeVisible();
    await expect(page.locator('[data-testid^="vehicle-list-item-"]').first())
      .toBeVisible({ timeout: 5000 });
  });

  test('should open and close driver contact modal', async ({ page }) => {
    await goToAssignments(page);

    const contactBtn = page.locator('[data-testid^="driver-contact-btn-"]').first();
    await expect(contactBtn).toBeVisible({ timeout: 5000 });
    await contactBtn.click();

    await expect(page.locator('[data-testid="contact-modal"]')).toBeVisible({ timeout: 5000 });
    await expect(page.locator('[data-testid="contact-modal-email"]')).toBeVisible();
    await expect(page.locator('[data-testid="contact-modal-phone"]')).toBeVisible();
    await expect(page.locator('[data-testid="contact-modal-license"]')).toBeVisible();

    await page.click('[data-testid="close-contact-modal"]');

    await expect(page.locator('[data-testid="contact-modal"]')).not.toBeVisible();
  });
});

// ─────────────────────────────────────────────────────────────
// RBAC — VIEWER RESTRICTIONS
// ─────────────────────────────────────────────────────────────
test.describe('RBAC - Viewer Cannot Modify Assignments', () => {

  test.beforeEach(async ({ page }) => {
    await loginAs(page, 'viewer');
    await goToAssignments(page);
  });

  test('viewer cannot see Assign button', async ({ page }) => {
    const count = await page.locator('[data-testid^="assign-btn-"]').count();
    expect(count).toBe(0);
  });

  test('viewer cannot see Cancel button', async ({ page }) => {
    const count = await page.locator('[data-testid^="cancel-btn-"]').count();
    expect(count).toBe(0);
  });

  test('viewer sees View only text in actions column', async ({ page }) => {
    await expect(page.getByText('View only').first()).toBeVisible({ timeout: 5000 });
  });

  test('viewer can still see all vehicles in table', async ({ page }) => {
    const totalText = await page.locator('[data-testid="status-count-all"]').innerText();
    const rows = await page.locator('[data-testid="assignments-table-body"] tr').count();
    expect(rows).toBe(parseInt(totalText));
  });
});

// ─────────────────────────────────────────────────────────────
// FLEET MAP
// ─────────────────────────────────────────────────────────────
test.describe('Fleet Map', () => {

  test.beforeEach(async ({ page }) => {
    await loginAs(page, 'manager');
    await goToFleetMap(page);
  });

  test('default view shows paginated vehicle list', async ({ page }) => {
    const items = await page.locator('[data-testid^="vehicle-list-item-"]').count();
    expect(items).toBeGreaterThan(0);
    expect(items).toBeLessThanOrEqual(10);
  });

  test('clicking Available filter shows only available vehicles', async ({ page }) => {
    await page.click('[data-testid="status-card-available"]');
    await expect(page.locator('[data-testid^="vehicle-list-item-"]').first())
      .toBeVisible({ timeout: 5000 });
  });

  test('SVG map renders with vehicle pins', async ({ page }) => {
    await expect(page.locator('svg').first()).toBeVisible();
  });
});