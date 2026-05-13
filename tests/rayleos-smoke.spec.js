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
  await expect(page.locator('[data-shows-preview] .show-card')).toHaveCount(4);
  await expect(page.locator('[data-shows-preview] .show-card').first()).toHaveClass(/show-card-compact/);
  await expect(page.locator('[data-shows-preview] .show-desc')).toHaveCount(0);
  await expect(page.locator('[data-shows-preview] .show-tags')).toHaveCount(0);
  await expect(page.locator('.photo-stack .stack-img')).toHaveCount(3);
  await expect(page.locator('.photo-stack .stack-img').first()).toHaveAttribute('tabindex', '0');
  await expect(page.locator('img[src="/RayLeos/assets/img/hero-stage.jpg"]')).toBeVisible();
  await expect(page.locator('.photo-stack img[src="/RayLeos/assets/img/venue-stage.jpg"]')).toBeVisible();
  await expect(page.locator('.photo-stack img[src="/RayLeos/assets/img/venue-bar.jpg"]')).toBeVisible();
  await expect(page.locator('.photo-stack img[src="/RayLeos/assets/img/venue-exterior.jpg"]')).toBeVisible();
  await expect(page.locator('.photo-stack img[src*="/placeholders/"]')).toHaveCount(0);
  await expect(page.locator('.photo-stack img[src*="venue-room.svg"]')).toHaveCount(0);
  await expect(page.locator('body')).not.toContainText(/undefined|null|error loading/i);
  expect(consoleErrors).toEqual([]);
  expect(pageErrors).toEqual([]);
});

test('home photo cards render on mobile without hover-dependent behavior', async ({ page }) => {
  const consoleErrors = installConsoleErrorGuard(page);
  await page.setViewportSize({ width: 412, height: 915 });

  await page.goto('/RayLeos/');

  await expect(page.locator('.photo-stack')).toBeVisible();
  await expect(page.locator('.photo-stack .stack-img')).toHaveCount(3);
  await expect(page.locator('.photo-stack .stack-img img').first()).toBeVisible();
  const viewport = await page.evaluate(() => ({ width: window.innerWidth, scrollWidth: document.documentElement.scrollWidth }));
  expect(viewport.scrollWidth).toBeLessThanOrEqual(viewport.width + 1);
  await expect(page.locator('main')).toBeVisible();
  expect(consoleErrors).toEqual([]);
});

test('real photos open in an accessible preview and logo images do not', async ({ page }) => {
  const consoleErrors = installConsoleErrorGuard(page);

  await page.goto('/RayLeos/');

  await expect(page.locator('img[data-photo-preview]')).toHaveCount(4);
  await expect(page.locator('.hero-logo[data-photo-preview]')).toHaveCount(0);
  await expect(page.locator('.brand-mark img[data-photo-preview]')).toHaveCount(0);

  await page.locator('img[data-photo-preview]').first().click();
  const dialog = page.getByRole('dialog', { name: /photo preview/i });
  await expect(dialog).toBeVisible();
  await expect(dialog.locator('.photo-lightbox__image')).toHaveAttribute('src', /\/RayLeos\/assets\/img\/hero-stage\.jpg$/);
  await expect(dialog.locator('.photo-lightbox__caption')).toContainText(/Live music at Ray Leo/i);

  await page.keyboard.press('Escape');
  await expect(dialog).toBeHidden();
  expect(consoleErrors).toEqual([]);
});
