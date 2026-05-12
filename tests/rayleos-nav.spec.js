const { test, expect } = require('@playwright/test');
const { installConsoleErrorGuard } = require('./rayleos-test-utils.cjs');

const navLinks = [
  { name: 'Home', path: '/RayLeos/' },
  { name: 'Shows', path: '/RayLeos/shows/' },
  { name: 'Food & Bar', path: '/RayLeos/food-bar/' },
  { name: 'Booking', path: '/RayLeos/booking/' },
  { name: 'Visit', path: '/RayLeos/visit/' },
  { name: 'About', path: '/RayLeos/about/' }
];

test.describe('primary navigation', () => {
  for (const link of navLinks) {
    test(`${link.name} link loads successfully`, async ({ page }) => {
      const consoleErrors = installConsoleErrorGuard(page);
      await page.goto('/RayLeos/');
      const responsePromise = page.waitForResponse(response => {
        const url = new URL(response.url());
        return url.pathname === link.path && response.request().resourceType() === 'document';
      });

      await page.getByRole('navigation').getByRole('link', { name: link.name, exact: true }).click();
      const response = await responsePromise;

      expect(response.ok()).toBeTruthy();
      await expect(page).toHaveURL(new RegExp(`${link.path.replace(/\//g, '\\/')}$`));
      await expect(page.locator('main')).toBeVisible();
      expect(consoleErrors).toEqual([]);
    });
  }
});

test('mobile nav opens and closes', async ({ page }) => {
  const consoleErrors = installConsoleErrorGuard(page);
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/RayLeos/');

  const toggle = page.locator('[data-menu-toggle]');
  const nav = page.locator('[data-primary-nav]');

  await expect(toggle).toBeVisible();
  await expect(toggle).toHaveAttribute('aria-expanded', 'false');

  await toggle.click();
  await expect(toggle).toHaveAttribute('aria-expanded', 'true');
  await expect(nav).toHaveClass(/is-open/);
  await expect(nav.getByRole('link', { name: 'Shows', exact: true })).toBeVisible();

  await toggle.click();
  await expect(toggle).toHaveAttribute('aria-expanded', 'false');
  await expect(nav).not.toHaveClass(/is-open/);
  expect(consoleErrors).toEqual([]);
});

test('external links open in new tabs while internal nav stays same-tab', async ({ page }) => {
  const consoleErrors = installConsoleErrorGuard(page, {
    ignorePatterns: [/Failed to load resource: the server responded with a status of 403/i]
  });

  await page.goto('/RayLeos/');
  await expect(page.locator('[data-shows-preview]').locator('.show-card, p').first()).toBeVisible();

  const navTargets = await page.locator('[data-primary-nav] a').evaluateAll(links => links.map(link => ({
    href: link.getAttribute('href') || '',
    target: link.getAttribute('target') || ''
  })));
  for (const link of navTargets) {
    expect(link.href.startsWith('/RayLeos/')).toBeTruthy();
    expect(link.target).toBe('');
  }

  for (const path of ['/RayLeos/', '/RayLeos/shows/', '/RayLeos/food-bar/', '/RayLeos/visit/', '/RayLeos/about/']) {
    await page.goto(path);
    if (path === '/RayLeos/' || path === '/RayLeos/shows/') {
      await expect(page.locator('[data-shows-preview], [data-shows-list]').locator('.show-card, p').first()).toBeVisible();
    }

    const externalLinks = await page.locator('a[href^="http"]').evaluateAll(links => links.map(link => ({
      text: link.textContent.trim(),
      href: link.getAttribute('href') || '',
      target: link.getAttribute('target') || '',
      rel: link.getAttribute('rel') || '',
      label: link.getAttribute('aria-label') || ''
    })).filter(link => !link.href.includes('/RayLeos/')));

    expect(externalLinks.length).toBeGreaterThan(0);
    for (const link of externalLinks) {
      expect(link.target).toBe('_blank');
      expect(link.rel.split(/\s+/)).toEqual(expect.arrayContaining(['noopener', 'noreferrer']));
      expect(link.label).toMatch(/opens in a new tab/i);
    }
  }

  await page.goto('/RayLeos/');
  const latestDetails = page.locator('[data-shows-preview] a[href^="https://www.facebook.com"]').first();
  await expect(latestDetails).toHaveAttribute('target', '_blank');
  await expect(latestDetails).toHaveAttribute('rel', /noopener/);
  await expect(latestDetails).toHaveAttribute('aria-label', /opens in a new tab/i);

  expect(consoleErrors).toEqual([]);
});
