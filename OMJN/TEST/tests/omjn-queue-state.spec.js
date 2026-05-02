const { test, expect } = require("@playwright/test");
const {
  addPerformerFromFirstOpenSlot,
  clearOperatorTestNow,
  openViewerPage,
  seedCurrentTimerState,
  setOperatorTestNow,
  startNextPerformer,
  watchPageErrors,
} = require("./omjn-test-helpers");

async function readMoveColumnMetrics(row){
  return row.evaluate((node) => {
    const actions = node.querySelector(".qActions");
    const grid = node.querySelector(".qActionGrid");
    const move = node.querySelector(".qMoveColumn");
    const up = node.querySelector(".qActionUp");
    const down = node.querySelector(".qActionDown");
    const danger = node.querySelector(".qDangerColumn");
    if(!actions || !grid || !move || !up || !down){
      return null;
    }
    const actionsRect = actions.getBoundingClientRect();
    const gridRect = grid.getBoundingClientRect();
    const moveRect = move.getBoundingClientRect();
    const upRect = up.getBoundingClientRect();
    const downRect = down.getBoundingClientRect();
    const dangerRect = danger ? danger.getBoundingClientRect() : null;
    return {
      actionsRight: actionsRect.right,
      gridRight: gridRect.right,
      moveLeft: moveRect.left,
      moveRight: moveRect.right,
      moveHeight: moveRect.height,
      upHeight: upRect.height,
      downHeight: downRect.height,
      upTop: upRect.top,
      downTop: downRect.top,
      dangerLeft: dangerRect ? dangerRect.left : null,
      dangerRight: dangerRect ? dangerRect.right : null,
    };
  });
}

test.describe("OMJN TEST queue state", () => {
  test("moving a performer into a blank slot swaps with that blank instead of shifting the whole queue", async ({ page }) => {
    const pageErrors = [];
    watchPageErrors(page, pageErrors);

    await page.goto("operator.html");
    const firstPerformer = await addPerformerFromFirstOpenSlot(page, "Swap One");
    await addPerformerFromFirstOpenSlot(page, "Swap Two");

    page.once("dialog", dialog => dialog.accept("3"));
    await firstPerformer.getByRole("button", { name: "Move #" }).click();

    const activeRowsBeforeSwap = page.locator("#queue > .queueItem");
    await expect(activeRowsBeforeSwap.nth(0)).toContainText("#1");
    await expect(activeRowsBeforeSwap.nth(0)).toContainText("Open Slot");
    await expect(activeRowsBeforeSwap.nth(1)).toContainText("#2");
    await expect(activeRowsBeforeSwap.nth(1)).toContainText("Swap Two");
    await expect(activeRowsBeforeSwap.nth(2)).toContainText("#3");
    await expect(activeRowsBeforeSwap.nth(2)).toContainText("Swap One");

    page.once("dialog", dialog => dialog.accept("1"));
    await page.locator('.queueItem[data-paper-slot="2"]').filter({ hasText: "Swap Two" }).getByRole("button", { name: "Move #" }).click();

    const activeRowsAfterSwap = page.locator("#queue > .queueItem");
    await expect(activeRowsAfterSwap.nth(0)).toContainText("#1");
    await expect(activeRowsAfterSwap.nth(0)).toContainText("Swap Two");
    await expect(activeRowsAfterSwap.nth(1)).toContainText("#2");
    await expect(activeRowsAfterSwap.nth(1)).toContainText("Open Slot");
    await expect(activeRowsAfterSwap.nth(2)).toContainText("#3");
    await expect(activeRowsAfterSwap.nth(2)).toContainText("Swap One");
    expect(pageErrors).toEqual([]);
  });

  test("blank slots can be deleted with confirmation and later active slots renumber immediately", async ({ page }) => {
    const pageErrors = [];
    watchPageErrors(page, pageErrors);

    await page.goto("operator.html");
    const firstPerformer = await addPerformerFromFirstOpenSlot(page, "Delete Shift A");
    await addPerformerFromFirstOpenSlot(page, "Delete Shift B");

    page.once("dialog", dialog => dialog.accept("4"));
    await firstPerformer.getByRole("button", { name: "Move #" }).click();

    const blankRow = page.locator('.paperSlotEmpty[data-paper-slot="3"]');
    let confirmMessage = "";
    page.once("dialog", dialog => {
      confirmMessage = dialog.message();
      dialog.accept();
    });
    await blankRow.getByRole("button", { name: "Delete Blank" }).click();

    expect(confirmMessage).toContain("Delete blank Open Slot #3");
    const activeRows = page.locator("#queue > .queueItem");
    await expect(activeRows.nth(0)).toContainText("#1");
    await expect(activeRows.nth(0)).toContainText("Open Slot");
    await expect(activeRows.nth(1)).toContainText("#2");
    await expect(activeRows.nth(1)).toContainText("Delete Shift B");
    await expect(activeRows.nth(2)).toContainText("#3");
    await expect(activeRows.nth(2)).toContainText("Delete Shift A");
    expect(pageErrors).toEqual([]);
  });

  test("delete all blank slots preserves special visual order and adds five fresh blanks at the bottom", async ({ page }) => {
    const pageErrors = [];
    watchPageErrors(page, pageErrors);

    await page.goto("operator.html");
    await addPerformerFromFirstOpenSlot(page, "Delete All Anchor");
    const secondPerformer = await addPerformerFromFirstOpenSlot(page, "Delete All Tail");

    page.once("dialog", dialog => dialog.accept("4"));
    await secondPerformer.getByRole("button", { name: "Move #" }).click();

    await page.locator('.paperSlotEmpty[data-paper-slot="3"]').getByRole("button", { name: "Intermission After" }).click();
    await expect(page.locator("#intermissionModal")).toBeVisible();
    await page.locator("#imName").fill("Delete All Break");
    await page.locator("#imMsg").fill("DELETE ALL BLANKS");
    await page.locator("#imDur5").click();
    await page.locator("#btnImAdd").click();
    await expect(page.locator("#intermissionModal")).toBeHidden();

    let confirmMessage = "";
    page.once("dialog", dialog => {
      confirmMessage = dialog.message();
      dialog.accept();
    });
    await page.locator("#btnDeleteAllBlankSlots").click();

    expect(confirmMessage).toContain("Delete all");
    const activeRows = page.locator("#queue > .queueItem");
    await expect(activeRows.nth(0)).toContainText("#1");
    await expect(activeRows.nth(0)).toContainText("Delete All Anchor");
    await expect(activeRows.nth(1)).toContainText("DELETE ALL BREAK");
    await expect(activeRows.nth(1)).toContainText("After #1");
    await expect(activeRows.nth(2)).toContainText("#2");
    await expect(activeRows.nth(2)).toContainText("Delete All Tail");
    await expect(page.locator(".paperSlotEmpty")).toHaveCount(5);
    await expect(page.locator('.paperSlotEmpty[data-paper-slot="3"]')).toBeVisible();
    await expect(page.locator('.paperSlotEmpty[data-paper-slot="7"]')).toBeVisible();
    expect(pageErrors).toEqual([]);
  });

  test("filled and blank rows keep dedicated move columns and separated blank delete action", async ({ page }) => {
    const pageErrors = [];
    watchPageErrors(page, pageErrors);

    await page.goto("operator.html");
    const performerRow = await addPerformerFromFirstOpenSlot(page, "Move Column Target");
    const blankRow = page.locator(".paperSlotEmpty").first();

    const performerMetrics = await readMoveColumnMetrics(performerRow);
    expect(performerMetrics).not.toBeNull();
    expect(Math.abs(performerMetrics.actionsRight - performerMetrics.moveRight)).toBeLessThan(2);
    expect(performerMetrics.moveLeft).toBeGreaterThan(performerMetrics.gridRight);
    expect(Math.abs(performerMetrics.upHeight - performerMetrics.downHeight)).toBeLessThan(3);
    expect(performerMetrics.upTop).toBeLessThan(performerMetrics.downTop);

    await expect(blankRow.locator(".qDangerColumn .qActionDeleteBlank")).toBeVisible();
    const blankMetrics = await readMoveColumnMetrics(blankRow);
    expect(blankMetrics).not.toBeNull();
    expect(Math.abs(blankMetrics.actionsRight - blankMetrics.moveRight)).toBeLessThan(2);
    expect(blankMetrics.moveLeft).toBeGreaterThan(blankMetrics.dangerRight);
    expect(blankMetrics.dangerLeft).toBeGreaterThan(blankMetrics.gridRight);
    expect(Math.abs(blankMetrics.upHeight - blankMetrics.downHeight)).toBeLessThan(3);
    expect(blankMetrics.upTop).toBeLessThan(blankMetrics.downTop);
    expect(pageErrors).toEqual([]);
  });

  test("inline editor opens only from explicit controls, keeps save/cancel top-right, and cancel discards unsaved changes", async ({ page }) => {
    const pageErrors = [];
    watchPageErrors(page, pageErrors);

    await page.goto("operator.html");
    const performerRow = await addPerformerFromFirstOpenSlot(page, "Inline Edit Target", "Original notes");
    const slotId = await performerRow.getAttribute("data-id");
    const row = page.locator(`.queueItem[data-id="${slotId}"]`);

    await row.dispatchEvent("click");
    await expect(row.locator(".qExpander")).toHaveCount(0);
    await row.locator(".qName").dispatchEvent("click");
    await expect(row.locator(".qExpander")).toHaveCount(0);

    await row.getByRole("button", { name: "Edit" }).click();
    await expect(row.locator(".qExpander")).toBeVisible();
    await expect(row.locator(".qExpHead .qExpActions")).toBeVisible();
    await expect(row.locator(".qExpHead .btn.good")).toHaveText("Save");
    const performerHeadBox = await row.locator(".qExpHead").boundingBox();
    const performerGridBox = await row.locator(".qExpGrid").boundingBox();
    expect(performerHeadBox.y).toBeLessThan(performerGridBox.y);

    await row.locator(".qExpander input[type='text']").first().fill("Cancel Should Discard");
    await row.locator(".qExpHead").getByRole("button", { name: "Cancel" }).click();
    await expect(row.locator(".qExpander")).toHaveCount(0);
    await expect(row).toContainText("Inline Edit Target");
    await expect(row).not.toContainText("Cancel Should Discard");

    await row.getByRole("button", { name: "Edit" }).click();
    await expect(row.locator(".qExpander")).toBeVisible();
    await row.locator(".qExpander input[type='text']").first().fill("Outside Save Name");
    await page.locator("#showTitle").click();
    await expect(row.locator(".qExpander")).toHaveCount(0);
    await expect(row).toContainText("Outside Save Name");
    await expect(row).toContainText("Saved");

    await row.getByRole("button", { name: "Edit" }).click();
    await expect(row.locator(".qExpander")).toBeVisible();
    const notesBox = row.locator(".qExpander textarea").last();
    await notesBox.fill("Line one");
    await notesBox.press("Enter");
    await expect(row.locator(".qExpander")).toBeVisible();

    await row.locator(".qExpander input[type='text']").first().fill("Escape Save Name");
    await page.keyboard.press("Escape");
    await expect(row.locator(".qExpander")).toHaveCount(0);
    await expect(row).toContainText("Escape Save Name");

    const blankRow = page.locator(".paperSlotEmpty").first();
    await blankRow.getByRole("button", { name: "Add Performer" }).click();
    await expect(blankRow.locator(".qExpHead .qExpActions")).toBeVisible();
    const blankHeadBox = await blankRow.locator(".qExpHead").boundingBox();
    const blankGridBox = await blankRow.locator(".qExpGrid").boundingBox();
    expect(blankHeadBox.y).toBeLessThan(blankGridBox.y);
    await blankRow.locator(".qExpHead").getByRole("button", { name: "Cancel" }).click();
    await expect(blankRow.locator(".qExpander")).toHaveCount(0);
    expect(pageErrors).toEqual([]);
  });

  test("ending an expired performer does not wipe all blank slots", async ({ page }) => {
    const pageErrors = [];
    watchPageErrors(page, pageErrors);

    await page.goto("operator.html");
    await addPerformerFromFirstOpenSlot(page, "End Blank Safety");
    await expect(page.locator(".paperSlotEmpty")).toHaveCount(29);

    await startNextPerformer(page);
    await seedCurrentTimerState(page, {
      baseDurationMs: 60 * 1000,
      elapsedMs: 61 * 1000,
      originalScheduledDurationMs: 60 * 1000,
      scheduleAdjustmentMs: 0,
      running: true,
      phase: "LIVE",
      reloadOperator: false,
    });

    page.once("dialog", dialog => dialog.accept());
    await page.locator("#btnEnd").click();

    await expect(page.locator("#statusBanner")).toContainText("Phase: SPLASH");
    await expect(page.locator(".paperSlotEmpty")).toHaveCount(29);
    await expect(page.locator('.paperSlotEmpty[data-paper-slot="2"]')).toBeVisible();
    expect(pageErrors).toEqual([]);
  });

  test("last-call settings can show a manual operator-only reminder and snooze or dismiss it", async ({ page, context }) => {
    const pageErrors = [];
    watchPageErrors(page, pageErrors);

    await page.goto("operator.html");
    const viewer = await openViewerPage(context, pageErrors);
    await setOperatorTestNow(page, "2026-04-29T23:20:00-05:00");

    await page.locator("#btnSettings").click();
    await expect(page.locator("#settingsModal")).toBeVisible();
    await page.locator('.settingsTabBtn[data-tab="advanced"]').click();
    await expect(page.locator('.settingsPanel[data-panel="advanced"]')).toBeVisible();
    await expect(page.locator("#setLastCallEnabled")).toBeChecked();
    await expect(page.locator("#setLastCallCloseMode")).toHaveValue("midnight");

    await page.locator("#btnLastCallShowNow").click();
    const prompt = page.locator("#lastCallPrompt");
    await expect(prompt).toBeVisible();
    await expect(prompt).toContainText("Venue close set to 12:00 AM");
    await expect(prompt).toContainText("Prompt patrons to tip bartenders and servers");
    await expect(viewer.locator("#lastCallPrompt")).toHaveCount(0);

    await page.locator("#btnLastCallSnooze").click();
    await expect(prompt).toBeHidden();

    await setOperatorTestNow(page, "2026-04-29T23:31:00-05:00");
    await expect(prompt).toBeVisible();
    await expect(prompt).toContainText("30 minutes before close");

    await page.locator("#btnLastCallDismiss").click();
    await expect(prompt).toBeHidden();
    await expect(page.locator("#lastCallStatus")).toContainText("Dismissed for tonight");
    await clearOperatorTestNow(page);
    expect(pageErrors).toEqual([]);
  });

  test("last-call reminder can use a custom close time schedule", async ({ page }) => {
    const pageErrors = [];
    watchPageErrors(page, pageErrors);

    await page.goto("operator.html");
    await setOperatorTestNow(page, "2026-04-29T23:40:00-05:00");

    await page.locator("#btnSettings").click();
    await expect(page.locator("#settingsModal")).toBeVisible();
    await page.locator('.settingsTabBtn[data-tab="advanced"]').click();
    await expect(page.locator('.settingsPanel[data-panel="advanced"]')).toBeVisible();
    await page.locator("#setLastCallCloseMode").selectOption("custom");
    await page.locator("#setLastCallCustomTime").fill("00:20");
    await page.locator("#setLastCallCustomTime").dispatchEvent("change");

    await expect(page.locator("#lastCallStatus")).toContainText("Close set to 12:20 AM");

    await setOperatorTestNow(page, "2026-04-29T23:50:00-05:00");
    const prompt = page.locator("#lastCallPrompt");
    await expect(prompt).toBeVisible();
    await expect(prompt).toContainText("30 minutes before close");
    await clearOperatorTestNow(page);
    expect(pageErrors).toEqual([]);
  });

  test("last-call due reminders surface on END and extending to 1 AM reschedules the remaining prompts", async ({ page }) => {
    const pageErrors = [];
    watchPageErrors(page, pageErrors);

    await page.goto("operator.html");
    await addPerformerFromFirstOpenSlot(page, "Last Call End Flow");
    await setOperatorTestNow(page, "2026-04-29T23:20:00-05:00");

    await startNextPerformer(page);
    await setOperatorTestNow(page, "2026-04-29T23:50:00-05:00");
    page.once("dialog", dialog => dialog.accept());
    await page.locator("#btnEnd").click();

    const prompt = page.locator("#lastCallPrompt");
    await expect(prompt).toBeVisible();
    await expect(prompt).toContainText("10 minutes before close confirmation");

    await page.locator("#btnLastCallExtend").click();
    await expect(prompt).toBeHidden();
    await expect(page.locator("#setLastCallCloseMode")).toHaveValue("oneam");

    await setOperatorTestNow(page, "2026-04-30T00:31:00-05:00");
    await expect(prompt).toBeVisible();
    await expect(prompt).toContainText("30 minutes before close");

    await page.locator("#btnLastCallMade").click();
    await expect(prompt).toBeHidden();

    await setOperatorTestNow(page, "2026-04-30T00:51:00-05:00");
    await page.waitForTimeout(350);
    await expect(prompt).toBeHidden();
    await clearOperatorTestNow(page);
    expect(pageErrors).toEqual([]);
  });

  test("no-show moves performer to completed state", async ({ page }) => {
    const pageErrors = [];
    watchPageErrors(page, pageErrors);

    await page.goto("operator.html");
    const performerRow = await addPerformerFromFirstOpenSlot(page, "No Show Test");

    page.once("dialog", dialog => dialog.accept());
    await performerRow.getByRole("button", { name: "No-show" }).click();

    const completedSummary = page.locator("summary.queueDivider").filter({ hasText: "Completed / No Show" });
    await expect(completedSummary).toBeVisible();
    await completedSummary.click();

    const completedRow = page.locator(".doneQueue .queueItem").filter({ hasText: "No Show Test" });
    await expect(completedRow).toBeVisible();
    await expect(completedRow).toContainText("NO SHOW");
    await expect(completedRow.getByRole("button", { name: "Re-queue" })).toBeVisible();
    expect(pageErrors).toEqual([]);
  });

  test("completed section is collapsed by default on initial load", async ({ page }) => {
    const pageErrors = [];
    watchPageErrors(page, pageErrors);

    await page.goto("operator.html");
    const performerRow = await addPerformerFromFirstOpenSlot(page, "Collapsed Done Test");

    page.once("dialog", dialog => dialog.accept());
    await performerRow.getByRole("button", { name: "No-show" }).click();
    await expect(page.locator("summary.queueDivider").filter({ hasText: "Completed / No Show" })).toBeVisible();

    await page.reload();

    const completedDetails = page.locator("details.doneDetails");
    await expect(completedDetails).toBeVisible();
    await expect(completedDetails).not.toHaveAttribute("open", "");
    await expect(page.locator("summary.queueDivider").filter({ hasText: "Completed / No Show" })).toBeVisible();
    await expect(page.locator(".doneQueue .queueItem").filter({ hasText: "Collapsed Done Test" })).toBeHidden();
    expect(pageErrors).toEqual([]);
  });
});
