const { test, expect } = require("@playwright/test");
const {
  addHouseBandMember,
  addHouseBandSetAfterFirstOpenSlot,
  addIntermissionAfterFirstOpenSlot,
  addVideoAdAfterFirstOpenSlot,
  endCurrentToSplash,
  openViewerPage,
  startNextPerformer,
  watchPageErrors,
} = require("./omjn-test-helpers");

async function houseBandCategoryNames(page, categoryKey){
  return page.locator(`#hbCat_${categoryKey} .queueItem`).evaluateAll((items) => {
    return items
      .map((item) => item.querySelector('.field input[type="text"]')?.value || "")
      .filter(Boolean);
  });
}

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
    await expect(viewer.locator("#liveFooterBar")).toBeHidden();

    await endCurrentToSplash(page);

    await expect(viewer.locator("#root")).toHaveClass(/isSplash/, { timeout: 10000 });
    await expect(viewer.locator("#hbLineup")).toContainText("Smoke Guitarist");
    const completedSummary = page.locator("summary.queueDivider").filter({ hasText: "Completed / No Show" });
    await expect(completedSummary).toBeVisible();
    expect(pageErrors).toEqual([]);
  });

  test("house band full roster is visible on splash and intermission", async ({ page, context }) => {
    const pageErrors = [];
    watchPageErrors(page, pageErrors);

    await page.goto("operator.html");
    await addHouseBandMember(page, "Roster Guitarist", "guitar");
    await addHouseBandMember(page, "Roster Drummer", "drums");

    const viewer = await openViewerPage(context, pageErrors);
    await expect(viewer.locator("#root")).toHaveClass(/isSplash/, { timeout: 10000 });
    await expect(viewer.locator("#splashHBCard")).toBeVisible();
    await expect(viewer.locator("#hbLineup .hbRosterHeadingPill")).toHaveText("Tonight's House Band Roster");
    await expect(viewer.locator("#hbLineup .hbRosterCard")).toHaveCount(2);
    await expect(viewer.locator("#hbLineup .hbRosterLabel")).toContainText(["Drummers", "Guitarists"]);
    await expect(viewer.locator("#hbLineup")).toContainText("Guitarists");
    await expect(viewer.locator("#hbLineup")).toContainText("Roster Guitarist");
    await expect(viewer.locator("#hbLineup")).toContainText("Drummers");
    await expect(viewer.locator("#hbLineup")).toContainText("Roster Drummer");
    await expect(viewer.locator("#hbLineup")).not.toContainText("Bass");

    await page.locator("#tabBtnPerformers").click();
    await addIntermissionAfterFirstOpenSlot(page, "ROSTER BREAK", "HOUSE BAND ROSTER CHECK");
    await startNextPerformer(page);

    await expect(viewer.locator("#nowLabel")).toHaveText("INTERMISSION", { timeout: 10000 });
    await expect(viewer.locator("#liveFooterBar")).toBeVisible();
    await expect(viewer.locator("#hbLiveLineup .hbRosterHeadingPill")).toHaveText("Tonight's House Band Roster");
    await expect(viewer.locator("#hbLiveLineup")).toContainText("Guitarists");
    await expect(viewer.locator("#hbLiveLineup")).toContainText("Roster Guitarist");
    await expect(viewer.locator("#hbLiveLineup")).toContainText("Drummers");
    await expect(viewer.locator("#hbLiveLineup")).toContainText("Roster Drummer");
    expect(pageErrors).toEqual([]);
  });

  test("house band slot ending rotates selected players to the bottom", async ({ page, context }) => {
    const pageErrors = [];
    watchPageErrors(page, pageErrors);

    await page.goto("operator.html");
    await addHouseBandMember(page, "Rotation Guitar One", "guitar");
    await addHouseBandMember(page, "Rotation Guitar Two", "guitar");
    await addHouseBandSetAfterFirstOpenSlot(page, "Rotation Guitar One");

    const viewer = await openViewerPage(context, pageErrors);
    await startNextPerformer(page);

    await expect(viewer.locator("#nowLabel")).toHaveText("HOUSE BAND", { timeout: 10000 });
    await expect(viewer.locator("#liveFooterBar")).toBeHidden();
    await endCurrentToSplash(page);

    await page.locator("#tabBtnHouseBand").click();
    await expect(page.locator("#tabHouseBand")).toBeVisible();
    await expect.poll(() => houseBandCategoryNames(page, "guitar")).toEqual([
      "Rotation Guitar Two",
      "Rotation Guitar One",
    ]);

    await expect(viewer.locator("#splashHBCard")).toBeVisible();
    await expect(viewer.locator("#hbLineup")).toContainText("Rotation Guitar Two");
    await expect(viewer.locator("#hbLineup")).toContainText("Rotation Guitar One");
    const rosterText = await viewer.locator("#hbLineup").innerText();
    expect(rosterText.indexOf("Rotation Guitar Two")).toBeLessThan(rosterText.indexOf("Rotation Guitar One"));
    expect(pageErrors).toEqual([]);
  });

  test("narrow house band roster cycles long category pages", async ({ page, context }) => {
    const pageErrors = [];
    watchPageErrors(page, pageErrors);

    await page.goto("operator.html");
    for (const name of ["Cycle One", "Cycle Two", "Cycle Three", "Cycle Four", "Cycle Five"]) {
      await addHouseBandMember(page, name, "guitar");
    }

    const viewer = await openViewerPage(context, pageErrors);
    await viewer.setViewportSize({ width: 390, height: 844 });
    await expect(viewer.locator("#hbLineup")).toHaveAttribute("data-hb-roster-pages", /^[2-9]/, { timeout: 10000 });

    const firstPage = await viewer.locator("#hbLineup").getAttribute("data-hb-roster-page");
    const firstText = await viewer.locator("#hbLineup").innerText();
    await viewer.waitForFunction((pageNo) => {
      const el = document.querySelector("#hbLineup");
      return !!el && el.dataset.hbRosterPage !== pageNo;
    }, firstPage, { timeout: 7000 });
    await expect(viewer.locator("#hbLineup")).not.toHaveText(firstText);
    expect(pageErrors).toEqual([]);
  });

  test("house band roster transition duration setting syncs to viewer", async ({ page, context }) => {
    const pageErrors = [];
    watchPageErrors(page, pageErrors);

    await page.goto("operator.html");
    for (const name of ["Duration One", "Duration Two", "Duration Three", "Duration Four"]) {
      await addHouseBandMember(page, name, "guitar");
    }

    const viewer = await openViewerPage(context, pageErrors);
    await expect(viewer.locator("#hbLineup")).toHaveAttribute("data-hb-roster-transition-ms", "1100");

    await page.locator("#setViewerHBRosterTransitionSec").evaluate((el, value) => {
      el.value = value;
      el.dispatchEvent(new Event("input", { bubbles: true }));
      el.dispatchEvent(new Event("change", { bubbles: true }));
    }, "1.8");
    await expect(viewer.locator("#hbLineup")).toHaveAttribute("data-hb-roster-transition-ms", "1800");

    await page.locator("#setViewerHBRosterTransitionSec").evaluate((el, value) => {
      el.value = value;
      el.dispatchEvent(new Event("input", { bubbles: true }));
      el.dispatchEvent(new Event("change", { bubbles: true }));
    }, "0.55");
    await expect(viewer.locator("#hbLineup")).toHaveAttribute("data-hb-roster-transition-ms", "550");
    expect(pageErrors).toEqual([]);
  });

  test("house band roster stays compact across requested viewer widths", async ({ page, context }) => {
    const pageErrors = [];
    watchPageErrors(page, pageErrors);

    await page.goto("operator.html");
    await addHouseBandMember(page, "Viewport Guitar One", "guitar");
    await addHouseBandMember(page, "Viewport Guitar Two", "guitar");
    await addHouseBandMember(page, "Viewport Drummer", "drums");
    await addHouseBandMember(page, "Viewport Vocalist", "vocals");
    await addHouseBandMember(page, "Viewport Keys", "keys");
    await addHouseBandMember(page, "Viewport Bass", "bass");

    const viewer = await openViewerPage(context, pageErrors);
    for (const width of [1440, 1280, 1024, 768, 430, 390]) {
      const height = width <= 430 ? 844 : 900;
      await viewer.setViewportSize({ width, height });
      await expect(viewer.locator("#splashHBCard")).toBeVisible();
      const metrics = await viewer.locator("#splashHBCard").evaluate((card) => {
        const line = card.querySelector("#hbLineup");
        const currentPageCards = line.querySelectorAll(".hbRosterPage.isCurrent .hbRosterCard").length;
        const cr = card.getBoundingClientRect();
        const shell = line.querySelector(".hbRosterShell");
        const sr = shell.getBoundingClientRect();
        return {
          cardHeight: cr.height,
          cardWidth: cr.width,
          shellHeight: sr.height,
          shellWidth: sr.width,
          childCount: line.childElementCount,
          currentPageCards,
        };
      });
      expect(metrics.childCount).toBeGreaterThan(0);
      expect(metrics.currentPageCards).toBeGreaterThanOrEqual(1);
      expect(metrics.currentPageCards).toBeLessThanOrEqual(2);
      if (width >= 1024) expect(metrics.currentPageCards).toBe(2);
      if (width <= 430) expect(metrics.currentPageCards).toBe(1);
      expect(metrics.cardHeight).toBeLessThanOrEqual(width <= 430 ? 210 : 250);
      expect(metrics.shellWidth).toBeLessThanOrEqual(metrics.cardWidth + 1);
      expect(metrics.shellHeight).toBeLessThanOrEqual(width <= 430 ? 150 : 190);
    }
    expect(pageErrors).toEqual([]);
  });
});
