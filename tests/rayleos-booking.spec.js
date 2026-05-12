const { test, expect } = require('@playwright/test');

test('booking page renders availability, autofills inquiry context, validates, and generates a copyable request', async ({ page }) => {
  const availabilityResponse = page.waitForResponse(response => response.url().endsWith('/RayLeos/assets/data/availability.json'));

  await page.goto('/RayLeos/booking/');

  const response = await availabilityResponse;
  expect(response.ok()).toBeTruthy();

  const availabilityList = page.locator('[data-availability-list]');
  await expect(availabilityList).toBeVisible();
  await expect(availabilityList.locator('.availability-item').first()).toBeVisible();

  const inquiryButton = availabilityList.locator('[data-inquire-date]').first();
  const inquiryDate = await inquiryButton.getAttribute('data-inquire-date');
  const inquiryStatus = await inquiryButton.getAttribute('data-inquire-status');
  await inquiryButton.click();

  const selectedDate = page.locator('#selectedDate');
  const selectedStatus = page.locator('#selectedStatus');
  await expect(selectedDate).not.toHaveValue('');
  await expect(selectedStatus).toHaveValue(inquiryStatus || '');
  expect(['Available', 'Booked', 'Hold', 'Needs Support', 'Unavailable']).toContain(inquiryStatus);

  await page.getByRole('button', { name: /Generate Booking Request/i }).click();
  await expect(page.locator('[data-form-alert]')).toBeVisible();
  await expect(page.locator('[data-form-alert]')).toContainText(/Please fix/i);

  await page.locator('#artistName').fill('The Test Signals');
  await page.locator('#contactName').fill('Jordan Test');
  await page.locator('#email').fill('booking@example.com');
  await page.locator('#hometown').fill('Evansville, IN');
  await page.locator('#genre').fill('Indie rock');
  await page.locator('#musicLinks').fill('https://example.com/music');
  await page.locator('#epk').fill('https://example.com/epk');
  await page.locator('#preferredDates').fill(`Autofilled inquiry date: ${inquiryDate}`);

  await page.getByRole('button', { name: /Generate Booking Request/i }).click();

  const output = page.locator('[data-booking-output]');
  const summary = page.locator('[data-booking-summary]');
  await expect(output).toBeVisible();
  await expect(summary).toHaveValue(/The Test Signals/);
  await expect(summary).toHaveValue(/Selected Date:/);
  await expect(summary).toHaveValue(new RegExp(`Calendar Status: ${inquiryStatus}`));
  await expect(summary).toHaveValue(/Send to:/);

  const emailLink = page.locator('[data-open-email]');
  await expect(emailLink).toHaveAttribute('href', /^mailto:/);
});
