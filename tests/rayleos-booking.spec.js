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

  const inquiryPanel = page.locator('[data-selected-date-panel]');
  await expect(inquiryPanel).toBeHidden();

  const inquiryButton = availabilityList.locator('[data-inquire-date]').first();
  const inquiryDate = await inquiryButton.getAttribute('data-inquire-date');
  const inquiryStatus = await inquiryButton.getAttribute('data-inquire-status');
  await inquiryButton.click();

  const selectedDate = page.locator('#selectedDate');
  const selectedStatus = page.locator('#selectedStatus');
  await expect(selectedDate).not.toHaveValue('');
  await expect(selectedStatus).toHaveValue(inquiryStatus || '');
  await expect(inquiryPanel).toBeVisible();
  expect(['Available', 'Booked', 'Hold', 'Needs Support', 'Unavailable']).toContain(inquiryStatus);

  await page.getByRole('button', { name: /Clear selected date/i }).click();
  await expect(inquiryPanel).toBeHidden();
  await expect(selectedDate).toHaveValue('');
  await expect(selectedStatus).toHaveValue('');

  await inquiryButton.click();
  await expect(selectedDate).not.toHaveValue('');
  await expect(selectedStatus).toHaveValue(inquiryStatus || '');
  await expect(inquiryPanel).toBeVisible();

  await page.getByRole('button', { name: /Generate Booking Request/i }).click();
  await expect(page.locator('[data-form-alert]')).toBeVisible();
  await expect(page.locator('[data-form-alert]')).toContainText(/Please fix/i);

  await page.locator('#artistName').fill('The Test Signals');
  await page.locator('#contactName').fill('Jordan Test');
  await page.locator('#email').fill('booking@example.com');
  await page.locator('#hometown').fill('Evansville, IN');
  await page.locator('#genre').selectOption({ label: 'Indie / Alternative' });
  await page.locator('#styleNotes').fill('Melodic indie rock with garage pop hooks.');
  await page.locator('#members').selectOption({ label: '4-piece' });
  await page.locator('#setLength').selectOption({ label: '45 minutes' });
  await page.locator('#musicLinks').fill('https://example.com/music');
  await page.locator('#epkStatus').selectOption({ label: 'I have an EPK / press kit link' });
  await page.locator('#epk').fill('https://example.com/epk');
  await page.locator('#preferredDates').fill(`Autofilled inquiry date: ${inquiryDate}`);
  await page.locator('#expectedDraw').selectOption({ label: '50–75' });
  await page.locator('#drawNotes').fill('Stronger draw with local support.');

  await page.getByRole('button', { name: /Generate Booking Request/i }).click();

  const output = page.locator('[data-booking-output]');
  const summary = page.locator('[data-booking-summary]');
  await expect(output).toBeVisible();
  await expect(summary).toHaveValue(/The Test Signals/);
  await expect(summary).toHaveValue(/Selected Date:/);
  await expect(summary).toHaveValue(new RegExp(`Availability Status: ${inquiryStatus}`));
  await expect(summary).toHaveValue(/Genre \/ Style: Indie \/ Alternative/);
  await expect(summary).toHaveValue(/Style Notes: Melodic indie rock with garage pop hooks\./);
  await expect(summary).toHaveValue(/Members: 4-piece/);
  await expect(summary).toHaveValue(/Set Length: 45 minutes/);
  await expect(summary).toHaveValue(/Music Links: https:\/\/example\.com\/music/);
  await expect(summary).toHaveValue(/EPK Status: I have an EPK \/ press kit link/);
  await expect(summary).toHaveValue(/EPK Link: https:\/\/example\.com\/epk/);
  await expect(summary).toHaveValue(/Expected Draw: 50–75/);
  await expect(summary).toHaveValue(/Draw Notes: Stronger draw with local support\./);
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

test('booking validation shows accessible field errors and clears them on edit', async ({ page }) => {
  const consoleErrors = installConsoleErrorGuard(page);
  await page.goto('/RayLeos/booking/');

  const email = page.locator('#email');
  const phone = page.locator('#phone');
  const website = page.locator('#website');
  const musicLinks = page.locator('#musicLinks');
  const epk = page.locator('#epk');
  const alert = page.locator('[data-form-alert]');

  await expect(page.locator('#artistName-error')).toHaveCount(1);
  await expect(email).toHaveAttribute('aria-describedby', /email-hint/);
  await expect(email).toHaveAttribute('aria-describedby', /email-error/);
  await expect(page.locator('[data-open-email]')).toHaveAttribute('href', '#');

  await page.getByRole('button', { name: /Generate Booking Request/i }).click();
  await expect(alert).toBeVisible();
  await expect(alert).toContainText(/Please fix these fields/i);
  await expect(alert).toContainText(/Artist\/Band name/i);
  await expect(page.locator('#artistName')).toHaveAttribute('aria-invalid', 'true');
  await expect(page.locator('#artistName-error')).toBeVisible();
  await expect(page.locator('#artistName-error')).toContainText(/Enter the artist or band name so we know who the request is for/i);
  await expect(page.locator('#contactName-error')).toContainText(/Enter a contact name so we know who to follow up with/i);
  await expect(page.locator('#hometown-error')).toContainText(/Enter the city, region, or market you’re based in/i);
  await expect(page.locator('#genre-error')).toContainText(/Choose the main style that best fits the act/i);
  await expect(page.locator('#musicLinks-error')).toContainText(/Add at least one full link to music, video, or a social page, including https:\/\//i);
  await expect(page.locator('#epkStatus-error')).toContainText(/Choose the option that best describes your EPK or press kit/i);
  await expect(page.locator('#preferredDates-error')).toContainText(/Tell us what date, dates, or routing window you’re asking about/i);
  await expect(page.locator('#expectedDraw-error')).toContainText(/Choose the closest expected draw range/i);
  await expect(page.locator('#hometown-error')).not.toContainText(/who to contact/i);
  await expect(page.locator('#genre-error')).not.toContainText(/who to contact/i);
  await expect(page.locator('#preferredDates-error')).not.toContainText(/who to contact/i);
  await expect(page.locator('#artistName')).toBeFocused();

  await page.locator('#artistName').fill('The Validation Tests');
  await page.locator('#contactName').fill('Casey Check');
  await email.fill('not-an-email');
  await phone.fill('812-401');
  await page.locator('#hometown').fill('Evansville, IN');
  await page.locator('#genre').selectOption({ label: 'Punk / Hardcore' });
  await page.locator('#styleNotes').fill('Fast punk with noisy garage rock edges.');
  await page.locator('#members').selectOption({ label: '4-piece' });
  await page.locator('#setLength').selectOption({ label: '30 minutes' });
  await website.fill('example.com');
  await musicLinks.fill('not a link');
  await page.locator('#epkStatus').selectOption({ label: 'I have an EPK / press kit link' });
  await epk.fill('ftp://example.com/epk');
  await page.locator('#preferredDates').fill('Next available Friday');
  await page.locator('#expectedDraw').selectOption({ label: 'Depends on bill/support' });
  await page.locator('#drawNotes').fill('Newer act locally, but can help promote with the right bill.');

  await page.getByRole('button', { name: /Generate Booking Request/i }).click();
  await expect(email).toHaveAttribute('aria-invalid', 'true');
  await expect(page.locator('#email-error')).toContainText(/Enter a valid email address, like booking@example.com/i);
  await expect(phone).toHaveAttribute('aria-invalid', 'true');
  await expect(page.locator('#phone-error')).toContainText(/Enter a phone number with at least 10 digits/i);
  await expect(website).toHaveAttribute('aria-invalid', 'true');
  await expect(page.locator('#website-error')).toContainText(/Enter a full website link, including https:\/\//i);
  await expect(musicLinks).toHaveAttribute('aria-invalid', 'true');
  await expect(page.locator('#musicLinks-error')).toContainText(/Add at least one full link to music, video, or a social page, including https:\/\//i);
  await expect(epk).toHaveAttribute('aria-invalid', 'true');
  await expect(page.locator('#epk-error')).toContainText(/Add your EPK link, including https:\/\//i);

  await email.fill('booking@example.com');
  await expect(email).not.toHaveAttribute('aria-invalid', 'true');
  await expect(page.locator('#email-error')).toBeHidden();
  await phone.fill('+1 812 401 1126');
  await website.fill('https://example.com');
  await musicLinks.fill('https://example.com/music');
  await epk.fill('https://example.com/epk');

  await page.getByRole('button', { name: /Generate Booking Request/i }).click();
  await expect(page.locator('[data-booking-output]')).toBeVisible();
  await expect(page.locator('[data-booking-summary]')).toHaveValue(/The Validation Tests/);
  await expect(page.locator('[data-booking-summary]')).toHaveValue(/EPK Status: I have an EPK \/ press kit link/);
  await expect(page.locator('[data-booking-summary]')).toHaveValue(/Expected Draw: Depends on bill\/support/);
  await expect(page.locator('[data-open-email]')).toHaveAttribute('href', /^mailto:/);
  expect(consoleErrors).toEqual([]);
});

test('booking form allows honest local-band EPK status without an EPK link', async ({ page }) => {
  const consoleErrors = installConsoleErrorGuard(page);
  await page.goto('/RayLeos/booking/');

  await page.locator('#artistName').fill('The No EPK Locals');
  await page.locator('#contactName').fill('Taylor Local');
  await page.locator('#email').fill('local@example.com');
  await page.locator('#hometown').fill('Evansville, IN');
  await page.locator('#genre').selectOption({ label: 'Other / describe below' });
  await page.locator('#styleNotes').fill('Original local rock with punk and country edges.');
  await page.locator('#musicLinks').fill('https://example.com/no-epk-locals/music');
  await page.locator('#epkStatus').selectOption({ label: 'I don’t have a full EPK yet' });
  await expect(page.locator('[data-epk-status-note]')).toBeVisible();
  await page.locator('#preferredDates').fill('Any Friday in June.');
  await page.locator('#expectedDraw').selectOption({ label: 'Not sure' });
  await page.locator('#drawNotes').fill('First time playing this room; will promote locally.');

  await page.getByRole('button', { name: /Generate Booking Request/i }).click();

  const summary = page.locator('[data-booking-summary]');
  await expect(page.locator('[data-booking-output]')).toBeVisible();
  await expect(summary).toHaveValue(/The No EPK Locals/);
  await expect(summary).toHaveValue(/EPK Status: I don’t have a full EPK yet/);
  await expect(summary).not.toHaveValue(/EPK Link:/);
  await expect(summary).toHaveValue(/Expected Draw: Not sure/);
  expect(consoleErrors).toEqual([]);
});

test('mobile manual scroll shows booking form fields without inquiry click', async ({ page }) => {
  const consoleErrors = installConsoleErrorGuard(page);
  await page.setViewportSize({ width: 412, height: 915 });

  await page.goto('/RayLeos/booking/#booking-form');

  const form = page.locator('[data-booking-form]');
  const artistName = page.locator('#artistName');
  const requestType = page.locator('#requestType');

  await expect(form).toBeVisible();
  await expect(requestType).toBeVisible();
  await expect(artistName).toBeVisible();
  await expect(artistName).toBeEditable();

  await artistName.fill('Manual Scroll Test');
  await expect(artistName).toHaveValue('Manual Scroll Test');
  expect(consoleErrors).toEqual([]);
});
