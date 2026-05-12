const { test, expect } = require('@playwright/test');
const AxeBuilder = require('@axe-core/playwright').default;
const { installConsoleErrorGuard } = require('./rayleos-test-utils.cjs');

const pages = [
  { name: 'Home', path: '/RayLeos/' },
  { name: 'Shows', path: '/RayLeos/shows/' },
  { name: 'Food & Bar', path: '/RayLeos/food-bar/' },
  { name: 'Booking', path: '/RayLeos/booking/' },
  { name: 'Visit', path: '/RayLeos/visit/' },
  { name: 'About', path: '/RayLeos/about/' }
];

for (const pageInfo of pages) {
  test(`${pageInfo.name} has no serious automated accessibility violations`, async ({ page }) => {
    const consoleErrors = installConsoleErrorGuard(page, {
      ignorePatterns: pageInfo.name === 'Food & Bar'
        ? [/Failed to load resource: the server responded with a status of 403/i]
        : []
    });
    await page.goto(pageInfo.path);

    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      .disableRules(['color-contrast'])
      .exclude('.menu-embed iframe')
      .analyze();

    const seriousViolations = results.violations.filter(violation => ['critical', 'serious'].includes(violation.impact));

    expect(seriousViolations).toEqual([]);
    expect(consoleErrors).toEqual([]);
  });
}
