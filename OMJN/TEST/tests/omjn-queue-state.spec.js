const { test, expect } = require("@playwright/test");
const {
  addPerformerFromFirstOpenSlot,
  watchPageErrors,
} = require("./omjn-test-helpers");

test.describe("OMJN TEST queue state", () => {
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
