const { test, expect } = require('@playwright/test');
const { installConsoleErrorGuard } = require('./rayleos-test-utils.cjs');

test('shows page fetches public event JSON and renders listings or empty state', async ({ page }) => {
  const consoleErrors = installConsoleErrorGuard(page);
  const showsResponse = page.waitForResponse(response => response.url().endsWith('/RayLeos/assets/data/shows.json'));

  await page.goto('/RayLeos/shows/');

  const response = await showsResponse;
  expect(response.ok()).toBeTruthy();

  const list = page.locator('[data-shows-list]');
  await expect(list).toBeVisible();
  await expect(list.locator('.show-card, p').first()).toBeVisible();

  const publicListingText = await list.textContent();
  expect(publicListingText).not.toMatch(/\b(PRIVATE|BLACKOUT|CANCELLED|NO SHOW)\b/i);
  expect(publicListingText).not.toMatch(/guarantee|door split|promoter notes|staffing notes|internal booking/i);
  expect(consoleErrors).toEqual([]);
});
