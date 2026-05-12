const { test, expect } = require('@playwright/test');
const { installConsoleErrorGuard } = require('./rayleos-test-utils.cjs');

test('core pages and booking inquiry work across configured browsers and viewports', async ({ page, isMobile }) => {
  const consoleErrors = installConsoleErrorGuard(page);

  await page.goto('/RayLeos/');
  await expect(page).toHaveTitle(/Ray Leo/i);
  await expect(page.getByRole('heading', { level: 1 })).toContainText(/Live music/i);

  if (isMobile) {
    const toggle = page.locator('[data-menu-toggle]');
    await expect(toggle).toBeVisible();
    await toggle.click();
    await expect(page.locator('[data-primary-nav]')).toHaveClass(/is-open/);
  }

  await page.goto('/RayLeos/shows/');
  await expect(page.locator('[data-shows-list]')).toBeVisible();
  await expect(page.locator('[data-shows-list]').locator('.show-card, p').first()).toBeVisible();

  const availabilityResponse = page.waitForResponse(response => response.url().endsWith('/RayLeos/assets/data/availability.json'));
  await page.goto('/RayLeos/booking/');
  expect((await availabilityResponse).ok()).toBeTruthy();

  const inquiryButton = page.locator('[data-availability-list] [data-inquire-date]').first();
  const inquiryStatus = await inquiryButton.getAttribute('data-inquire-status');
  await inquiryButton.click();

  await expect(page.locator('#selectedDate')).not.toHaveValue('');
  await expect(page.locator('#selectedStatus')).toHaveValue(inquiryStatus || '');
  await expect(page.locator('[data-booking-form]')).toBeVisible();
  await expect(page.locator('#requestType')).toBeEditable();
  expect(consoleErrors).toEqual([]);
});
