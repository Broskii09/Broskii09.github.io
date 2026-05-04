const { expect } = require("@playwright/test");

function watchPageErrors(page, bucket){
  page.on("pageerror", err => bucket.push(err.message));
}

async function expectActionButtonsFit(row){
  const overlappingButtons = await row.locator(".qActions .btn").evaluateAll((buttons) => {
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

  const overflowingButtons = await row.locator(".qActions .btn").evaluateAll((buttons) => {
    return buttons
      .filter((btn) => btn.scrollWidth > btn.clientWidth + 1 || btn.scrollHeight > btn.clientHeight + 1)
      .map((btn) => btn.textContent || "");
  });
  expect(overflowingButtons).toEqual([]);
}

async function expectOpenSlotActionsFit(slot){
  await expect(slot).toContainText("Open Slot");
  await expect(slot).not.toContainText(/paper/i);
  await expectActionButtonsFit(slot);
}

async function openBlankSpecialMenu(slot){
  await slot.getByRole("button", { name: "Insert special after this open slot" }).click();
  const menu = slot.locator(".qSpecialMenu");
  await expect(menu).toBeVisible();
  return menu;
}

async function chooseMenuType(menu, label){
  const button = menu.getByRole("button", { name: label });
  await expect(button).toBeVisible();
  await expect(button).toBeEnabled();
  await button.evaluate((node) => node.click());
}

async function insertSpecialFromRow(row, position, typeLabel){
  await row.getByRole("button", { name: "Insert Special" }).click();
  const menu = row.locator(".qSpecialMenu");
  await expect(menu).toBeVisible();
  await menu.getByRole("button", { name: position === "before" ? "Before" : "After" }).click();
  await chooseMenuType(menu, typeLabel);
}

async function addPerformerFromFirstOpenSlot(page, name, notes = ""){
  const firstSlot = page.locator(".paperSlotEmpty").first();
  const paperSlot = (await firstSlot.getAttribute("data-paper-slot")) || "";
  await firstSlot.getByRole("button", { name: "Add Performer" }).click();

  const editingRow = page.locator(".queueItem.isEditing").first();
  const expander = editingRow.locator(".qExpander");
  await expect(expander).toBeVisible();
  await expect(expander.locator("select").first()).toHaveValue("");

  await expander.locator("input[type='text']").first().fill(name);
  await expander.locator("select").first().selectOption("musician");
  if(notes) await expander.locator("textarea").first().fill(notes);
  await editingRow.locator(".qDeleteColumn.isEditing .qActionSave").click();

  const performerRow = page.locator(".queueItem").filter({ hasText: name });
  if(paperSlot) await expect(performerRow).toContainText(`#${paperSlot}`);
  return performerRow;
}

async function openViewerPage(context, pageErrors){
  const viewer = await context.newPage();
  watchPageErrors(viewer, pageErrors);
  await viewer.goto("viewer.html");
  return viewer;
}

async function openOperatorAdvancedSettings(page){
  await page.locator("#btnSettings").click();
  await expect(page.locator("#settingsModal")).toBeVisible();
  await page.locator('.settingsTabBtn[data-tab="advanced"]').click();
  await expect(page.locator('.settingsPanel[data-panel="advanced"]')).toBeVisible();
}

async function enableSponsorAdSlots(page){
  await openOperatorAdvancedSettings(page);
  const toggle = page.locator("#setEnableSponsorAdSlots");
  if(!(await toggle.isChecked())){
    await toggle.check();
  }
  await page.locator("#btnCloseSettings").click();
  await expect(page.locator("#settingsModal")).toBeHidden();
}

async function openSoundboardSettings(page){
  const enableBtn = page.locator("#sbEnableBtn");
  if(await enableBtn.isVisible().catch(() => false)){
    await enableBtn.click({ force: true });
    await page.evaluate(() => {
      const overlay = document.getElementById("sbEnable");
      if(!overlay) return;
      overlay.style.display = "none";
      overlay.setAttribute("aria-hidden", "true");
    });
  }
  await page.locator("#sbSettingsBtn").click();
  await expect(page.locator("#sbSettingsModal")).toBeVisible();
}

async function setOperatorTestNow(page, value){
  await page.evaluate((nextValue) => {
    const nextMs = (typeof nextValue === "number") ? nextValue : Date.parse(String(nextValue || ""));
    if(!Number.isFinite(nextMs)) throw new Error("Invalid last-call test time.");
    window.__OMJN_TEST_LAST_CALL_NOW_MS = nextMs;
  }, value);
}

async function clearOperatorTestNow(page){
  await page.evaluate(() => {
    try{ delete window.__OMJN_TEST_LAST_CALL_NOW_MS; }catch(_){ window.__OMJN_TEST_LAST_CALL_NOW_MS = undefined; }
  });
}

async function startNextPerformer(page){
  page.once("dialog", dialog => dialog.accept());
  await page.locator("#btnStart").click();
  await expect(page.locator("#statusBanner")).toContainText("Phase: LIVE");
}

async function endCurrentToSplash(page){
  page.once("dialog", dialog => dialog.accept());
  await page.locator("#btnEnd").click();
  await expect(page.locator("#statusBanner")).toContainText("Phase: SPLASH");
}

async function seedCurrentTimerState(page, options = {}){
  await page.evaluate((cfg) => {
    const s = OMJN.loadState();
    if(!s.currentSlotId) throw new Error("No live slot is active.");
    const cur = (s.queue || []).find(x => x && x.id === s.currentSlotId);
    if(!cur) throw new Error("Current slot data is missing.");

    const baseDurationMs = Math.max(0, Math.round(Number(cfg.baseDurationMs || 0)));
    const elapsedMs = Math.max(0, Math.round(Number(cfg.elapsedMs || 0)));
    const originalScheduledDurationMs = Math.max(0, Math.round(Number(cfg.originalScheduledDurationMs ?? baseDurationMs)));
    const scheduleAdjustmentMs = Math.round(Number(cfg.scheduleAdjustmentMs ?? (baseDurationMs - originalScheduledDurationMs)));
    const running = !!cfg.running;

    if(!s.transitionForecast) s.transitionForecast = {};
    s.transitionForecast.defaultBufferSec = Math.max(0, Math.round(Number(cfg.transitionBufferSec ?? 0)));
    s.transitionForecast.manualAdjustSec = Math.round(Number(cfg.manualAdjustSec ?? 0));
    s.transitionForecast.autoLearn = cfg.autoLearn === true;
    s.transitionForecast.observedSamplesSec = [];

    cur.originalScheduledDurationMs = originalScheduledDurationMs > 0 ? originalScheduledDurationMs : null;
    cur.scheduleAdjustmentMs = Number.isFinite(scheduleAdjustmentMs) ? scheduleAdjustmentMs : 0;
    cur.scheduledDurationMs = baseDurationMs > 0 ? baseDurationMs : null;

    s.timer.baseDurationMs = baseDurationMs;
    s.timer.elapsedMs = elapsedMs;
    s.timer.running = running;
    s.timer.startedAt = running ? Date.now() : null;
    s.phase = String(cfg.phase || (running ? "LIVE" : "PAUSED"));

    OMJN.saveState(s);
    OMJN.publish(s);
  }, options);

  if(options.reloadOperator !== false){
    await page.reload();
  }
}

async function addIntermissionAfterFirstOpenSlot(page, title, message){
  const firstSlot = page.locator(".paperSlotEmpty").first();
  const paperSlot = (await firstSlot.getAttribute("data-paper-slot")) || "";
  const menu = await openBlankSpecialMenu(firstSlot);
  await chooseMenuType(menu, "Intermission");
  await expect(page.locator("#intermissionModal")).toBeVisible();
  if(paperSlot) await expect(page.locator("#btnImAdd")).toContainText(`After #${paperSlot}`);
  await page.locator("#imName").fill(title);
  await page.locator("#imMsg").fill(message);
  await page.locator("#imDur5").click();
  await page.locator("#btnImAdd").click();

  await expect(page.locator("#intermissionModal")).toBeHidden();
  const intermissionRow = page.locator(".queueItem").filter({ hasText: title });
  await expect(intermissionRow).toBeVisible();
  await expect(intermissionRow).toContainText("Intermission");
  if(paperSlot) await expect(intermissionRow).toContainText(`After #${paperSlot}`);
  return intermissionRow;
}

async function addGraphicAdAfterFirstOpenSlot(page, label){
  const svg = "<svg xmlns='http://www.w3.org/2000/svg' width='800' height='450'><rect width='800' height='450' fill='%23001524'/><text x='400' y='240' fill='white' font-size='64' font-family='Arial' text-anchor='middle'>SMOKE AD</text></svg>";
  const dataUrl = `data:image/svg+xml,${svg}`;

  const firstSlot = page.locator(".paperSlotEmpty").first();
  const paperSlot = (await firstSlot.getAttribute("data-paper-slot")) || "";
  const menu = await openBlankSpecialMenu(firstSlot);
  await chooseMenuType(menu, "Graphic Ad");
  await expect(page.locator("#adModal")).toBeVisible();
  await expect(page.locator("#btnAdSave")).toHaveText("Add to Queue");
  await page.locator("#adLabel").fill(label);
  await page.locator("#adSource").selectOption("url");
  await expect(page.locator("#adUrlWrap")).toBeVisible();
  await page.locator("#adUrl").fill(dataUrl);
  await page.locator("#btnAdSave").click();

  await expect(page.locator("#adModal")).toBeHidden();
  const adRow = page.locator(".queueItem").filter({ hasText: label });
  await expect(adRow).toBeVisible();
  await expect(adRow).toContainText("Ad");
  if(paperSlot) await expect(adRow).toContainText(`After #${paperSlot}`);
  return adRow;
}

async function addVideoAdAfterFirstOpenSlot(page, label){
  const tinyVideoUrl = "data:video/mp4;base64,AAAA";

  const firstSlot = page.locator(".paperSlotEmpty").first();
  const paperSlot = (await firstSlot.getAttribute("data-paper-slot")) || "";
  const menu = await openBlankSpecialMenu(firstSlot);
  await chooseMenuType(menu, "Video Ad");
  await expect(page.locator("#adModal")).toBeVisible();
  await page.locator("#adLabel").fill(label);
  await expect(page.locator("#adVideoOptions")).toBeVisible();
  await page.locator("#adSource").selectOption("url");
  await expect(page.locator("#adUrlWrap")).toBeVisible();
  await page.locator("#adUrl").fill(tinyVideoUrl);
  await page.locator("#btnAdSave").click();

  await expect(page.locator("#adModal")).toBeHidden();
  const adRow = page.locator(".queueItem").filter({ hasText: label });
  await expect(adRow).toBeVisible();
  await expect(adRow).toContainText("Ad");
  if(paperSlot) await expect(adRow).toContainText(`After #${paperSlot}`);
  return adRow;
}

async function addHouseBandMember(page, name, instrumentId = "guitar"){
  const categoryByInstrument = {
    bass: "bass",
    drums: "drums",
    keys: "keys",
    piano: "keys",
    vocals: "vocals",
    percussion: "percussion",
  };
  const categoryKey = categoryByInstrument[instrumentId] || "guitar";

  await page.locator("#tabBtnHouseBand").click();
  await expect(page.locator("#tabHouseBand")).toBeVisible();
  await page.locator("#hbAddName").fill(name);
  await page.locator("#hbAddInstrument").selectOption(instrumentId);
  await page.locator("#btnAddHBQ").click();

  const memberInput = page.locator(`#hbCat_${categoryKey} .queueItem`).last().locator('input[type="text"]').first();
  await expect(memberInput).toHaveValue(name);
  return memberInput;
}

async function addHouseBandSetAfterFirstOpenSlot(page, memberName){
  await page.locator("#tabBtnPerformers").click();
  await expect(page.locator("#tabPerformers")).toBeVisible();
  const firstSlot = page.locator(".paperSlotEmpty").first();
  const paperSlot = (await firstSlot.getAttribute("data-paper-slot")) || "";
  const menu = await openBlankSpecialMenu(firstSlot);
  await chooseMenuType(menu, "House Band");

  await expect(page.locator("#hbBuildModal")).toBeVisible();
  await expect(page.locator("#hbPreviewNames")).toContainText(memberName);
  await expect(page.locator("#btnHbBuildSave")).toHaveText("Add to Queue");
  await page.locator("#btnHbBuildSave").click();

  await expect(page.locator("#hbBuildModal")).toBeHidden();
  const houseBandRow = page.locator('.queueItem[data-slot-type="houseband"]').filter({ hasText: "HOUSE BAND" });
  await expect(houseBandRow).toBeVisible();
  await expect(houseBandRow).toContainText(memberName);
  if(paperSlot) await expect(houseBandRow).toContainText(`After #${paperSlot}`);
  return houseBandRow;
}

async function addAllStarJamAfterFirstOpenSlot(page, title = "All Star Finale", notes = ""){
  const firstSlot = page.locator(".paperSlotEmpty").first();
  const paperSlot = (await firstSlot.getAttribute("data-paper-slot")) || "";
  const menu = await openBlankSpecialMenu(firstSlot);
  await chooseMenuType(menu, "All Star Jam");

  const jamRow = page.locator('.queueItem[data-slot-type="allstarjam"]').last();
  await expect(jamRow).toBeVisible();
  const expander = jamRow.locator(".qExpander");
  await expect(expander).toBeVisible();

  if(title){
    await expander.locator("input[type='text']").first().fill(title);
  }
  if(notes){
    await expander.locator("textarea").first().fill(notes);
  }
  await jamRow.locator(".qDeleteColumn.isEditing .qActionSave").click();

  await expect(jamRow).toContainText("All Star Jam");
  if(title) await expect(jamRow).toContainText(title);
  if(paperSlot) await expect(jamRow).toContainText(`After #${paperSlot}`);
  return jamRow;
}

async function addAllStarJamAtQueueEnd(page, title = "Finale Jam"){
  const lastSlot = page.locator(".paperSlotEmpty").last();
  const paperSlot = (await lastSlot.getAttribute("data-paper-slot")) || "";
  const menu = await openBlankSpecialMenu(lastSlot);
  await chooseMenuType(menu, "All Star Jam");

  const jamRow = page.locator('.queueItem[data-slot-type="allstarjam"]').last();
  await expect(jamRow).toBeVisible();
  const expander = jamRow.locator(".qExpander");
  await expect(expander).toBeVisible();

  if(title){
    await expander.locator("input[type='text']").first().fill(title);
  }
  await jamRow.locator(".qDeleteColumn.isEditing .qActionSave").click();

  await expect(jamRow).toContainText("All Star Jam");
  if(title) await expect(jamRow).toContainText(title);
  if(paperSlot) await expect(jamRow).toContainText(`After #${paperSlot}`);
  return jamRow;
}

module.exports = {
  addAllStarJamAfterFirstOpenSlot,
  addAllStarJamAtQueueEnd,
  addGraphicAdAfterFirstOpenSlot,
  addHouseBandMember,
  addHouseBandSetAfterFirstOpenSlot,
  addIntermissionAfterFirstOpenSlot,
  addPerformerFromFirstOpenSlot,
  addVideoAdAfterFirstOpenSlot,
  clearOperatorTestNow,
  endCurrentToSplash,
  expectActionButtonsFit,
  expectOpenSlotActionsFit,
  enableSponsorAdSlots,
  insertSpecialFromRow,
  openOperatorAdvancedSettings,
  openSoundboardSettings,
  openViewerPage,
  seedCurrentTimerState,
  setOperatorTestNow,
  startNextPerformer,
  watchPageErrors,
};
