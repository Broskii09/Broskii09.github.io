const { test, expect } = require("@playwright/test");
const {
  addGraphicAdAfterFirstOpenSlot,
  addHouseBandMember,
  addHouseBandSetAfterFirstOpenSlot,
  addIntermissionAfterFirstOpenSlot,
  addPerformerFromFirstOpenSlot,
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

  test("special slots can be moved to a different open slot position", async ({ page }) => {
    const pageErrors = [];
    watchPageErrors(page, pageErrors);

    await page.goto("operator.html");

    const intermissionRow = await addIntermissionAfterFirstOpenSlot(page, "MOVE BREAK", "MOVE TEST INTERMISSION");
    await intermissionRow.locator(".qActionDown").click();
    await expect(page.locator(".queueItem").filter({ hasText: "MOVE BREAK" })).toContainText("After #2");

    const adRow = await addGraphicAdAfterFirstOpenSlot(page, "Move Graphic Ad");
    await adRow.locator(".qActionDown").click();
    await expect(page.locator(".queueItem").filter({ hasText: "Move Graphic Ad" })).toContainText("After #2");

    await addHouseBandMember(page, "Move Guitarist", "guitar");
    const houseBandRow = await addHouseBandSetAfterFirstOpenSlot(page, "Move Guitarist");
    await houseBandRow.locator(".qActionDown").click();
    await expect(page.locator('.queueItem[data-slot-type="houseband"]').filter({ hasText: "Move Guitarist" })).toContainText("After #2");
    expect(pageErrors).toEqual([]);
  });

  test("special slots can still be drag-dropped within the active queue", async ({ page }) => {
    const pageErrors = [];
    watchPageErrors(page, pageErrors);

    await page.goto("operator.html");

    const intermissionRow = await addIntermissionAfterFirstOpenSlot(page, "DRAG BREAK", "DRAG TEST INTERMISSION");
    const adRow = await addGraphicAdAfterFirstOpenSlot(page, "Drag Graphic Ad");

    await adRow.dragTo(intermissionRow);

    const activeRows = page.locator("#queue > .queueItem");
    await expect(activeRows.nth(1)).toContainText("Drag Graphic Ad");
    await expect(activeRows.nth(2)).toContainText("DRAG BREAK");
    expect(pageErrors).toEqual([]);
  });

  test("deleting a blank slot keeps a following special in the same visual queue position", async ({ page }) => {
    const pageErrors = [];
    watchPageErrors(page, pageErrors);

    await page.goto("operator.html");
    await addPerformerFromFirstOpenSlot(page, "Anchor One");
    const secondPerformer = await addPerformerFromFirstOpenSlot(page, "Anchor Two");

    page.once("dialog", dialog => dialog.accept("3"));
    await secondPerformer.getByRole("button", { name: "Move #" }).click();

    const intermissionRow = await addIntermissionAfterFirstOpenSlot(page, "Anchor Break", "ANCHOR TEST INTERMISSION");
    await expect(intermissionRow).toContainText("After #2");

    let confirmMessage = "";
    page.once("dialog", dialog => {
      confirmMessage = dialog.message();
      dialog.accept();
    });
    await page.locator('.paperSlotEmpty[data-paper-slot="2"]').getByRole("button", { name: "Delete Blank" }).click();

    expect(confirmMessage).toContain("Delete blank Open Slot #2");
    const activeRows = page.locator("#queue > .queueItem");
    await expect(activeRows.nth(0)).toContainText("#1");
    await expect(activeRows.nth(0)).toContainText("Anchor One");
    await expect(activeRows.nth(1)).toContainText("ANCHOR BREAK");
    await expect(activeRows.nth(1)).toContainText("After #1");
    await expect(activeRows.nth(2)).toContainText("#2");
    await expect(activeRows.nth(2)).toContainText("Anchor Two");
    expect(pageErrors).toEqual([]);
  });

  test("edited ad can be sent live from the ad modal", async ({ page, context }) => {
    const pageErrors = [];
    watchPageErrors(page, pageErrors);

    await page.goto("operator.html");
    const viewer = await openViewerPage(context, pageErrors);

    const adRow = await addGraphicAdAfterFirstOpenSlot(page, "Queued Edit Ad");
    await adRow.getByRole("button", { name: "Edit" }).click();
    await expect(page.locator("#adModal")).toBeVisible();
    await expect(page.locator("#btnAdLive")).toHaveText("Go Live");

    await page.locator("#adLabel").fill("Edited Live Ad");
    await page.locator("#btnAdLive").click();

    await expect(page.locator("#adModal")).toBeHidden();
    await expect(page.locator("#statusBanner")).toContainText("Phase: LIVE");
    await expect(page.locator(".queueItem").filter({ hasText: "Edited Live Ad" })).toContainText("LIVE");
    await expect(viewer.locator("#root")).toHaveClass(/isAd/, { timeout: 10000 });
    await expect(viewer.locator("#adLayer")).toBeVisible();
    await expect(viewer.locator("#adImg")).toHaveAttribute("src", /data:image\/svg\+xml/);
    expect(pageErrors).toEqual([]);
  });
});
