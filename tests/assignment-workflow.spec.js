// tests/assignment-workflow.spec.js
// E2E Test: Driver Assignment Workflow
// Uses data-testid attributes for reliable selectors

const { test, expect } = require('@playwright/test');

test.describe('Driver Assignment Workflow', () => {

  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:5173');
    await page.waitForLoadState('networkidle');
  });

  test('should complete full assignment workflow', async ({ page }) => {
    // Step 1: Navigate to Assignments tab
    await page.click('[data-testid="tab-assignments"]');
    await page.waitForSelector('[data-testid="tab-content-assignments"]');

    // Step 2: Click first available Assign button
    const assignBtn = page.locator('[data-testid^="assign-btn-"]').first();
    await expect(assignBtn).toBeVisible({ timeout: 5000 });
    await assignBtn.click();

    // Step 3: Verify driver selection modal opened
    await expect(page.locator('[data-testid="driver-selection-modal"]')).toBeVisible({ timeout: 5000 });
    console.log('✓ Driver selection modal opened');

    // Step 4: Click first available driver card
    const driverCard = page.locator('[data-testid^="driver-card-"]').first();
    await expect(driverCard).toBeVisible({ timeout: 5000 });

    page.once('dialog', async dialog => {
      console.log('✓ Confirmation dialog:', dialog.message());
      await dialog.accept();
    });
    await driverCard.click();
    await page.waitForTimeout(2000);

    // Step 5: Verify Pending status appears
    const pendingBadge = page.locator('[data-testid^="assignment-status-"]').first();
    await expect(pendingBadge).toBeVisible({ timeout: 5000 });
    console.log('✓ Assignment created - Pending status visible');
  });

  test('should cancel pending assignment', async ({ page }) => {
    await page.click('[data-testid="tab-assignments"]');
    await page.waitForSelector('[data-testid="tab-content-assignments"]');

    // Create assignment if needed
    let cancelBtn = page.locator('[data-testid^="cancel-btn-"]').first();
    const hasCancelBtn = await cancelBtn.isVisible().catch(() => false);

    if (!hasCancelBtn) {
      console.log('⚠ No pending assignment, creating one first...');
      await page.locator('[data-testid^="assign-btn-"]').first().click();
      await expect(page.locator('[data-testid="driver-selection-modal"]')).toBeVisible({ timeout: 5000 });
      page.once('dialog', async dialog => await dialog.accept());
      await page.locator('[data-testid^="driver-card-"]').first().click();
      await page.waitForTimeout(2000);
    }

    // Get the specific cancel button and its vehicle code
    cancelBtn = page.locator('[data-testid^="cancel-btn-"]').first();
    await expect(cancelBtn).toBeVisible({ timeout: 5000 });

    // Get the testid to track THIS specific button
    const cancelTestId = await cancelBtn.getAttribute('data-testid');
    console.log(`✓ Cancelling: ${cancelTestId}`);

    page.once('dialog', async dialog => {
      console.log('✓ Cancel dialog appeared');
      await dialog.accept();
    });
    await cancelBtn.click();
    await page.waitForTimeout(1500);

    // Verify THIS specific cancel button is gone (not just any cancel button)
    const specificBtn = page.locator(`[data-testid="${cancelTestId}"]`);
    const stillVisible = await specificBtn.isVisible().catch(() => false);
    expect(stillVisible).toBe(false);
    console.log('✓ Assignment cancelled');
  });

  test('should show Fleet Map after assignment', async ({ page }) => {
    // Ensure assignment exists
    await page.click('[data-testid="tab-assignments"]');
    await page.waitForSelector('[data-testid="tab-content-assignments"]');

    const hasPending = await page.locator('[data-testid^="assignment-status-"]').first().isVisible().catch(() => false);
    if (!hasPending) {
      console.log('⚠ Creating assignment for map test...');
      await page.locator('[data-testid^="assign-btn-"]').first().click();
      await expect(page.locator('[data-testid="driver-selection-modal"]')).toBeVisible({ timeout: 5000 });
      page.once('dialog', async dialog => await dialog.accept());
      await page.locator('[data-testid^="driver-card-"]').first().click();
      await page.waitForTimeout(2000);
    }

    // Switch to Fleet Map
    await page.click('[data-testid="tab-map"]');
    await page.waitForSelector('[data-testid="tab-content-map"]');

    await expect(page.locator('[data-testid="vehicle-list"]')).toBeVisible();
    await expect(page.locator('svg').first()).toBeVisible();
    console.log('✓ Fleet Map visible with vehicle list');
  });

});