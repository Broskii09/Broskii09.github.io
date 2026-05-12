const { test, expect } = require('@playwright/test');
const { installConsoleErrorGuard } = require('./rayleos-test-utils.cjs');

test('homepage loads with Ray Leo content and core calls to action', async ({ page }) => {
  const consoleErrors = installConsoleErrorGuard(page);
  const pageErrors = [];
  page.on('pageerror', error => pageErrors.push(error.message));

  await page.goto('/RayLeos/');

  await expect(page).toHaveTitle(/Ray Leo/i);
  await expect(page.locator('main')).toBeVisible();
  await expect(page.getByRole('heading', { level: 1 })).toContainText(/Live music/i);
  await expect(page.getByText(/Evansville live music venue/i)).toBeVisible();
  await expect(page.getByRole('link', { name: /See Upcoming Shows/i })).toBeVisible();
  await expect(page.getByRole('link', { name: /Book the Stage/i })).toBeVisible();
  await expect(page.locator('[data-shows-preview]')).toBeVisible();
  await expect(page.locator('body')).not.toContainText(/undefined|null|error loading/i);
  expect(consoleErrors).toEqual([]);
  expect(pageErrors).toEqual([]);
});
