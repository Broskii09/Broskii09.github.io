const { test, expect } = require("@playwright/test");
const {
  addPerformerFromFirstOpenSlot,
  expectActionButtonsFit,
  expectOpenSlotActionsFit,
  openViewerPage,
  startNextPerformer,
  watchPageErrors,
} = require("./omjn-test-helpers");

async function expectNoPageHorizontalOverflow(page){
  const metrics = await page.evaluate(() => ({
    innerWidth: window.innerWidth,
    docScrollWidth: document.documentElement.scrollWidth,
    bodyScrollWidth: document.body.scrollWidth,
  }));
  expect(metrics.docScrollWidth).toBeLessThanOrEqual(metrics.innerWidth);
  expect(metrics.bodyScrollWidth).toBeLessThanOrEqual(metrics.innerWidth);
}

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
    await expect(performerRow.locator(".qMetaChip")).toContainText(["Notes"]);
    await page.setViewportSize({ width: 390, height: 720 });
    await expectActionButtonsFit(page.locator(".queueItem").filter({ hasText: "Alex Test" }));
    expect(pageErrors).toEqual([]);
  });

  test("queue rows stay readable across requested operator viewports without horizontal overflow", async ({ page }) => {
    const pageErrors = [];
    watchPageErrors(page, pageErrors);

    await page.goto("operator.html");
    await addPerformerFromFirstOpenSlot(page, "Viewport Queue Test", "Compact row sanity");

    const viewports = [
      { width: 1920, height: 1080 },
      { width: 1536, height: 322 },
      { width: 1536, height: 500 },
      { width: 1440, height: 600 },
      { width: 1280, height: 720 },
      { width: 1024, height: 768 },
      { width: 768, height: 1024 },
      { width: 430, height: 844 },
      { width: 390, height: 844 },
    ];

    for(const viewport of viewports){
      await page.setViewportSize(viewport);
      const performerRow = page.locator(".queueItem").filter({ hasText: "Viewport Queue Test" }).first();
      const blankRow = page.locator(".paperSlotEmpty").first();

      await performerRow.scrollIntoViewIfNeeded();
      await expect(performerRow).toBeVisible();
      await blankRow.scrollIntoViewIfNeeded();
      await expect(blankRow).toBeVisible();
      await expectNoPageHorizontalOverflow(page);
      await expectActionButtonsFit(performerRow);
      await expectOpenSlotActionsFit(blankRow);
      await expect(performerRow.locator(".dragHandle")).toBeVisible();
      await expect(blankRow.locator(".dragHandle")).toBeVisible();
      await expect(performerRow.locator(".qMoveColumn")).toBeVisible();
      await expect(blankRow.locator(".qMoveColumn")).toBeVisible();
      await page.locator("#btnStart").scrollIntoViewIfNeeded();
      await expect(page.locator("#btnStart")).toBeVisible();
    }
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
