const { test, expect } = require("@playwright/test");
const path = require("path");
const { pathToFileURL } = require("url");

function pageUrl(fileName){
  return pathToFileURL(path.join(__dirname, "..", fileName)).href;
}

async function expectOpenSlotActionsFit(slot){
  await expect(slot).toContainText("Open Slot");
  await expect(slot).not.toContainText(/paper/i);

  const overlappingButtons = await slot.locator(".qActions .btn").evaluateAll((buttons) => {
    const rects = buttons.map((btn) => {
      const r = btn.getBoundingClientRect();
      return { text: btn.textContent || "", left: r.left, right: r.right, top: r.top, bottom: r.bottom };
    });
    const overlaps = [];
    for(let i = 0; i < rects.length; i++){
      for(let j = i + 1; j < rects.length; j++){
        const a = rects[i], b = rects[j];
        const overlapX = Math.max(0, Math.min(a.right, b.right) - Math.max(a.left, b.left));
        const overlapY = Math.max(0, Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top));
        if(overlapX > 1 && overlapY > 1) overlaps.push(`${a.text}/${b.text}`);
      }
    }
    return overlaps;
  });
  expect(overlappingButtons).toEqual([]);

  const overflowingButtons = await slot.locator(".qActions .btn").evaluateAll((buttons) => {
    return buttons
      .filter((btn) => btn.scrollWidth > btn.clientWidth + 1 || btn.scrollHeight > btn.clientHeight + 1)
      .map((btn) => btn.textContent || "");
  });
  expect(overflowingButtons).toEqual([]);
}

test.describe("OMJN TEST local pages", () => {
  test("Operator page loads", async ({ page }) => {
    const pageErrors = [];
    page.on("pageerror", err => pageErrors.push(err.message));

    await page.goto(pageUrl("operator.html"));

    await expect(page.locator("body.operatorPage")).toBeVisible();
    await expect(page.locator("#btnStart")).toBeVisible();
    await expect(page.locator("#queue")).toBeVisible();
    await expect(page.locator(".paperSlotEmpty")).toHaveCount(30);
    await expect(page.locator("#btnAddPaperSlots")).toBeVisible();

    const firstSlot = page.locator(".paperSlotEmpty").first();
    await expectOpenSlotActionsFit(firstSlot);
    await page.setViewportSize({ width: 390, height: 720 });
    await expectOpenSlotActionsFit(page.locator(".paperSlotEmpty").first());
    await page.setViewportSize({ width: 1280, height: 720 });
    await firstSlot.getByRole("button", { name: "Add Performer" }).click();
    const expander = page.locator(".qExpander").first();
    await expect(expander).toBeVisible();
    await expect(expander.locator("select").first()).toHaveValue("");
    await expander.locator("input[type='text']").first().fill("Alex Test");
    await expander.locator("select").first().selectOption("musician");
    await expander.locator("textarea").first().fill("Walkup song\nhttps://open.spotify.com/track/1234567890abcdef");
    await expander.getByRole("button", { name: "Save" }).click();

    await expect(page.locator(".paperSlotEmpty")).toHaveCount(29);
    await expect(page.locator(".queueItem").filter({ hasText: "Alex Test" })).toContainText("#1");
    await expect(page.getByRole("link", { name: "Spotify App" })).toBeVisible();
    expect(pageErrors).toEqual([]);
  });

  test("Soundboard page loads", async ({ page }) => {
    const pageErrors = [];
    page.on("pageerror", err => pageErrors.push(err.message));

    await page.goto(pageUrl("soundboard.html"));

    await expect(page.locator("body.soundboardPage")).toBeVisible();
    await expect(page.locator("#sbStart")).toBeVisible();
    await expect(page.locator("#sbPads")).toBeAttached();
    expect(pageErrors).toEqual([]);
  });
});
