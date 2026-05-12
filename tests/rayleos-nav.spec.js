const { test, expect } = require('@playwright/test');

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
    });
  }
});

test('mobile nav opens and closes', async ({ page }) => {
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
});
