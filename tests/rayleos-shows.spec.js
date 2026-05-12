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

test('shows page renders only confirmed public events', async ({ page }) => {
  const consoleErrors = installConsoleErrorGuard(page);
  await page.route('**/RayLeos/assets/data/shows.json', route => route.fulfill({
    contentType: 'application/json',
    body: JSON.stringify([
      {
        id: '2099-01-01-public-show',
        title: 'Public Confirmed Show',
        status: 'confirmed',
        visibility: 'public',
        date: '2099-01-01',
        doorsTime: '7:00 PM',
        showTime: '8:00 PM',
        startTime: '8:00 PM',
        endTime: '11:00 PM',
        price: 'Check listing',
        agePolicy: 'All ages unless noted',
        lineup: ['Public Confirmed Show'],
        support: [],
        publicDescription: 'Public show description.',
        ticketUrl: 'https://www.eventbrite.com/o/121162835137',
        detailUrl: '',
        ticketLabel: 'Tickets',
        detailLabel: 'Event details',
        tags: ['Live Music'],
        source: { type: 'manual' }
      },
      {
        id: '2099-01-02-private-show',
        title: 'Private Calendar Hold',
        status: 'hold',
        visibility: 'private',
        date: '2099-01-02',
        startTime: '8:00 PM',
        endTime: '11:00 PM',
        lineup: ['Private Calendar Hold'],
        publicDescription: 'Hidden event.'
      },
      {
        id: '2099-01-03-cancelled-show',
        title: 'Cancelled Public Event',
        status: 'cancelled',
        visibility: 'public',
        date: '2099-01-03',
        startTime: '8:00 PM',
        endTime: '11:00 PM',
        lineup: ['Cancelled Public Event'],
        publicDescription: 'Hidden event.'
      },
      {
        id: '2099-01-04-needs-opener',
        title: 'Needs Opener Event',
        status: 'needs-opener',
        visibility: 'public',
        date: '2099-01-04',
        startTime: '8:00 PM',
        endTime: '11:00 PM',
        lineup: ['Needs Opener Event'],
        publicDescription: 'Hidden event.'
      }
    ])
  }));

  await page.goto('/RayLeos/shows/');

  const list = page.locator('[data-shows-list]');
  await expect(list.locator('.show-card')).toHaveCount(1);
  await expect(list).toContainText('Public Confirmed Show');
  await expect(list).not.toContainText('Private Calendar Hold');
  await expect(list).not.toContainText('Cancelled Public Event');
  await expect(list).not.toContainText('Needs Opener Event');

  const detailLink = list.locator('.show-card a[href^="https://"]').first();
  await expect(detailLink).toHaveAttribute('target', '_blank');
  await expect(detailLink).toHaveAttribute('rel', /noopener/);
  await expect(consoleErrors).toEqual([]);
});

test('shows page mobile layout has no horizontal overflow', async ({ page }) => {
  const consoleErrors = installConsoleErrorGuard(page);
  await page.setViewportSize({ width: 412, height: 915 });

  await page.goto('/RayLeos/shows/');
  await expect(page.locator('[data-shows-list]').locator('.show-card, p').first()).toBeVisible();

  const hasOverflow = await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth + 2);
  expect(hasOverflow).toBe(false);
  expect(consoleErrors).toEqual([]);
});
