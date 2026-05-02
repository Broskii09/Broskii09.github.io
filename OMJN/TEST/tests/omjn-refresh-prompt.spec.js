const { test, expect } = require("@playwright/test");
const {
  openOperatorAdvancedSettings,
  openSoundboardSettings,
  openViewerPage,
  watchPageErrors,
} = require("./omjn-test-helpers");

test.describe("OMJN TEST refresh prompt", () => {
  test("force check and reset dismissal reliably surface the refresh prompt", async ({ page }) => {
    const pageErrors = [];
    watchPageErrors(page, pageErrors);

    let version = "2026-04-21T22:18:21-05:00";
    await page.route("**/site-version.json*", async (route) => {
      await route.fulfill({
        contentType: "application/json",
        body: JSON.stringify({
          version,
          updatedAt: version,
          environment: "test",
        }),
      });
    });

    await page.goto("operator.html");
    await expect.poll(async () => page.evaluate(() => OMJN.getSiteUpdateStatus().currentVersion)).not.toBe("");

    await page.evaluate((dismissVersion) => {
      localStorage.setItem(OMJN.scopedKey("siteUpdate.dismissedVersion"), dismissVersion);
    }, "2026-04-29T21:45:00-05:00");

    version = "2026-04-29T21:45:00-05:00";

    await openOperatorAdvancedSettings(page);
    await expect(page.locator("#btnSiteUpdateCheckNow")).toBeVisible();
    await page.locator("#btnSiteUpdateCheckNow").click();

    await expect.poll(async () => page.evaluate(() => OMJN.getSiteUpdateStatus().latestVersion)).toBe(version);
    await expect(page.locator(".omjnRefreshPrompt")).toBeHidden();
    await expect(page.locator("#siteUpdateStatus")).toContainText("Dismissed:");

    await page.locator("#btnSiteUpdateResetDismissal").click();

    await expect(page.locator(".omjnRefreshPrompt.isVisible")).toBeVisible();
    await expect(page.locator(".omjnRefreshPrompt")).toContainText("Refresh available");
    await expect(page.locator("#siteUpdateStatus")).toContainText("Update ready:");
    expect(pageErrors).toEqual([]);
  });

  test("operator can prompt open OMJN TEST tabs to refresh and soundboard exposes controls", async ({ page, context }) => {
    const pageErrors = [];
    watchPageErrors(page, pageErrors);

    await page.goto("operator.html");
    const viewer = await openViewerPage(context, pageErrors);
    const soundboard = await context.newPage();
    watchPageErrors(soundboard, pageErrors);
    await soundboard.goto("soundboard.html");

    await openOperatorAdvancedSettings(page);
    await openSoundboardSettings(soundboard);
    await expect(soundboard.locator("#sbSiteUpdateCheckNow")).toBeVisible();
    await expect(soundboard.locator("#sbSiteUpdateResetDismissal")).toBeVisible();
    await expect(soundboard.locator("#sbSiteUpdatePromptTabs")).toBeVisible();

    await page.locator("#btnSiteUpdatePromptTabs").click();

    await expect(page.locator(".omjnRefreshPrompt.isVisible")).toBeVisible();
    await expect(viewer.locator(".omjnRefreshPrompt.isVisible")).toBeVisible();
    await expect(soundboard.locator(".omjnRefreshPrompt.isVisible")).toBeVisible();
    await expect(viewer.locator(".omjnRefreshPrompt")).toContainText("Refresh suggested");
    await expect(soundboard.locator(".omjnRefreshPrompt")).toContainText("Operator");
    expect(pageErrors).toEqual([]);
  });

  test("refresh prompt stacks cleanly with the operator last-call prompt", async ({ page }) => {
    const pageErrors = [];
    watchPageErrors(page, pageErrors);

    await page.goto("operator.html");
    await openOperatorAdvancedSettings(page);

    await page.locator("#btnLastCallShowNow").click();
    await expect(page.locator("#lastCallPrompt.isVisible")).toBeVisible();

    await page.locator("#btnSiteUpdatePromptTabs").click();
    await expect(page.locator(".omjnRefreshPrompt.isVisible")).toBeVisible();

    const layout = await page.evaluate(() => {
      const refresh = document.querySelector(".omjnRefreshPrompt.isVisible");
      const lastCall = document.querySelector("#lastCallPrompt.isVisible");
      if(!refresh || !lastCall) return null;
      const refreshRect = refresh.getBoundingClientRect();
      const lastCallRect = lastCall.getBoundingClientRect();
      return {
        refreshTop: refreshRect.top,
        refreshBottom: refreshRect.bottom,
        lastCallTop: lastCallRect.top,
        lastCallBottom: lastCallRect.bottom,
      };
    });

    expect(layout).not.toBeNull();
    expect(layout.refreshBottom).toBeLessThanOrEqual(layout.lastCallTop);
    expect(pageErrors).toEqual([]);
  });
});
