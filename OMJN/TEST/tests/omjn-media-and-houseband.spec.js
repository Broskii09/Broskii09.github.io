const { test, expect } = require("@playwright/test");
const {
  addHouseBandMember,
  addHouseBandSetAfterFirstOpenSlot,
  addVideoAdAfterFirstOpenSlot,
  endCurrentToSplash,
  openViewerPage,
  startNextPerformer,
  watchPageErrors,
} = require("./omjn-test-helpers");

test.describe("OMJN TEST media and house band", () => {
  test("video ad ends cleanly back to splash", async ({ page, context }) => {
    const pageErrors = [];
    watchPageErrors(page, pageErrors);

    await page.goto("operator.html");
    const viewer = await openViewerPage(context, pageErrors);

    await addVideoAdAfterFirstOpenSlot(page, "Smoke Video Ad");
    await startNextPerformer(page);

    await expect(page.locator("#statusBanner")).toContainText("Phase: LIVE");
    await expect(viewer.locator("#root")).toHaveClass(/isAd/, { timeout: 10000 });
    await expect(viewer.locator("#adLayer")).toBeVisible();
    await expect(viewer.locator("#adVideo")).toHaveAttribute("src", /data:video\/mp4/);

    await viewer.locator("#adVideo").dispatchEvent("ended");

    await expect(page.locator("#statusBanner")).toContainText("Phase: SPLASH", { timeout: 10000 });
    await expect(viewer.locator("#root")).toHaveClass(/isSplash/, { timeout: 10000 });
    await expect(viewer.locator("#adLayer")).toBeHidden();
    expect(pageErrors).toEqual([]);
  });

  test("house band slot can be started and ended", async ({ page, context }) => {
    const pageErrors = [];
    watchPageErrors(page, pageErrors);

    await page.goto("operator.html");
    await addHouseBandMember(page, "Smoke Guitarist", "guitar");
    await addHouseBandSetAfterFirstOpenSlot(page, "Smoke Guitarist");

    const viewer = await openViewerPage(context, pageErrors);
    await startNextPerformer(page);

    await expect(page.locator("#statusBanner")).toContainText("Phase: LIVE");
    await expect(page.locator('.queueItem[data-slot-type="houseband"]')).toContainText("LIVE");
    await expect(viewer.locator("#nowLabel")).toHaveText("HOUSE BAND", { timeout: 10000 });
    await expect(viewer.locator("#nowName")).toContainText("Smoke Guitarist");
    await expect(viewer.locator("#hbInstruments")).toContainText("Guitar");

    await endCurrentToSplash(page);

    await expect(viewer.locator("#root")).toHaveClass(/isSplash/, { timeout: 10000 });
    const completedSummary = page.locator("summary.queueDivider").filter({ hasText: "Completed / No Show" });
    await expect(completedSummary).toBeVisible();
    expect(pageErrors).toEqual([]);
  });
});
