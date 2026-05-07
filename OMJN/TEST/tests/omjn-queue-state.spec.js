const { test, expect } = require("@playwright/test");
const {
  addPerformerFromFirstOpenSlot,
  clearOperatorTestNow,
  enableSponsorAdSlots,
  insertSpecialFromRow,
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
    const danger = node.querySelector(".qDeleteColumn");
    if(!actions || !grid || !move || !up || !down || !danger){
      return null;
    }
    const actionsRect = actions.getBoundingClientRect();
    const gridRect = grid.getBoundingClientRect();
    const moveRect = move.getBoundingClientRect();
    const upRect = up.getBoundingClientRect();
    const downRect = down.getBoundingClientRect();
    const dangerRect = danger.getBoundingClientRect();
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
      dangerLeft: dangerRect.left,
      dangerRight: dangerRect.right,
    };
  });
}

async function expectUndoNoticeNearTop(page){
  const notice = page.locator("#queueUndoNotice");
  await expect(notice).toBeVisible();
  const box = await notice.boundingBox();
  expect(box).not.toBeNull();
  expect(box.y).toBeGreaterThanOrEqual(0);
  expect(box.y).toBeLessThan(140);
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
    await page.setViewportSize({ width: 1536, height: 322 });
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
    await blankRow.locator(".qActionDeleteBlank").click();

    expect(confirmMessage).toContain("Delete this blank slot?");
    await expectUndoNoticeNearTop(page);
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

    await page.locator('.paperSlotEmpty[data-paper-slot="3"]').getByRole("button", { name: "Insert special after this open slot" }).click();
    await page.locator('.paperSlotEmpty[data-paper-slot="3"] .qSpecialMenu').getByRole("button", { name: "Intermission" }).click();
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
    expect(performerMetrics.moveLeft).toBeGreaterThan(performerMetrics.dangerRight);
    expect(performerMetrics.dangerLeft).toBeGreaterThan(performerMetrics.gridRight);
    expect(performerMetrics.moveLeft).toBeGreaterThan(performerMetrics.gridRight);
    expect(Math.abs(performerMetrics.upHeight - performerMetrics.downHeight)).toBeLessThan(3);
    expect(performerMetrics.upTop).toBeLessThan(performerMetrics.downTop);

    await expect(blankRow.locator(".qDeleteColumn .qActionDeleteBlank")).toBeVisible();
    const blankMetrics = await readMoveColumnMetrics(blankRow);
    expect(blankMetrics).not.toBeNull();
    expect(blankMetrics.moveLeft).toBeGreaterThan(blankMetrics.dangerRight);
    expect(blankMetrics.dangerLeft).toBeGreaterThan(blankMetrics.gridRight);
    expect(Math.abs(blankMetrics.upHeight - blankMetrics.downHeight)).toBeLessThan(3);
    expect(blankMetrics.upTop).toBeLessThan(blankMetrics.downTop);
    expect(pageErrors).toEqual([]);
  });

  test("queue rows use dedicated drag handles instead of whole-row drag triggers", async ({ page }) => {
    const pageErrors = [];
    watchPageErrors(page, pageErrors);

    await page.goto("operator.html");
    const performerRow = await addPerformerFromFirstOpenSlot(page, "Drag Handle Target");
    const blankRow = page.locator(".paperSlotEmpty").first();

    await expect(performerRow.locator(".dragHandle")).toHaveAttribute("aria-label", "Drag to reorder");
    await expect(blankRow.locator(".dragHandle")).toHaveAttribute("aria-label", "Drag to reorder");
    expect(await performerRow.evaluate((node) => node.draggable)).toBe(false);
    expect(await performerRow.locator(".dragHandle").evaluate((node) => node.draggable)).toBe(true);
    expect(await blankRow.evaluate((node) => node.draggable)).toBe(false);
    expect(await blankRow.locator(".dragHandle").evaluate((node) => node.draggable)).toBe(true);
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
    await expect(row.locator(".qDeleteColumn.isEditing .qActionSave")).toBeVisible();
    await expect(row.locator(".qDeleteColumn.isEditing .qActionCancel")).toBeVisible();
    await expect(row.locator(".dragHandle")).toHaveAttribute("aria-disabled", "true");
    await expect(row.locator(".qActionUp")).toBeDisabled();
    await expect(row.locator(".qActionDown")).toBeDisabled();
    const performerSaveBox = await row.locator(".qDeleteColumn.isEditing .qActionSave").boundingBox();
    const performerGridBox = await row.locator(".qExpGrid").boundingBox();
    expect(performerSaveBox.x).toBeGreaterThan(performerGridBox.x);
    expect(performerSaveBox.y).toBeLessThan(performerGridBox.y + 16);

    await row.locator(".qExpander input[type='text']").first().fill("Cancel Should Discard");
    await row.locator(".qDeleteColumn.isEditing .qActionCancel").click();
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
    await expect(blankRow.locator(".qDeleteColumn.isEditing .qActionSave")).toBeVisible();
    await expect(blankRow.locator(".qDeleteColumn.isEditing .qActionCancel")).toBeVisible();
    await expect(blankRow.locator(".dragHandle")).toHaveAttribute("aria-disabled", "true");
    await expect(blankRow.locator(".qActionUp")).toBeDisabled();
    await expect(blankRow.locator(".qActionDown")).toBeDisabled();
    const blankHeadBox = await blankRow.locator(".qDeleteColumn.isEditing .qActionSave").boundingBox();
    const blankGridBox = await blankRow.locator(".qExpGrid").boundingBox();
    expect(blankHeadBox.y).toBeLessThan(blankGridBox.y);
    await blankRow.locator(".qDeleteColumn.isEditing .qActionCancel").click();
    await expect(blankRow.locator(".qExpander")).toHaveCount(0);
    expect(pageErrors).toEqual([]);
  });

  test("filled row delete confirms, moves into deleted history, and shows an undo notice", async ({ page }) => {
    const pageErrors = [];
    watchPageErrors(page, pageErrors);

    await page.goto("operator.html");
    await page.setViewportSize({ width: 1536, height: 322 });
    const performerRow = await addPerformerFromFirstOpenSlot(page, "Delete Queue Target");

    let confirmMessage = "";
    page.once("dialog", (dialog) => {
      confirmMessage = dialog.message();
      dialog.accept();
    });
    await performerRow.locator(".qActionDelete").click();

    expect(confirmMessage).toContain('Delete "Delete Queue Target" from the active queue?');
    await expectUndoNoticeNearTop(page);
    const completedSummary = page.locator("summary.queueDivider").filter({ hasText: "Completed / No Show / Deleted" });
    await expect(completedSummary).toBeVisible();
    await completedSummary.click();

    const completedRow = page.locator(".doneQueue .queueItem").filter({ hasText: "Delete Queue Target" });
    await expect(completedRow).toBeVisible();
    await expect(completedRow).toContainText("DELETED");
    await expect(completedRow.getByRole("button", { name: "Re-queue" })).toBeVisible();

    await page.locator("#btnQueueUndoNotice").click();
    await expect(page.locator("#queueUndoNotice")).toBeHidden();
    await expect(page.locator("#queue > .queueItem").filter({ hasText: "Delete Queue Target" })).toBeVisible();
    expect(pageErrors).toEqual([]);
  });

  test("go live appears only on the first three non-blank rows and includes specials in that count", async ({ page }) => {
    const pageErrors = [];
    watchPageErrors(page, pageErrors);

    await page.goto("operator.html");
    await addPerformerFromFirstOpenSlot(page, "Go Live One");
    await addPerformerFromFirstOpenSlot(page, "Go Live Two");
    const thirdRow = await addPerformerFromFirstOpenSlot(page, "Go Live Three");
    await addPerformerFromFirstOpenSlot(page, "Go Live Four");

    await insertSpecialFromRow(thirdRow, "before", "Intermission");
    await expect(page.locator("#intermissionModal")).toBeVisible();
    await page.locator("#imName").fill("Go Live Break");
    await page.locator("#imMsg").fill("GO LIVE BREAK");
    await page.locator("#imDur5").click();
    await page.locator("#btnImAdd").click();
    await expect(page.locator("#intermissionModal")).toBeHidden();

    const queueRows = page.locator("#queue > .queueItem:not(.paperSlotEmpty)");
    await expect(queueRows.nth(0)).toContainText("Go Live One");
    await expect(queueRows.nth(0).locator(".qActionGoLive")).toBeVisible();
    await expect(queueRows.nth(1)).toContainText("Go Live Two");
    await expect(queueRows.nth(1).locator(".qActionGoLive")).toBeVisible();
    await expect(queueRows.nth(2)).toContainText("GO LIVE BREAK");
    await expect(queueRows.nth(2).locator(".qActionGoLive")).toBeVisible();
    await expect(queueRows.nth(3)).toContainText("Go Live Three");
    await expect(queueRows.nth(3).locator(".qActionGoLive")).toHaveCount(0);
    await expect(queueRows.nth(4)).toContainText("Go Live Four");
    await expect(queueRows.nth(4).locator(".qActionGoLive")).toHaveCount(0);
    expect(pageErrors).toEqual([]);
  });

  test("insert special popover opens and closes, supports before/after insertion, and keeps ad options behind the setting", async ({ page }) => {
    const pageErrors = [];
    watchPageErrors(page, pageErrors);

    await page.goto("operator.html");
    const firstRow = await addPerformerFromFirstOpenSlot(page, "Insert Base One");
    const targetRow = await addPerformerFromFirstOpenSlot(page, "Insert Base Two");
    const firstTrigger = firstRow.getByRole("button", { name: "Insert Special" });
    const targetTrigger = targetRow.getByRole("button", { name: "Insert Special" });

    await targetTrigger.click();
    const popover = targetRow.locator(".qSpecialMenu");
    await expect(popover).toBeVisible();
    await expect(targetTrigger).toHaveAttribute("aria-expanded", "true");
    await expect(popover.getByRole("button", { name: "Before" })).toBeVisible();
    await expect(popover.getByRole("button", { name: "After" })).toBeVisible();
    await expect(popover.getByRole("button", { name: "Graphic Ad" })).toHaveCount(0);
    await expect(popover.getByRole("button", { name: "Video Ad" })).toHaveCount(0);

    await targetTrigger.click();
    await expect(targetRow.locator(".qSpecialMenu")).toHaveCount(0);
    await expect(targetTrigger).toHaveAttribute("aria-expanded", "false");

    await firstTrigger.click();
    await expect(firstRow.locator(".qSpecialMenu")).toBeVisible();
    await expect(firstTrigger).toHaveAttribute("aria-expanded", "true");

    await targetTrigger.click();
    await expect(firstRow.locator(".qSpecialMenu")).toHaveCount(0);
    await expect(firstTrigger).toHaveAttribute("aria-expanded", "false");
    await expect(targetRow.locator(".qSpecialMenu")).toBeVisible();
    await expect(targetTrigger).toHaveAttribute("aria-expanded", "true");

    await page.locator("#showTitle").click();
    await expect(targetRow.locator(".qSpecialMenu")).toHaveCount(0);
    await expect(targetTrigger).toHaveAttribute("aria-expanded", "false");

    await insertSpecialFromRow(targetRow, "before", "Intermission");
    await expect(page.locator("#intermissionModal")).toBeVisible();
    await page.locator("#imName").fill("Before Insert Break");
    await page.locator("#imMsg").fill("BEFORE INSERT");
    await page.locator("#imDur5").click();
    await page.locator("#btnImAdd").click();
    await expect(page.locator("#intermissionModal")).toBeHidden();

    const activeRows = page.locator("#queue > .queueItem");
    await expect(activeRows.nth(0)).toContainText("Insert Base One");
    await expect(activeRows.nth(1)).toContainText("BEFORE INSERT BREAK");
    await expect(activeRows.nth(2)).toContainText("Insert Base Two");

    const refreshedTarget = page.locator("#queue > .queueItem").filter({ hasText: "Insert Base Two" }).first();
    await insertSpecialFromRow(refreshedTarget, "after", "All Star Jam");
    const jamRow = page.locator('.queueItem[data-slot-type="allstarjam"]').last();
    await expect(jamRow.locator(".qExpander")).toBeVisible();
    await jamRow.locator(".qExpander input[type='text']").first().fill("After Insert Jam");
    await jamRow.locator(".qDeleteColumn.isEditing .qActionSave").click();

    await expect(activeRows.nth(2)).toContainText("Insert Base Two");
    await expect(activeRows.nth(3)).toContainText("After Insert Jam");

    await enableSponsorAdSlots(page);
    const refreshedTrigger = refreshedTarget.getByRole("button", { name: "Insert Special" });
    await refreshedTrigger.click();
    const adPopover = refreshedTarget.locator(".qSpecialMenu");
    await expect(adPopover).toBeVisible();
    await expect(refreshedTrigger).toHaveAttribute("aria-expanded", "true");
    await adPopover.getByRole("button", { name: "After" }).click();
    await expect(adPopover.getByRole("button", { name: "Graphic Ad" })).toBeVisible();
    await expect(adPopover.getByRole("button", { name: "Video Ad" })).toBeVisible();
    await page.locator("#showTitle").click();
    await expect(refreshedTarget.locator(".qSpecialMenu")).toHaveCount(0);
    await expect(refreshedTrigger).toHaveAttribute("aria-expanded", "false");
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
    await page.locator("#btnCloseSettings").click();
    await expect(page.locator("#settingsModal")).toBeHidden();

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

  test("no-show controls are removed from the main queue row UI", async ({ page }) => {
    const pageErrors = [];
    watchPageErrors(page, pageErrors);

    await page.goto("operator.html");
    const performerRow = await addPerformerFromFirstOpenSlot(page, "No Show Hidden");

    await expect(performerRow.locator(".qActionNoShow")).toHaveCount(0);
    await expect(performerRow.getByRole("button", { name: /No-show/i })).toHaveCount(0);
    expect(pageErrors).toEqual([]);
  });

  test("completed section is collapsed by default on initial load", async ({ page }) => {
    const pageErrors = [];
    watchPageErrors(page, pageErrors);

    await page.goto("operator.html");
    const performerRow = await addPerformerFromFirstOpenSlot(page, "Collapsed Done Test");

    page.once("dialog", dialog => dialog.accept());
    await performerRow.locator(".qActionDelete").click();
    await expect(page.locator("summary.queueDivider").filter({ hasText: "Completed / No Show / Deleted" })).toBeVisible();

    await page.reload();

    const completedDetails = page.locator("details.doneDetails");
    await expect(completedDetails).toBeVisible();
    await expect(completedDetails).not.toHaveAttribute("open", "");
    await expect(page.locator("summary.queueDivider").filter({ hasText: "Completed / No Show / Deleted" })).toBeVisible();
    await expect(page.locator(".doneQueue .queueItem").filter({ hasText: "Collapsed Done Test" })).toBeHidden();
    expect(pageErrors).toEqual([]);
  });
});
