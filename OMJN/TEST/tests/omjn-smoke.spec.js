const { test, expect } = require("@playwright/test");
const {
  addPerformerFromFirstOpenSlot,
  expectActionButtonsFit,
  expectOpenSlotActionsFit,
  openViewerPage,
  startNextPerformer,
  watchPageErrors,
} = require("./omjn-test-helpers");

test.describe("OMJN TEST smoke", () => {
  test("operator page loads", async ({ page }) => {
    const pageErrors = [];
    watchPageErrors(page, pageErrors);

    await page.goto("operator.html");

    await expect(page.locator("body.operatorPage")).toBeVisible();
    await expect(page.locator("#btnStart")).toBeVisible();
    await expect(page.locator("#queue")).toBeVisible();
    await expect(page.locator(".paperSlotEmpty")).toHaveCount(30);
    await expect(page.locator("#btnAddPaperSlots")).toBeVisible();

    await expectOpenSlotActionsFit(page.locator(".paperSlotEmpty").first());
    await page.setViewportSize({ width: 390, height: 720 });
    await expectOpenSlotActionsFit(page.locator(".paperSlotEmpty").first());
    expect(pageErrors).toEqual([]);
  });

  test("add performer in operator", async ({ page }) => {
    const pageErrors = [];
    watchPageErrors(page, pageErrors);

    await page.goto("operator.html");

    const performerRow = await addPerformerFromFirstOpenSlot(
      page,
      "Alex Test",
      "Walkup song\nhttps://open.spotify.com/track/1234567890abcdef"
    );

    await expect(page.locator(".paperSlotEmpty")).toHaveCount(29);
    await expectActionButtonsFit(performerRow);
    await expect(performerRow.locator(".qActionUp")).toHaveCount(1);
    await expect(performerRow.locator(".qActionDown")).toHaveCount(1);
    await page.setViewportSize({ width: 390, height: 720 });
    await expectActionButtonsFit(page.locator(".queueItem").filter({ hasText: "Alex Test" }));
    await expect(page.getByRole("link", { name: "Spotify App" })).toBeVisible();
    expect(pageErrors).toEqual([]);
  });

  test("operator syncs live performer to viewer", async ({ page, context }) => {
    const pageErrors = [];
    watchPageErrors(page, pageErrors);

    await page.goto("operator.html");
    await addPerformerFromFirstOpenSlot(page, "Live Sync Test");

    const viewer = await openViewerPage(context, pageErrors);

    await expect(viewer.locator("#sNext")).toContainText("Live Sync Test");
    await startNextPerformer(page);

    await expect(viewer.locator("#nowName")).toContainText("Live Sync Test", { timeout: 10000 });
    await expect(viewer.locator("#nowLabel")).toContainText("NOW PERFORMING");
    expect(pageErrors).toEqual([]);
  });

  test("end current performer returns viewer to splash", async ({ page, context }) => {
    const pageErrors = [];
    watchPageErrors(page, pageErrors);

    await page.goto("operator.html");
    await addPerformerFromFirstOpenSlot(page, "End Splash Test");

    const viewer = await openViewerPage(context, pageErrors);
    await expect(viewer.locator("#sNext")).toContainText("End Splash Test");
    await startNextPerformer(page);

    await expect(viewer.locator("#root")).toHaveClass(/isLive/);
    await expect(viewer.locator("#nowName")).toContainText("End Splash Test", { timeout: 10000 });

    page.once("dialog", dialog => dialog.accept());
    await page.locator("#btnEnd").click();

    await expect(page.locator("#statusBanner")).toContainText("Phase: SPLASH");
    await expect(viewer.locator("#root")).toHaveClass(/isSplash/, { timeout: 10000 });
    await expect(viewer.locator("#splashInfo")).toHaveAttribute("aria-hidden", "false");
    await expect(viewer.locator("#overlay")).toHaveAttribute("aria-hidden", "true");
    expect(pageErrors).toEqual([]);
  });

  test("pause and resume updates operator and viewer", async ({ page, context }) => {
    const pageErrors = [];
    watchPageErrors(page, pageErrors);

    await page.goto("operator.html");
    await addPerformerFromFirstOpenSlot(page, "Pause Resume Test");

    const viewer = await openViewerPage(context, pageErrors);
    await startNextPerformer(page);
    await expect(viewer.locator("#nowName")).toContainText("Pause Resume Test", { timeout: 10000 });

    await expect(page.locator("#btnPauseResume")).toBeEnabled();
    await page.locator("#btnPauseResume").click();
    await expect(page.locator("#statusBanner")).toContainText("Phase: PAUSED");
    await expect(page.locator("#btnPauseResumeLabel")).toHaveText("Resume");
    await expect(page.locator("#btnPauseResume")).toHaveAttribute("aria-pressed", "true");
    await expect(viewer.locator("#root")).toHaveClass(/isLive/);
    await expect(viewer.locator("#nowName")).toContainText("Pause Resume Test");

    await page.locator("#btnPauseResume").click();
    await expect(page.locator("#statusBanner")).toContainText("Phase: LIVE");
    await expect(page.locator("#btnPauseResumeLabel")).toHaveText("Pause");
    await expect(page.locator("#btnPauseResume")).toHaveAttribute("aria-pressed", "false");
    await expect(viewer.locator("#root")).toHaveClass(/isLive/);
    await expect(viewer.locator("#nowName")).toContainText("Pause Resume Test");
    expect(pageErrors).toEqual([]);
  });

  test("soundboard page loads", async ({ page }) => {
    const pageErrors = [];
    watchPageErrors(page, pageErrors);

    await page.goto("soundboard.html");

    await expect(page.locator("body.soundboardPage")).toBeVisible();
    await expect(page.locator("#sbStart")).toBeVisible();
    await expect(page.locator("#sbPads")).toBeAttached();
    expect(pageErrors).toEqual([]);
  });
});
