const { test, expect } = require("@playwright/test");
const {
  addPerformerFromFirstOpenSlot,
  watchPageErrors,
} = require("./omjn-test-helpers");

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

  test("inline editor opens only from explicit controls and saves on outside click and Escape", async ({ page }) => {
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
    await expect(row.locator(":scope > .qExpander")).toHaveCount(0);
    await expect(row.locator(":scope > .qActions")).toHaveCount(0);

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
