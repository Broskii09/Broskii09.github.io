const { test, expect } = require("@playwright/test");
const {
  addGraphicAdAfterFirstOpenSlot,
  addIntermissionAfterFirstOpenSlot,
  endCurrentToSplash,
  openViewerPage,
  startNextPerformer,
  watchPageErrors,
} = require("./omjn-test-helpers");

test.describe("OMJN TEST special slots", () => {
  test("intermission can be added and started", async ({ page, context }) => {
    const pageErrors = [];
    watchPageErrors(page, pageErrors);

    await page.goto("operator.html");
    const viewer = await openViewerPage(context, pageErrors);

    await addIntermissionAfterFirstOpenSlot(page, "SMOKE BREAK", "SMOKE TEST INTERMISSION");

    await startNextPerformer(page);
    await expect(viewer.locator("#nowLabel")).toHaveText("INTERMISSION", { timeout: 10000 });
    await expect(viewer.locator("#nowName")).toContainText("SMOKE TEST INTERMISSION");
    expect(pageErrors).toEqual([]);
  });

  test("intermission ends cleanly back to splash", async ({ page, context }) => {
    const pageErrors = [];
    watchPageErrors(page, pageErrors);

    await page.goto("operator.html");
    const viewer = await openViewerPage(context, pageErrors);

    await addIntermissionAfterFirstOpenSlot(page, "END BREAK", "ENDING INTERMISSION");
    await startNextPerformer(page);
    await expect(viewer.locator("#nowLabel")).toHaveText("INTERMISSION", { timeout: 10000 });
    await expect(viewer.locator("#nowName")).toContainText("ENDING INTERMISSION");

    await endCurrentToSplash(page);

    await expect(viewer.locator("#root")).toHaveClass(/isSplash/, { timeout: 10000 });
    await expect(viewer.locator("#splashInfo")).toHaveAttribute("aria-hidden", "false");
    await expect(viewer.locator("#overlay")).toHaveAttribute("aria-hidden", "true");
    const completedSummary = page.locator("summary.queueDivider").filter({ hasText: "Completed / No Show" });
    await expect(completedSummary).toBeVisible();
    expect(pageErrors).toEqual([]);
  });

  test("ad slot can be started without breaking operator or viewer state", async ({ page, context }) => {
    const pageErrors = [];
    watchPageErrors(page, pageErrors);

    await page.goto("operator.html");
    const viewer = await openViewerPage(context, pageErrors);

    await addGraphicAdAfterFirstOpenSlot(page, "Smoke Graphic Ad");
    await startNextPerformer(page);

    await expect(page.locator("#statusBanner")).toContainText("Phase: LIVE");
    await expect(page.locator(".queueItem").filter({ hasText: "Smoke Graphic Ad" })).toBeVisible();
    await expect(viewer.locator("#root")).toHaveClass(/isLive/, { timeout: 10000 });
    await expect(viewer.locator("#root")).toHaveClass(/isAd/);
    await expect(viewer.locator("#adLayer")).toBeVisible();
    await expect(viewer.locator("#adImg")).toHaveAttribute("src", /data:image\/svg\+xml/);
    expect(pageErrors).toEqual([]);
  });
});
