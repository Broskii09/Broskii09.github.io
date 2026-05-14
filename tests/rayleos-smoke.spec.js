const { test, expect } = require('@playwright/test');
const { installConsoleErrorGuard } = require('./rayleos-test-utils.cjs');

const heroPages = [
  { path: '/RayLeos/', image: '/RayLeos/assets/img/hero-home-exterior.jpg', focal: 'center 52%' },
  { path: '/RayLeos/shows/', image: '/RayLeos/assets/img/venue-stage.jpg', focal: '42% 45%' },
  { path: '/RayLeos/food-bar/', image: '/RayLeos/assets/img/venue-bar.jpg', focal: '62% 48%' },
  { path: '/RayLeos/booking/', image: '/RayLeos/assets/img/venue-exterior.jpg', focal: '58% 56%' },
  { path: '/RayLeos/visit/', image: '/RayLeos/assets/img/placeholders/map-placeholder.svg', focal: 'center center' },
  { path: '/RayLeos/about/', image: '/RayLeos/assets/img/placeholders/about-room.svg', focal: 'center center' }
];

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
  await expect(page.locator('.hero.hero--parallax[data-parallax-hero]')).toHaveCSS('background-color', /rgb/);
  await expect(page.locator('.hero.hero--parallax')).toHaveAttribute('style', /\/RayLeos\/assets\/img\/hero-home-exterior\.jpg/);
  await expect(page.locator('.photo-stack .stack-img')).toHaveCount(3);
  await expect(page.locator('.photo-stack .stack-img').first()).toHaveAttribute('tabindex', '0');
  await expect(page.locator('.hero img[src="/RayLeos/assets/img/hero-home-exterior.jpg"]')).toHaveCount(0);
  await expect(page.locator('.photo-stack img[src="/RayLeos/assets/img/venue-stage.jpg"]')).toBeVisible();
  await expect(page.locator('.photo-stack img[src="/RayLeos/assets/img/venue-bar.jpg"]')).toBeVisible();
  await expect(page.locator('.photo-stack img[src="/RayLeos/assets/img/venue-exterior.jpg"]')).toBeVisible();
  await expect(page.locator('.photo-stack img[src*="/placeholders/"]')).toHaveCount(0);
  await expect(page.locator('.photo-stack img[src*="venue-room.svg"]')).toHaveCount(0);
  await expect(page.locator('body')).not.toContainText(/undefined|null|error loading/i);
  expect(consoleErrors).toEqual([]);
  expect(pageErrors).toEqual([]);
});

test('public page heroes use CSS background parallax sources', async ({ page }) => {
  const consoleErrors = installConsoleErrorGuard(page, {
    ignorePatterns: [/Failed to load resource: the server responded with a status of 403/i]
  });

  for (const heroPage of heroPages) {
    await page.goto(heroPage.path);
    const hero = page.locator('[data-parallax-hero]').first();
    await expect(hero).toBeVisible();
    await expect(hero).toHaveClass(/hero--parallax/);
    await expect(hero).toHaveAttribute('style', new RegExp(heroPage.image.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')));
    await expect(hero).toHaveAttribute('style', new RegExp(heroPage.focal.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')));
    const heroLayer = await hero.evaluate(el => {
      const imageLayer = window.getComputedStyle(el, '::before');
      const overlayLayer = window.getComputedStyle(el, '::after');
      return {
        image: imageLayer.backgroundImage,
        imageContent: imageLayer.content,
        imageZ: imageLayer.zIndex,
        overlayZ: overlayLayer.zIndex,
        contentZ: window.getComputedStyle(el.querySelector('.hero-grid, .page-hero-grid')).zIndex
      };
    });
    expect(heroLayer.image).toContain(heroPage.image.split('/').pop());
    expect(heroLayer.imageContent).not.toBe('none');
    expect(heroLayer.imageZ).toBe('0');
    expect(heroLayer.overlayZ).toBe('1');
    expect(heroLayer.contentZ).toBe('2');
    await expect(hero.locator('img')).toHaveCount(heroPage.path === '/RayLeos/' ? 1 : 0);
  }

  expect(consoleErrors).toEqual([]);
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

  await expect(page.locator('img[data-photo-preview]')).toHaveCount(3);
  await expect(page.locator('.hero-logo[data-photo-preview]')).toHaveCount(0);
  await expect(page.locator('.brand-mark img[data-photo-preview]')).toHaveCount(0);
  await expect(page.locator('.hero img[data-photo-preview]')).toHaveCount(0);

  await page.locator('img[data-photo-preview]').first().click();
  const dialog = page.getByRole('dialog', { name: /photo preview/i });
  await expect(dialog).toBeVisible();
  await expect(dialog.locator('.photo-lightbox__image')).toHaveAttribute('src', /\/RayLeos\/assets\/img\/venue-stage\.jpg$/);
  await expect(dialog.locator('.photo-lightbox__caption')).toContainText(/Ray Leo.*stage/i);

  await page.keyboard.press('Escape');
  await expect(dialog).toBeHidden();
  expect(consoleErrors).toEqual([]);
});
