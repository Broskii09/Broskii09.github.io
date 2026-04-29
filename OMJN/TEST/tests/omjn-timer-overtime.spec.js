const { test, expect } = require("@playwright/test");
const {
  addPerformerFromFirstOpenSlot,
  endCurrentToSplash,
  openViewerPage,
  seedCurrentTimerState,
  startNextPerformer,
  watchPageErrors,
} = require("./omjn-test-helpers");

test.describe("OMJN TEST timer overtime", () => {
  test.describe.configure({ timeout: 80000 });

  test("timer crossing zero triggers overtime flash, pulse, and repeat cue", async ({ page, context }) => {
    const pageErrors = [];
    watchPageErrors(page, pageErrors);

    await page.goto("operator.html");
    await addPerformerFromFirstOpenSlot(page, "Zero Cross Test");

    const viewer = await openViewerPage(context, pageErrors);
    await startNextPerformer(page);
    await expect(viewer.locator("#nowName")).toContainText("Zero Cross Test", { timeout: 10000 });

    await seedCurrentTimerState(page, {
      baseDurationMs: 1500,
      elapsedMs: 0,
      running: true,
      phase: "LIVE",
      originalScheduledDurationMs: 1500,
    });

    await expect(viewer.locator("#vMainCard")).toHaveClass(/cue-overtime/, { timeout: 6000 });
    await expect.poll(async () => (
      await viewer.locator("#vMainCard").evaluate((node) => node.classList.contains("overtimeFlash"))
    ), { timeout: 6000 }).toBe(true);
    await expect.poll(async () => (
      await viewer.locator("#vMainCard").evaluate((node) => node.classList.contains("overtimeFlash"))
    ), { timeout: 5000 }).toBe(false);
    await expect(viewer.locator("#vMainCard")).toHaveClass(/cue-overtime/);
    await expect.poll(async () => (
      await viewer.locator("#vMainCard").evaluate((node) => node.classList.contains("overtimeFlash"))
    ), { timeout: 33000 }).toBe(true);

    expect(pageErrors).toEqual([]);
  });

  test("adding time while overtime clears warnings, updates ETA, and preserves completed timing detail", async ({ page, context }) => {
    const pageErrors = [];
    watchPageErrors(page, pageErrors);

    await page.goto("operator.html");
    await addPerformerFromFirstOpenSlot(page, "Overtime Recovery");
    await addPerformerFromFirstOpenSlot(page, "ETA Next");

    const viewer = await openViewerPage(context, pageErrors);
    await startNextPerformer(page);
    await expect(viewer.locator("#nowName")).toContainText("Overtime Recovery", { timeout: 10000 });

    await page.locator("#btnPauseResume").click();
    await expect(page.locator("#statusBanner")).toContainText("Phase: PAUSED");

    await seedCurrentTimerState(page, {
      baseDurationMs: 5 * 60 * 1000,
      elapsedMs: 7 * 60 * 1000,
      running: false,
      phase: "PAUSED",
      originalScheduledDurationMs: 5 * 60 * 1000,
      transitionBufferSec: 0,
    });

    const queuedRow = page.locator(".queueItem").filter({ hasText: "ETA Next" }).first();
    const beforeEstEnd = (await page.locator("#kpiEstEnd").textContent())?.trim();

    await expect(page.locator("#timerLine")).toContainText("7:00 / 0:00");
    await expect(page.locator("#timerUpModal")).toBeVisible({ timeout: 3000 });
    await expect(queuedRow.locator(".qForecastInline")).not.toContainText("3m current");

    await page.locator("#btnTimerUpPlus5").click();

    await expect(page.locator("#timerLine")).toContainText("7:00 / 3:00");
    await expect(page.locator("#statusBanner")).toContainText("Phase: PAUSED");
    await expect(page.locator("#timerUpModal")).toBeHidden();
    await expect(page.locator("#kpiOvertimeSummary")).toBeHidden();
    await expect(viewer.locator("#vMainCard")).not.toHaveClass(/cue-overtime/);
    await expect(queuedRow.locator(".qForecastInline")).toContainText("3m current");
    await expect(page.locator(".queueItem").filter({ hasText: "Overtime Recovery" }).first()).toContainText("Plan 5:00 + 5:00 = 10:00");

    const afterEstEnd = (await page.locator("#kpiEstEnd").textContent())?.trim();
    expect(afterEstEnd).not.toBe(beforeEstEnd);

    await endCurrentToSplash(page);

    const completedSummary = page.locator("summary.queueDivider").filter({ hasText: "Completed / No Show" });
    await expect(completedSummary).toBeVisible();
    await completedSummary.click();

    const completedRow = page.locator(".doneQueue .queueItem").filter({ hasText: "Overtime Recovery" });
    await expect(completedRow).toContainText("Planned: 5:00");
    await expect(completedRow).toContainText("Added: +5:00");
    await expect(completedRow).toContainText("Scheduled: 10:00");
    await expect(completedRow).toContainText("Actual: 7:00");
    await expect(completedRow).toContainText("Over/Under: -3:00");

    expect(pageErrors).toEqual([]);
  });
});
