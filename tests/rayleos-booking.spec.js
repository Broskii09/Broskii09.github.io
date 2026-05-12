const { test, expect } = require('@playwright/test');
const { installConsoleErrorGuard } = require('./rayleos-test-utils.cjs');

test('booking page renders availability, autofills inquiry context, validates, and generates a copyable request', async ({ page }) => {
  const consoleErrors = installConsoleErrorGuard(page);
  const availabilityResponse = page.waitForResponse(response => response.url().endsWith('/RayLeos/assets/data/availability.json'));

  await page.goto('/RayLeos/booking/');

  const response = await availabilityResponse;
  expect(response.ok()).toBeTruthy();

  const availabilityList = page.locator('[data-availability-list]');
  await expect(availabilityList).toBeVisible();
  await expect(availabilityList.locator('.availability-item').first()).toBeVisible();
  await expect(page.locator('#already-booked')).toBeVisible();
  await expect(page.locator('#already-booked')).toContainText(/Final show checklist/i);

  const sectionOrder = await page.evaluate(() => {
    const availability = document.querySelector('#availability')?.getBoundingClientRect().top || 0;
    const alreadyBooked = document.querySelector('#already-booked')?.getBoundingClientRect().top || 0;
    const bookingForm = document.querySelector('#booking-form')?.getBoundingClientRect().top || 0;
    return { availability, alreadyBooked, bookingForm };
  });
  expect(sectionOrder.availability).toBeLessThan(sectionOrder.alreadyBooked);
  expect(sectionOrder.alreadyBooked).toBeLessThan(sectionOrder.bookingForm);

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
  await expect(summary).toHaveValue(new RegExp(`Availability Status: ${inquiryStatus}`));
  await expect(summary).toHaveValue(/Music Links: https:\/\/example\.com\/music/);
  await expect(summary).toHaveValue(/EPK Link: https:\/\/example\.com\/epk/);
  await expect(summary).toHaveValue(/Send to:/);

  const emailLink = page.locator('[data-open-email]');
  await expect(emailLink).toHaveAttribute('href', /^mailto:/);
  expect(consoleErrors).toEqual([]);
});

test('mobile inquiry click reveals booking form and leaves fields editable', async ({ page }) => {
  const consoleErrors = installConsoleErrorGuard(page);
  await page.setViewportSize({ width: 412, height: 915 });

  const availabilityResponse = page.waitForResponse(response => response.url().endsWith('/RayLeos/assets/data/availability.json'));
  await page.goto('/RayLeos/booking/');
  expect((await availabilityResponse).ok()).toBeTruthy();

  const inquiryButton = page.locator('[data-availability-list] [data-inquire-date]').first();
  const inquiryStatus = await inquiryButton.getAttribute('data-inquire-status');
  await inquiryButton.click();

  const form = page.locator('[data-booking-form]');
  const selectedDate = page.locator('#selectedDate');
  const selectedStatus = page.locator('#selectedStatus');
  const requestType = page.locator('#requestType');

  await expect(selectedDate).not.toHaveValue('');
  await expect(selectedStatus).toHaveValue(inquiryStatus || '');
  await expect(form).toBeVisible();
  await expect(requestType).toBeInViewport();
  await expect(requestType).toBeEditable();

  await requestType.selectOption({ label: 'General booking inquiry' });
  await expect(requestType).toHaveValue('General booking inquiry');
  expect(consoleErrors).toEqual([]);
});
