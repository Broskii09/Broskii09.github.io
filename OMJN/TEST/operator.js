/* Operator UI + actions */
(() => {
  let state = OMJN.loadState();

// Ads (Graphic + Video)
let adCtx = null; // { mode:"add"|"edit", slotId }
let adPresetsTried = false;
let adPresets = [];
let adSelectedPresetId = null;
let adPreviewBlobUrl = null;
let adInsertAfterPaperSlot = null;
  OMJN.applyThemeToDocument(document, state);
  OMJN.ensureHouseBandQueues(state);
  normalizeQueueSpecialSlots(state);
  const els = {
    statusBanner: document.getElementById("statusBanner"),
    queue: document.getElementById("queue"),
    addName: document.getElementById("addName"),
    addType: document.getElementById("addType"),
    btnAdd: document.getElementById("btnAdd"),
    btnAddPaperSlots: document.getElementById("btnAddPaperSlots"),
    btnAddIntermission: document.getElementById("btnAddIntermission"),
    btnAddAd: document.getElementById("btnAddAd"),
    btnAddHouseBandSlot: document.getElementById("btnAddHouseBandSlot"),
    addCustomWrap: document.getElementById("addCustomWrap"),
    addCustomLabel: document.getElementById("addCustomLabel"),
    addCustomMinutesWrap: document.getElementById("addCustomMinutesWrap"),
    addCustomMinutes: document.getElementById("addCustomMinutes"),
    operatorVersionBadge: document.getElementById("operatorVersionBadge"),

    showTitle: document.getElementById("showTitle"),
    startGuard: document.getElementById("startGuard"),
    endGuard: document.getElementById("endGuard"),
    hotkeysEnabled: document.getElementById("hotkeysEnabled"),

    // Settings
setBgColor: document.getElementById("setBgColor"),
    setPanelColor: document.getElementById("setPanelColor"),
    setAccentColor: document.getElementById("setAccentColor"),
    setTextColor: document.getElementById("setTextColor"),
    setCardColor: document.getElementById("setCardColor"),
    setCardOpacity: document.getElementById("setCardOpacity"),
    setCardOpacityVal: document.getElementById("setCardOpacityVal"),
    setSplashShowNextTwo: document.getElementById("setSplashShowNextTwo"),
    setViewerUiScale: document.getElementById("setViewerUiScale"),
    setViewerUiScaleVal: document.getElementById("setViewerUiScaleVal"),
    setViewerNameScale: document.getElementById("setViewerNameScale"),
    setViewerNameScaleVal: document.getElementById("setViewerNameScaleVal"),
    setViewerHBScale: document.getElementById("setViewerHBScale"),
    setViewerHBScaleVal: document.getElementById("setViewerHBScaleVal"),
    setViewerUpcomingScale: document.getElementById("setViewerUpcomingScale"),
    setViewerUpcomingScaleVal: document.getElementById("setViewerUpcomingScaleVal"),
    setViewerPadPx: document.getElementById("setViewerPadPx"),
    setViewerPadPxVal: document.getElementById("setViewerPadPxVal"),
    setViewerMediaPaneScale: document.getElementById("setViewerMediaPaneScale"),
    setViewerMediaPaneScaleVal: document.getElementById("setViewerMediaPaneScaleVal"),
    setTransitionEnabled: document.getElementById("setTransitionEnabled"),
    setTransitionStyle: document.getElementById("setTransitionStyle"),
    setTransitionDurSec: document.getElementById("setTransitionDurSec"),
    setTransitionDurVal: document.getElementById("setTransitionDurVal"),
    setTransitionCutSec: document.getElementById("setTransitionCutSec"),
    setTransitionCutVal: document.getElementById("setTransitionCutVal"),
    setShowProgressBar: document.getElementById("setShowProgressBar"),
    setShowOvertime: document.getElementById("setShowOvertime"),
    setWarnAtSec: document.getElementById("setWarnAtSec"),
    setWarnAtSecVal: document.getElementById("setWarnAtSecVal"),
    setFinalAtSec: document.getElementById("setFinalAtSec"),
    setFinalAtSecVal: document.getElementById("setFinalAtSecVal"),
    setEtaTransitionSec: document.getElementById("setEtaTransitionSec"),
    setEtaTransitionSecVal: document.getElementById("setEtaTransitionSecVal"),
    setEtaAdjustSec: document.getElementById("setEtaAdjustSec"),
    setEtaAdjustSecVal: document.getElementById("setEtaAdjustSecVal"),
    setEtaAutoLearn: document.getElementById("setEtaAutoLearn"),
    btnEtaResetLearning: document.getElementById("btnEtaResetLearning"),
    etaLearningStatus: document.getElementById("etaLearningStatus"),
    setWarnColor: document.getElementById("setWarnColor"),
    setWarnAlpha: document.getElementById("setWarnAlpha"),
    setWarnAlphaVal: document.getElementById("setWarnAlphaVal"),
    setWarnSpeed: document.getElementById("setWarnSpeed"),
    setFinalColor: document.getElementById("setFinalColor"),
    setFinalAlpha: document.getElementById("setFinalAlpha"),
    setFinalAlphaVal: document.getElementById("setFinalAlphaVal"),
    setFinalSpeed: document.getElementById("setFinalSpeed"),
    setOvertimeColor: document.getElementById("setOvertimeColor"),
    setOvertimeAlpha: document.getElementById("setOvertimeAlpha"),
    setOvertimeAlphaVal: document.getElementById("setOvertimeAlphaVal"),
    setVizEnabled: document.getElementById("setVizEnabled"),
    setVizSensitivity: document.getElementById("setVizSensitivity"),
    setVizSensitivityVal: document.getElementById("setVizSensitivityVal"),
    setVizMode: document.getElementById("setVizMode"),
    setVizDirection: document.getElementById("setVizDirection"),

    // Crowd Prompts
    setCrowdEnabled: document.getElementById("setCrowdEnabled"),
    setCrowdPreset: document.getElementById("setCrowdPreset"),
    btnCrowdShowNow: document.getElementById("btnCrowdShowNow"),
    btnCrowdHide: document.getElementById("btnCrowdHide"),
    crowdPresetName: document.getElementById("crowdPresetName"),
    crowdTitle: document.getElementById("crowdTitle"),
    crowdLines: document.getElementById("crowdLines"),
    crowdFooter: document.getElementById("crowdFooter"),
    crowdAutoHide: document.getElementById("crowdAutoHide"),
    btnCrowdSave: document.getElementById("btnCrowdSave"),
    btnCrowdAdd: document.getElementById("btnCrowdAdd"),
    btnCrowdDuplicate: document.getElementById("btnCrowdDuplicate"),
    btnCrowdDelete: document.getElementById("btnCrowdDelete"),

    // Sponsor Bug
    setSponsorEnabled: document.getElementById("setSponsorEnabled"),
    setSponsorLiveOnly: document.getElementById("setSponsorLiveOnly"),
    setSponsorSourceType: document.getElementById("setSponsorSourceType"),
    setSponsorUrl: document.getElementById("setSponsorUrl"),
    setSponsorUploadFile: document.getElementById("setSponsorUploadFile"),
    btnClearSponsorUpload: document.getElementById("btnClearSponsorUpload"),
    sponsorBugPreview: document.getElementById("sponsorBugPreview"),
    sponsorBugStatus: document.getElementById("sponsorBugStatus"),
    setSponsorPosition: document.getElementById("setSponsorPosition"),
    setSponsorScale: document.getElementById("setSponsorScale"),
    setSponsorScaleVal: document.getElementById("setSponsorScaleVal"),
    setSponsorMaxPct: document.getElementById("setSponsorMaxPct"),
    setSponsorMaxPctVal: document.getElementById("setSponsorMaxPctVal"),
    setSponsorOpacity: document.getElementById("setSponsorOpacity"),
    setSponsorOpacityVal: document.getElementById("setSponsorOpacityVal"),
    setSponsorSafeMargin: document.getElementById("setSponsorSafeMargin"),
    setSponsorSafeMarginVal: document.getElementById("setSponsorSafeMarginVal"),
    slotTypesEditor: document.getElementById("slotTypesEditor"),
    btnExportSettings: document.getElementById("btnExportSettings"),
    importSettingsFile: document.getElementById("importSettingsFile"),
    btnResetSettings: document.getElementById("btnResetSettings"),

    btnExport: document.getElementById("btnExport"),
    importFile: document.getElementById("importFile"),
    btnReset: document.getElementById("btnReset"),

    btnSettings: document.getElementById("btnSettings"),
    btnCrowdPrev: document.getElementById("btnCrowdPrev"),
    btnCrowdToggle: document.getElementById("btnCrowdToggle"),
    btnCrowdNext: document.getElementById("btnCrowdNext"),
    btnSettingsOpenCrowdEditor: document.getElementById("btnSettingsOpenCrowdEditor"),
    crowdPromptStatus: document.getElementById("crowdPromptStatus"),
    crowdStatusStrip: document.getElementById("crowdStatusStrip"),
    crowdStatusPill: document.getElementById("crowdStatusPill"),
    crowdStatusName: document.getElementById("crowdStatusName"),
    crowdStatusMeta: document.getElementById("crowdStatusMeta"),
    crowdStatusAutoHide: document.getElementById("crowdStatusAutoHide"),
    crowdDraftBadge: document.getElementById("crowdDraftBadge"),
    btnCrowdEditToggle: document.getElementById("btnCrowdEditToggle"),
    crowdEditorModal: document.getElementById("crowdEditorModal"),
    crowdEditorPanel: document.getElementById("crowdEditorPanel"),
    crowdEditorSubtitle: document.getElementById("crowdEditorSubtitle"),
    crowdEditorPreview: document.getElementById("crowdEditorPreview"),
    btnCrowdEditorClose: document.getElementById("btnCrowdEditorClose"),
    btnCrowdCancel: document.getElementById("btnCrowdCancel"),
    crowdPresetHeroName: document.getElementById("crowdPresetHeroName"),
    crowdPresetHeroTitle: document.getElementById("crowdPresetHeroTitle"),
    crowdPresetHeroAutoHide: document.getElementById("crowdPresetHeroAutoHide"),
    crowdPresetHeroLineCount: document.getElementById("crowdPresetHeroLineCount"),
    crowdPresetHeroState: document.getElementById("crowdPresetHeroState"),
    settingsModal: document.getElementById("settingsModal"),
    btnCloseSettings: document.getElementById("btnCloseSettings"),

    kpiPhaseChip: document.getElementById("kpiPhaseChip"),
    kpiDeckSummary: document.getElementById("kpiDeckSummary"),
    kpiMathSummary: document.getElementById("kpiMathSummary"),
    kpiOvertimeSummary: document.getElementById("kpiOvertimeSummary"),
    crowdPromptPreview: document.getElementById("crowdPromptPreview"),
    timerUpModal: document.getElementById("timerUpModal"),
    timerUpName: document.getElementById("timerUpName"),
    timerUpOver: document.getElementById("timerUpOver"),
    btnTimerUpEnd: document.getElementById("btnTimerUpEnd"),
    btnTimerUpPause: document.getElementById("btnTimerUpPause"),
    btnTimerUpResume: document.getElementById("btnTimerUpResume"),
    btnTimerUpSnooze: document.getElementById("btnTimerUpSnooze"),
    btnTimerUpDismiss: document.getElementById("btnTimerUpDismiss"),
    btnTimerUpPlus30: document.getElementById("btnTimerUpPlus30"),
    btnTimerUpPlus1: document.getElementById("btnTimerUpPlus1"),
    btnTimerUpPlus5: document.getElementById("btnTimerUpPlus5"),
    btnTimerUpReset: document.getElementById("btnTimerUpReset"),
    kpiCurrent: document.getElementById("kpiCurrent"),
    kpiNext: document.getElementById("kpiNext"),
    kpiLeft: document.getElementById("kpiLeft"),
    kpiEstEnd: document.getElementById("kpiEstEnd"),
    kpiTransitionAvg: document.getElementById("kpiTransitionAvg"),
    kpiTransitionMeta: document.getElementById("kpiTransitionMeta"),
    kpiEstHint: document.getElementById("kpiEstHint"),
    kpiNowTime: document.getElementById("kpiNowTime"),

    btnStart: document.getElementById("btnStart"),
    btnPauseResume: document.getElementById("btnPauseResume"),
    btnPauseResumeLabel: document.getElementById("btnPauseResumeLabel"),
    btnEnd: document.getElementById("btnEnd"),
    btnUndo: document.getElementById("btnUndo"),
    btnRedo: document.getElementById("btnRedo"),
    btnMinus1: document.getElementById("btnMinus1"),
    btnMinus5: document.getElementById("btnMinus5"),
    btnPlus1: document.getElementById("btnPlus1"),
    btnPlus5: document.getElementById("btnPlus5"),
    btnMinus30: document.getElementById("btnMinus30"),
    btnPlus30: document.getElementById("btnPlus30"),
    btnResetTime: document.getElementById("btnResetTime"),
    btnViewerTimerToggle: document.getElementById("btnViewerTimerToggle"),
    timerLine: document.getElementById("timerLine"),
// Tabs
    tabBtnPerformers: document.getElementById("tabBtnPerformers"),
    tabBtnHouseBand: document.getElementById("tabBtnHouseBand"),
    tabPerformers: document.getElementById("tabPerformers"),
    tabHouseBand: document.getElementById("tabHouseBand"),

    // Viewer toggle
    toggleHBFooter: document.getElementById("toggleHBFooter"),
    hbFooterFormat: document.getElementById("hbFooterFormat"),

    // House Band queue
    hbAddName: document.getElementById("hbAddName"),
    hbAddInstrument: document.getElementById("hbAddInstrument"),
    hbAddCustomWrap: document.getElementById("hbAddCustomWrap"),
    hbAddCustomInstrument: document.getElementById("hbAddCustomInstrument"),
    hbAddTags: document.getElementById("hbAddTags"),
    btnAddHBQ: document.getElementById("btnAddHBQ"),
    hbCats: document.getElementById("hbCats"),

    // House Band Set Builder modal
    hbBuildModal: document.getElementById("hbBuildModal"),
    // Ads
    adModal: document.getElementById("adModal"),
    adModalTitle: document.getElementById("adModalTitle"),
    adModalSub: document.getElementById("adModalSub"),
    btnAdClose: document.getElementById("btnAdClose"),
    btnAdCancel: document.getElementById("btnAdCancel"),
    btnAdSave: document.getElementById("btnAdSave"),
    btnAdLive: document.getElementById("btnAdLive"),
    adLabel: document.getElementById("adLabel"),
    adSource: document.getElementById("adSource"),
    adKind: document.getElementById("adKind"),
    adVideoOptions: document.getElementById("adVideoOptions"),
    adVideoLoop: document.getElementById("adVideoLoop"),
    adVideoAudio: document.getElementById("adVideoAudio"),

    adPresetWrap: document.getElementById("adPresetWrap"),
    adPreset: document.getElementById("adPreset"),
    adPresetSearch: document.getElementById("adPresetSearch"),
    btnAdPresetRefresh: document.getElementById("btnAdPresetRefresh"),
    adPresetList: document.getElementById("adPresetList"),
    adPresetStatus: document.getElementById("adPresetStatus"),
    adManifestLocalRow: document.getElementById("adManifestLocalRow"),
    btnLoadAdManifest: document.getElementById("btnLoadAdManifest"),
    adManifestFile: document.getElementById("adManifestFile"),
    adUploadWrap: document.getElementById("adUploadWrap"),
    adFile: document.getElementById("adFile"),
    adUrlWrap: document.getElementById("adUrlWrap"),
    adUrl: document.getElementById("adUrl"),
    adPreviewWrap: document.getElementById("adPreviewWrap"),
    adPreviewImg: document.getElementById("adPreviewImg"),
    adPreviewVideo: document.getElementById("adPreviewVideo"),
    hbBuildList: document.getElementById("hbBuildList"),
    hbPreviewNames: document.getElementById("hbPreviewNames"),
    hbPreviewRoles: document.getElementById("hbPreviewRoles"),
    btnHbBuildClose: document.getElementById("btnHbBuildClose"),
    btnHbBuildEnableAll: document.getElementById("btnHbBuildEnableAll"),
    btnHbBuildClearAll: document.getElementById("btnHbBuildClearAll"),
    btnHbBuildCancel: document.getElementById("btnHbBuildCancel"),
    btnHbBuildSave: document.getElementById("btnHbBuildSave"),

    // Intermission Builder modal
    intermissionModal: document.getElementById("intermissionModal"),
    imName: document.getElementById("imName"),
    imMsg: document.getElementById("imMsg"),
    imCustomWrap: document.getElementById("imCustomWrap"),
    imCustomMins: document.getElementById("imCustomMins"),
    imDur5: document.getElementById("imDur5"),
    imDur10: document.getElementById("imDur10"),
    imDur15: document.getElementById("imDur15"),
    imDurCustom: document.getElementById("imDurCustom"),
    btnImClose: document.getElementById("btnImClose"),
    btnImCancel: document.getElementById("btnImCancel"),
    btnImLive: document.getElementById("btnImLive"),
    btnImAdd: document.getElementById("btnImAdd"),
  };

  function formatSiteVersionLabel(version){
    const raw = String(version || "").trim();
    if(!raw) return "";
    const isoMatch = raw.match(/^(\d{4}-\d{2}-\d{2})T(\d{2}:\d{2})/);
    if(isoMatch) return `Build ${isoMatch[1]} ${isoMatch[2]}`;
    return `Build ${raw}`;
  }

  function renderSiteVersionBadge(version){
    const badge = els.operatorVersionBadge;
    if(!badge) return;
    const raw = String(version || "").trim();
    if(!raw){
      badge.hidden = true;
      badge.textContent = "";
      badge.removeAttribute("title");
      return;
    }
    badge.hidden = false;
    badge.textContent = formatSiteVersionLabel(raw);
    badge.title = `Site version ${raw}`;
    badge.setAttribute("aria-label", `Site version ${raw}`);
  }

  function syncSiteVersionBadge(detail){
    renderSiteVersionBadge(detail?.currentVersion || OMJN.getSiteVersion?.() || "");
  }

  syncSiteVersionBadge();
  window.addEventListener("omjn:site-version", (e) => {
    syncSiteVersionBadge(e?.detail || {});
  });

  let selectedId = null;
  // Inline per-row editor (Stage 2)
  let editingId = null;
  let editDraft = null;
  let completedExpanded = false;

  // House Band Set Builder
  let hbBuildCtx = null; // { mode:'add'|'edit', slotId?:string }
  let hbBuildDraft = null;

  // Intermission Builder
  let imDraft = null; // { minutes: number | 'custom' }
  let imInsertAfterPaperSlot = null;

  const PAPER_SLOT_DEFAULT_COUNT = 30;
  const PAPER_SLOT_ADD_COUNT = 5;
  const PAPER_EMPTY_STATUS = "EMPTY";


  const VIEWER_HEARTBEAT_KEY = OMJN.scopedKey("viewerHeartbeat.v1");

  // ---- Undo/Redo (operator-only) ----
  const HISTORY_KEY = OMJN.scopedKey("operator.history.v1");
  const SETTINGS_TAB_KEY = OMJN.scopedKey("operator.settingsTab.v1");
  const HISTORY_LIMIT = 20;
  let undoStack = [];
  let redoStack = [];
  let isApplyingHistory = false;

  function loadHistory(){
    try{
      const raw = localStorage.getItem(HISTORY_KEY);
      if(!raw) return;
      const obj = JSON.parse(raw);
      undoStack = Array.isArray(obj?.undo) ? obj.undo : [];
      redoStack = Array.isArray(obj?.redo) ? obj.redo : [];
    }catch(_){}
  }
  function saveHistory(){
    try{
      localStorage.setItem(HISTORY_KEY, JSON.stringify({ undo: undoStack.slice(-HISTORY_LIMIT), redo: redoStack.slice(-HISTORY_LIMIT) }));
    }catch(_){}
  }
  function pushUndoSnapshot(){
    try{
      undoStack.push(JSON.stringify(state));
      if(undoStack.length > HISTORY_LIMIT) undoStack = undoStack.slice(-HISTORY_LIMIT);
      redoStack = [];
      saveHistory();
    }catch(_){}
  }
  function applyHistory(nextJson, direction){
    try{
      isApplyingHistory = true;
      if(direction === "undo") redoStack.push(JSON.stringify(state));
      if(direction === "redo") undoStack.push(JSON.stringify(state));
      if(redoStack.length > HISTORY_LIMIT) redoStack = redoStack.slice(-HISTORY_LIMIT);
      if(undoStack.length > HISTORY_LIMIT) undoStack = undoStack.slice(-HISTORY_LIMIT);
      const next = JSON.parse(nextJson);
      setState(next);
      saveHistory();
    }finally{
      isApplyingHistory = false;
    }
  }
  function undo(){
    if(!undoStack.length) return;
    const prev = undoStack.pop();
    applyHistory(prev, "undo");
  }
  function redo(){
    if(!redoStack.length) return;
    const next = redoStack.pop();
    applyHistory(next, "redo");
  }

    function addSeconds(deltaSec) {
        updateState(s => {
            const cur = s.queue.find(x => x.id === s.currentSlotId);
            if (!cur) return;

            const base = (s.timer.baseDurationMs ?? (OMJN.effectiveMinutes(s, cur) * 60 * 1000));
            let next = base + (deltaSec * 1000);

            // Prevent going below :30
            const minMs = 30 * 1000;
            if (next < minMs) next = minMs;

            // IMPORTANT: do NOT set minutesOverride here (keep it seconds-accurate)
            s.timer.baseDurationMs = next;
        });
    }

  // ---- House Band shape ----

  // ---- House Band shape ----

  function slotTypesForSelect(opts = {}){
    const includeDisabled = !!opts.includeDisabled;
    const excludeSpecial = !!opts.excludeSpecial;
    return (state.slotTypes || [])
      .filter(t => t && t.id)
      .filter(t => includeDisabled || (t.enabled !== false))
      .filter(t => !excludeSpecial || (t.special !== true));
  }

  function isDoneStatus(status){
    return status === "DONE" || status === "SKIPPED";
  }

  function isAdSlotTypeId(slotTypeId){
    return OMJN.isAdSlotType ? OMJN.isAdSlotType(slotTypeId) : String(slotTypeId || "").startsWith("ad_");
  }

  function isSpecialSlot(slot){
    const typeId = String(slot?.slotTypeId || "");
    return isAdSlotTypeId(typeId) || typeId === "intermission" || typeId === "houseband";
  }

  function isPaperSlot(slot){
    return !!slot && !isSpecialSlot(slot);
  }

  function isPaperPlaceholder(slot){
    return !!slot && isPaperSlot(slot) && (slot.status === PAPER_EMPTY_STATUS || slot.isPlaceholder === true);
  }

  function paperSlotNumber(slot){
    const n = Math.round(Number(slot?.paperSlotNumber || 0));
    return Number.isFinite(n) && n > 0 ? n : null;
  }

  function paperSlotLabel(slot){
    const n = paperSlotNumber(slot);
    return n ? `#${n}` : "";
  }

  function ensureOperatorPrefs(s){
    s.operatorPrefs = s.operatorPrefs || {};
    if(!Number.isFinite(Number(s.operatorPrefs.paperSlotCount))){
      s.operatorPrefs.paperSlotCount = PAPER_SLOT_DEFAULT_COUNT;
    }
    s.operatorPrefs.paperSlotCount = Math.max(PAPER_SLOT_DEFAULT_COUNT, Math.round(Number(s.operatorPrefs.paperSlotCount) || PAPER_SLOT_DEFAULT_COUNT));
    if(!Array.isArray(s.operatorPrefs.retiredPaperSlots)) s.operatorPrefs.retiredPaperSlots = [];
    s.operatorPrefs.retiredPaperSlots = Array.from(new Set(
      s.operatorPrefs.retiredPaperSlots
        .map(n => Math.round(Number(n)))
        .filter(n => Number.isFinite(n) && n > 0)
    )).sort((a,b) => a-b);
    return s.operatorPrefs;
  }

  function makePaperPlaceholder(num){
    return {
      id: OMJN.uid("empty"),
      createdAt: Date.now(),
      displayName: "",
      slotTypeId: "",
      minutesOverride: null,
      customTypeLabel: "",
      status: PAPER_EMPTY_STATUS,
      isPlaceholder: true,
      paperSlotNumber: num,
      notes: "",
      media: { donationUrl: null, imageAssetId: null, mediaLayout: "NONE" }
    };
  }

  function normalizePaperSlotState(s){
    if(!s) return;
    if(!Array.isArray(s.queue)) s.queue = [];
    const prefs = ensureOperatorPrefs(s);
    const retired = new Set(prefs.retiredPaperSlots);
    let nextNumber = 1;
    let maxNumber = prefs.paperSlotCount;
    const reservedNumbers = new Set(
      s.queue
        .filter(isPaperSlot)
        .map(paperSlotNumber)
        .filter(Boolean)
    );

    for(const slot of s.queue){
      if(!slot || typeof slot !== "object") continue;
      if(isPaperSlot(slot)){
        if(!paperSlotNumber(slot)){
          while(retired.has(nextNumber) || reservedNumbers.has(nextNumber)) nextNumber++;
          slot.paperSlotNumber = nextNumber;
          reservedNumbers.add(nextNumber);
          nextNumber++;
        }
        const n = paperSlotNumber(slot);
        if(n) maxNumber = Math.max(maxNumber, n);
        if(isPaperPlaceholder(slot)){
          slot.status = PAPER_EMPTY_STATUS;
          slot.isPlaceholder = true;
          slot.displayName = "";
          slot.notes = slot.notes || "";
        }else{
          slot.isPlaceholder = false;
          if(slot.status === PAPER_EMPTY_STATUS) slot.status = "QUEUED";
        }
      }else{
        delete slot.isPlaceholder;
      }
    }

    prefs.paperSlotCount = Math.max(PAPER_SLOT_DEFAULT_COUNT, maxNumber);

    const occupied = new Set(
      s.queue
        .filter(isPaperSlot)
        .map(paperSlotNumber)
        .filter(Boolean)
    );
    for(let n=1; n<=prefs.paperSlotCount; n++){
      if(occupied.has(n) || retired.has(n)) continue;
      s.queue.push(makePaperPlaceholder(n));
      occupied.add(n);
    }
  }

  function pruneLeadingEmptyPaperSlots(s){
    normalizePaperSlotState(s);
    const prefs = ensureOperatorPrefs(s);
    const retired = new Set(prefs.retiredPaperSlots);
    const activePaper = s.queue
      .filter(slot => isPaperSlot(slot) && !isDoneStatus(slot.status))
      .sort((a,b) => (paperSlotNumber(a) || 0) - (paperSlotNumber(b) || 0));

    for(const slot of activePaper){
      if(!isPaperPlaceholder(slot)) break;
      const n = paperSlotNumber(slot);
      if(n) retired.add(n);
      const idx = s.queue.findIndex(x => x && x.id === slot.id);
      if(idx >= 0) s.queue.splice(idx, 1);
    }
    prefs.retiredPaperSlots = Array.from(retired).sort((a,b) => a-b);
  }

  function addPaperSlots(s, count = PAPER_SLOT_ADD_COUNT){
    const prefs = ensureOperatorPrefs(s);
    prefs.paperSlotCount += Math.max(1, Math.round(Number(count) || PAPER_SLOT_ADD_COUNT));
    normalizePaperSlotState(s);
  }

  function movePaperSlotNumberInState(s, slotId, destinationNumber){
    normalizePaperSlotState(s);
    const dest = Math.round(Number(destinationNumber || 0));
    if(!Number.isFinite(dest) || dest <= 0) return false;

    const moving = (s.queue || []).find(x => x && x.id === slotId);
    if(!moving || !isPaperSlot(moving) || isDoneStatus(moving.status)) return false;

    const completedAtDest = (s.queue || []).some(x =>
      x && x.id !== slotId && isPaperSlot(x) && isDoneStatus(x.status) && paperSlotNumber(x) === dest
    );
    if(completedAtDest) return "completed";

    const prefs = ensureOperatorPrefs(s);
    if(dest > prefs.paperSlotCount){
      prefs.paperSlotCount = dest;
      normalizePaperSlotState(s);
    }
    prefs.retiredPaperSlots = (prefs.retiredPaperSlots || []).filter(n => n !== dest);

    const from = paperSlotNumber(moving);
    if(!from || from === dest) return true;

    const activePaper = (s.queue || []).filter(x =>
      x && x.id !== slotId && isPaperSlot(x) && !isDoneStatus(x.status)
    );

    if(dest < from){
      for(const slot of activePaper){
        const n = paperSlotNumber(slot);
        if(n && n >= dest && n < from) slot.paperSlotNumber = n + 1;
      }
    }else{
      for(const slot of activePaper){
        const n = paperSlotNumber(slot);
        if(n && n <= dest && n > from) slot.paperSlotNumber = n - 1;
      }
    }

    moving.paperSlotNumber = dest;
    return true;
  }

  function insertSpecialAfterPaperSlot(s, slot, paperNumber){
    if(!Array.isArray(s.queue)) s.queue = [];
    const n = Math.round(Number(paperNumber || 0));
    if(Number.isFinite(n) && n > 0){
      slot.afterPaperSlotNumber = n;
      let insertAt = -1;
      for(let i=0; i<s.queue.length; i++){
        const it = s.queue[i];
        if(paperSlotNumber(it) === n || Number(it?.afterPaperSlotNumber || 0) === n) insertAt = i;
      }
      if(insertAt >= 0){
        s.queue.splice(insertAt + 1, 0, slot);
        return;
      }
    }
    insertQueuedSlotSmart(s, slot);
  }

  function sortPaperQueue(s){
    normalizePaperSlotState(s);
    const done = s.queue.filter(x => isDoneStatus(x?.status)).slice()
      .sort((a,b) => (a.completedAt || 0) - (b.completedAt || 0));
    const active = s.queue.filter(x => !isDoneStatus(x?.status));
    const numbered = active.filter(isPaperSlot).sort((a,b) => (paperSlotNumber(a) || 0) - (paperSlotNumber(b) || 0));
    const specials = active.filter(x => !isPaperSlot(x));
    const unanchored = specials.filter(x => !Number.isFinite(Number(x.afterPaperSlotNumber || 0)));
    const byAfter = new Map();
    for(const sp of specials){
      const n = Math.round(Number(sp.afterPaperSlotNumber || 0));
      if(!Number.isFinite(n) || n <= 0) continue;
      if(!byAfter.has(n)) byAfter.set(n, []);
      byAfter.get(n).push(sp);
    }

    const next = [...unanchored];
    for(const slot of numbered){
      next.push(slot);
      const n = paperSlotNumber(slot);
      if(n && byAfter.has(n)) next.push(...byAfter.get(n));
    }
    s.queue = [...next, ...done];
  }

  // Select a performer in the queue, and apply sensible defaults for legacy/empty media settings.
  // If a slot has no uploaded image, no URL, and no explicit layout, default it to QR_ONLY so the
  // Viewer shows the default QR image (assets/OMJN-QR.png) without extra operator clicks.
  function selectSlot(slotId){
    selectedId = slotId;

    const slot = state.queue.find(x => x.id === slotId) || null;
    const donationUrl = slot?.media?.donationUrl;
    const hasUrl = (typeof donationUrl === "string") && donationUrl.trim() !== "";
    const hasUpload = !!slot?.media?.imageAssetId;
    const layout = slot?.media?.mediaLayout;

    const needsDefault = !!slot && !hasUrl && !hasUpload && (!layout || layout === "NONE");

    if(needsDefault){
      updateState(s => {
        const sl = s.queue.find(x => x.id === slotId);
        if(!sl) return;
        if(!sl.media) sl.media = { donationUrl:null, imageAssetId:null, mediaLayout:"NONE" };
        if(!sl.media.mediaLayout || sl.media.mediaLayout === "NONE"){
          sl.media.mediaLayout = "QR_ONLY";
        }
      }, { recordHistory:false });
    }else{
      render();
    }
  }

  // ---- Inline performer editor (Stage 2) ----
  function isTypingContext(el = document.activeElement){
    if(!el) return false;
    const tag = (el.tagName||"").toLowerCase();
    return tag === "input" || tag === "textarea" || tag === "select" || !!el.isContentEditable;
  }

  function openInlineEdit(slotId){
    // Editing implies selection (keeps highlights consistent)
    selectSlot(slotId);
    editingId = slotId;
    const slot = state.queue.find(x => x.id === slotId) || null;
    const media = slot?.media || { donationUrl:null, imageAssetId:null, mediaLayout:"NONE" };
    editDraft = {
      displayName: slot?.displayName || "",
      slotTypeId: isPaperPlaceholder(slot) ? "" : (slot?.slotTypeId || "musician"),
      customTypeLabel: slot?.customTypeLabel || "",
      minutesOverride: (slot?.minutesOverride ?? ""),
      notes: slot?.notes || "",
      donationUrl: (media.donationUrl || ""),
      mediaLayout: media.mediaLayout || "NONE",
      intermissionMessage: slot?.intermissionMessage || "",
    };
  }

  function closeInlineEdit(){
    editingId = null;
    editDraft = null;
  }

  function toggleInlineEdit(slotId){
    if(editingId === slotId){
      closeInlineEdit();
      render();
      return;
    }
    openInlineEdit(slotId);
    render();
  }

  function saveInlineEdit(slotId){
    if(!editDraft) return;
    const name = OMJN.sanitizeText(editDraft.displayName || "");
    const notes = String(editDraft.notes || "");
    const url = OMJN.sanitizeText(editDraft.donationUrl || "");
    const layout = String(editDraft.mediaLayout || "NONE");
    const intermissionMessage = String(editDraft.intermissionMessage || "").trim();

    const slotTypeId = String(editDraft.slotTypeId || "");
    const customLabel = OMJN.sanitizeText(editDraft.customTypeLabel || "");
    const moRaw = (editDraft.minutesOverride ?? "");
    let minutesOverride = null;
    if(String(moRaw).trim() !== ""){
      const n = Math.round(Number(moRaw));
      if(Number.isFinite(n) && n > 0) minutesOverride = n;
    }

    const currentSlot = state.queue.find(x => x.id === slotId);
    if(isPaperPlaceholder(currentSlot) && !name){
      alert("Performer name is required.");
      return;
    }
    if(isPaperPlaceholder(currentSlot) && !slotTypeId){
      alert("Choose a slot type.");
      return;
    }

    updateState(s => {
      const slot = s.queue.find(x => x.id === slotId);
      if(!slot) return;
      const wasPlaceholder = isPaperPlaceholder(slot);
      const prevName = OMJN.sanitizeText(slot.displayName || "");
      const prevType = String(slot.slotTypeId || "");
      const prevMedia = slot.media || { donationUrl:null, imageAssetId:null, mediaLayout:"NONE" };
      const prevUrl = OMJN.sanitizeText(prevMedia.donationUrl || "");
      const prevLayout = String(prevMedia.mediaLayout || "NONE");

      const identityChanged = (prevName !== name) || (prevType !== slotTypeId);

      slot.displayName = name;
      slot.slotTypeId = slotTypeId;
      if(wasPlaceholder){
        slot.status = "QUEUED";
        slot.isPlaceholder = false;
      }
      slot.minutesOverride = minutesOverride;
      slot.customTypeLabel = (slotTypeId === "custom") ? customLabel : "";
      slot.notes = notes;

      if(!slot.media) slot.media = { donationUrl:null, imageAssetId:null, mediaLayout:"NONE" };

      if(identityChanged){
        // Idiot-proofing: if identity changes (even spelling), prevent stale performer media from carrying over.
        // - always clear image uploads
        // - clear donation URL unless operator explicitly changed it
        // - reset layout to QR_ONLY unless operator explicitly changed it
        slot.media.imageAssetId = null;

        const draftUrl = url;
        slot.media.donationUrl = (draftUrl && draftUrl !== prevUrl) ? draftUrl : null;

        const draftLayout = layout;
        slot.media.mediaLayout = (draftLayout && draftLayout !== prevLayout) ? draftLayout : "QR_ONLY";
      }else{
        slot.media.donationUrl = url || null;
        slot.media.mediaLayout = layout;
      }


      // Special screens
      if(slotTypeId === "houseband"){
        slot.displayName = houseBandQueueTitle(name || slot.displayName || "");
        // Keep slot.hbSelections / slot.hbLineup (built via the House Band Set Builder modal).
      }else{
        try{ delete slot.hbSelections; }catch(_){ }
        try{ delete slot.hbLineup; }catch(_){ }
      }

      if(slotTypeId === "intermission"){
        slot.intermissionMessage = intermissionMessage || "WE'LL BE RIGHT BACK";
      }else{
        try{ delete slot.intermissionMessage; }catch(_){ }
      }
    });

    closeInlineEdit();
    render();
  }

  function cancelInlineEdit(){
    closeInlineEdit();
    render();
  }

  function notesPreviewData(txt, maxLines = 3){
    const lines = String(txt || "")
      .replace(/\r/g, "")
      .split(String.fromCharCode(10))
      .map(line => line.trim())
      .filter(Boolean);
    if(!lines.length) return { preview:"", full:"", hasMore:false };
    const previewLines = lines.slice(0, Math.max(1, maxLines));
    return {
      preview: previewLines.join(String.fromCharCode(10)),
      full: lines.join(String.fromCharCode(10)),
      hasMore: lines.length > previewLines.length
    };
  }

  function appendNotesPreview(root, notes){
    const data = notesPreviewData(notes);
    if(!data.preview || !root) return;
    const sub = document.createElement("div");
    sub.className = "qNotesSub";
    const text = document.createElement("span");
    text.textContent = data.preview;
    sub.appendChild(text);
    if(data.hasMore){
      const btn = document.createElement("button");
      btn.className = "btn tiny qNotesToggle";
      btn.type = "button";
      btn.textContent = "Show notes";
      btn.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();
        const expanded = sub.classList.toggle("isExpanded");
        text.textContent = expanded ? data.full : data.preview;
        btn.textContent = expanded ? "Hide notes" : "Show notes";
      });
      sub.appendChild(btn);
    }
    root.appendChild(sub);
  }

  function formatClockTime(ts){
    const n = Number(ts || 0);
    if(!Number.isFinite(n) || n <= 0) return "";
    return new Date(n).toLocaleTimeString([], { hour:"numeric", minute:"2-digit" });
  }

  function appendDoneKpis(meta, slot, scheduledMinutes){
    if(!meta || !slot) return;
    const wrap = document.createElement("span");
    wrap.className = "qDoneKpis";

    const add = (label, value, cls = "") => {
      if(!value) return;
      const item = document.createElement("span");
      item.className = `qDoneKpi ${cls}`.trim();
      item.textContent = `${label}: ${value}`;
      wrap.appendChild(item);
    };

    if(slot.noShow) add("Status", "NO SHOW", "qNoShowLabel");
    add("ETA", formatClockTime(slot.expectedStartAt));
    add("Start", formatClockTime(slot.actualStartedAt));
    add("End", formatClockTime(slot.actualEndedAt || slot.completedAt));

    const actualMs = Number(slot.actualDurationMs);
    const hasActual = Number.isFinite(actualMs) && actualMs > 0;
    const scheduledMs = Number(slot.scheduledDurationMs || 0) || (Number(scheduledMinutes || 0) * 60 * 1000);
    if(hasActual) add("Actual", OMJN.formatMMSS(actualMs));
    if(scheduledMs > 0) add("Scheduled", OMJN.formatMMSS(scheduledMs));
    if(hasActual && scheduledMs > 0) add("Over/Under", formatSignedDurationMs(actualMs - scheduledMs));

    if(wrap.childElementCount) meta.appendChild(wrap);
  }

  function houseBandQueueTitle(raw){
    const title = OMJN.sanitizeText(raw || "").trim();
    return title || "HOUSE BAND";
  }

  function houseBandLineupSummary(slot){
    const lineup = Array.isArray(slot?.hbLineup) ? slot.hbLineup : [];
    const pieces = lineup
      .map(x => OMJN.sanitizeText(x?.name || "").trim())
      .filter(Boolean)
      .slice(0, 4);
    if(pieces.length) return pieces.join(" • ");
    return "No lineup selected yet";
  }

  function normalizeQueueSpecialSlots(s){
    if(!s || !Array.isArray(s.queue)) return;
    for(const slot of s.queue){
      if(!slot || typeof slot !== "object") continue;
      if(String(slot.slotTypeId || "") === "houseband"){
        slot.displayName = houseBandQueueTitle(slot.displayName || "");
        if(!slot.hbSelections || typeof slot.hbSelections !== "object") slot.hbSelections = {};
        if(!Array.isArray(slot.hbLineup)) slot.hbLineup = OMJN.buildHouseBandLineupFromSelections(s, slot.hbSelections);
      }
      if(String(slot.slotTypeId || "") === "intermission"){
        const msg = String(slot.intermissionMessage || "").trim();
        if(!msg) slot.intermissionMessage = "WE'LL BE RIGHT BACK";
      }
    }
  }

  function skipSwapDown(slotId){
    if(state.currentSlotId && (state.phase === "LIVE" || state.phase === "PAUSED") && slotId === state.currentSlotId) return;
    // swap down one spot (clamped); uses existing queue constraints
    moveSlot(slotId, +1);
  }

  function markNoShow(slotId){
    if(state.currentSlotId && (state.phase === "LIVE" || state.phase === "PAUSED") && slotId === state.currentSlotId) return;
    const slot = state.queue.find(x => x.id === slotId);
    if(!slot || slot.status !== "QUEUED") return;
    const ok = confirm(`Mark "${slot.displayName}" as NO-SHOW and move to Completed?`);
    if(!ok) return;
    updateState(s => {
      const sl = s.queue.find(x => x.id === slotId);
      if(!sl) return;
      sl.status = "SKIPPED";
      sl.noShow = true;
      sl.completedAt = Date.now();
    });
  }

  async function handleImageUploadForSlot(slotId, file){
    if(!file) return;
    await handleImageUpload(file, slotId);
  }

  function buildInlineExpander(slot){
    const wrap = document.createElement("div");
    wrap.className = "qExpander";

    // Prevent row-click selection from stealing focus while editing
    const stopRowClick = (e) => { e.stopPropagation(); };
    wrap.addEventListener("mousedown", stopRowClick);
    wrap.addEventListener("click", stopRowClick);

    const grid = document.createElement("div");
    grid.className = "qExpGrid";

    const left = document.createElement("div");
    left.className = "col";

    const initialType = String(editDraft?.slotTypeId ?? slot.slotTypeId ?? "musician");

    // Intermission should not look like a performer editor:
    // Only allow Title, Duration, and Message.
    if(initialType === "intermission"){
      grid.style.gridTemplateColumns = "1fr";

      const fName = document.createElement("div");
      fName.className = "field";
      const lName = document.createElement("label");
      lName.textContent = "Title";
      const iName = document.createElement("input");
      iName.type = "text";
      iName.value = editDraft?.displayName ?? (slot.displayName || "");
      iName.addEventListener("input", () => { if(editDraft) editDraft.displayName = iName.value; });
      iName.addEventListener("keydown", (e) => {
        if(e.key === "Enter"){ e.preventDefault(); saveInlineEdit(slot.id); }
        if(e.key === "Escape"){ e.preventDefault(); cancelInlineEdit(); }
      });
      fName.appendChild(lName); fName.appendChild(iName);

      const fMins = document.createElement("div");
      fMins.className = "field";
      const lMins = document.createElement("label");
      lMins.textContent = "Duration (minutes)";
      const iMins = document.createElement("input");
      iMins.type = "number";
      iMins.min = "1";
      iMins.step = "1";
      iMins.placeholder = "10";
      iMins.value = String(editDraft?.minutesOverride ?? (slot.minutesOverride ?? ""));
      iMins.addEventListener("input", () => { if(editDraft) editDraft.minutesOverride = iMins.value; });
      iMins.addEventListener("keydown", (e) => {
        if(e.key === "Enter"){ e.preventDefault(); saveInlineEdit(slot.id); }
        if(e.key === "Escape"){ e.preventDefault(); cancelInlineEdit(); }
      });

      const quick = document.createElement("div");
      quick.className = "row";
      quick.style.gap = "8px";
      quick.style.marginTop = "8px";
      const mkBtn = (label, mins) => {
        const b = document.createElement("button");
        b.type = "button";
        b.className = "btn tiny";
        b.textContent = label;
        b.addEventListener("click", (e) => {
          e.preventDefault();
          iMins.value = String(mins);
          if(editDraft) editDraft.minutesOverride = String(mins);
        });
        return b;
      };
      quick.appendChild(mkBtn("5m", 5));
      quick.appendChild(mkBtn("10m", 10));
      quick.appendChild(mkBtn("15m", 15));
      quick.appendChild(mkBtn("Custom", ""));
      quick.lastChild.addEventListener("click", (e) => { e.preventDefault(); iMins.focus(); iMins.select?.(); });

      fMins.appendChild(lMins); fMins.appendChild(iMins); fMins.appendChild(quick);

      const fIM = document.createElement("div");
      fIM.className = "field";
      const lIM = document.createElement("label");
      lIM.textContent = "Message on screen";
      const tIM = document.createElement("textarea");
      tIM.rows = 3;
      tIM.placeholder = "WE'LL BE RIGHT BACK";
      tIM.value = String(editDraft?.intermissionMessage ?? (slot.intermissionMessage || ""));
      tIM.addEventListener("input", () => { if(editDraft) editDraft.intermissionMessage = tIM.value; });
      tIM.addEventListener("keydown", (e) => { if(e.key === "Escape"){ e.preventDefault(); cancelInlineEdit(); } });
      fIM.appendChild(lIM); fIM.appendChild(tIM);

      left.appendChild(fName);
      left.appendChild(fMins);
      left.appendChild(fIM);

      grid.appendChild(left);
      wrap.appendChild(grid);

      const actions = document.createElement("div");
      actions.className = "qExpActions";

      const btnCancel = document.createElement("button");
      btnCancel.className = "btn small";
      btnCancel.textContent = "Cancel";
      btnCancel.addEventListener("click", (e) => { e.preventDefault(); cancelInlineEdit(); });

      const btnSave = document.createElement("button");
      btnSave.className = "btn small";
      btnSave.textContent = "Save";
      btnSave.addEventListener("click", (e) => { e.preventDefault(); saveInlineEdit(slot.id); });

      actions.appendChild(btnCancel);
      actions.appendChild(btnSave);
      wrap.appendChild(actions);

      return wrap;
    }

    const fName = document.createElement("div");
    fName.className = "field";
    const lName = document.createElement("label");
    lName.textContent = "Name";
    const iName = document.createElement("input");
    iName.type = "text";
    iName.value = editDraft?.displayName ?? (slot.displayName || "");
    iName.addEventListener("input", () => { if(editDraft) editDraft.displayName = iName.value; });
    iName.addEventListener("keydown", (e) => {
      if(e.key === "Enter"){ e.preventDefault(); saveInlineEdit(slot.id); }
      if(e.key === "Escape"){ e.preventDefault(); cancelInlineEdit(); }
    });
    fName.appendChild(lName); fName.appendChild(iName);

    const fType = document.createElement("div");
    fType.className = "field";
    const lType = document.createElement("label");
    lType.textContent = "Slot Type";
    const selType = document.createElement("select");
    fillTypeSelect(selType, { includeDisabled:true });
    if(isPaperPlaceholder(slot)){
      const ph = document.createElement("option");
      ph.value = "";
      ph.textContent = "- CHOOSE A SLOT -";
      selType.insertBefore(ph, selType.firstChild);
    }
    selType.value = editDraft?.slotTypeId ?? (slot.slotTypeId || "musician");
    fType.appendChild(lType);
    fType.appendChild(selType);

    const fCustom = document.createElement("div");
    fCustom.className = "field";
    const lCustom = document.createElement("label");
    lCustom.textContent = "Custom Slot Label";
    const iCustom = document.createElement("input");
    iCustom.type = "text";
    iCustom.placeholder = "Custom";
    iCustom.value = editDraft?.customTypeLabel ?? (slot.customTypeLabel || "");
    iCustom.addEventListener("input", () => { if(editDraft) editDraft.customTypeLabel = iCustom.value; });
    iCustom.addEventListener("keydown", (e) => {
      if(e.key === "Enter"){ e.preventDefault(); saveInlineEdit(slot.id); }
      if(e.key === "Escape"){ e.preventDefault(); cancelInlineEdit(); }
    });
    fCustom.appendChild(lCustom); fCustom.appendChild(iCustom);

    function syncCustomVisibility(){
      const cur = String(selType.value || "");
      if(editDraft) editDraft.slotTypeId = cur;
      fCustom.style.display = (cur === "custom") ? "" : "none";
    }
    selType.addEventListener("change", () => {
      syncCustomVisibility();
    });
    syncCustomVisibility();

    const fMins = document.createElement("div");
    fMins.className = "field";
    const lMins = document.createElement("label");
    lMins.textContent = "Minutes Override";
    const iMins = document.createElement("input");
    iMins.type = "number";
    iMins.min = "1";
    iMins.step = "1";
    iMins.placeholder = "—";
    iMins.value = String(editDraft?.minutesOverride ?? (slot.minutesOverride ?? ""));
    iMins.addEventListener("input", () => { if(editDraft) editDraft.minutesOverride = iMins.value; });
    iMins.addEventListener("keydown", (e) => {
      if(e.key === "Enter"){ e.preventDefault(); saveInlineEdit(slot.id); }
      if(e.key === "Escape"){ e.preventDefault(); cancelInlineEdit(); }
    });
    fMins.appendChild(lMins); fMins.appendChild(iMins);



    // House Band Set (HOUSE BAND slots)
    const fHB = document.createElement("div");
    fHB.className = "field";
    const lHB = document.createElement("label");
    lHB.textContent = "House Band Set";

    const hbPrevNames = document.createElement("div");
    hbPrevNames.className = "small";
    hbPrevNames.style.opacity = ".90";
    hbPrevNames.style.marginTop = "4px";

    const hbPrevRoles = document.createElement("div");
    hbPrevRoles.className = "small";
    hbPrevRoles.style.opacity = ".75";
    hbPrevRoles.style.marginTop = "2px";

    const btnHbEdit = document.createElement("button");
    btnHbEdit.type = "button";
    btnHbEdit.className = "btn small";
    btnHbEdit.textContent = "Edit set…";
    btnHbEdit.style.marginTop = "8px";
    btnHbEdit.addEventListener("click", (e) => {
      e.preventDefault();
      openHbBuildModal({ mode: "edit", slotId: slot.id });
    });

    function syncHBPreview(){
      const lineup = Array.isArray(slot.hbLineup) ? slot.hbLineup : [];
      const names = lineup.map(x => String(x?.name || "").trim()).filter(Boolean).join(" • ");
      const roles = lineup.map(x => String(x?.instrumentLabel || x?.instrument || "").trim()).filter(Boolean).join(" • ");
      hbPrevNames.textContent = names || "No lineup selected yet";
      hbPrevRoles.textContent = roles || "";
    }
    syncHBPreview();

    fHB.appendChild(lHB);
    fHB.appendChild(hbPrevNames);
    fHB.appendChild(hbPrevRoles);
    fHB.appendChild(btnHbEdit);

    // Intermission message (INTERMISSION slots)
    const fIM = document.createElement("div");
    fIM.className = "field";
    const lIM = document.createElement("label");
    lIM.textContent = "Intermission Message";
    const tIM = document.createElement("textarea");
    tIM.rows = 2;
    tIM.placeholder = "WE'LL BE RIGHT BACK";
    tIM.value = String(editDraft?.intermissionMessage ?? (slot.intermissionMessage || ""));
    tIM.addEventListener("input", () => { if(editDraft) editDraft.intermissionMessage = tIM.value; });
    tIM.addEventListener("keydown", (e) => { if(e.key === "Escape"){ e.preventDefault(); cancelInlineEdit(); } });
    fIM.appendChild(lIM);
    fIM.appendChild(tIM);

    function syncSpecialFields(){
      const curType = String(selType.value || "");
      fHB.style.display = (curType === "houseband") ? "" : "none";
      fIM.style.display = (curType === "intermission") ? "" : "none";
    }
    selType.addEventListener("change", syncSpecialFields);
    syncSpecialFields();
    const fUrl = document.createElement("div");
    fUrl.className = "field";
    const lUrl = document.createElement("label");
    lUrl.textContent = "Website / Socials";
    const iUrl = document.createElement("input");
    iUrl.type = "text";
    iUrl.placeholder = "https://... or @handle";
    iUrl.value = editDraft?.donationUrl ?? (slot.media?.donationUrl || "");
    iUrl.addEventListener("input", () => { if(editDraft) editDraft.donationUrl = iUrl.value; });
    iUrl.addEventListener("keydown", (e) => {
      if(e.key === "Enter"){ e.preventDefault(); saveInlineEdit(slot.id); }
      if(e.key === "Escape"){ e.preventDefault(); cancelInlineEdit(); }
    });
    fUrl.appendChild(lUrl); fUrl.appendChild(iUrl);

    const fNotes = document.createElement("div");
    fNotes.className = "field";
    const lNotes = document.createElement("label");
    lNotes.textContent = "Operator Notes (private)";
    const tNotes = document.createElement("textarea");
    tNotes.rows = 3;
    tNotes.value = editDraft?.notes ?? (slot.notes || "");
    tNotes.addEventListener("input", () => { if(editDraft) editDraft.notes = tNotes.value; });
    tNotes.addEventListener("keydown", (e) => {
      if(e.key === "Escape"){ e.preventDefault(); cancelInlineEdit(); }
      // Enter should create a newline in textarea (do not save)
    });
    fNotes.appendChild(lNotes); fNotes.appendChild(tNotes);

    left.appendChild(fName);
    left.appendChild(fType);
    left.appendChild(fCustom);
    left.appendChild(fMins);
    left.appendChild(fUrl);
    left.appendChild(fNotes);

    const right = document.createElement("div");
    right.className = "col";

    const fLayout = document.createElement("div");
    fLayout.className = "field";
    const lLayout = document.createElement("label");
    lLayout.textContent = "Media Layout";
    const sel = document.createElement("select");
    const opts = [
      ["NONE","None"],
      ["IMAGE_ONLY","Image only"],
      ["QR_ONLY","QR only (upload image)"],
      ["IMAGE_PLUS_QR","Image + QR (upload image)"]
    ];
    for(const [v, label] of opts){
      const o = document.createElement("option");
      o.value = v;
      o.textContent = label;
      sel.appendChild(o);
    }
    sel.value = editDraft?.mediaLayout ?? (slot.media?.mediaLayout || "NONE");
    sel.addEventListener("change", () => { if(editDraft) editDraft.mediaLayout = sel.value; });
    fLayout.appendChild(lLayout); fLayout.appendChild(sel);

    const fImg = document.createElement("div");
    fImg.className = "field";
    const lImg = document.createElement("label");
    lImg.textContent = "Image / QR";
    const row = document.createElement("div");
    row.className = "row";
    row.style.gap = "8px";

    const upLbl = document.createElement("label");
    upLbl.className = "btn small";
    upLbl.style.cursor = "pointer";
    const inputId = `imgFile_${slot.id}`;
    upLbl.setAttribute("for", inputId);
    upLbl.textContent = "Upload";

    const up = document.createElement("input");
    up.type = "file";
    up.accept = "image/*";
    up.id = inputId;
    up.hidden = true;
    up.addEventListener("change", async () => {
      const file = up.files?.[0] || null;
      up.value = "";
      if(file) await handleImageUpload(file, slot.id);
    });

    const btnClear = document.createElement("button");
    btnClear.className = "btn small";
    btnClear.textContent = "Clear";
    btnClear.disabled = !slot.media?.imageAssetId;
    btnClear.addEventListener("click", (e) => { e.preventDefault(); clearImage(slot.id); });

    row.appendChild(upLbl);
    row.appendChild(up);
    row.appendChild(btnClear);

    fImg.appendChild(lImg);
    fImg.appendChild(row);

    if(slot.media?.imageAssetId){
      const tiny = document.createElement("div");
      tiny.className = "small";
      tiny.style.marginTop = "6px";
      tiny.textContent = "Image uploaded";
      fImg.appendChild(tiny);
    }

    right.appendChild(fLayout);
    right.appendChild(fImg);

    grid.appendChild(left);
    grid.appendChild(right);
    wrap.appendChild(grid);

    const actions = document.createElement("div");
    actions.className = "qExpActions";

    const btnCancel = document.createElement("button");
    btnCancel.className = "btn small";
    btnCancel.textContent = "Cancel";
    btnCancel.addEventListener("click", (e) => { e.preventDefault(); cancelInlineEdit(); });

    const btnSave = document.createElement("button");
    btnSave.className = "btn small";
    btnSave.textContent = "Save";
    btnSave.addEventListener("click", (e) => { e.preventDefault(); saveInlineEdit(slot.id); });

    actions.appendChild(btnCancel);
    actions.appendChild(btnSave);
    wrap.appendChild(actions);

    return wrap;
  }


  function publish(){
    OMJN.publish(state);
  }

  function setState(next){
    OMJN.ensureHouseBandQueues(next);
    normalizeQueueSpecialSlots(next);

    state = next;
    OMJN.applyThemeToDocument(document, state);
    publish();
    render();
  }

  function cloneState(obj){
    try{
      if(typeof structuredClone === "function") return structuredClone(obj);
    }catch(_){}
    // Fallback for older browsers
    return JSON.parse(JSON.stringify(obj));
  }

  function updateState(mutator, opts={}){
    const recordHistory = opts.recordHistory !== false;
    if(recordHistory && !isApplyingHistory) pushUndoSnapshot();
    const s = cloneState(state);
    OMJN.ensureHouseBandQueues(s);
    // Ensure performer queue exists so mutators can push safely
    if(!Array.isArray(s.queue)) s.queue = [];
    mutator(s);
    normalizeQueueSpecialSlots(s);
    normalizePerformerQueue(s);
    setState(s);
  }

  
  
  function normalizePerformerQueue(s){
    if(!Array.isArray(s.queue)) s.queue = [];
    sortPaperQueue(s);
  }

function clamp(n, min, max){ return Math.max(min, Math.min(max, n)); }

  const TRANSITION_SAMPLE_LIMIT = 8;
  const TRANSITION_SAMPLE_MAX_SEC = 20 * 60;

  function ensureTransitionForecastState(s){
    const d = OMJN.defaultState().transitionForecast || {};
    if(!s.transitionForecast) s.transitionForecast = JSON.parse(JSON.stringify(d));
    const tf = s.transitionForecast;
    tf.defaultBufferSec = clamp(Math.round(Number(tf.defaultBufferSec ?? d.defaultBufferSec ?? 300) || 0), 0, 900);
    tf.manualAdjustSec = clamp(Math.round(Number(tf.manualAdjustSec ?? d.manualAdjustSec ?? 0) || 0), -300, 300);
    if(tf.autoLearn === undefined) tf.autoLearn = true;
    if(!Array.isArray(tf.observedSamplesSec)) tf.observedSamplesSec = [];
    tf.observedSamplesSec = tf.observedSamplesSec
      .map(v => Math.round(Number(v)))
      .filter(v => Number.isFinite(v) && v >= 0 && v <= TRANSITION_SAMPLE_MAX_SEC)
      .slice(-TRANSITION_SAMPLE_LIMIT);
    if(!Number.isFinite(Number(tf.pendingStartedAt))) tf.pendingStartedAt = null;
    if(tf.pendingFromSlotId === undefined) tf.pendingFromSlotId = null;
    return tf;
  }

  function getTransitionForecastCfg(s=state){
    return ensureTransitionForecastState(s);
  }

  function formatSignedDurationMs(ms){
    const sign = ms < 0 ? "-" : "+";
    return `${sign}${OMJN.formatMMSS(Math.abs(ms || 0))}`;
  }

  function computeMedianSec(values){
    const list = (values || []).slice().sort((a, b) => a - b);
    if(!list.length) return null;
    const mid = Math.floor(list.length / 2);
    if(list.length % 2) return list[mid];
    return Math.round((list[mid - 1] + list[mid]) / 2);
  }

  function getTransitionForecastStats(s=state){
    const cfg = getTransitionForecastCfg(s);
    const samples = Array.isArray(cfg.observedSamplesSec) ? cfg.observedSamplesSec : [];
    const learnedMedianSec = samples.length ? computeMedianSec(samples) : null;
    const baseSec = Math.max(0, cfg.defaultBufferSec + cfg.manualAdjustSec);
    let forecastSec = baseSec;
    if(cfg.autoLearn && learnedMedianSec !== null){
      const weight = Math.min(samples.length, 5) / 5;
      forecastSec = Math.max(0, Math.round((baseSec * (1 - weight)) + (learnedMedianSec * weight)));
    }
    return {
      baseSec,
      forecastSec,
      learnedMedianSec,
      observedCount: samples.length,
      manualAdjustSec: cfg.manualAdjustSec,
      autoLearn: cfg.autoLearn !== false,
      pendingStartedAt: cfg.pendingStartedAt,
      pendingFromSlotId: cfg.pendingFromSlotId,
    };
  }

  function getPendingTransitionRemainingMs(nextSlot, nowMs, forecastTransitionMs, tfStats){
    if(!nextSlot || !slotNeedsChangeoverBuffer(nextSlot)) return 0;
    const startedAt = Number(tfStats?.pendingStartedAt || 0);
    const fromId = String(tfStats?.pendingFromSlotId || "");
    if(!startedAt || !fromId || !(forecastTransitionMs > 0)) return 0;
    const prevSlot = (state.queue || []).find(x => x && x.id === fromId) || null;
    if(!prevSlot || !slotNeedsChangeoverBuffer(prevSlot)) return 0;
    const elapsedMs = Math.max(0, Number(nowMs || Date.now()) - startedAt);
    return Math.max(0, forecastTransitionMs - elapsedMs);
  }

  function clearPendingTransitionForecast(s){
    const tf = ensureTransitionForecastState(s);
    tf.pendingStartedAt = null;
    tf.pendingFromSlotId = null;
  }

  function markTransitionPendingFromSlot(s, slot, atMs = Date.now()){
    const tf = ensureTransitionForecastState(s);
    if(slot && slotNeedsChangeoverBuffer(slot)){
      tf.pendingStartedAt = atMs;
      tf.pendingFromSlotId = slot.id;
    }else{
      clearPendingTransitionForecast(s);
    }
  }

  function recordObservedTransitionForStart(s, nextSlot, atMs = Date.now()){
    const tf = ensureTransitionForecastState(s);
    const startedAt = Number(tf.pendingStartedAt || 0);
    const fromId = String(tf.pendingFromSlotId || "");
    if(!startedAt || !fromId || !nextSlot){
      clearPendingTransitionForecast(s);
      return;
    }
    const prevSlot = (s.queue || []).find(x => x && x.id === fromId) || null;
    if(!prevSlot || !slotNeedsChangeoverBuffer(prevSlot) || !slotNeedsChangeoverBuffer(nextSlot)){
      clearPendingTransitionForecast(s);
      return;
    }
    const sampleSec = Math.round((atMs - startedAt) / 1000);
    if(Number.isFinite(sampleSec) && sampleSec >= 0 && sampleSec <= TRANSITION_SAMPLE_MAX_SEC){
      tf.observedSamplesSec.push(sampleSec);
      tf.observedSamplesSec = tf.observedSamplesSec.slice(-TRANSITION_SAMPLE_LIMIT);
    }
    clearPendingTransitionForecast(s);
  }

function formatCutSeconds(sec){
  const s = Math.max(0, Number(sec)||0);
  const m = Math.floor(s / 60);
  const r = s - m*60;
  const mm = String(m);
  const ss = String(Math.floor(r)).padStart(2, "0");
  const ms = String(Math.round((r - Math.floor(r)) * 100)).padStart(2, "0");
  return `${s.toFixed(2)}s ( ${mm}:${ss}.${ms} )`;
}


// HTML-escape helper used by renderSettings()
function escapeHtml(s){
  return String(s || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

  function renderSlotTypesEditor(){
    if(!els.slotTypesEditor) return;
    els.slotTypesEditor.innerHTML = "";
    const order = ["musician","comedian","comedian5","jamaoke","poetry","custom"];
    const types = [...(state.slotTypes||[])].sort((a,b)=>{
      const ia = order.indexOf(a.id); const ib = order.indexOf(b.id);
      if(ia===-1 && ib===-1) return String(a.label).localeCompare(String(b.label));
      if(ia===-1) return 1;
      if(ib===-1) return -1;
      return ia-ib;
    });

    for(const t of types){
      const row = document.createElement("div");
      row.className = "slotTypeRow";
      row.dataset.id = t.id;

      const dot = document.createElement("div");
      dot.className = "slotTypeDot";
      dot.style.background = t.color || "#00c2ff";
      row.appendChild(dot);

      const fEn = document.createElement("div");
      fEn.className = "field";
      fEn.style.flex = "0 0 auto";
      const labEn = document.createElement("label");
      labEn.textContent = "On";
      const cb = document.createElement("input");
      cb.type = "checkbox";
      cb.checked = (t.enabled !== false);
      cb.disabled = (t.id === "custom");
      cb.addEventListener("change", () => {
        updateState(s => {
          const tt = s.slotTypes.find(x=>x.id===t.id);
          if(tt) tt.enabled = cb.checked;
        }, { recordHistory:false });
      });
      fEn.appendChild(labEn);
      fEn.appendChild(cb);
      row.appendChild(fEn);

      const fColor = document.createElement("div");
      fColor.className = "field";
      fColor.style.flex = "0 0 120px";
      const labC = document.createElement("label");
      labC.textContent = "Color";
      const col = document.createElement("input");
      col.type = "color";
      col.value = t.color || "#00c2ff";
      col.addEventListener("input", () => {
        dot.style.background = col.value;
        updateState(s => {
          const tt = s.slotTypes.find(x=>x.id===t.id);
          if(tt) tt.color = col.value;
        }, { recordHistory:false });
      });
      fColor.appendChild(labC);
      fColor.appendChild(col);
      row.appendChild(fColor);

      const fLabel = document.createElement("div");
      fLabel.className = "field";
      fLabel.style.flex = "1 1 220px";
      const labL = document.createElement("label");
      labL.textContent = "Title";
      const inpL = document.createElement("input");
      inpL.type = "text";
      inpL.value = t.label || t.id;
      inpL.addEventListener("input", () => {
        updateState(s => {
          const tt = s.slotTypes.find(x=>x.id===t.id);
          if(tt) tt.label = inpL.value;
        }, { recordHistory:false });
      });
      fLabel.appendChild(labL);
      fLabel.appendChild(inpL);
      row.appendChild(fLabel);

      const fMin = document.createElement("div");
      fMin.className = "field";
      fMin.style.flex = "0 0 140px";
      const labM = document.createElement("label");
      labM.textContent = "Default (min)";
      const inpM = document.createElement("input");
      inpM.type = "number";
      inpM.min = "1";
      inpM.step = "1";
      inpM.value = String(t.defaultMinutes ?? 15);
      inpM.addEventListener("change", () => {
        const val = clamp(parseInt(inpM.value||"0",10) || 0, 1, 240);
        inpM.value = String(val);
        updateState(s => {
          const tt = s.slotTypes.find(x=>x.id===t.id);
          if(tt) tt.defaultMinutes = val;
        }, { recordHistory:false });
      });
      fMin.appendChild(labM);
      fMin.appendChild(inpM);

      row.appendChild(fMin);

      els.slotTypesEditor.appendChild(row);
    }
  }



  // ---- Crowd Prompts (Operator settings + quick controls) ----
  let crowdAutoHideTimeout = null;
  let lastCrowdEditorKey = null;
  let lastCrowdAutoKey = null;

  function ensureCrowdDefaults(s){
    s.viewerPrefs = s.viewerPrefs || {};
    const d = OMJN.defaultState();
    if(!s.viewerPrefs.crowdPrompts) s.viewerPrefs.crowdPrompts = JSON.parse(JSON.stringify(d.viewerPrefs.crowdPrompts));
    else {
      const c = s.viewerPrefs.crowdPrompts;
      const cd = d.viewerPrefs.crowdPrompts;
      for(const k of Object.keys(cd)){ if(c[k] === undefined) c[k] = cd[k]; }
      if(!Array.isArray(c.presets) || !c.presets.length) c.presets = JSON.parse(JSON.stringify(cd.presets));
      // Ensure preset shapes (merge defaults by id)
      const byId = new Map((cd.presets || []).map(p => [p.id, p]));
      c.presets = (c.presets || []).map(p => Object.assign({}, byId.get(p.id) || {}, p || {}));
    }
    const c = s.viewerPrefs.crowdPrompts;
    if(!Array.isArray(c.presets) || !c.presets.length){
      c.presets = JSON.parse(JSON.stringify(OMJN.defaultState().viewerPrefs.crowdPrompts.presets));
    }
    if(!c.activePresetId || !c.presets.some(p => p.id === c.activePresetId)){
      c.activePresetId = c.presets[0]?.id || OMJN.defaultState().viewerPrefs.crowdPrompts.activePresetId;
    }
  }

  function getCrowdCfg(s=state){
    const d = OMJN.defaultState();
    return (s.viewerPrefs && s.viewerPrefs.crowdPrompts) ? s.viewerPrefs.crowdPrompts : d.viewerPrefs.crowdPrompts;
  }

  function getActiveCrowdPreset(cfg){
    const presets = cfg?.presets || [];
    const id = cfg?.activePresetId;
    return presets.find(p => p.id === id) || presets[0] || null;
  }

  function clearCrowdAutoHide(){
    if(crowdAutoHideTimeout){
      clearTimeout(crowdAutoHideTimeout);
      crowdAutoHideTimeout = null;
    }
  }

  function scheduleCrowdAutoHide(){
    clearCrowdAutoHide();
    const cfg = getCrowdCfg(state);
    if(!cfg?.enabled) return;
    const p = getActiveCrowdPreset(cfg);
    const sec = clamp(parseInt(String(p?.autoHideSeconds ?? 0), 10) || 0, 0, 60);
    if(sec <= 0) return;
    crowdAutoHideTimeout = setTimeout(() => {
      updateState(s => { ensureCrowdDefaults(s); s.viewerPrefs.crowdPrompts.enabled = false; }, { recordHistory:false });
    }, sec * 1000);
  }

  function syncCrowdAutoHide(){
    const cfg = getCrowdCfg(state);
    const p = getActiveCrowdPreset(cfg);
    const key = JSON.stringify({
      enabled: !!cfg.enabled,
      presetId: cfg.activePresetId,
      autoHideSeconds: p?.autoHideSeconds
    });
    if(key == lastCrowdAutoKey) return;
    lastCrowdAutoKey = key;
    if(!cfg.enabled){
      clearCrowdAutoHide();
      return;
    }
    scheduleCrowdAutoHide();
  }

  function cycleCrowdPreset(dir){
    const cfg = getCrowdCfg(state);
    const presets = cfg?.presets || [];
    if(presets.length < 2) return;
    const idx = Math.max(0, presets.findIndex(p => p.id === cfg.activePresetId));
    const next = (idx + (dir > 0 ? 1 : -1) + presets.length) % presets.length;
    const nextId = presets[next].id;
    updateState(s => { ensureCrowdDefaults(s); s.viewerPrefs.crowdPrompts.activePresetId = nextId; }, { recordHistory:false });
    // If currently showing, restart timer on preset swap
    scheduleCrowdAutoHide();
    updateCrowdQuickButtons();
    renderCrowdPromptPreview();
  }

  function setCrowdEnabled(on){
    updateState(s => { ensureCrowdDefaults(s); s.viewerPrefs.crowdPrompts.enabled = !!on; }, { recordHistory:false });
    scheduleCrowdAutoHide();
  }

  // Crowd prompt editor state
  let crowdEditorReadFn = null;
  let crowdEditorDirty = false;
  let crowdEditorReturnFocusEl = null;

  function isCrowdEditorOpen(){
    return !!els.crowdEditorModal && !els.crowdEditorModal.hidden;
  }

  function getFocusableWithin(root){
    if(!root) return [];
    return Array.from(root.querySelectorAll('button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'))
      .filter(node => !node.hidden && node.getAttribute("aria-hidden") !== "true" && node.offsetParent !== null);
  }

  function refreshModalOpenClass(){
    const anyOpen = [
      els.settingsModal,
      els.crowdEditorModal,
      els.timerUpModal,
      els.intermissionModal,
      els.adModal,
      els.hbBuildModal
    ].some(node => node && !node.hidden);
    document.body.classList.toggle("modalOpen", anyOpen);
  }



  function updateCrowdQuickButtons(){
      if(!els.btnCrowdToggle) return;

      const cfg = getCrowdCfg(state);
      const p = getActiveCrowdPreset(cfg);
      const presets = Array.isArray(cfg.presets) ? cfg.presets : [];
      const idx = Math.max(0, presets.findIndex(x => x.id === cfg.activePresetId));
      const displayIdx = presets.length ? `${idx+1}/${presets.length}` : "—";
      const name = (p?.name || p?.title || "Prompt").trim();
      const title = (p?.title || "CROWD PROMPT").trim();
      const autoHide = (p?.autoHideSeconds ?? 0) | 0;
      const lineCount = Array.isArray(p?.lines) ? p.lines.filter(Boolean).length : 0;
      const editorOpen = isCrowdEditorOpen();

      if(cfg.enabled){
        els.btnCrowdToggle.textContent = "Hide Prompt";
        els.btnCrowdToggle.classList.add("good");
        els.btnCrowdToggle.title = `Hide crowd prompt (${name})`;
      }else{
        els.btnCrowdToggle.textContent = "Show Prompt";
        els.btnCrowdToggle.classList.remove("good");
        els.btnCrowdToggle.title = `Show crowd prompt (${name})`;
      }
      els.btnCrowdToggle.setAttribute("aria-pressed", cfg.enabled ? "true" : "false");

      if(els.crowdStatusPill){
        els.crowdStatusPill.textContent = cfg.enabled ? "ON" : "OFF";
        els.crowdStatusPill.classList.toggle("on", !!cfg.enabled);
        els.crowdStatusPill.classList.toggle("off", !cfg.enabled);
      }
      if(els.crowdStatusName) els.crowdStatusName.textContent = name || "—";
      if(els.crowdStatusMeta) els.crowdStatusMeta.textContent = displayIdx;
      if(els.crowdStatusAutoHide) els.crowdStatusAutoHide.textContent = `Auto-hide: ${autoHide ? autoHide + "s" : "off"}`;
      if(els.crowdDraftBadge) els.crowdDraftBadge.hidden = !crowdEditorDirty;
      if(els.crowdPresetHeroName) els.crowdPresetHeroName.textContent = name || "Prompt";
      if(els.crowdPresetHeroTitle) els.crowdPresetHeroTitle.textContent = title || "CROWD PROMPT";
      if(els.crowdPresetHeroAutoHide) els.crowdPresetHeroAutoHide.textContent = autoHide ? `${autoHide}s` : "off";
      if(els.crowdPresetHeroLineCount) els.crowdPresetHeroLineCount.textContent = String(lineCount);
      if(els.crowdPresetHeroState){
        els.crowdPresetHeroState.textContent = cfg.enabled ? "LIVE" : "READY";
        els.crowdPresetHeroState.classList.toggle("isOn", !!cfg.enabled);
      }
      if(els.crowdEditorSubtitle){
        els.crowdEditorSubtitle.textContent = `${name || "Prompt"} · ${displayIdx} · Auto-hide ${autoHide ? autoHide + "s" : "off"}`;
      }

      const lockCycle = !!crowdEditorDirty;
      if(els.btnCrowdPrev) els.btnCrowdPrev.disabled = lockCycle;
      if(els.btnCrowdNext) els.btnCrowdNext.disabled = lockCycle;
      if(els.btnCrowdEditToggle){
        els.btnCrowdEditToggle.classList.toggle("primary", editorOpen);
        els.btnCrowdEditToggle.textContent = editorOpen ? "Editing…" : "Edit preset";
        els.btnCrowdEditToggle.setAttribute("aria-expanded", editorOpen ? "true" : "false");
      }
      if(els.btnSettingsOpenCrowdEditor){
        els.btnSettingsOpenCrowdEditor.classList.toggle("primary", editorOpen);
        els.btnSettingsOpenCrowdEditor.setAttribute("aria-expanded", editorOpen ? "true" : "false");
      }
      if(els.btnCrowdDelete){
        const locked = presets.length <= 1;
        els.btnCrowdDelete.disabled = locked;
        els.btnCrowdDelete.title = locked ? "Keep at least one prompt preset." : "Delete the selected preset";
      }

      // Legacy status element (if present)
      if(els.crowdPromptStatus){
        els.crowdPromptStatus.textContent = `${cfg.enabled ? "ON" : "OFF"} · ${name}`;
        els.crowdPromptStatus.classList.toggle("on", !!cfg.enabled);
        els.crowdPromptStatus.classList.toggle("off", !cfg.enabled);
      }
    }

  function wireCrowdEditorInteractions(){
      if(els.crowdEditorPanel){
        els.crowdEditorPanel.addEventListener("mousedown", e => e.stopPropagation());
        els.crowdEditorPanel.addEventListener("click", e => e.stopPropagation());
      }
      if(els.crowdEditorModal){
        els.crowdEditorModal.addEventListener("mousedown", (e) => {
          if(e.target === els.crowdEditorModal) closeCrowdEditor(false);
        });
        els.crowdEditorModal.addEventListener("keydown", (e) => {
          if(e.key === "Escape"){
            e.preventDefault();
            closeCrowdEditor(false);
            return;
          }
          if(e.key !== "Tab") return;
          const focusables = getFocusableWithin(els.crowdEditorModal);
          if(!focusables.length) return;
          const first = focusables[0];
          const last = focusables[focusables.length - 1];
          if(e.shiftKey && document.activeElement === first){
            e.preventDefault();
            last.focus();
          }else if(!e.shiftKey && document.activeElement === last){
            e.preventDefault();
            first.focus();
          }
        });
      }

      const onDirty = () => {
        if(!isCrowdEditorOpen()) return;
        setCrowdEditorDirty(true);
        renderCrowdPromptPreview();
      };

      for(const el of [els.crowdPresetName, els.crowdTitle, els.crowdFooter, els.crowdAutoHide, els.crowdLines]){
        if(!el) continue;
        el.addEventListener("input", onDirty);
        el.addEventListener("change", onDirty);
      }

      if(els.btnCrowdEditToggle){
        els.btnCrowdEditToggle.addEventListener("click", () => {
          openCrowdEditor(els.btnCrowdEditToggle);
        });
      }

      if(els.btnSettingsOpenCrowdEditor){
        els.btnSettingsOpenCrowdEditor.addEventListener("click", () => {
          closeSettingsModal();
          openCrowdEditor(els.btnSettingsOpenCrowdEditor);
        });
      }

      if(els.btnCrowdEditorClose){
        els.btnCrowdEditorClose.addEventListener("click", () => closeCrowdEditor(false));
      }

      if(els.btnCrowdCancel){
        els.btnCrowdCancel.addEventListener("click", () => closeCrowdEditor(false));
      }
    }


  function setCrowdEditorDirty(on){
      crowdEditorDirty = !!on;
      updateCrowdQuickButtons();
    }


  function loadCrowdEditorFromActivePreset(){
      const cfg = getCrowdCfg(state);
      const p = getActiveCrowdPreset(cfg) || {};
      if(els.crowdPresetName) els.crowdPresetName.value = p.name || "";
      if(els.crowdTitle) els.crowdTitle.value = p.title || "";
      if(els.crowdFooter) els.crowdFooter.value = p.footer || "";
      if(els.crowdAutoHide) els.crowdAutoHide.value = String((p.autoHideSeconds ?? 0) | 0);
      if(els.crowdLines) els.crowdLines.value = Array.isArray(p.lines) ? p.lines.join("\n") : "";
    }


  function closeCrowdEditor(force=false){
      if(!els.crowdEditorModal) return;
      if(!force && crowdEditorDirty){
        const ok = confirm("Discard unsaved crowd prompt edits?");
        if(!ok) return;
      }
      els.crowdEditorModal.hidden = true;
      refreshModalOpenClass();
      setCrowdEditorDirty(false);
      renderCrowdPromptPreview();
      const focusEl = crowdEditorReturnFocusEl;
      crowdEditorReturnFocusEl = null;
      setTimeout(() => { focusEl?.focus?.(); }, 0);
    }


  function openCrowdEditor(returnFocusEl=null){
      if(!els.crowdEditorModal) return;
      if(isCrowdEditorOpen()){
        if(returnFocusEl && !crowdEditorReturnFocusEl) crowdEditorReturnFocusEl = returnFocusEl;
        setTimeout(() => { els.crowdPresetName?.focus?.(); }, 0);
        return;
      }
      crowdEditorReturnFocusEl = returnFocusEl || document.activeElement;
      els.crowdEditorModal.hidden = false;
      refreshModalOpenClass();
      loadCrowdEditorFromActivePreset();
      setCrowdEditorDirty(false);
      renderCrowdPromptPreview();
      setTimeout(() => { els.crowdPresetName?.focus?.(); }, 0);
    }


// ---- Sponsor Bug (Operator settings) ----
  const SPONSOR_VIEWER_STATUS_KEY = OMJN.scopedKey("sponsorBug.viewerStatus.v1");
  let sponsorPreviewObjectUrl = null;
  let lastSponsorPreviewKey = null;

  function setSponsorStatus(msg, isErr=false){
    if(!els.sponsorBugStatus) return;
    els.sponsorBugStatus.textContent = msg || "—";
    els.sponsorBugStatus.style.color = isErr ? "var(--danger,#ff6b6b)" : "";
  }

  function clearSponsorPreview(){
    if(sponsorPreviewObjectUrl){
      try{ URL.revokeObjectURL(sponsorPreviewObjectUrl); }catch(_){}
      sponsorPreviewObjectUrl = null;
    }
    if(els.sponsorBugPreview) els.sponsorBugPreview.src = "";
  }

  function clampNum(n, min, max){
    const v = Number(n);
    if(!Number.isFinite(v)) return min;
    return Math.max(min, Math.min(max, v));
  }

  function getSponsorCfg(s=state){
    const d = OMJN.defaultState();
    const cfg = (s.viewerPrefs && s.viewerPrefs.sponsorBug) ? s.viewerPrefs.sponsorBug : (d.viewerPrefs && d.viewerPrefs.sponsorBug) || {};
    return cfg;
  }

  function testImageUrl(url){
    return new Promise(resolve => {
      const img = new Image();
      img.onload = () => resolve(true);
      img.onerror = () => resolve(false);
      img.src = url;
    });
  }

  async function updateSponsorPreviewAndStatus(){
    const cfg = getSponsorCfg(state);
    const key = JSON.stringify({
      enabled: !!cfg.enabled,
      liveOnly: !!cfg.showLiveOnly,
      sourceType: cfg.sourceType || "upload",
      uploadAssetId: cfg.uploadAssetId || null,
      url: String(cfg.url || "").trim(),
      position: cfg.position || "TR",
      scale: cfg.scale,
      opacity: cfg.opacity,
      safeMargin: cfg.safeMargin,
    });
    if(key === lastSponsorPreviewKey) return;
    lastSponsorPreviewKey = key;

    if(!cfg.enabled){
      clearSponsorPreview();
      setSponsorStatus("Disabled");
      return;
    }

    const url = String(cfg.url || "").trim();
    const hasUrl = !!url;
    const hasUpload = !!cfg.uploadAssetId;

    const order = (cfg.sourceType === "url") ? ["url", "upload"] : ["upload", "url"];
    let ok = false;
    let used = null;
    let err = null;

    for(const mode of order){
      if(mode === "upload" && hasUpload){
        try{
          const blob = await OMJN.getAsset(cfg.uploadAssetId);
          if(blob){
            clearSponsorPreview();
            sponsorPreviewObjectUrl = URL.createObjectURL(blob);
            if(els.sponsorBugPreview) els.sponsorBugPreview.src = sponsorPreviewObjectUrl;
            ok = true; used = "upload";
            break;
          }
        }catch(e){ err = e; }
      }
      if(mode === "url" && hasUrl){
        const works = await testImageUrl(url);
        if(works){
          clearSponsorPreview();
          if(els.sponsorBugPreview) els.sponsorBugPreview.src = url;
          ok = true; used = "url";
          break;
        }
      }
    }
    if(!ok){
      clearSponsorPreview();
      if(hasUpload && !hasUrl){
        setSponsorStatus("Upload missing", true);
      }else if(hasUrl && !hasUpload){
        setSponsorStatus("Bad URL/path", true);
      }else{
        setSponsorStatus("Missing source", true);
      }
      return;
    }

    let msg = (used === cfg.sourceType) ? (used == "upload" ? "Upload OK" : "URL OK") : (used == "upload" ? "Fallback: Upload OK" : "Fallback: URL OK");
    // If Viewer reported an error, surface it subtly
    try{
      const raw = localStorage.getItem(SPONSOR_VIEWER_STATUS_KEY);
      if(raw){
        const v = JSON.parse(raw);
        if(v && v.ok === false){
          msg = msg + " · Viewer: error";
        }
      }
    }catch(_){}
    setSponsorStatus(msg);
  }


  function renderSettings(){
    const st = state.settings || {};
    const vars = st.theme?.vars || {};
    if(els.setBgColor) els.setBgColor.value = vars.bg || "#0b172e";
    if(els.setPanelColor) els.setPanelColor.value = vars.panel || "#0f2140";
    if(els.setAccentColor) els.setAccentColor.value = vars.accent || "#00c2ff";
    if(els.setTextColor) els.setTextColor.value = vars.text || "#e7eefb";

    const card = st.theme?.viewerCard || { hex:"#000000", opacity:0.90 };
    if(els.setCardColor) els.setCardColor.value = card.hex || "#000000";
    if(els.setCardOpacity){
      els.setCardOpacity.value = String(card.opacity ?? 0.90);
      if(els.setCardOpacityVal) els.setCardOpacityVal.textContent = Number(card.opacity ?? 0.90).toFixed(2);
    }

    // Splash + timer prefs
    if(els.setSplashShowNextTwo) els.setSplashShowNextTwo.checked = (state.splash?.showNextTwo !== false);

    if(els.setViewerUiScale){
      const raw = Number(state.viewerPrefs?.uiScale ?? 1.0);
      const v = Number.isFinite(raw) ? clamp(raw, 0.80, 1.40) : 1.0;
      els.setViewerUiScale.value = String(v);
      if(els.setViewerUiScaleVal) els.setViewerUiScaleVal.textContent = `${v.toFixed(2)}×`;
    }

    if(els.setViewerNameScale){
      const raw = Number(state.viewerPrefs?.nameScale ?? 2.10);
      const v = Number.isFinite(raw) ? clamp(raw, 1.00, 2.50) : 2.10;
      els.setViewerNameScale.value = String(v);
      if(els.setViewerNameScaleVal) els.setViewerNameScaleVal.textContent = `${v.toFixed(2)}×`;
    }

    if(els.setViewerHBScale){
      const raw = Number(state.viewerPrefs?.hbLineupScale ?? 1.00);
      const v = Number.isFinite(raw) ? clamp(raw, 0.70, 2.00) : 1.00;
      els.setViewerHBScale.value = String(v);
      if(els.setViewerHBScaleVal) els.setViewerHBScaleVal.textContent = `${v.toFixed(2)}×`;
    }

    if(els.setViewerUpcomingScale){
      const raw = Number(state.viewerPrefs?.upcomingScale ?? 1.00);
      const v = Number.isFinite(raw) ? clamp(raw, 0.75, 1.30) : 1.00;
      els.setViewerUpcomingScale.value = String(v);
      if(els.setViewerUpcomingScaleVal) els.setViewerUpcomingScaleVal.textContent = `${v.toFixed(2)}×`;
    }

    if(els.setViewerPadPx){
      const raw = Number(state.viewerPrefs?.framePaddingPx ?? 48);
      const v = Number.isFinite(raw) ? clamp(raw, 20, 96) : 48;
      els.setViewerPadPx.value = String(v);
      if(els.setViewerPadPxVal) els.setViewerPadPxVal.textContent = `${Math.round(v)}px`;
    }

    if(els.setViewerMediaPaneScale){
      const raw = Number(state.viewerPrefs?.mediaPaneScale ?? 1.00);
      const v = Number.isFinite(raw) ? clamp(raw, 0.75, 1.30) : 1.00;
      els.setViewerMediaPaneScale.value = String(v);
      if(els.setViewerMediaPaneScaleVal) els.setViewerMediaPaneScaleVal.textContent = `${v.toFixed(2)}×`;
    }


    // Transition (Splash -> Live stinger)
    if(els.setTransitionEnabled){
      els.setTransitionEnabled.checked = (state.viewerPrefs?.transitionEnabled !== false);
    }

    if(els.setTransitionStyle){
      const raw = String(state.viewerPrefs?.transitionStyle || "flashZoom");
      const v = (raw === "flashZoom" || raw === "off") ? raw : (raw === "video" ? "flashZoom" : "flashZoom");
      els.setTransitionStyle.value = v;
    }

    if(els.setTransitionDurSec){
      const raw = Number(state.viewerPrefs?.transitionDurSec);
      const v = Number.isFinite(raw) ? clamp(raw, 0.20, 10) : 0.65;
      els.setTransitionDurSec.value = String(v);
      if(els.setTransitionDurVal) els.setTransitionDurVal.textContent = formatCutSeconds(v);
    }

    if(els.setTransitionCutSec){
      const style = String(state.viewerPrefs?.transitionStyle || "flashZoom");
      const raw = Number(state.viewerPrefs?.transitionCutSec);
      const def = 0.22;
      const v = Number.isFinite(raw) ? clamp(raw, 0, 30) : def;
      els.setTransitionCutSec.value = String(v);
      if(els.setTransitionCutVal) els.setTransitionCutVal.textContent = formatCutSeconds(v);
    }
    if(els.setShowProgressBar) els.setShowProgressBar.checked = (state.viewerPrefs?.showProgressBar !== false);
    if(els.setShowOvertime) els.setShowOvertime.checked = (state.viewerPrefs?.showOvertime !== false);

    if(els.setWarnAtSec){
      const v = clamp(parseInt(String(state.viewerPrefs?.warnAtSec ?? 120), 10) || 120, 0, 600);
      els.setWarnAtSec.value = String(v);
      if(els.setWarnAtSecVal) els.setWarnAtSecVal.textContent = OMJN.formatMMSS(v * 1000);
    }
    if(els.setFinalAtSec){
      const v = clamp(parseInt(String(state.viewerPrefs?.finalAtSec ?? 30), 10) || 30, 0, 600);
      els.setFinalAtSec.value = String(v);
      if(els.setFinalAtSecVal) els.setFinalAtSecVal.textContent = OMJN.formatMMSS(v * 1000);
    }

    const tfStats = getTransitionForecastStats(state);
    if(els.setEtaTransitionSec){
      els.setEtaTransitionSec.value = String(tfStats.baseSec - tfStats.manualAdjustSec);
      if(els.setEtaTransitionSecVal) els.setEtaTransitionSecVal.textContent = OMJN.formatMMSS((tfStats.baseSec - tfStats.manualAdjustSec) * 1000);
    }
    if(els.setEtaAdjustSec){
      els.setEtaAdjustSec.value = String(tfStats.manualAdjustSec);
      if(els.setEtaAdjustSecVal) els.setEtaAdjustSecVal.textContent = formatSignedDurationMs(tfStats.manualAdjustSec * 1000);
    }
    if(els.setEtaAutoLearn) els.setEtaAutoLearn.checked = !!tfStats.autoLearn;
    if(els.btnEtaResetLearning){
      els.btnEtaResetLearning.disabled = !tfStats.observedCount;
      els.btnEtaResetLearning.title = tfStats.observedCount ? "Clear observed transition gaps from this show." : "No learned transition gaps to clear yet.";
    }
    if(els.etaLearningStatus){
      const parts = [];
      parts.push(`Forecast ${OMJN.formatMMSS(tfStats.forecastSec * 1000)}`);
      parts.push(`Base ${OMJN.formatMMSS(tfStats.baseSec * 1000)}`);
      if(tfStats.learnedMedianSec !== null) parts.push(`Learned median ${OMJN.formatMMSS(tfStats.learnedMedianSec * 1000)} from ${tfStats.observedCount} observed`);
      else parts.push("No observed gaps yet");
      if(!tfStats.autoLearn) parts.push("Auto-learn off");
      els.etaLearningStatus.textContent = parts.join(" • ");
    }


    const cues = st.viewerCues || {};
    if(els.setWarnColor) els.setWarnColor.value = cues.warnHex || "#00c2ff";
    if(els.setWarnAlpha){
      const v = Number(cues.warnAlpha ?? 0.12);
      els.setWarnAlpha.value = String(v);
      if(els.setWarnAlphaVal) els.setWarnAlphaVal.textContent = v.toFixed(2);
    }
    if(els.setWarnSpeed) els.setWarnSpeed.value = String(cues.warnDurSec ?? 3.2);

    if(els.setFinalColor) els.setFinalColor.value = cues.finalHex || "#2dd4bf";
    if(els.setFinalAlpha){
      const v = Number(cues.finalAlpha ?? 0.18);
      els.setFinalAlpha.value = String(v);
      if(els.setFinalAlphaVal) els.setFinalAlphaVal.textContent = v.toFixed(2);
    }
    if(els.setFinalSpeed) els.setFinalSpeed.value = String(cues.finalDurSec ?? 1.4);

    if(els.setOvertimeColor) els.setOvertimeColor.value = cues.overtimeHex || "#ff0000";
    if(els.setOvertimeAlpha){
      const v = Number(cues.overtimeAlpha ?? 0.85);
      els.setOvertimeAlpha.value = String(v);
      if(els.setOvertimeAlphaVal) els.setOvertimeAlphaVal.textContent = v.toFixed(2);
    }

    // Viewer extras
    if(els.setVizEnabled) els.setVizEnabled.checked = !!state.viewerPrefs?.visualizerEnabled;
    if(els.setVizSensitivity){
      const v = Number(state.viewerPrefs?.visualizerSensitivity ?? 1.0);
      const vv = Number.isFinite(v) ? Math.max(0.25, Math.min(4, v)) : 1.0;
      els.setVizSensitivity.value = String(vv);
      if(els.setVizSensitivityVal) els.setVizSensitivityVal.textContent = `${vv.toFixed(2)}×`;

    if(els.setVizMode){
      const m = String(state.viewerPrefs?.visualizerMode || "eq");
      els.setVizMode.value = (m === "volume") ? "volume" : "eq";
    }
    if(els.setVizDirection){
      const d = String(state.viewerPrefs?.visualizerDirection || "mirror");
      els.setVizDirection.value = (d === "ltr") ? "ltr" : "mirror";
    }

    }

    

    

    // Crowd Prompts UI
    const cp = state.viewerPrefs?.crowdPrompts || OMJN.defaultState().viewerPrefs.crowdPrompts;
    const presets = Array.isArray(cp.presets) ? cp.presets : [];
    const activeId = presets.some(p=>p.id===cp.activePresetId) ? cp.activePresetId : (presets[0]?.id || "");

    if(els.setCrowdEnabled) els.setCrowdEnabled.checked = !!cp.enabled;

    if(els.setCrowdPreset){
      const opts = presets.map(p => ({ id: p.id, label: (p.name || p.title || p.id) }));
      els.setCrowdPreset.innerHTML = opts.map(o => `<option value="${o.id}">${escapeHtml(o.label)}</option>`).join("");
      els.setCrowdPreset.value = activeId;
    }

    // Only sync editor fields when preset changes (so typing isn't overwritten)
    const editorKey = JSON.stringify({ activeId, count: presets.length, names: presets.map(p=>p.name||"").join("|") });
    if(editorKey !== lastCrowdEditorKey){
      lastCrowdEditorKey = editorKey;
      const ap = presets.find(p=>p.id===activeId) || presets[0] || {};
      if(els.crowdPresetName) els.crowdPresetName.value = ap.name || "";
      if(els.crowdTitle) els.crowdTitle.value = ap.title || "";
      if(els.crowdLines) els.crowdLines.value = Array.isArray(ap.lines) ? ap.lines.join("\n") : "";
      if(els.crowdFooter) els.crowdFooter.value = ap.footer || "";
      if(els.crowdAutoHide) els.crowdAutoHide.value = String(clamp(parseInt(String(ap.autoHideSeconds ?? 0),10) || 0, 0, 60));
    }

    updateCrowdQuickButtons();
    syncCrowdAutoHide();


    // Sponsor Bug UI
    const sb = state.viewerPrefs?.sponsorBug || OMJN.defaultState().viewerPrefs.sponsorBug;
    if(els.setSponsorEnabled) els.setSponsorEnabled.checked = !!sb.enabled;
    if(els.setSponsorLiveOnly) els.setSponsorLiveOnly.checked = (sb.showLiveOnly !== false);
    if(els.setSponsorSourceType) els.setSponsorSourceType.value = sb.sourceType || "upload";
    if(els.setSponsorUrl) els.setSponsorUrl.value = sb.url || "";
    if(els.setSponsorPosition) els.setSponsorPosition.value = sb.position || "TR";
    if(els.setSponsorScale){
      const v = clampNum(sb.scale ?? 1.0, 0.25, 2.0);
      els.setSponsorScale.value = String(v);
      if(els.setSponsorScaleVal) els.setSponsorScaleVal.textContent = `${v.toFixed(2)}×`;
    }
    if(els.setSponsorMaxPct){
      const v = clampNum(sb.maxSizePct ?? 18, 5, 25);
      els.setSponsorMaxPct.value = String(Math.round(v));
      if(els.setSponsorMaxPctVal) els.setSponsorMaxPctVal.textContent = `${Math.round(v)}%`;
    }
    if(els.setSponsorOpacity){
      const v = clampNum(sb.opacity ?? 1.0, 0, 1);
      els.setSponsorOpacity.value = String(v);
      if(els.setSponsorOpacityVal) els.setSponsorOpacityVal.textContent = v.toFixed(2);
    }
    if(els.setSponsorSafeMargin){
      const v = clampNum(sb.safeMargin ?? 16, 0, 200);
      els.setSponsorSafeMargin.value = String(v);
      if(els.setSponsorSafeMarginVal) els.setSponsorSafeMarginVal.textContent = `${Math.round(v)}px`;
    }
    updateSponsorPreviewAndStatus().catch(() => {});

    renderSlotTypesEditor();
  }

  function bindSettings(){
    function bindColor(inputEl, key){
      if(!inputEl) return;
      inputEl.addEventListener("input", () => {
        updateState(s => {
          s.settings = s.settings || {};
          s.settings.theme = s.settings.theme || {};
          s.settings.theme.vars = s.settings.theme.vars || {};
          s.settings.theme.vars[key] = inputEl.value;
        }, { recordHistory:false });
      });
    }
    bindColor(els.setBgColor, "bg");
    bindColor(els.setPanelColor, "panel");
    bindColor(els.setAccentColor, "accent");
    bindColor(els.setTextColor, "text");

    if(els.setCardColor){
      els.setCardColor.addEventListener("input", () => {
        updateState(s => {
          s.settings = s.settings || {};
          s.settings.theme = s.settings.theme || {};
          s.settings.theme.viewerCard = s.settings.theme.viewerCard || { hex:"#000000", opacity:0.90 };
          s.settings.theme.viewerCard.hex = els.setCardColor.value;
        }, { recordHistory:false });
      });
    }
    if(els.setCardOpacity){
      els.setCardOpacity.addEventListener("input", () => {
        const val = clamp(parseFloat(els.setCardOpacity.value||"0.9"), 0.5, 1);
        if(els.setCardOpacityVal) els.setCardOpacityVal.textContent = val.toFixed(2);
        updateState(s => {
          s.settings = s.settings || {};
          s.settings.theme = s.settings.theme || {};
          s.settings.theme.viewerCard = s.settings.theme.viewerCard || { hex:"#000000", opacity:0.90 };
          s.settings.theme.viewerCard.opacity = val;
        }, { recordHistory:false });
      });
    }

    function bindCueColor(inputEl, key){
      if(!inputEl) return;
      inputEl.addEventListener("input", () => {
        updateState(s => {
          s.settings = s.settings || {};
          s.settings.viewerCues = s.settings.viewerCues || {};
          s.settings.viewerCues[key] = inputEl.value;
        }, { recordHistory:false });
      });
    }

    function bindCueRange(rangeEl, valEl, key, min, max){
      if(!rangeEl) return;
      const onInput = () => {
        const val = clamp(parseFloat(rangeEl.value||"0"), min, max);
        rangeEl.value = String(val);
        if(valEl) valEl.textContent = val.toFixed(2);
        updateState(s => {
          s.settings = s.settings || {};
          s.settings.viewerCues = s.settings.viewerCues || {};
          s.settings.viewerCues[key] = val;
        }, { recordHistory:false });
      };
      rangeEl.addEventListener("input", onInput);
      rangeEl.addEventListener("change", onInput);
    }

    bindCueColor(els.setWarnColor, "warnHex");
    bindCueColor(els.setFinalColor, "finalHex");
    bindCueColor(els.setOvertimeColor, "overtimeHex");
    bindCueRange(els.setWarnAlpha, els.setWarnAlphaVal, "warnAlpha", 0, 1);
    bindCueRange(els.setFinalAlpha, els.setFinalAlphaVal, "finalAlpha", 0, 1);
    bindCueRange(els.setOvertimeAlpha, els.setOvertimeAlphaVal, "overtimeAlpha", 0, 1);

    function bindCueNumber(inputEl, key, min, max){
      if(!inputEl) return;
      inputEl.addEventListener("change", () => {
        const val = clamp(parseFloat(inputEl.value||"0"), min, max);
        inputEl.value = String(val);
        updateState(s => {
          s.settings = s.settings || {};
          s.settings.viewerCues = s.settings.viewerCues || {};
          s.settings.viewerCues[key] = val;
        }, { recordHistory:false });
      });
    }
    bindCueNumber(els.setWarnSpeed, "warnDurSec", 0.6, 30);
    bindCueNumber(els.setFinalSpeed, "finalDurSec", 0.4, 30);

    if(els.startGuard){
      els.startGuard.addEventListener("change", () => updateState(s => { s.operatorPrefs.startGuard = !!els.startGuard.checked; }, { recordHistory:false }));
    }
    if(els.endGuard){
      els.endGuard.addEventListener("change", () => updateState(s => { s.operatorPrefs.endGuard = !!els.endGuard.checked; }, { recordHistory:false }));
    }
    if(els.hotkeysEnabled){
      els.hotkeysEnabled.addEventListener("change", () => updateState(s => { s.operatorPrefs.hotkeysEnabled = !!els.hotkeysEnabled.checked; }, { recordHistory:false }));
    }


    // Splash layout
    if(els.setSplashShowNextTwo){
      els.setSplashShowNextTwo.addEventListener("change", () => {
        updateState(s => {
          s.splash = s.splash || {};
          s.splash.showNextTwo = !!els.setSplashShowNextTwo.checked;
        }, { recordHistory:false });
      });
    }

    // Viewer scale
    if(els.setViewerUiScale){
      const onInput = () => {
        const v = clamp(parseFloat(String(els.setViewerUiScale.value||"1")), 0.80, 1.40);
        els.setViewerUiScale.value = String(v);
        if(els.setViewerUiScaleVal) els.setViewerUiScaleVal.textContent = `${v.toFixed(2)}×`;
        updateState(s => {
          s.viewerPrefs = s.viewerPrefs || {};
          s.viewerPrefs.uiScale = v;
        }, { recordHistory:false });
      };
      els.setViewerUiScale.addEventListener("input", onInput);
      els.setViewerUiScale.addEventListener("change", onInput);
    }

    if(els.setViewerNameScale){
      const onInput = () => {
        const v = clamp(parseFloat(String(els.setViewerNameScale.value||"2.10")), 1.00, 2.50);
        els.setViewerNameScale.value = String(v);
        if(els.setViewerNameScaleVal) els.setViewerNameScaleVal.textContent = `${v.toFixed(2)}×`;
        updateState(s => {
          s.viewerPrefs = s.viewerPrefs || {};
          s.viewerPrefs.nameScale = v;
        }, { recordHistory:false });
      };
      els.setViewerNameScale.addEventListener("input", onInput);
      els.setViewerNameScale.addEventListener("change", onInput);
    }

    if(els.setViewerHBScale){
      const onInput = () => {
        const v = clamp(parseFloat(String(els.setViewerHBScale.value||"1.00")), 0.70, 2.00);
        els.setViewerHBScale.value = String(v);
        if(els.setViewerHBScaleVal) els.setViewerHBScaleVal.textContent = `${v.toFixed(2)}×`;
        updateState(s => {
          s.viewerPrefs = s.viewerPrefs || {};
          s.viewerPrefs.hbLineupScale = v;
        }, { recordHistory:false });
      };
      els.setViewerHBScale.addEventListener("input", onInput);
      els.setViewerHBScale.addEventListener("change", onInput);
    }

    if(els.setViewerUpcomingScale){
      const onInput = () => {
        const v = clamp(parseFloat(String(els.setViewerUpcomingScale.value||"1.00")), 0.75, 1.30);
        els.setViewerUpcomingScale.value = String(v);
        if(els.setViewerUpcomingScaleVal) els.setViewerUpcomingScaleVal.textContent = `${v.toFixed(2)}×`;
        updateState(s => {
          s.viewerPrefs = s.viewerPrefs || {};
          s.viewerPrefs.upcomingScale = v;
        }, { recordHistory:false });
      };
      els.setViewerUpcomingScale.addEventListener("input", onInput);
      els.setViewerUpcomingScale.addEventListener("change", onInput);
    }

    if(els.setViewerPadPx){
      const onInput = () => {
        const v = clamp(parseInt(String(els.setViewerPadPx.value||"48"), 10), 20, 96);
        els.setViewerPadPx.value = String(v);
        if(els.setViewerPadPxVal) els.setViewerPadPxVal.textContent = `${Math.round(v)}px`;
        updateState(s => {
          s.viewerPrefs = s.viewerPrefs || {};
          s.viewerPrefs.framePaddingPx = v;
        }, { recordHistory:false });
      };
      els.setViewerPadPx.addEventListener("input", onInput);
      els.setViewerPadPx.addEventListener("change", onInput);
    }

    if(els.setViewerMediaPaneScale){
      const onInput = () => {
        const v = clamp(parseFloat(String(els.setViewerMediaPaneScale.value||"1.00")), 0.75, 1.30);
        els.setViewerMediaPaneScale.value = String(v);
        if(els.setViewerMediaPaneScaleVal) els.setViewerMediaPaneScaleVal.textContent = `${v.toFixed(2)}×`;
        updateState(s => {
          s.viewerPrefs = s.viewerPrefs || {};
          s.viewerPrefs.mediaPaneScale = v;
        }, { recordHistory:false });
      };
      els.setViewerMediaPaneScale.addEventListener("input", onInput);
      els.setViewerMediaPaneScale.addEventListener("change", onInput);
    }

// Transition (Splash -> Live stinger)
    if(els.setTransitionEnabled){
      els.setTransitionEnabled.addEventListener("change", () => {
        updateState(s => {
          s.viewerPrefs = s.viewerPrefs || {};
          s.viewerPrefs.transitionEnabled = !!els.setTransitionEnabled.checked;
        }, { recordHistory:false });
      });
    }

    if(els.setTransitionStyle){
      els.setTransitionStyle.addEventListener("change", () => {
        const v = String(els.setTransitionStyle.value || "flashZoom");
        updateState(s => {
          s.viewerPrefs = s.viewerPrefs || {};
          const style = (v === "flashZoom" || v === "off") ? v : (v === "video" ? "flashZoom" : "flashZoom");
          s.viewerPrefs.transitionStyle = style;

          // Convenience defaults when switching styles (keeps the cut point reasonable).
          if(style === "flashZoom"){
            const cut = Number(s.viewerPrefs.transitionCutSec);
            if(!Number.isFinite(cut) || cut > 1.5) s.viewerPrefs.transitionCutSec = 0.22;
            const dur = Number(s.viewerPrefs.transitionDurSec);
            if(!Number.isFinite(dur) || dur < 0.20 || dur > 10) s.viewerPrefs.transitionDurSec = 0.65;
          }
        }, { recordHistory:false });
        // Refresh the settings UI so defaults (cut/duration) display sensibly.
        renderSettings();
      });
    }

    if(els.setTransitionDurSec){
      const onDur = () => {
        const v = clamp(parseFloat(String(els.setTransitionDurSec.value || "")), 0.20, 10);
        els.setTransitionDurSec.value = String(v);
        if(els.setTransitionDurVal) els.setTransitionDurVal.textContent = formatCutSeconds(v);
        updateState(s => {
          s.viewerPrefs = s.viewerPrefs || {};
          s.viewerPrefs.transitionDurSec = v;
        }, { recordHistory:false });
      };
      els.setTransitionDurSec.addEventListener("input", onDur);
      els.setTransitionDurSec.addEventListener("change", onDur);
    }

    if(els.setTransitionCutSec){
      const onCut = () => {
        const v = clamp(parseFloat(String(els.setTransitionCutSec.value || "")), 0, 30);
        els.setTransitionCutSec.value = String(v);
        if(els.setTransitionCutVal) els.setTransitionCutVal.textContent = formatCutSeconds(v);
        updateState(s => {
          s.viewerPrefs = s.viewerPrefs || {};
          s.viewerPrefs.transitionCutSec = v;
        }, { recordHistory:false });
      };
      els.setTransitionCutSec.addEventListener("input", onCut);
      els.setTransitionCutSec.addEventListener("change", onCut);
    }

    // Timer display prefs
    if(els.setShowProgressBar){
      els.setShowProgressBar.addEventListener("change", () => {
        updateState(s => {
          s.viewerPrefs = s.viewerPrefs || {};
          s.viewerPrefs.showProgressBar = !!els.setShowProgressBar.checked;
        }, { recordHistory:false });
      });
    }
    if(els.setShowOvertime){
      els.setShowOvertime.addEventListener("change", () => {
        updateState(s => {
          s.viewerPrefs = s.viewerPrefs || {};
          s.viewerPrefs.showOvertime = !!els.setShowOvertime.checked;
        }, { recordHistory:false });
      });
    }

    function bindRemainingSec(inputEl, valEl, key, defVal){
      if(!inputEl) return;
      const onAny = () => {
        const raw = parseInt(String(inputEl.value || defVal), 10);
        const val = clamp(Number.isFinite(raw) ? raw : defVal, 0, 600);
        inputEl.value = String(val);
        if(valEl) valEl.textContent = OMJN.formatMMSS(val * 1000);
        updateState(s => {
          s.viewerPrefs = s.viewerPrefs || {};
          s.viewerPrefs[key] = val;
        }, { recordHistory:false });
      };
      inputEl.addEventListener("input", onAny);
      inputEl.addEventListener("change", onAny);
    }
    bindRemainingSec(els.setWarnAtSec, els.setWarnAtSecVal, "warnAtSec", 120);
    bindRemainingSec(els.setFinalAtSec, els.setFinalAtSecVal, "finalAtSec", 30);

    if(els.setEtaTransitionSec){
      const onTransitionBase = () => {
        const raw = parseInt(String(els.setEtaTransitionSec.value || "300"), 10);
        const v = clamp(Number.isFinite(raw) ? raw : 300, 0, 900);
        els.setEtaTransitionSec.value = String(v);
        if(els.setEtaTransitionSecVal) els.setEtaTransitionSecVal.textContent = OMJN.formatMMSS(v * 1000);
        updateState(s => {
          const tf = ensureTransitionForecastState(s);
          tf.defaultBufferSec = v;
        }, { recordHistory:false });
      };
      els.setEtaTransitionSec.addEventListener("input", onTransitionBase);
      els.setEtaTransitionSec.addEventListener("change", onTransitionBase);
    }

    if(els.setEtaAdjustSec){
      const onTransitionAdjust = () => {
        const raw = parseInt(String(els.setEtaAdjustSec.value || "0"), 10);
        const v = clamp(Number.isFinite(raw) ? raw : 0, -300, 300);
        els.setEtaAdjustSec.value = String(v);
        if(els.setEtaAdjustSecVal) els.setEtaAdjustSecVal.textContent = formatSignedDurationMs(v * 1000);
        updateState(s => {
          const tf = ensureTransitionForecastState(s);
          tf.manualAdjustSec = v;
        }, { recordHistory:false });
      };
      els.setEtaAdjustSec.addEventListener("input", onTransitionAdjust);
      els.setEtaAdjustSec.addEventListener("change", onTransitionAdjust);
    }

    if(els.setEtaAutoLearn){
      els.setEtaAutoLearn.addEventListener("change", () => {
        updateState(s => {
          const tf = ensureTransitionForecastState(s);
          tf.autoLearn = !!els.setEtaAutoLearn.checked;
        }, { recordHistory:false });
      });
    }

    if(els.btnEtaResetLearning){
      els.btnEtaResetLearning.addEventListener("click", () => {
        updateState(s => {
          const tf = ensureTransitionForecastState(s);
          tf.observedSamplesSec = [];
        }, { recordHistory:false });
      });
    }

    // Viewer extras: mic visualizer
    if(els.setVizEnabled){
      els.setVizEnabled.addEventListener("change", () => {
        updateState(s => {
          s.viewerPrefs = s.viewerPrefs || {};
          s.viewerPrefs.visualizerEnabled = !!els.setVizEnabled.checked;
        }, { recordHistory:false });
      });
    }
    if(els.setVizSensitivity){
      const onViz = () => {
        const val = clamp(parseFloat(els.setVizSensitivity.value||"1"), 0.25, 4);
        els.setVizSensitivity.value = String(val);
        if(els.setVizSensitivityVal) els.setVizSensitivityVal.textContent = `${val.toFixed(2)}×`;
        updateState(s => {
          s.viewerPrefs = s.viewerPrefs || {};
          s.viewerPrefs.visualizerSensitivity = val;
        }, { recordHistory:false });
      };
      els.setVizSensitivity.addEventListener("input", onViz);
      els.setVizSensitivity.addEventListener("change", onViz);
      if(els.setVizSensitivityVal) els.setVizSensitivityVal.addEventListener?.("dblclick", () => {
        els.setVizSensitivity.value = "1";
        onViz();
      });
    }


    // Viewer extras: visualizer mode/direction
    if(els.setVizMode){
      els.setVizMode.addEventListener("change", () => {
        const mode = String(els.setVizMode.value || "eq");
        updateState(s => {
          s.viewerPrefs = s.viewerPrefs || {};
          s.viewerPrefs.visualizerMode = (mode === "volume") ? "volume" : "eq";
        }, { recordHistory:false });
      });
    }
    if(els.setVizDirection){
      els.setVizDirection.addEventListener("change", () => {
        const dir = String(els.setVizDirection.value || "mirror");
        updateState(s => {
          s.viewerPrefs = s.viewerPrefs || {};
          s.viewerPrefs.visualizerDirection = (dir === "ltr") ? "ltr" : "mirror";
        }, { recordHistory:false });
      });
    }

    // Crowd Prompts controls
    function readCrowdEditor(){
      const name = (els.crowdPresetName?.value || "").trim();
      const title = (els.crowdTitle?.value || "").trim();
      const footer = (els.crowdFooter?.value || "").trim();
      const autoHideSeconds = clamp(parseInt(String(els.crowdAutoHide?.value || "0"), 10) || 0, 0, 60);
      const linesRaw = (els.crowdLines?.value || "");
      const lines = linesRaw.split(/\r?\n/).map(l => l.trim()).filter(l => l.length > 0);
      return { name, title, footer, autoHideSeconds, lines };
    }

    crowdEditorReadFn = readCrowdEditor;


    function saveCrowdPreset(){
      const data = readCrowdEditor();
      updateState(s => {
        ensureCrowdDefaults(s);
        const cfg = s.viewerPrefs.crowdPrompts;
        const idx = cfg.presets.findIndex(p => p.id === cfg.activePresetId);
        if(idx >= 0){
          cfg.presets[idx] = Object.assign({}, cfg.presets[idx], data);
        }
      }, { recordHistory:false });
      scheduleCrowdAutoHide();
      setCrowdEditorDirty(false);
      updateCrowdQuickButtons();
      renderCrowdPromptPreview();
    }

    function addCrowdPreset(fromPreset=null){
      const base = fromPreset || { name: "New Prompt", title: "CROWD PROMPT", lines: [], footer: "", autoHideSeconds: 0 };
      const id = OMJN.uid("cp");
      const preset = {
        id,
        name: (base.name || "New Prompt") + (fromPreset ? " Copy" : ""),
        title: base.title || "CROWD PROMPT",
        lines: Array.isArray(base.lines) ? base.lines.slice() : [],
        footer: base.footer || "",
        autoHideSeconds: clamp(parseInt(String(base.autoHideSeconds ?? 0), 10) || 0, 0, 60)
      };
      updateState(s => {
        ensureCrowdDefaults(s);
        const cfg = s.viewerPrefs.crowdPrompts;
        cfg.presets.push(preset);
        cfg.activePresetId = id;
      }, { recordHistory:false });
    }

    function deleteCrowdPreset(){
      const cfg = getCrowdCfg(state);
      const presets = Array.isArray(cfg?.presets) ? cfg.presets : [];
      if(presets.length <= 1) return;
      const active = getActiveCrowdPreset(cfg);
      const label = active?.name || active?.title || "this prompt";
      if(!confirm(`Delete "${label}"?`)) return;
      updateState(s => {
        ensureCrowdDefaults(s);
        const cfg = s.viewerPrefs.crowdPrompts;
        if(cfg.presets.length <= 1) return;
        const idx = cfg.presets.findIndex(p => p.id === cfg.activePresetId);
        if(idx >= 0) cfg.presets.splice(idx, 1);
        const newIdx = Math.min(idx, cfg.presets.length - 1);
        cfg.activePresetId = cfg.presets[newIdx].id;
      }, { recordHistory:false });
      scheduleCrowdAutoHide();
    }

    if(els.setCrowdEnabled){
      els.setCrowdEnabled.addEventListener("change", () => setCrowdEnabled(!!els.setCrowdEnabled.checked));
    }
    if(els.btnCrowdShowNow){
      els.btnCrowdShowNow.addEventListener("click", () => setCrowdEnabled(true));
    }
    if(els.btnCrowdHide){
      els.btnCrowdHide.addEventListener("click", () => setCrowdEnabled(false));
    }
    if(els.setCrowdPreset){
      els.setCrowdPreset.addEventListener("change", () => {
        const id = String(els.setCrowdPreset.value || "");
        updateState(s => { ensureCrowdDefaults(s); s.viewerPrefs.crowdPrompts.activePresetId = id; }, { recordHistory:false });
        scheduleCrowdAutoHide();
      });
    }
    if(els.btnCrowdSave) els.btnCrowdSave.addEventListener("click", saveCrowdPreset);
    if(els.btnCrowdAdd) els.btnCrowdAdd.addEventListener("click", () => addCrowdPreset(null));
    if(els.btnCrowdDuplicate) els.btnCrowdDuplicate.addEventListener("click", () => {
      const cfg = getCrowdCfg(state);
      const p = getActiveCrowdPreset(cfg);
      if(!p) return;
      addCrowdPreset(p);
    });
    if(els.btnCrowdDelete) els.btnCrowdDelete.addEventListener("click", deleteCrowdPreset);


    // Sponsor Bug controls
    function ensureSponsorBugDefaults(s){
      s.viewerPrefs = s.viewerPrefs || {};
      const d = OMJN.defaultState();
      if(!s.viewerPrefs.sponsorBug) s.viewerPrefs.sponsorBug = JSON.parse(JSON.stringify(d.viewerPrefs.sponsorBug));
      else{
        const bd = d.viewerPrefs.sponsorBug;
        const b = s.viewerPrefs.sponsorBug;
        for(const k of Object.keys(bd)){ if(b[k] === undefined) b[k] = bd[k]; }
      }
    }

    async function handleSponsorUpload(file){
      if(!file) return;
      // Compress and store using existing asset system
      const { blob, meta } = await OMJN.compressImageFile(file, { maxEdge: 1400, quality: 0.86, mime: "image/webp" });
      if(!blob) return;
      const assetId = OMJN.uid("sponsor");
      await OMJN.putAsset(assetId, blob);
      updateState(s => {
        ensureSponsorBugDefaults(s);
        const sb = s.viewerPrefs.sponsorBug;
        // Best-effort cleanup of prior upload
        if(sb.uploadAssetId && sb.uploadAssetId !== assetId){
          const old = sb.uploadAssetId;
          delete s.assetsIndex[old];
          OMJN.deleteAsset(old).catch(() => {});
        }
        s.assetsIndex[assetId] = meta;
        sb.uploadAssetId = assetId;
        sb.sourceType = "upload";
        sb.enabled = true;
      }, { recordHistory:false });
      updateSponsorPreviewAndStatus().catch(() => {});
    }

    if(els.setSponsorEnabled){
      els.setSponsorEnabled.addEventListener("change", () => {
        updateState(s => { ensureSponsorBugDefaults(s); s.viewerPrefs.sponsorBug.enabled = !!els.setSponsorEnabled.checked; }, { recordHistory:false });
        updateSponsorPreviewAndStatus().catch(() => {});
      });
    }
    if(els.setSponsorLiveOnly){
      els.setSponsorLiveOnly.addEventListener("change", () => {
        updateState(s => { ensureSponsorBugDefaults(s); s.viewerPrefs.sponsorBug.showLiveOnly = !!els.setSponsorLiveOnly.checked; }, { recordHistory:false });
        updateSponsorPreviewAndStatus().catch(() => {});
      });
    }
    if(els.setSponsorSourceType){
      els.setSponsorSourceType.addEventListener("change", () => {
        updateState(s => { ensureSponsorBugDefaults(s); s.viewerPrefs.sponsorBug.sourceType = els.setSponsorSourceType.value; }, { recordHistory:false });
        updateSponsorPreviewAndStatus().catch(() => {});
      });
    }
    if(els.setSponsorUrl){
      const onUrl = () => {
        const v = String(els.setSponsorUrl.value || "").trim();
        updateState(s => { ensureSponsorBugDefaults(s); s.viewerPrefs.sponsorBug.url = v; }, { recordHistory:false });
        updateSponsorPreviewAndStatus().catch(() => {});
      };
      els.setSponsorUrl.addEventListener("change", onUrl);
      els.setSponsorUrl.addEventListener("blur", onUrl);
    }
    if(els.setSponsorUploadFile){
      els.setSponsorUploadFile.addEventListener("change", async (e) => {
        const file = e.target.files && e.target.files[0];
        if(!file) return;
        try{ await handleSponsorUpload(file); }catch(err){ alert("Sponsor upload failed: " + err.message); }
        finally{ els.setSponsorUploadFile.value = ""; }
      });
    }
    if(els.btnClearSponsorUpload){
      els.btnClearSponsorUpload.addEventListener("click", () => {
        updateState(s => {
          ensureSponsorBugDefaults(s);
          const sb = s.viewerPrefs.sponsorBug;
          if(sb.uploadAssetId){
            const old = sb.uploadAssetId;
            sb.uploadAssetId = null;
            delete s.assetsIndex[old];
            OMJN.deleteAsset(old).catch(() => {});
          }
        }, { recordHistory:false });
        updateSponsorPreviewAndStatus().catch(() => {});
      });
    }
    if(els.setSponsorPosition){
      els.setSponsorPosition.addEventListener("change", () => {
        updateState(s => { ensureSponsorBugDefaults(s); s.viewerPrefs.sponsorBug.position = els.setSponsorPosition.value; }, { recordHistory:false });
      });
    }
    if(els.setSponsorScale){
      const onScale = () => {
        const v = clamp(parseFloat(els.setSponsorScale.value || "1"), 0.25, 2);
        els.setSponsorScale.value = String(v);
        if(els.setSponsorScaleVal) els.setSponsorScaleVal.textContent = `${v.toFixed(2)}×`;
        updateState(s => { ensureSponsorBugDefaults(s); s.viewerPrefs.sponsorBug.scale = v; }, { recordHistory:false });
      };
      els.setSponsorScale.addEventListener("input", onScale);
      els.setSponsorScale.addEventListener("change", onScale);
      els.setSponsorScaleVal?.addEventListener?.("dblclick", () => { els.setSponsorScale.value = "1"; onScale(); });
    }
    if(els.setSponsorMaxPct){
      const onCap = () => {
        const v = clamp(parseInt(els.setSponsorMaxPct.value || "18", 10) || 18, 5, 25);
        els.setSponsorMaxPct.value = String(v);
        if(els.setSponsorMaxPctVal) els.setSponsorMaxPctVal.textContent = `${v}%`;
        updateState(s => { ensureSponsorBugDefaults(s); s.viewerPrefs.sponsorBug.maxSizePct = v; }, { recordHistory:false });
      };
      els.setSponsorMaxPct.addEventListener("input", onCap);
      els.setSponsorMaxPct.addEventListener("change", onCap);
      els.setSponsorMaxPctVal?.addEventListener?.("dblclick", () => { els.setSponsorMaxPct.value = "18"; onCap(); });
    }
    if(els.setSponsorOpacity){
      const onOp = () => {
        const v = clamp(parseFloat(els.setSponsorOpacity.value || "1"), 0, 1);
        els.setSponsorOpacity.value = String(v);
        if(els.setSponsorOpacityVal) els.setSponsorOpacityVal.textContent = v.toFixed(2);
        updateState(s => { ensureSponsorBugDefaults(s); s.viewerPrefs.sponsorBug.opacity = v; }, { recordHistory:false });
      };
      els.setSponsorOpacity.addEventListener("input", onOp);
      els.setSponsorOpacity.addEventListener("change", onOp);
      els.setSponsorOpacityVal?.addEventListener?.("dblclick", () => { els.setSponsorOpacity.value = "1"; onOp(); });
    }
    if(els.setSponsorSafeMargin){
      const onSm = () => {
        const v = clamp(parseInt(els.setSponsorSafeMargin.value || "16", 10) || 0, 0, 200);
        els.setSponsorSafeMargin.value = String(v);
        if(els.setSponsorSafeMarginVal) els.setSponsorSafeMarginVal.textContent = `${v}px`;
        updateState(s => { ensureSponsorBugDefaults(s); s.viewerPrefs.sponsorBug.safeMargin = v; }, { recordHistory:false });
      };
      els.setSponsorSafeMargin.addEventListener("input", onSm);
      els.setSponsorSafeMargin.addEventListener("change", onSm);
      els.setSponsorSafeMarginVal?.addEventListener?.("dblclick", () => { els.setSponsorSafeMargin.value = "16"; onSm(); });
    }

    if(els.btnExportSettings){
      els.btnExportSettings.addEventListener("click", () => {
        const payload = {
          version: 1,
          exportedAt: Date.now(),
          settings: state.settings,
          slotTypes: state.slotTypes,
          viewerPrefs: state.viewerPrefs
        };
        const blob = new Blob([JSON.stringify(payload, null, 2)], { type:"application/json" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "omjn-settings.json";
        document.body.appendChild(a);
        a.click();
        a.remove();
        setTimeout(() => URL.revokeObjectURL(url), 500);
      });
    }

    if(els.importSettingsFile){
      els.importSettingsFile.addEventListener("change", async (e) => {
        const file = e.target.files?.[0];
        if(!file) return;
        try{
          const text = await file.text();
          const imported = JSON.parse(text);
          if(!imported || typeof imported !== "object") throw new Error("Invalid file");
          updateState(s => {
            if(imported.settings) s.settings = imported.settings;
            if(Array.isArray(imported.slotTypes) && imported.slotTypes.length) s.slotTypes = imported.slotTypes;
            if(imported.viewerPrefs) s.viewerPrefs = imported.viewerPrefs;
          }, { recordHistory:false });
        }catch(err){
          alert("Settings import failed: " + err.message);
        }finally{
          els.importSettingsFile.value = "";
        }
      });
    }

    if(els.btnResetSettings){
      els.btnResetSettings.addEventListener("click", () => {
        if(!confirm("Reset settings (theme, cues, slot types) back to defaults?")) return;
        updateState(s => {
          const d = OMJN.defaultState();
          s.settings = d.settings;
          s.slotTypes = d.slotTypes;
          s.viewerPrefs = d.viewerPrefs;
        }, { recordHistory:false });
      });
    }

    // Settings tabs (Viewer / Timer / Visualizer / Crowd / Advanced)
    if(els.settingsModal && !els.settingsModal.dataset.tabsBound){
      els.settingsModal.dataset.tabsBound = "1";

      const navBtns = Array.from(els.settingsModal.querySelectorAll('.settingsTabBtn[data-tab]'));
      const panels  = Array.from(els.settingsModal.querySelectorAll('.settingsPanel[data-panel]'));

      function activateSettingsTab(tabId){
        navBtns.forEach(btn => {
          const isActive = btn.dataset.tab === tabId;
          btn.classList.toggle("isActive", isActive);
          btn.setAttribute("aria-selected", isActive ? "true" : "false");
        });
        panels.forEach(p => {
          p.hidden = (p.dataset.panel !== tabId);
        });
        try{ localStorage.setItem(SETTINGS_TAB_KEY, tabId); }catch(_){}
      }

      navBtns.forEach(btn => {
        btn.addEventListener("click", () => activateSettingsTab(btn.dataset.tab));
      });

      // Initial tab (remember last)
      let firstTab = "viewer";
      try{ firstTab = localStorage.getItem(SETTINGS_TAB_KEY) || "viewer"; }catch(_){}
      activateSettingsTab(firstTab);
    }

  }

  function fillTypeSelect(selectEl, opts = {}){
    if(!selectEl) return;
    selectEl.innerHTML = "";

    // Quick Add performer slot type should always prompt.
    // Only apply this placeholder to the Quick Add select (id="addType").
    if(selectEl.id === "addType"){
      const ph = document.createElement("option");
      ph.value = "";
      ph.textContent = "- CHOOSE A SLOT -";
      selectEl.appendChild(ph);
    }
    for(const t of slotTypesForSelect(opts)){
      const opt = document.createElement("option");
      opt.value = t.id;
      opt.textContent = `${t.label} (${t.defaultMinutes}m)`;
      selectEl.appendChild(opt);
    }
  }

  function slotBadge(slot){
    OMJN.normalizeSlot(slot);
    const t = OMJN.getSlotType(state, slot.slotTypeId);
    const mins = OMJN.effectiveMinutes(state, slot);
    const typeLabel = OMJN.displaySlotTypeLabel(state, slot);
    const media = slot.media || {};
    const icons = [];
    if(media.imageAssetId) icons.push("🖼️");
    if(media.donationUrl) icons.push("🔗");
    return { t, mins, icons, typeLabel };
  }

  // Queue visuals: font-awesome icons for consistent rendering.
  // Requires font-awesome CSS to be loaded in operator.html.
  function slotTypeIconClass(slotTypeId){
    const id = String(slotTypeId || "");
    if(id === "musician") return "fa-solid fa-music";
    if(id === "jamaoke") return "fa-solid fa-compact-disc";
    if(id === "comedian" || id === "comedian5") return "fa-solid fa-microphone-lines";
    if(id === "poetry") return "fa-solid fa-masks-theater";
    if(id === "houseband") return "fa-solid fa-guitar";
    if(id === "intermission") return "fa-solid fa-pause";
    if(id.startsWith("ad_")) return "fa-solid fa-bullhorn";
    return "fa-solid fa-wand-magic-sparkles";
  }

  function extractMusicLinks(text){
    const s = String(text || "");
    const urls = s.match(/https?:\/\/[^\s<>"')]+/gi) || [];
    const out = [];
    urls.forEach((raw, idx) => {
      const url = raw.replace(/[.,;]+$/g, "");
      const lower = url.toLowerCase();
      const add = (buttonUrl, label) => out.push({ url: buttonUrl, label, id: `${idx}_${label}_${buttonUrl}` });
      if(lower.includes("open.spotify.com")){
        const match = url.match(/open\.spotify\.com\/(track|album|playlist)\/([A-Za-z0-9]+)/i);
        if(match) add(`spotify:${match[1]}:${match[2]}`, "Spotify App");
        add(url, "Spotify Web");
      }else if(lower.includes("music.apple.com")){
        add(url.replace(/^https?:\/\//i, "music://"), "Apple Music App");
        add(url, "Apple Music Web");
      }else if(lower.includes("youtube.com") || lower.includes("youtu.be")){
        add(url, "Open YouTube");
      }else if(lower.includes("drive.google.com")){
        add(url, "Open Drive");
      }else{
        add(url, "Open Link");
      }
    });
    return out;
  }

  function appendMusicButtons(root, slot){
    const links = extractMusicLinks(slot?.notes || "");
    if(!links.length || !root) return;
    const wrap = document.createElement("div");
    wrap.className = "qMusicLinks";
    for(const link of links){
      const a = document.createElement("a");
      a.className = "btn tiny qMusicBtn";
      a.href = link.url;
      if(/^https?:\/\//i.test(link.url)){
        a.target = "_blank";
        a.rel = "noopener";
      }
      a.textContent = link.label;
      a.addEventListener("click", (e) => e.stopPropagation());
      wrap.appendChild(a);
    }
    root.appendChild(wrap);
  }

  function addSpecialButtons(actions, paperNumber){
    const n = Math.round(Number(paperNumber || 0));
    if(!Number.isFinite(n) || n <= 0) return;
    const addBtn = (label, fn) => {
      const b = document.createElement("button");
      b.className = "btn tiny";
      b.type = "button";
      b.textContent = label;
      const anchor = (state.queue || []).find(x => x && paperSlotNumber(x) === n) || null;
      const eta = anchor ? queueEtaMap.get(anchor.id) : null;
      b.title = eta
        ? `Insert after Open Slot #${n}. That slot's ETA is ${formatClockTime(eta)}.`
        : `Insert after Open Slot #${n}.`;
      b.addEventListener("click", (e) => {
        e.stopPropagation();
        fn(n);
      });
      actions.appendChild(b);
    };
    addBtn("Intermission After", (after) => openIntermissionModal(after));
    addBtn("Ad After", (after) => openAdModal(null, after));
    addBtn("House Band After", (after) => addHouseBandSlot(after));
  }

  function placeholderRow(slot){
    const div = document.createElement("div");
    div.className = "queueItem paperSlotEmpty";
    div.dataset.id = slot.id;
    div.dataset.paperSlot = String(paperSlotNumber(slot) || "");
    if(editingId === slot.id) div.classList.add("isEditing");

    const handle = document.createElement("div");
    handle.className = "paperSlotNumber";
    handle.textContent = paperSlotLabel(slot);

    const main = document.createElement("div");
    main.className = "qMain";
    const title = document.createElement("div");
    title.className = "paperEmptyTitle";
    title.textContent = "Open Slot";
    const hint = document.createElement("div");
    hint.className = "small";
    hint.textContent = "Viewer and KPIs skip this blank spot.";
    main.appendChild(title);
    main.appendChild(hint);

    const actions = document.createElement("div");
    actions.className = "qActions paperSlotActions";
    const add = document.createElement("button");
    add.className = "btn tiny good";
    add.type = "button";
    add.textContent = editingId === slot.id ? "Close" : "Add Performer";
    add.addEventListener("click", (e) => {
      e.stopPropagation();
      toggleInlineEdit(slot.id);
    });
    actions.appendChild(add);
    addSpecialButtons(actions, paperSlotNumber(slot));

    div.appendChild(handle);
    div.appendChild(main);
    div.appendChild(actions);
    if(editingId === slot.id && editDraft) div.appendChild(buildInlineExpander(slot));
    div.addEventListener("click", () => toggleInlineEdit(slot.id));
    return div;
  }

  function queueRow(slot){
    if(isPaperPlaceholder(slot)) return placeholderRow(slot);
    const { t, mins, icons, typeLabel } = slotBadge(slot);
    const div = document.createElement("div");

    // Visual roles (LIVE / NEXT / ON DECK / DONE) for clarity during busy nights
    const [n1, n2] = OMJN.computeNextTwo(state);
    const lockCurrent = (state.phase === "LIVE" || state.phase === "PAUSED") && !!state.currentSlotId;
    const isLive = lockCurrent && (slot.id === state.currentSlotId);
    const isDone = (slot.status === "DONE" || slot.status === "SKIPPED");
    const isNext = (!isLive && !isDone && n1 && slot.id === n1.id);
    const isDeck = (!isLive && !isDone && n2 && slot.id === n2.id);

    div.className = "queueItem";
    if(isLive) div.classList.add("livePinned");
    if(isNext) div.classList.add("isNext");
    if(isDeck) div.classList.add("isDeck");
    if(isDone) div.classList.add("isDone");
    if(slot.status !== "QUEUED") div.classList.add("notQueued");
    if(selectedId === slot.id) div.classList.add("isSelected");
    if(editingId === slot.id) div.classList.add("isEditing");

    const pNum = paperSlotNumber(slot);
    div.draggable = (slot.status === "QUEUED") && !isLive && !isDone && !pNum && (editingId !== slot.id);
    div.dataset.id = slot.id;
    div.dataset.slotType = String(slot.slotTypeId || "");
    if(t?.color) div.style.borderLeft = `6px solid ${t.color}`;

    // Role-based styling for quick scanning (broadcast-style)
    const slotTypeId = String(slot.slotTypeId || "");
    const isIntermission = slotTypeId === "intermission";
    const isHouseBand = slotTypeId === "houseband";
    const isJamaoke = slotTypeId === "jamaoke";
    const isAd = slotTypeId.startsWith("ad_");
    if(isLive) div.classList.add("role-live");
    else if(isNext) div.classList.add("role-next");
    else if(isDeck) div.classList.add("role-deck");
    else if(isDone) div.classList.add("role-done");
    else if(isIntermission) div.classList.add("role-intermission");
    else if(isHouseBand) div.classList.add("role-houseband");
    else if(isJamaoke) div.classList.add("role-jamaoke");
    else if(isAd) div.classList.add("role-ad");
    else div.classList.add("role-queued");

    if(div.draggable){
      div.addEventListener("dragstart", (e) => {
        // Allow full-row drag, but never start a drag from interactive controls
        // (buttons/inputs/selects/links or the inline expander).
        const blockSel = ".qActions, .qExpander, button, input, select, textarea, a, label";
        const t = e.target;
        if(t && t.closest && t.closest(blockSel)){
          e.preventDefault();
          e.stopPropagation();
          return;
        }
        div.classList.add("dragging");
        try{
          e.dataTransfer.effectAllowed = "move";
          // set both for broader browser compatibility
          e.dataTransfer.setData("text/plain", slot.id);
          e.dataTransfer.setData("text", slot.id);
        }catch(_){}
      });
      div.addEventListener("dragend", () => div.classList.remove("dragging"));
    }

    const handle = document.createElement("div");
    handle.className = "dragHandle";
    handle.textContent = "≡";

    if(pNum){
      handle.classList.add("paperSlotNumber");
      handle.textContent = `#${pNum}`;
      handle.title = `Open Slot #${pNum}`;
    }

    const main = document.createElement("div");
    main.className = "qMain";
    // Status bar (solid role color band)
    const bar = document.createElement("div");
    bar.className = "qBar";

    const barLeft = document.createElement("div");
    barLeft.className = "qBarLeft";

    const role = document.createElement("span");
    role.className = "qRole";
    if(isLive) role.textContent = "LIVE";
    else if(isNext) role.textContent = "UP NEXT";
    else if(isDeck) role.textContent = "ON DECK";
    else if(slotTypeId === "intermission") role.textContent = "INTERMISSION";
    else if(slotTypeId === "houseband") role.textContent = "HOUSE BAND SET";
    else if(slotTypeId === "jamaoke") role.textContent = "JAMAOKE";
    else if(slotTypeId.startsWith("ad_")) role.textContent = "AD";
    else if(isDone) role.textContent = (slot.status === "SKIPPED" ? (slot.noShow ? "NO-SHOW" : "SKIPPED") : "DONE");
    else role.textContent = "QUEUED";

    barLeft.appendChild(role);

    const pills = document.createElement("div");
    pills.className = "qPills";

    const pillType = document.createElement("span");
    pillType.className = "qPill";
    pillType.textContent = typeLabel;
    pills.appendChild(pillType);

    const pillMins = document.createElement("span");
    pillMins.className = "qPill qPillMins";
    pillMins.textContent = `${mins}m`;
    pills.appendChild(pillMins);

    // Requested: keep pills left, next to the status role label.
    barLeft.appendChild(pills);

    bar.appendChild(barLeft);

    const forecastDetail = queueEtaDetailMap.get(slot.id);

    // Approximate showtime for queued performers (non-ad). Updated by updateQueueEtaLabels().
    if(slot.status === "QUEUED" && !isAd && !isIntermission && !isHouseBand){
      const barRight = document.createElement("div");
      barRight.className = "qBarRight";
      if(forecastDetail){
        const helper = document.createElement("span");
        helper.className = "qForecastInline";
        helper.textContent = formatQueueForecastDetail(forecastDetail);
        helper.title = "ETA math breakdown for this queued performer.";
        barRight.appendChild(helper);
      }
      const eta = document.createElement("span");
      eta.className = "qEta mono";
      eta.dataset.slotId = slot.id;
      eta.title = "Approximate start time including queued durations, special slots, and transition assumptions.";
      eta.hidden = true;
      barRight.appendChild(eta);
      bar.appendChild(barRight);
    }

    // Name row (icon + name)
    const nameRow = document.createElement("div");
    nameRow.className = "qNameRow";

    const ico = document.createElement("span");
    ico.className = "qIcon";
    const icls = slotTypeIconClass(slotTypeId);
    ico.innerHTML = `<i class="${icls}" aria-hidden="true"></i>`;

    const name = document.createElement("div");
    name.className = "qName";
    name.textContent = (slotTypeId === "houseband") ? houseBandQueueTitle(slot.displayName) : (slot.displayName || "—");

    nameRow.appendChild(ico);
    nameRow.appendChild(name);

    const meta = document.createElement("div");
    meta.className = "qMeta";
    const st = document.createElement("span");
    st.textContent = slot.status;
    meta.appendChild(st);

    if(icons.length){
      const ic = document.createElement("span");
      ic.textContent = icons.join(" ");
      meta.appendChild(ic);
    }

    const afterPaper = Math.round(Number(slot.afterPaperSlotNumber || 0));
    if(Number.isFinite(afterPaper) && afterPaper > 0){
      const after = document.createElement("span");
      after.textContent = `After #${afterPaper}`;
      meta.appendChild(after);
    }

    if(isDone) appendDoneKpis(meta, slot, mins);

    const houseBandLine = isHouseBand ? houseBandLineupSummary(slot) : "";

    const actions = document.createElement("div");
    actions.className = "qActions";

    // Edit / Close (inline expander)
    if(!isDone){
      const btnEdit = document.createElement("button");
      btnEdit.className = "btn tiny";
      const isOpen = (editingId === slot.id);
      btnEdit.textContent = isOpen ? "Close" : "Edit";
      btnEdit.addEventListener("click", (e) => {
        e.stopPropagation();
        if(isAdSlotType(slot.slotTypeId)){ openAdModal(slot.id); return; }

        toggleInlineEdit(slot.id);
      });
      actions.appendChild(btnEdit);

      // Skip (swap down one spot) - disabled for current performer
      const btnSkip = document.createElement("button");
      btnSkip.className = "btn tiny";
      btnSkip.textContent = "Skip";
      btnSkip.title = "Swap down one spot";
      btnSkip.disabled = (slot.status !== "QUEUED") || isLive;
      btnSkip.addEventListener("click", (e) => {
        e.stopPropagation();
        skipSwapDown(slot.id);
      });
      actions.appendChild(btnSkip);

      // No-show (not applicable for special screens like Intermission)
      if(String(slot.slotTypeId || "") !== "intermission"){
        const btnNo = document.createElement("button");
        btnNo.className = "btn tiny";
        btnNo.textContent = "No-show";
        btnNo.title = "Mark as no-show and move to Completed";
        btnNo.disabled = (slot.status !== "QUEUED") || isLive;
        btnNo.addEventListener("click", (e) => {
          e.stopPropagation();
          markNoShow(slot.id);
        });
        actions.appendChild(btnNo);
      }
    }

    if(isDone){
      const btnRq = document.createElement("button");
      btnRq.className = "btn tiny";
      btnRq.textContent = "Re-queue";
      btnRq.title = "Move back to Active queue";
      btnRq.addEventListener("click", (e) => {
        e.stopPropagation();
        requeueSlot(slot.id);
      });
      actions.appendChild(btnRq);
    }else{
      if(pNum && slot.status === "QUEUED" && !isLive){
        const btnMoveTo = document.createElement("button");
        btnMoveTo.className = "btn tiny";
        btnMoveTo.textContent = "Move #";
        btnMoveTo.title = "Move to an Open Slot number";
        btnMoveTo.addEventListener("click", (e) => {
          e.stopPropagation();
          moveSlotToPaperNumber(slot.id);
        });
        actions.appendChild(btnMoveTo);
      }

      const btnUp = document.createElement("button");
      btnUp.className = "btn tiny";
      btnUp.textContent = "↑";
      btnUp.title = "Move up";
      btnUp.disabled = (slot.status !== "QUEUED") || isLive;
      btnUp.addEventListener("click", (e) => {
        e.stopPropagation();
        moveSlot(slot.id, -1);
      });

      const btnDn = document.createElement("button");
      btnDn.className = "btn tiny";
      btnDn.textContent = "↓";
      btnDn.title = "Move down";
      btnDn.disabled = (slot.status !== "QUEUED") || isLive;
      btnDn.addEventListener("click", (e) => {
        e.stopPropagation();
        moveSlot(slot.id, +1);
      });

      actions.appendChild(btnUp);
      actions.appendChild(btnDn);

      if(pNum && slot.status === "QUEUED"){
        addSpecialButtons(actions, pNum);
      }
    }

    const btnDel = document.createElement("button");
    btnDel.className = "btn tiny danger";
    btnDel.textContent = "✕";
    btnDel.title = "Remove from queue";
    btnDel.addEventListener("click", (e) => {
      e.stopPropagation();
      removeSlot(slot.id);
    });
    actions.prepend(btnDel);

    main.appendChild(bar);
    main.appendChild(nameRow);
    if(isHouseBand && houseBandLine){
      const sub = document.createElement("div");
      sub.className = "qNotesSub";
      sub.textContent = houseBandLine;
      main.appendChild(sub);
    }else{
      appendNotesPreview(main, slot.notes);
    }
    appendMusicButtons(main, slot);
    main.appendChild(meta);

    div.appendChild(handle);
    div.appendChild(main);
    div.appendChild(actions);
    // Inline expander under row (text-only edits)
    if(editingId === slot.id && editDraft){
      try{
        div.appendChild(buildInlineExpander(slot));
      }catch(_){ /* never block queue rendering */ }
    }

    div.addEventListener("click", () => {
      selectSlot(slot.id);
    });

    return div;
  }

  function renderQueue(){
    if(!els.queue) return;

    els.queue.innerHTML = "";
    try{
      const forecast = buildQueueForecast(Date.now());
      queueEtaMap = forecast.etaMap;
      queueEtaDetailMap = forecast.detailMap;
    }catch(_){
      queueEtaMap = new Map();
      queueEtaDetailMap = new Map();
    }

    const isDone = (x) => x && (x.status === "DONE" || x.status === "SKIPPED");
    const active = (state.queue || []).filter(x => !isDone(x));
    const done = (state.queue || []).filter(isDone);

    if(!active.length){
      const empty = document.createElement("div");
      empty.className = "small";
      empty.textContent = done.length
        ? "No active performers. Completed / No Show rows are hidden below."
        : "No active signups yet. Add a performer above.";
      els.queue.appendChild(empty);
    } else {
      for(const slot of active){
        els.queue.appendChild(queueRow(slot));
      }
    }

    if(done.length){
      const details = document.createElement("details");
      details.className = "doneDetails";
      details.open = !!completedExpanded;
      details.addEventListener("toggle", () => {
        completedExpanded = !!details.open;
      });

      const summary = document.createElement("summary");
      summary.className = "queueDivider";
      const left = document.createElement("div");
      left.textContent = "Completed / No Show";
      const right = document.createElement("div");
      right.className = "mono";
      right.textContent = String(done.length);
      summary.appendChild(left);
      summary.appendChild(right);
      details.appendChild(summary);

      const doneWrap = document.createElement("div");
      doneWrap.className = "doneQueue";
      for(const slot of done){
        doneWrap.appendChild(queueRow(slot));
      }
      details.appendChild(doneWrap);
      els.queue.appendChild(details);
    }

    // Keep approximate showtimes current
    updateQueueEtaLabels();
  }

  // ---- Queue ETA + Estimated End forecast ----
  let queueEtaMap = new Map();
  let queueEtaDetailMap = new Map();

  function slotNeedsChangeoverBuffer(slot){
    if(!slot) return false;
    const typeId = String(slot.slotTypeId || "");
    if(!typeId) return true;
    if(typeId.startsWith("ad_")) return false;
    if(typeId === "intermission") return false;
    return true;
  }

  function isUntimedForecastSlot(slot){
    const typeId = String(slot?.slotTypeId || "");
    return typeId === "jamaoke";
  }

  function forecastCurrentRemainingMs(slot){
    if(!slot) return 0;
    const typeId = String(slot.slotTypeId || "");
    if(typeId.startsWith("ad_")) return 0;
    const t = OMJN.computeTimer(state);
    if((t.durationMs || 0) > 0){
      return Math.max(t.remainingMs || 0, 0);
    }
    if(isUntimedForecastSlot(slot)) return OMJN.effectiveMinutes(state, slot) * 60 * 1000;
    return 0;
  }

  function formatApproxTime(tsMs){
    const t = new Date(tsMs);
    return `${t.toLocaleTimeString([], { hour:"numeric", minute:"2-digit" })} (≈)`;
  }

  function formatLeadDuration(ms){
    const totalMin = Math.max(0, Math.round((Number(ms) || 0) / 60000));
    if(totalMin <= 0) return "<1m";
    const h = Math.floor(totalMin / 60);
    const m = totalMin % 60;
    if(h && m) return `${h}h ${m}m`;
    if(h) return `${h}h`;
    return `${m}m`;
  }

  function formatQueueForecastDetail(detail){
    if(!detail) return "";
    const math = [];
    if(detail.currentLeftMs > 0){
      math.push(`${formatLeadDuration(detail.currentLeftMs)} current`);
    }
    if(detail.pendingTransitionMs > 0){
      math.push(`${formatLeadDuration(detail.pendingTransitionMs)} current transition`);
    }
    if(detail.performerDurationBeforeMs > 0){
      const count = detail.performerBeforeCount ? ` (${detail.performerBeforeCount})` : "";
      math.push(`${formatLeadDuration(detail.performerDurationBeforeMs)} performers${count}`);
    }
    if(detail.specialDurationBeforeMs > 0){
      const count = detail.specialBeforeCount ? ` (${detail.specialBeforeCount})` : "";
      math.push(`${formatLeadDuration(detail.specialDurationBeforeMs)} special${count}`);
    }
    if(detail.futureTransitionCount){
      math.push(`${formatLeadDuration(detail.futureTransitionTotalMs)} transitions (${detail.futureTransitionCount}x${formatLeadDuration(detail.forecastTransitionMs)})`);
    }
    if(!math.length){
      math.push("next up now");
    }
    return `Ahead ${formatLeadDuration(detail.aheadMs)} | ${math.join(" + ")}`;
  }

  function buildQueueForecast(nowMs){
    const etaMap = new Map();
    const detailMap = new Map();
    const tfStats = getTransitionForecastStats(state);
    const forecastTransitionMs = tfStats.forecastSec * 1000;
    let transitionCount = 0;
    let transitionTotalMs = 0;
    let pendingTransitionMs = 0;
    let pendingTransitionApplied = false;
    let futureTransitionCount = 0;
    let futureTransitionTotalMs = 0;
    let slotsBeforeCount = 0;
    let specialBeforeCount = 0;
    let performerBeforeCount = 0;
    let slotDurationBeforeMs = 0;
    let performerDurationBeforeMs = 0;
    let specialDurationBeforeMs = 0;
    let currentLeftMs = 0;

    const phase = state.phase || "SPLASH";
    const hasCurrent = (phase === "LIVE" || phase === "PAUSED") && !!state.currentSlotId;

    const isDone = (x) => x && (x.status === "DONE" || x.status === "SKIPPED");
    const active = (state.queue || []).filter(x => x && !isDone(x));
    const curIdx = hasCurrent ? active.findIndex(x => x.id === state.currentSlotId) : -1;

    let cursor = nowMs;
    let prevSlot = null;

    if(curIdx !== -1){
      try{
        const cur = active[curIdx];
        prevSlot = cur || null;
        currentLeftMs = forecastCurrentRemainingMs(cur);
        cursor += currentLeftMs;
      }catch(_){
        currentLeftMs = 0;
        prevSlot = null;
      }
    }

    const start = (curIdx === -1) ? 0 : (curIdx + 1);

    for(let i = start; i < active.length; i++){
      const s = active[i];
      OMJN.normalizeSlot(s);
      if(s.status !== "QUEUED") continue;

      if(!prevSlot && !pendingTransitionApplied){
        pendingTransitionMs = getPendingTransitionRemainingMs(s, nowMs, forecastTransitionMs, tfStats);
        pendingTransitionApplied = true;
        if(pendingTransitionMs > 0){
          cursor += pendingTransitionMs;
          transitionCount += 1;
          transitionTotalMs += pendingTransitionMs;
        }
      }else if(prevSlot && slotNeedsChangeoverBuffer(prevSlot) && slotNeedsChangeoverBuffer(s)){
        cursor += forecastTransitionMs;
        transitionCount += 1;
        transitionTotalMs += forecastTransitionMs;
        futureTransitionCount += 1;
        futureTransitionTotalMs += forecastTransitionMs;
      }

      const typeId = String(s.slotTypeId || "");
      const isAd = typeId.startsWith("ad_");
      const isIntermission = typeId === "intermission";
      const isHouseBand = typeId === "houseband";
      const isSpecial = isAd || isIntermission || isHouseBand;

      if(!isAd && !isIntermission && !isHouseBand){
        etaMap.set(s.id, cursor);
        detailMap.set(s.id, {
          aheadMs: Math.max(0, cursor - nowMs),
          currentLeftMs,
          slotsBeforeCount,
          slotDurationBeforeMs,
          specialBeforeCount,
          specialDurationBeforeMs,
          performerBeforeCount,
          performerDurationBeforeMs,
          transitionCount,
          forecastTransitionMs,
          transitionTotalMs,
          pendingTransitionMs,
          futureTransitionCount,
          futureTransitionTotalMs,
        });
      }

      const durMs = OMJN.effectiveMinutes(state, s) * 60 * 1000;
      cursor += durMs;
      slotsBeforeCount += 1;
      slotDurationBeforeMs += durMs;
      if(isSpecial){
        specialBeforeCount += 1;
        specialDurationBeforeMs += durMs;
      }else{
        performerBeforeCount += 1;
        performerDurationBeforeMs += durMs;
      }
      prevSlot = s;
    }

    const estEndTs = (cursor > nowMs) ? cursor : null;
    return {
      etaMap,
      detailMap,
      estEndTs,
      transitionCount,
      transitionTotalMs,
      pendingTransitionMs,
      futureTransitionCount,
      futureTransitionTotalMs,
      forecastTransitionMs,
      tfStats,
    };
  }

  function updateQueueEtaLabels(nowMs = Date.now()){
    let nodes;
    try{
      const forecast = buildQueueForecast(nowMs);
      queueEtaMap = forecast.etaMap;
      queueEtaDetailMap = forecast.detailMap;
      nodes = document.querySelectorAll(".qEta[data-slot-id]");
      for(const node of nodes){
        const id = node.dataset.slotId;
        const ts = queueEtaMap.get(id);
        if(ts){
          node.textContent = formatApproxTime(ts);
          node.hidden = false;
        }else{
          node.textContent = "";
          node.hidden = true;
        }
      }
    }catch(_){
      try{
        nodes = nodes || document.querySelectorAll(".qEta[data-slot-id]");
        for(const node of nodes){
          node.textContent = "";
          node.hidden = true;
        }
      }catch(__){}
    }
  }

  function renderEstimatedEnd(nowMs = Date.now()){
    if(!els.kpiEstEnd) return;
    try{
      const forecast = buildQueueForecast(nowMs);
      const ts = forecast.estEndTs;
      if(!ts){
        els.kpiEstEnd.textContent = "—";
      }else{
        const end = new Date(ts);
        els.kpiEstEnd.textContent = end.toLocaleTimeString([], { hour:"numeric", minute:"2-digit" });
      }
      if(els.kpiTransitionAvg){
        els.kpiTransitionAvg.textContent = OMJN.formatMMSS(forecast.forecastTransitionMs || 0);
      }
      if(els.kpiTransitionMeta){
        const meta = [];
        meta.push(forecast.tfStats.autoLearn ? "Auto" : "Manual");
        if(forecast.tfStats.observedCount){
          meta.push(`${forecast.tfStats.observedCount} gaps`);
        }else{
          meta.push("No gaps yet");
        }
        if(forecast.tfStats.manualAdjustSec){
          meta.push(formatSignedDurationMs(forecast.tfStats.manualAdjustSec * 1000));
        }
        els.kpiTransitionMeta.textContent = meta.join(" • ");
      }
      if(els.kpiEstHint){
        if(!ts){
          els.kpiEstHint.textContent = "ETA appears when there is current or queued show time to forecast.";
        }else if(forecast.pendingTransitionMs > 0 && forecast.futureTransitionCount > 0){
          const plural = forecast.futureTransitionCount === 1 ? "" : "s";
          els.kpiEstHint.textContent = `ETA includes current transition remaining ${OMJN.formatMMSS(forecast.pendingTransitionMs)} plus ${forecast.futureTransitionCount} future transition${plural} at ${OMJN.formatMMSS(forecast.forecastTransitionMs)} each.`;
        }else if(forecast.pendingTransitionMs > 0){
          els.kpiEstHint.textContent = `ETA includes the current transition in progress: ${OMJN.formatMMSS(forecast.pendingTransitionMs)} remaining.`;
        }else if(forecast.futureTransitionCount > 0){
          const plural = forecast.futureTransitionCount === 1 ? "" : "s";
          els.kpiEstHint.textContent = `ETA includes ${forecast.futureTransitionCount} future transition${plural} at ${OMJN.formatMMSS(forecast.forecastTransitionMs)} each.`;
        }else{
          els.kpiEstHint.textContent = "ETA is currently based only on active and queued slot durations.";
        }
      }
    }catch(_){
      els.kpiEstEnd.textContent = "—";
      if(els.kpiTransitionAvg) els.kpiTransitionAvg.textContent = "—";
      if(els.kpiTransitionMeta) els.kpiTransitionMeta.textContent = "Forecast unavailable";
      if(els.kpiEstHint) els.kpiEstHint.textContent = "ETA forecast unavailable.";
    }
  }


function getDragAfterElement(container, y){
    const items = [...container.querySelectorAll('.queueItem:not(.dragging)')];
    return items.reduce((closest, child) => {
      const box = child.getBoundingClientRect();
      const offset = y - box.top - box.height / 2;
      if(offset < 0 && offset > closest.offset){
        return { offset, element: child };
      } else {
        return closest;
      }
    }, { offset: Number.NEGATIVE_INFINITY, element: null }).element;
  }

  // Performer queue drag & drop (reorder)
  let performerDnDBound = false;

  function getDragAfterElementActive(container, y){
    const items = [...container.querySelectorAll('.queueItem:not(.dragging):not(.isDone)')];
    return items.reduce((closest, child) => {
      const box = child.getBoundingClientRect();
      const offset = y - box.top - box.height / 2;
      if(offset < 0 && offset > closest.offset){
        return { offset, element: child };
      }
      return closest;
    }, { offset: Number.NEGATIVE_INFINITY, element: null }).element;
  }

  function bindPerformerDnD(){
    if(performerDnDBound) return;
    if(!els.queue) return;
    performerDnDBound = true;

    els.queue.addEventListener('dragover', (e) => {
      e.preventDefault();
      try{ e.dataTransfer.dropEffect = 'move'; }catch(_){ }
      const dragging = els.queue.querySelector('.queueItem.dragging');
      if(!dragging) return;

      const after = getDragAfterElementActive(els.queue, e.clientY);
      const divider = els.queue.querySelector('.queueDivider');

      if(after && after !== dragging){
        els.queue.insertBefore(dragging, after);
      }else if(divider){
        els.queue.insertBefore(dragging, divider);
      }else{
        els.queue.appendChild(dragging);
      }
    });

    els.queue.addEventListener('drop', (e) => {
      e.preventDefault();
      const draggedId = e.dataTransfer.getData('text/plain');
      if(!draggedId) return;

      const activeIds = [...els.queue.querySelectorAll('.queueItem:not(.isDone)')]
        .map(el => el.dataset.id)
        .filter(Boolean);
      if(!activeIds.length) return;

      updateState(s => {
        const isDone = (x) => x && (x.status === 'DONE' || x.status === 'SKIPPED');
        const done = s.queue.filter(isDone);
        const active = s.queue.filter(x => !isDone(x));
        const map = new Map(active.map(x => [x.id, x]));

        const next = [];
        const seen = new Set();

        for(const id of activeIds){
          const slot = map.get(id);
          if(slot && !seen.has(id)){
            next.push(slot);
            seen.add(id);
          }
        }
        for(const slot of active){
          if(slot && !seen.has(slot.id)){
            next.push(slot);
            seen.add(slot.id);
          }
        }

        const lockCurrent = !!s.currentSlotId && (s.phase === 'LIVE' || s.phase === 'PAUSED');
        if(lockCurrent){
          const idx = next.findIndex(x => x.id === s.currentSlotId);
          if(idx > 0){
            const [cur] = next.splice(idx, 1);
            next.unshift(cur);
          }
        }

        s.queue = [...next, ...done];
      });
    });
  }


  function moveSlot(slotId, delta){
    updateState(s => {
      const idx = s.queue.findIndex(x=>x.id===slotId);
      if(idx < 0) return;

      const slot = s.queue[idx];
      if(!slot) return;
      if(slot.status === "DONE" || slot.status === "SKIPPED") return; // completed lives in Completed tab

      const lockCurrent = !!s.currentSlotId && (s.phase === "LIVE" || s.phase === "PAUSED");
      // do not move the live slot while LIVE/PAUSED
      if(lockCurrent && slotId === s.currentSlotId) return;

      if(isPaperSlot(slot) && paperSlotNumber(slot)){
        const activePaper = s.queue
          .filter(x => x && isPaperSlot(x) && !isDoneStatus(x.status))
          .sort((a,b) => (paperSlotNumber(a) || 0) - (paperSlotNumber(b) || 0));
        const paperIdx = activePaper.findIndex(x => x.id === slotId);
        const target = activePaper[paperIdx + delta] || null;
        const targetNumber = paperSlotNumber(target);
        if(targetNumber) movePaperSlotNumberInState(s, slotId, targetNumber);
        return;
      }

      const liveIdx = lockCurrent ? s.queue.findIndex(x=>x.id===s.currentSlotId) : -1;
      const minIdx = (liveIdx >= 0) ? liveIdx + 1 : 0;

      const doneStart = s.queue.findIndex(x => x.status === "DONE" || x.status === "SKIPPED");
      const maxIdx = (doneStart >= 0) ? Math.max(minIdx, doneStart - 1) : (s.queue.length - 1);

      const idx2 = Math.max(minIdx, Math.min(maxIdx, idx + delta));
      if(idx2 === idx) return;

      const [it] = s.queue.splice(idx, 1);
      s.queue.splice(idx2, 0, it);
    });
  }

  function moveSlotToPaperNumber(slotId){
    const slot = state.queue.find(x => x && x.id === slotId);
    if(!slot || !isPaperSlot(slot) || isDoneStatus(slot.status)) return;
    const current = paperSlotNumber(slot) || "";
    const raw = prompt(`Move "${slot.displayName || "this performer"}" to Open Slot number:`, String(current));
    if(raw === null) return;
    const dest = Math.round(Number(raw));
    if(!Number.isFinite(dest) || dest <= 0){
      alert("Enter a valid Open Slot number.");
      return;
    }

    let result = true;
    updateState(s => {
      result = movePaperSlotNumberInState(s, slotId, dest);
    });

    if(result === "completed"){
      alert(`Open Slot #${dest} is already in Completed / No Show. Choose an open active slot number.`);
    }
  }


  function requeueSlot(slotId){
    updateState(s => {
      const idx = s.queue.findIndex(x=>x.id===slotId);
      if(idx < 0) return;

      const slot = s.queue[idx];
      if(!slot) return;
      if(slot.status !== "DONE" && slot.status !== "SKIPPED") return;

      slot.status = "QUEUED";
      slot.completedAt = null;
      slot.actualEndedAt = null;
      slot.actualDurationMs = null;
      slot.actualWallDurationMs = null;
      slot.noShow = false;
      slot.isPlaceholder = false;

      const prefs = ensureOperatorPrefs(s);
      const activeMax = (s.queue || [])
        .filter(x => x && isPaperSlot(x) && !isDoneStatus(x.status) && x.id !== slotId)
        .reduce((max, x) => Math.max(max, paperSlotNumber(x) || 0), 0);
      const nextNumber = Math.max(prefs.paperSlotCount, activeMax) + 1;
      prefs.paperSlotCount = Math.max(prefs.paperSlotCount, nextNumber);
      slot.paperSlotNumber = nextNumber;

      // move to bottom of Active (before first completed)
      const [moved] = s.queue.splice(idx, 1);
      const doneStart = s.queue.findIndex(x => x.status === "DONE" || x.status === "SKIPPED");
      const insertAt = (doneStart >= 0) ? doneStart : s.queue.length;
      s.queue.splice(insertAt, 0, moved);
    });
  }

  
  function removeSlot(slotId){
    const slot = state.queue.find(x=>x.id===slotId);
    if(!slot) return;
    const ok = confirm(`Remove "${slot.displayName}" from the queue entirely?`);
    if(!ok) return;

    updateState(s => {
      const idx = s.queue.findIndex(x=>x.id===slotId);
      if(idx < 0) return;
      const [removed] = s.queue.splice(idx, 1);
      if(removed && isPaperSlot(removed) && isDoneStatus(removed.status)){
        const n = paperSlotNumber(removed);
        if(n){
          const prefs = ensureOperatorPrefs(s);
          prefs.retiredPaperSlots = Array.from(new Set([...(prefs.retiredPaperSlots || []), n])).sort((a,b) => a-b);
        }
      }

      if(s.currentSlotId === slotId){
        s.currentSlotId = null;
        s.phase = "SPLASH";
        s.timer.running = false;
        s.timer.startedAt = null;
        s.timer.elapsedMs = 0;
        s.timer.baseDurationMs = null;
      }

      const assetId = removed?.media?.imageAssetId;
      if(assetId){
        const stillUsed = s.queue.some(x => x?.media?.imageAssetId === assetId);
        if(!stillUsed){
          delete s.assetsIndex[assetId];
          OMJN.deleteAsset(assetId).catch(()=>{});
        }
      }
    });

    if(selectedId === slotId) selectedId = null;
    render();
  }


  function fillHBInstrumentSelect(sel){
    const opts = OMJN.houseBandInstrumentOptions();
    sel.innerHTML = "";
    for(const o of opts){
      const opt = document.createElement("option");
      opt.value = o.id;
      opt.textContent = o.label;
      sel.appendChild(opt);
    }
  }

  function toggleHBCustomField(){
    const id = els.hbAddInstrument?.value || "guitar";
    if(!els.hbAddCustomWrap) return;
    els.hbAddCustomWrap.style.display = (id === "custom") ? "" : "none";
  }

  function parseTagsInput(s){
    return String(s || "")
      .split(",")
      .map(x => OMJN.sanitizeText(x))
      .map(x => x.trim())
      .filter(Boolean)
      .slice(0, 10);
  }

  function addHouseBandMember(){
    const name = OMJN.sanitizeText(els.hbAddName?.value || "");
    const instrumentId = els.hbAddInstrument?.value || "guitar";
    const customInstrument = OMJN.sanitizeText(els.hbAddCustomInstrument?.value || "");
    const skillTags = parseTagsInput(els.hbAddTags?.value || "");

    if(!name) return;
    updateState(st => {
      OMJN.ensureHouseBandQueues(st);
      OMJN.addHouseBandMember(st, {
        id: OMJN.uid("hb"),
        name,
        instrumentId,
        customInstrument: (instrumentId === "custom") ? customInstrument : "",
        skillTags,
        active: true,
      });
    });

    if(els.hbAddName) els.hbAddName.value = "";
    if(els.hbAddTags) els.hbAddTags.value = "";
    if(els.hbAddCustomInstrument) els.hbAddCustomInstrument.value = "";

    // Accordion UX: auto-open the category we just added to, and scroll it into view.
    try{
      const catKey = OMJN.houseBandCategoryKeyForInstrumentId(instrumentId);
      const target = document.querySelector(`details.hbAcc[data-hbcat="${catKey}"]`);
        if (target) {
            target.open = true; // allow multiple categories open
            target.scrollIntoView({ block: "nearest", behavior: "smooth" });
        }

    }catch(_){ /* no-op */ }
  }

  function rotateHouseBandTop(categoryKey){
    updateState(s => {
      OMJN.rotateHouseBandTopToEnd(s, categoryKey);
    });
  }

  function hbItem(member, catKey){
    OMJN.normalizeHouseBandMember(member);

    const div = document.createElement("div");
    div.className = "queueItem";
    div.draggable = true;
    div.dataset.id = member.id;
    div.dataset.cat = catKey;

    div.addEventListener("dragstart", (e) => {
      div.classList.add("dragging");
      e.dataTransfer.setData("text/plain", `${catKey}:${member.id}`);
      e.dataTransfer.effectAllowed = "move";
    });
    div.addEventListener("dragend", () => div.classList.remove("dragging"));

    const handle = document.createElement("div");
    handle.className = "dragHandle";
    handle.textContent = "≡";

    const main = document.createElement("div");
    main.className = "hbItemRow";

    const activeWrap = document.createElement("label");
    activeWrap.style.display = "inline-flex";
    activeWrap.style.alignItems = "center";
    activeWrap.style.gap = "6px";
    activeWrap.style.cursor = "pointer";
    const active = document.createElement("input");
    active.type = "checkbox";
    active.checked = (member.active !== false);
    active.title = "Active";
    active.addEventListener("change", () => {
      updateState(st => {
        OMJN.ensureHouseBandQueues(st);
        const list = st.houseBandQueues?.[catKey] || [];
        const m = list.find(x => x.id === member.id);
        if(!m) return;
        m.active = !!active.checked;
      }, { recordHistory:false });
    });
    const activeLbl = document.createElement("span");
    activeLbl.className = "small";
    activeLbl.textContent = "active";
    activeWrap.appendChild(active);
    activeWrap.appendChild(activeLbl);

    const nameField = document.createElement("div");
    nameField.className = "field";
    nameField.style.flex = "1 1 180px";
    const nameInput = document.createElement("input");
    nameInput.type = "text";
    nameInput.value = member.name || "";
    nameInput.placeholder = "Name";
    nameInput.addEventListener("input", () => {
      updateState(st => {
        OMJN.ensureHouseBandQueues(st);
        const list = st.houseBandQueues?.[catKey] || [];
        const m = list.find(x => x.id === member.id);
        if(!m) return;
        m.name = OMJN.sanitizeText(nameInput.value);
      }, { recordHistory:false });
    });
    nameField.appendChild(nameInput);

    const instField = document.createElement("div");
    instField.className = "field";
    instField.style.width = "200px";
    const instSelect = document.createElement("select");
    fillHBInstrumentSelect(instSelect);
    instSelect.value = member.instrumentId || "guitar";
    instSelect.addEventListener("change", () => {
      const nextInst = instSelect.value;
      updateState(st => {
        OMJN.ensureHouseBandQueues(st);
        // Find + remove from current category
        const curList = st.houseBandQueues?.[catKey] || [];
        const idx = curList.findIndex(x => x.id === member.id);
        if(idx < 0) return;
        const [m] = curList.splice(idx, 1);
        m.instrumentId = nextInst;
        if(nextInst !== "custom") m.customInstrument = "";
        const nextCat = OMJN.houseBandCategoryKeyForMember(m);
        if(!st.houseBandQueues[nextCat]) st.houseBandQueues[nextCat] = [];
        st.houseBandQueues[nextCat].push(m);
      }, { recordHistory:false });
    });
    instField.appendChild(instSelect);

    const customField = document.createElement("div");
    customField.className = "field";
    customField.style.flex = "1 1 180px";
    const customInput = document.createElement("input");
    customInput.type = "text";
    customInput.placeholder = "Custom instrument";
    customInput.value = member.customInstrument || "";
    customField.style.display = (member.instrumentId === "custom") ? "" : "none";
    customInput.addEventListener("input", () => {
      updateState(st => {
        OMJN.ensureHouseBandQueues(st);
        const list = st.houseBandQueues?.[catKey] || [];
        const m = list.find(x => x.id === member.id);
        if(!m) return;
        m.customInstrument = OMJN.sanitizeText(customInput.value);
      }, { recordHistory:false });
    });
    customField.appendChild(customInput);

    instSelect.addEventListener("change", () => {
      // Best-effort: toggle custom field visibility immediately
      customField.style.display = (instSelect.value === "custom") ? "" : "none";
    });

    const tagsField = document.createElement("div");
    tagsField.className = "field";
    tagsField.style.flex = "1 1 220px";
    const tagsInput = document.createElement("input");
    tagsInput.type = "text";
    tagsInput.placeholder = "tags (comma)";
    tagsInput.value = Array.isArray(member.skillTags) ? member.skillTags.join(", ") : "";
    tagsInput.addEventListener("input", () => {
      updateState(st => {
        OMJN.ensureHouseBandQueues(st);
        const list = st.houseBandQueues?.[catKey] || [];
        const m = list.find(x => x.id === member.id);
        if(!m) return;
        m.skillTags = parseTagsInput(tagsInput.value);
      }, { recordHistory:false });
    });
    tagsField.appendChild(tagsInput);

    const btnRotate = document.createElement("button");
    btnRotate.className = "btn tiny hbSmallBtn";
    btnRotate.textContent = "Rotate";
    btnRotate.title = "Move to end of this category";
    btnRotate.addEventListener("click", (e) => {
      e.stopPropagation();
      updateState(st => OMJN.rotateHouseBandMemberToEnd(st, member.id));
    });

    const btnRemove = document.createElement("button");
    btnRemove.className = "btn tiny danger hbSmallBtn";
    btnRemove.textContent = "✕";
    btnRemove.title = "Remove";
    btnRemove.addEventListener("click", (e) => {
      e.stopPropagation();
      updateState(st => OMJN.removeHouseBandMember(st, member.id));
    });

    main.appendChild(activeWrap);
    main.appendChild(nameField);
    main.appendChild(instField);
    main.appendChild(customField);
    main.appendChild(tagsField);
    main.appendChild(btnRotate);
    main.appendChild(btnRemove);

    div.appendChild(handle);
    div.appendChild(main);
    return div;
  }

  function renderHouseBandCategories(){
    OMJN.ensureHouseBandQueues(state);
    const cats = OMJN.houseBandCategories();
    for(const cat of cats){
      const listEl = document.getElementById(`hbCat_${cat.key}`);
      if(!listEl) continue;
      listEl.innerHTML = "";
      const members = state.houseBandQueues?.[cat.key] || [];

      // Update the accordion count (shows even when collapsed)
      const countEl = document.getElementById(`hbCount_${cat.key}`);
      if(countEl){
        const activeCount = members.filter(m => {
          OMJN.normalizeHouseBandMember(m);
          return m.active !== false;
        }).length;
        countEl.textContent = members.length ? `${activeCount}/${members.length}` : "";
        countEl.title = members.length ? `${activeCount} active of ${members.length}` : "";
      }

      if(!members.length){
        const empty = document.createElement("div");
        empty.className = "small";
        empty.textContent = "—";
        listEl.appendChild(empty);
        continue;
      }
      for(const m of members){
        listEl.appendChild(hbItem(m, cat.key));
      }
    }
  }

function renderKPIs(nowMs = Date.now()){
    const current = OMJN.computeCurrent(state);
    const [next] = OMJN.computeNextTwo(state);

    els.kpiCurrent.textContent = current ? current.displayName : "—";
    els.kpiNext.textContent = next ? next.displayName : "—";

    // Performers left = current (if LIVE/PAUSED) + queued
    const queued = (state.queue || []).filter(x => x && x.status === "QUEUED");
    const hasCurrent = !!current && (state.phase === "LIVE" || state.phase === "PAUSED");
    const left = queued.length + (hasCurrent ? 1 : 0);
    if(els.kpiLeft) els.kpiLeft.textContent = String(left);

    renderEstimatedEnd(nowMs);
    renderNowTime();
  }

  function renderNowTime(){
    if(!els.kpiNowTime) return;
    try{
      els.kpiNowTime.textContent = new Date().toLocaleTimeString([], { hour:"numeric", minute:"2-digit" });
    }catch(_){
      els.kpiNowTime.textContent = "—";
    }
  }

  function renderStatusBanner(){
    if(!els.statusBanner) return;

    let hbTs = 0;
    try{ hbTs = Number(localStorage.getItem(VIEWER_HEARTBEAT_KEY) || 0); }catch(_){ hbTs = 0; }
    const viewerOk = hbTs && ((Date.now() - hbTs) < 2500);

    const phase = state.phase || "SPLASH";
    const phaseDot = (phase === "LIVE") ? "good" : (phase === "PAUSED") ? "warn" : "";
    const phaseLabel = (phase === "LIVE") ? "LIVE" : (phase === "PAUSED") ? "PAUSED" : "SPLASH";

    const savedAt = state.lastSavedAt ? new Date(state.lastSavedAt) : null;
    const savedText = savedAt
      ? `Saved ${savedAt.toLocaleTimeString([], { hour:"2-digit", minute:"2-digit", second:"2-digit" })}`
      : "Not saved yet";

    const doneCount = (state.queue || []).filter(x => x && (x.status === "DONE" || x.status === "SKIPPED")).length;
    const activeCount = Math.max(0, (state.queue || []).length - doneCount);

    const mk = (label, dotClass="") => {
      const span = document.createElement("span");
      span.className = "sbItem";
      if(dotClass){
        const d = document.createElement("span");
        d.className = `sbDot ${dotClass}`;
        span.appendChild(d);
      }
      const t = document.createElement("span");
      t.textContent = label;
      span.appendChild(t);
      return span;
    };

    els.statusBanner.innerHTML = "";
    els.statusBanner.appendChild(mk(`Phase: ${phaseLabel}`, phaseDot));
    els.statusBanner.appendChild(mk(`Viewer: ${viewerOk ? "Connected" : "Not detected"}`, viewerOk ? "good" : "bad"));
    els.statusBanner.appendChild(mk(savedText));
    els.statusBanner.appendChild(mk(`Queue: ${activeCount} active • ${doneCount} completed`));
  }

  
  function renderLiveStatusBanner(){
    const phase = state.phase || "SPLASH";
    const [next, deck] = OMJN.computeNextTwo(state);
    const current = OMJN.computeCurrent(state);
    const inLive = (phase === "LIVE" || phase === "PAUSED") && !!current;
    const forecast = buildQueueForecast(Date.now());
    const queued = (state.queue || []).filter(x => x && x.status === "QUEUED");
    const specialQueued = queued.filter(x => {
      const typeId = String(x?.slotTypeId || "");
      return typeId.startsWith("ad_") || typeId === "intermission" || typeId === "houseband";
    }).length;

    if(els.kpiPhaseChip){
      els.kpiPhaseChip.textContent = phase;
      els.kpiPhaseChip.classList.remove("isLive", "isPaused", "isSplash");
      if(phase === "LIVE") els.kpiPhaseChip.classList.add("isLive");
      else if(phase === "PAUSED") els.kpiPhaseChip.classList.add("isPaused");
      else els.kpiPhaseChip.classList.add("isSplash");
    }
    if(els.kpiDeckSummary){
      els.kpiDeckSummary.textContent = `On Deck: ${deck ? deck.displayName : "—"}`;
    }
    if(els.kpiMathSummary){
      const parts = [];
      if(inLive) parts.push("1 live");
      parts.push(`${queued.length} queued`);
      if(specialQueued) parts.push(`${specialQueued} special`);
      if(forecast.transitionCount) parts.push(`${forecast.transitionCount} transition${forecast.transitionCount === 1 ? "" : "s"}`);
      els.kpiMathSummary.textContent = `Queue Math: ${parts.join(" • ")}`;
    }

    if(inLive){
      const t = OMJN.computeTimer(state);
      const showOT = (t.remainingMs === 0 && (t.overtimeMs || 0) > 0);
      if(els.kpiOvertimeSummary){
        els.kpiOvertimeSummary.hidden = !showOT;
        if(showOT) els.kpiOvertimeSummary.textContent = `Overtime: +${OMJN.formatMMSS(t.overtimeMs)}`;
      }
    }else{
      if(els.kpiOvertimeSummary) els.kpiOvertimeSummary.hidden = true;
    }
  }

  function renderLiveControls(){
    const cur = OMJN.computeCurrent(state);
    const liveish = !!cur && (state.phase === "LIVE" || state.phase === "PAUSED");
    const timer = liveish ? OMJN.computeTimer(state) : null;
    const timedLive = !!liveish && !!timer && (timer.durationMs || 0) > 0;
    const paused = state.phase === "PAUSED" && timedLive;

    if(els.btnPauseResume){
      const pauseWrap = els.btnPauseResume.closest(".pauseResumeWrap");
      if(pauseWrap){
        pauseWrap.classList.toggle("isReady", timedLive);
        pauseWrap.classList.toggle("isPaused", paused);
        pauseWrap.classList.toggle("isDisabled", !timedLive);
      }
      if(els.btnPauseResumeLabel) els.btnPauseResumeLabel.textContent = paused ? "Resume" : "Pause";
      els.btnPauseResume.classList.toggle("isPaused", paused);
      els.btnPauseResume.classList.toggle("isDisabled", !timedLive);
      els.btnPauseResume.disabled = !timedLive;
      els.btnPauseResume.setAttribute("aria-pressed", paused ? "true" : "false");
      els.btnPauseResume.title = timedLive
        ? (paused ? "Resume the current timed slot" : "Pause the current timed slot")
        : "No timed live slot is active";
    }

    const showViewerTimer = state.viewerPrefs?.showTimer !== false;
    if(els.btnViewerTimerToggle){
      const viewerWrap = els.btnViewerTimerToggle.closest(".viewerTimerWrap");
      if(viewerWrap){
        viewerWrap.classList.toggle("isReady", true);
        viewerWrap.classList.toggle("isPaused", showViewerTimer);
        viewerWrap.classList.remove("isDisabled");
      }
      els.btnViewerTimerToggle.textContent = showViewerTimer ? "Hide Viewer Timer" : "Show Viewer Timer";
      els.btnViewerTimerToggle.classList.toggle("isPaused", showViewerTimer);
      els.btnViewerTimerToggle.classList.remove("isDisabled");
      els.btnViewerTimerToggle.disabled = false;
      els.btnViewerTimerToggle.setAttribute("aria-pressed", showViewerTimer ? "true" : "false");
      els.btnViewerTimerToggle.title = showViewerTimer
        ? "Hide the Viewer timer and progress bar"
        : "Show the Viewer timer and progress bar";
    }
  }

  function renderCrowdPromptPreviewInto(root, cfg, data){
      if(!root) return;
      const title = (data.title || "").trim();
      const footer = (data.footer || "").trim();
      const lines = Array.isArray(data.lines) ? data.lines : [];

      root.innerHTML = "";

      const wrap = document.createElement("div");
      wrap.className = "cpPrevInner";

      const h = document.createElement("div");
      h.className = "cpPrevTitle";
      h.textContent = title || "CROWD PROMPT";
      wrap.appendChild(h);

      const list = document.createElement("div");
      list.className = "cpPrevLines";
      const max = 6;
      for(const ln of lines.slice(0, max)){
        const item = document.createElement("div");
        item.className = "cpPrevLine";
        item.textContent = ln;
        list.appendChild(item);
      }
      if(lines.length > max){
        const more = document.createElement("div");
        more.className = "cpPrevLine cpPrevMore";
        more.textContent = `… +${lines.length - max} more`;
        list.appendChild(more);
      }
      wrap.appendChild(list);

      if(footer){
        const f = document.createElement("div");
        f.className = "cpPrevFooter";
        f.textContent = footer;
        wrap.appendChild(f);
      }

      const hint = document.createElement("div");
      hint.className = "cpPrevHint";
      hint.textContent = cfg.enabled ? "Overlay ON (viewer sponsor hidden)" : "Overlay OFF";
      wrap.appendChild(hint);

      root.appendChild(wrap);
  }

  function renderCrowdPromptPreview(){
      if(!els.crowdPromptPreview && !els.crowdEditorPreview) return;
      const cfg = getCrowdCfg(state);
      const p = getActiveCrowdPreset(cfg) || {};

      const editorOpen = isCrowdEditorOpen();

      let data = p;
      if(editorOpen && typeof crowdEditorReadFn === "function"){
        try{
          const typed = crowdEditorReadFn();
          data = Object.assign({}, p, typed);
        }catch(_){}
      }

      renderCrowdPromptPreviewInto(els.crowdPromptPreview, cfg, data);
      renderCrowdPromptPreviewInto(els.crowdEditorPreview, cfg, data);
    }

  // ---- Timer-up modal (operator reminder) ----
  let timerUpDismissedSlotId = null;
  let timerUpArmed = true;
  let timerUpSnoozeForSlotId = null;
  let timerUpSnoozeUntil = 0;

  function openTimerUpModal(){
    if(!els.timerUpModal) return;
    const cur = OMJN.computeCurrent(state);
    if(!cur) return;
    const t = OMJN.computeTimer(state);

    if(els.timerUpName) els.timerUpName.textContent = cur.displayName || "—";
    if(els.timerUpOver) els.timerUpOver.textContent = `Overtime: +${OMJN.formatMMSS(t.overtimeMs || 0)}`;

    els.timerUpModal.hidden = false;
    document.body.classList.add("modalOpen");
  }

  function closeTimerUpModal(){
    if(!els.timerUpModal) return;
    els.timerUpModal.hidden = true;
    if(els.settingsModal?.hidden !== false){
      document.body.classList.remove("modalOpen");
    }
  }

  function checkTimerUpModal(){
    const phase = state.phase;
    const cur = OMJN.computeCurrent(state);

    if(!cur || !(phase === "LIVE" || phase === "PAUSED")){
      if(els.timerUpModal && !els.timerUpModal.hidden) closeTimerUpModal();
      return;
    }

    const t = OMJN.computeTimer(state);
    const hasDuration = (t.durationMs || 0) > 0;

    // Re-arm when timer is above 0 again (e.g. added time)
    if(hasDuration && t.remainingMs > 0){
      timerUpArmed = true;
      timerUpDismissedSlotId = null;
      timerUpSnoozeForSlotId = null;
      timerUpSnoozeUntil = 0;
      if(els.timerUpModal && !els.timerUpModal.hidden) closeTimerUpModal();
      return;
    }

    if(!hasDuration) return;

    if(t.remainingMs === 0){
      const now = Date.now();

      if(timerUpSnoozeForSlotId === cur.id && now < timerUpSnoozeUntil) return;
      const snoozeExpired = (timerUpSnoozeForSlotId === cur.id && now >= timerUpSnoozeUntil);

      if(timerUpDismissedSlotId === cur.id) return;

      if(timerUpArmed || snoozeExpired){
        timerUpArmed = false;
        if(snoozeExpired){
          timerUpSnoozeForSlotId = null;
          timerUpSnoozeUntil = 0;
        }
        openTimerUpModal();
      }else{
        if(els.timerUpModal && !els.timerUpModal.hidden){
          if(els.timerUpOver) els.timerUpOver.textContent = `Overtime: +${OMJN.formatMMSS(t.overtimeMs || 0)}`;
        }
      }
    }
  }

  // Lightweight UI tick so timer + reminder work even without state changes.
  let uiTickHandle = null;
  function startUiTick(){
    if(uiTickHandle) return;
    uiTickHandle = setInterval(() => {
      try{
        const tickNow = Date.now();
        if(els.timerLine) renderTimerLine();
        renderKPIs(tickNow);
        updateQueueEtaLabels(tickNow);
        renderLiveStatusBanner();
        renderLiveControls();
        updateCrowdQuickButtons();
        renderCrowdPromptPreview();
        syncCrowdAutoHide();
        checkTimerUpModal();
      }catch(e){
        console.error("uiTick error:", e);
      }
    }, 250);
  }

function renderTimerLine(){
    const t = OMJN.computeTimer(state);
    els.timerLine.textContent = `${OMJN.formatMMSS(t.elapsedMs)} / ${OMJN.formatMMSS(t.remainingMs)}`;
  }


function render(){
    sortPaperQueue(state);
    // sync header inputs
    els.showTitle.value = state.showTitle || "";
    renderStatusBanner();

    // Operator prefs
    els.startGuard.checked = !!state.operatorPrefs?.startGuard;
    els.endGuard.checked = !!state.operatorPrefs?.endGuard;
    els.hotkeysEnabled.checked = (state.operatorPrefs?.hotkeysEnabled !== false);

    if(els.toggleHBFooter) els.toggleHBFooter.checked = (state.viewerPrefs?.showHouseBandFooter !== false);
    if(els.hbFooterFormat) els.hbFooterFormat.value = (state.viewerPrefs?.hbFooterFormat || "categoryFirst");
    try{
      renderSettings();
    }catch(err){
      console.error("renderSettings crashed; continuing to render queue.", err);
    }

    // Undo/redo buttons
    els.btnUndo.disabled = !undoStack.length;
    els.btnRedo.disabled = !redoStack.length;

    fillTypeSelect(els.addType, { excludeSpecial:true });
    if(els.addType) els.addType.value = "";
    toggleCustomAddFields();
    // House Band add controls
    if(els.hbAddInstrument){
      fillHBInstrumentSelect(els.hbAddInstrument);
      toggleHBCustomField();
    }


    renderQueue();
    renderKPIs();
    renderLiveStatusBanner();
    renderLiveControls();
    renderCrowdPromptPreview();
    renderTimerLine();
    renderHouseBandCategories();
    if(els.intermissionModal && !els.intermissionModal.hidden) refreshIntermissionModalActions();
  }

  // ---- Actions ----
  function addPerformer(){
    const name = OMJN.sanitizeText(els.addName.value);
    if(!name) return;

    // Enforce explicit slot selection (no silent default to Musician).
    const chosenType = String(els.addType?.value || "");
    if(!chosenType){
      try{
        els.addType?.focus?.();
        els.addType?.classList?.add("nudge");
        setTimeout(() => els.addType?.classList?.remove("nudge"), 650);
      }catch(_){ }
      return;
    }

    updateState(s => {
      const slotTypeId = chosenType;
      const isCustom = slotTypeId === "custom";
      const customTypeLabel = isCustom ? OMJN.sanitizeText(els.addCustomLabel.value) : "";
      const customMinutesRaw = isCustom ? els.addCustomMinutes.value : "";
      const customMinutes = (isCustom && customMinutesRaw !== "") ? Math.max(1, Math.round(Number(customMinutesRaw))) : null;
      const slot = {
        id: OMJN.uid("slot"),
        createdAt: Date.now(),
        displayName: name,
        slotTypeId,
        minutesOverride: customMinutes,
        customTypeLabel,
        status: "QUEUED",
        notes: "",
        media: { donationUrl: null, imageAssetId: null, mediaLayout: "QR_ONLY" }
      };
      s.queue.push(slot);
    });

    els.addName.value = "";
    els.addName.focus();

    // Always prompt again after a successful add.
    if(els.addType) els.addType.value = "";
    toggleCustomAddFields();
  }



  // ---- House Band Set Builder Modal ----

  function openHbBuildModal(ctx){
    hbBuildCtx = ctx || { mode: "add" };
    hbBuildDraft = buildHbBuildDraftFromState(hbBuildCtx.slotId || null);
    if(!els.hbBuildModal) return;
    renderHbBuildModal();
    els.hbBuildModal.hidden = false;
    document.body.classList.add("modalOpen");
    setTimeout(() => { els.btnHbBuildSave?.focus?.(); }, 0);
  }

  function closeHbBuildModal(){
    hbBuildCtx = null;
    hbBuildDraft = null;
    if(!els.hbBuildModal) return;
    els.hbBuildModal.hidden = true;
    document.body.classList.remove("modalOpen");
  }

  function buildHbBuildDraftFromState(slotId){
    const draft = { cats: {} };
    const slot = slotId ? (state.queue || []).find(x => x && x.id === slotId) : null;
    const existing = (slot && slot.hbSelections && typeof slot.hbSelections === "object") ? slot.hbSelections : null;
    const cats = OMJN.houseBandCategories();
    for(const cat of cats){
      const suggested = OMJN.houseBandSuggestedInCategory(state, cat.key);
      const suggestedId = suggested?.member?.id || null;
      let enabled = !!suggestedId;
      let memberId = suggestedId;
      if(existing && Object.prototype.hasOwnProperty.call(existing, cat.key)){
        enabled = !!existing[cat.key];
        memberId = existing[cat.key] || null;
      }
      draft.cats[cat.key] = { enabled, memberId, suggestedId };
    }
    return draft;
  }

  function computeHbBuildLineupFromDraft(){
    if(!hbBuildDraft) return [];
    const selections = {};
    for(const [key, cfg] of Object.entries(hbBuildDraft.cats || {})){
      if(cfg && cfg.enabled && cfg.memberId) selections[key] = cfg.memberId;
    }
    return OMJN.buildHouseBandLineupFromSelections(state, selections);
  }

  function updateHbBuildPreview(){
    const lineup = computeHbBuildLineupFromDraft();
    const names = lineup.map(x => OMJN.sanitizeText(x.name || "")).filter(Boolean);
    const roles = lineup.map(x => OMJN.sanitizeText(x.instrumentLabel || "")).filter(Boolean);
    if(els.hbPreviewNames) els.hbPreviewNames.textContent = names.length ? names.join(" • ") : "No lineup selected yet";
    if(els.hbPreviewRoles) els.hbPreviewRoles.textContent = roles.length ? roles.join(" • ") : "—";
  }

  function renderHbBuildModal(){
    if(!els.hbBuildList || !hbBuildDraft) return;
    const cats = OMJN.houseBandCategories();
    els.hbBuildList.innerHTML = "";

    for(const cat of cats){
      const cfg = hbBuildDraft.cats[cat.key] || { enabled:false, memberId:null, suggestedId:null };
      const row = document.createElement("div");
      row.className = "hbBuildRow" + (cfg.enabled ? "" : " disabled");

      const chk = document.createElement("input");
      chk.type = "checkbox";
      chk.checked = !!cfg.enabled;
      chk.addEventListener("change", () => {
        cfg.enabled = !!chk.checked;
        if(cfg.enabled && !cfg.memberId){
          cfg.memberId = cfg.suggestedId || null;
        }
        renderHbBuildModal();
      });

      const lab = document.createElement("div");
      lab.className = "hbCatLabel";
      lab.textContent = cat.label;

      const sel = document.createElement("select");
      const emptyOpt = document.createElement("option");
      emptyOpt.value = "";
      emptyOpt.textContent = "(none)";
      sel.appendChild(emptyOpt);

      const members = OMJN.houseBandMembersInCategory(state, cat.key, { activeOnly:true });
      for(const item of members){
        const m = item.member;
        if(!m?.id) continue;
        const opt = document.createElement("option");
        opt.value = m.id;
        let label = String(m.name || "—");
        if(cfg.suggestedId && m.id === cfg.suggestedId) label += "  • suggested";
        opt.textContent = label;
        sel.appendChild(opt);
      }

      sel.value = String(cfg.memberId || "");
      sel.disabled = !cfg.enabled;
      sel.addEventListener("change", () => {
        cfg.memberId = sel.value || null;
        updateHbBuildPreview();
      });

      row.appendChild(chk);
      row.appendChild(lab);
      row.appendChild(sel);
      els.hbBuildList.appendChild(row);
    }

    if(els.btnHbBuildSave){
      els.btnHbBuildSave.textContent = (hbBuildCtx && hbBuildCtx.mode === "edit") ? "Save" : "Add to Queue";
    }

    updateHbBuildPreview();
  }

  function enableAllHbBuild(){
    if(!hbBuildDraft) return;
    for(const cat of OMJN.houseBandCategories()){
      const cfg = hbBuildDraft.cats[cat.key];
      if(!cfg) continue;
      cfg.enabled = true;
      if(!cfg.memberId) cfg.memberId = cfg.suggestedId || null;
    }
    renderHbBuildModal();
  }

  function clearAllHbBuild(){
    if(!hbBuildDraft) return;
    for(const cat of OMJN.houseBandCategories()){
      const cfg = hbBuildDraft.cats[cat.key];
      if(!cfg) continue;
      cfg.enabled = false;
    }
    renderHbBuildModal();
  }

  function commitHbBuild(){
    if(!hbBuildDraft) return;
    const selections = {};
    for(const [catKey, cfg] of Object.entries(hbBuildDraft.cats || {})){
      if(cfg && cfg.enabled && cfg.memberId) selections[catKey] = cfg.memberId;
    }
    const lineup = OMJN.buildHouseBandLineupFromSelections(state, selections);

    if(hbBuildCtx && hbBuildCtx.mode === "edit" && hbBuildCtx.slotId){
      updateState(s => {
        const slot = (s.queue || []).find(x => x && x.id === hbBuildCtx.slotId);
        if(!slot) return;
        slot.slotTypeId = "houseband";
        slot.displayName = houseBandQueueTitle(slot.displayName || "");
        slot.hbSelections = selections;
        slot.hbLineup = lineup;
      });
      closeHbBuildModal();
      render();
      return;
    }

    updateState(s => {
      const slot = {
        id: OMJN.uid("slot"),
        createdAt: Date.now(),
        displayName: houseBandQueueTitle(""),
        slotTypeId: "houseband",
        minutesOverride: null,
        customTypeLabel: "",
        status: "QUEUED",
        notes: "",
        hbSelections: selections,
        hbLineup: lineup,
        media: { donationUrl: null, imageAssetId: null, mediaLayout: "QR_ONLY" }
      };

      // Smart reorder: if you skip the suggested (top) player, keep them NEXT.
      for(const [catKey, memberId] of Object.entries(selections)){
        OMJN.reorderHouseBandCategorySelectedWithSuggestedNext(s, catKey, memberId);
      }

      const afterPaperSlotNumber = Math.round(Number(hbBuildCtx?.afterPaperSlotNumber || 0)) || null;
      if(afterPaperSlotNumber) insertSpecialAfterPaperSlot(s, slot, afterPaperSlotNumber);
      else insertQueuedSlotSmart(s, slot);
    });

    closeHbBuildModal();
    render();
  }
  // Quick-add: Intermission + House Band special slots
  function isLiveishState(s){
    return !!s && (s.phase === "LIVE" || s.phase === "PAUSED") && !!s.currentSlotId;
  }

  function insertQueuedSlotSmart(s, slot){
    if(!Array.isArray(s.queue)) s.queue = [];
    const liveish = isLiveishState(s);

    // Prefer inserting immediately after the current live item.
    if(liveish){
      const curIdx = s.queue.findIndex(x => x && x.id === s.currentSlotId);
      const insertAt = (curIdx >= 0) ? (curIdx + 1) : 1;
      s.queue.splice(Math.max(0, insertAt), 0, slot);
      return;
    }

    // Otherwise, insert before completed items (DONE/SKIPPED) to keep the active queue grouped.
    const firstCompletedIdx = s.queue.findIndex(x => x && isDoneStatus(x.status));
    if(firstCompletedIdx >= 0) s.queue.splice(firstCompletedIdx, 0, slot);
    else s.queue.push(slot);
  }

  function insertIntermissionSlotSmart(s, slot){
    if(!Array.isArray(s.queue)) s.queue = [];
    if(isLiveishState(s)){
      const curIdx = s.queue.findIndex(x => x && x.id === s.currentSlotId);
      const insertAt = (curIdx >= 0) ? (curIdx + 1) : 1;
      s.queue.splice(Math.max(0, insertAt), 0, slot);
      return;
    }
    s.queue.unshift(slot);
  }

  function prepareSlotForLive(s, slot, { pinToTop = true } = {}){
    if(!slot) return;

    if(pinToTop){
      const idx = s.queue.findIndex(x => x && x.id === slot.id);
      if(idx > 0){
        const [moved] = s.queue.splice(idx, 1);
        s.queue.unshift(moved);
      }
    }

    if(String(slot.slotTypeId || "") === "houseband"){
      slot.displayName = houseBandQueueTitle(slot.displayName || "");
      const sel = (slot.hbSelections && typeof slot.hbSelections === "object") ? slot.hbSelections : {};
      slot.hbSelections = sel;
      slot.hbLineup = OMJN.buildHouseBandLineupFromSelections(s, sel);
    }

    if(String(slot.slotTypeId || "") === "intermission"){
      const msg = String(slot.intermissionMessage || "").trim();
      if(!msg) slot.intermissionMessage = "WE'LL BE RIGHT BACK";
    }
  }

  function activateSlotLive(s, slot, { pinToTop = true } = {}){
    if(!slot) return;
    recordObservedTransitionForStart(s, slot, Date.now());
    prepareSlotForLive(s, slot, { pinToTop });

    const startedAt = Date.now();
    if(!slot.expectedStartAt) slot.expectedStartAt = startedAt;
    slot.actualStartedAt = startedAt;
    slot.actualEndedAt = null;
    slot.actualDurationMs = null;
    slot.actualWallDurationMs = null;
    slot.scheduledDurationMs = OMJN.effectiveMinutes(s, slot) * 60 * 1000;

    s.currentSlotId = slot.id;
    s.phase = "LIVE";
    if(!s.viewerPrefs) s.viewerPrefs = {};
    s.viewerPrefs.showTimer = true;

    const isAd = isAdSlotType(slot.slotTypeId);
    if(isAd){
      s.timer.running = false;
      s.timer.startedAt = null;
      s.timer.elapsedMs = 0;
      s.timer.baseDurationMs = 0;
    }else{
      s.timer.running = true;
      s.timer.startedAt = startedAt;
      s.timer.elapsedMs = 0;
      s.timer.baseDurationMs = OMJN.effectiveMinutes(s, slot) * 60 * 1000;
    }
  }

  function refreshIntermissionModalActions(){
    const liveish = isLiveishState(state);
    if(els.btnImLive){
      els.btnImLive.textContent = liveish ? "Arm Next" : "Go Live Now";
      els.btnImLive.title = liveish ? "Insert Intermission next and arm it to start when the current act ends." : "Start this Intermission immediately.";
    }
    if(els.btnImAdd){
      if(imInsertAfterPaperSlot){
        els.btnImAdd.textContent = `Add After #${imInsertAfterPaperSlot}`;
        els.btnImAdd.title = `Insert Intermission directly after Open Slot #${imInsertAfterPaperSlot}.`;
      }else{
        els.btnImAdd.textContent = liveish ? "Add Next" : "Add to Top";
        els.btnImAdd.title = liveish ? "Insert Intermission directly after the current live act." : "Insert Intermission at the top of the queue.";
      }
    }
  }

  function openIntermissionModal(afterPaperSlotNumber = null){
    if(!els.intermissionModal) return;
    imDraft = { minutes: 10 };
    imInsertAfterPaperSlot = Math.round(Number(afterPaperSlotNumber || 0)) || null;

    if(els.imName) els.imName.value = "INTERMISSION";
    if(els.imMsg) els.imMsg.value = "WE'LL BE RIGHT BACK";
    if(els.imCustomMins) els.imCustomMins.value = "";
    if(els.imCustomWrap) els.imCustomWrap.style.display = "none";
    setIntermissionPresetActive(10);
    refreshIntermissionModalActions();

    els.intermissionModal.hidden = false;
    document.body.classList.add("modalOpen");
    setTimeout(() => { els.imName?.focus?.(); }, 0);
  }

  function closeIntermissionModal(){
    imDraft = null;
    imInsertAfterPaperSlot = null;
    if(!els.intermissionModal) return;
    els.intermissionModal.hidden = true;
    document.body.classList.remove("modalOpen");
  }

  // ------------------------------
  // Ads — Presets + Modal + One-click Live
  // ------------------------------

  function isFileProtocol(){
    try{ return location.protocol === "file:"; }catch(_){ return false; }
  }

  function deriveLabelFromPath(p){
    const s = String(p || "").trim();
    if(!s) return "";
    try{
      // URL or relative path
      const u = s.includes("://") ? new URL(s) : null;
      const path = u ? u.pathname : s;
      const base = path.split("/").pop() || path;
      const decoded = decodeURIComponent(base);
      const noExt = decoded.replace(/\.[a-z0-9]{2,6}$/i, "");
      return noExt.replace(/[_-]+/g, " ").replace(/\s+/g, " ").trim();
    }catch(_){
      const base = s.split("/").pop() || s;
      const noExt = base.replace(/\.[a-z0-9]{2,6}$/i, "");
      return noExt.replace(/[_-]+/g, " ").replace(/\s+/g, " ").trim();
    }
  }

  function isProbablyImageUrl(u){
    const s = String(u || "").toLowerCase();
    return /\.(png|jpe?g|gif|webp|avif|svg)(\?|#|$)/.test(s);
  }

  function normalizeAdManifest(json, baseUrl){
    const out = [];
    const addItem = (it) => {
      if(!it) return;
      const raw = String(it.url || it.src || it.path || "").trim();
      if(!raw) return;

      const type = String(it.type || it.kind || "").toLowerCase();
      let kind = "graphic";

      if(type === "video") kind = "video";
      else if(type === "image" || type === "graphic") kind = "graphic";
      else {
        if(isProbablyVideoUrl(raw)) kind = "video";
        else if(isProbablyImageUrl(raw)) kind = "graphic";
        else return; // unknown media type
      }

      const abs = (new URL(raw, baseUrl)).href;
      const id = String(it.id || abs || OMJN.uid("adp")).trim();
      const label = String(it.label || it.name || deriveLabelFromPath(raw) || "Ad").trim();
      out.push({ id, label, url: abs, kind });
    };

    if(Array.isArray(json)){
      json.forEach(addItem);
    } else if(Array.isArray(json?.items)){
      json.items.forEach(addItem);
    } else if(Array.isArray(json?.ads)){
      json.ads.forEach(addItem);
    }
    return out;
  }

  async function tryFetchJson(url){
    const r = await fetch(url, { cache: "no-store" });
    if(!r.ok) throw new Error(`HTTP ${r.status}`);
    return await r.json();
  }

  async function ensureAdPresets(force=false){
    if(adPresetsTried && !force) return;
    adPresetsTried = true;
    adPresets = [];
    adSelectedPresetId = null;

    if(!els.adPresetStatus) return;

    const showStatus = (msg) => {
      els.adPresetStatus.style.display = msg ? "" : "none";
      els.adPresetStatus.textContent = msg || "";
    };

    // file:// cannot fetch local files; offer file picker UI
    if(isFileProtocol()){
      els.adManifestLocalRow && (els.adManifestLocalRow.style.display = "");
      showStatus("Running from file:// — presets must be loaded via file picker or served over http(s).");
      renderAdPresetList();
      return;
    } else {
      els.adManifestLocalRow && (els.adManifestLocalRow.style.display = "none");
    }

    showStatus("Loading presets…");

    const candidates = [
      "./ads_manifest.json",
      "./ads_manifest.example.json",
      "./assets/ads/ads_manifest.json",
      "./assets/ads/ads_manifest.example.json",
    ];

    for(const url of candidates){
      try{
        const json = await tryFetchJson(url);
        const base = new URL(url, location.href).href;
        const items = normalizeAdManifest(json, base);
        if(items.length){
          adPresets = items;
          showStatus(`Loaded ${items.length} preset${items.length===1?"":"s"}.`);
          renderAdPresetList();
          return;
        }
      }catch(_){ /* try next */ }
    }

    showStatus("No presets found. Add ads_manifest.json to this folder to enable presets.");
    renderAdPresetList();
  }

  function renderAdPresetList(){
    if(!els.adPresetList) return;
    const q = String(els.adPresetSearch?.value || "").trim().toLowerCase();

    els.adPresetList.innerHTML = "";
    const kind = getAdKind();
    const items = (adPresets || [])
      .filter(it => String(it.kind || "graphic") === kind)
      .filter(it => !q || it.label.toLowerCase().includes(q) || it.url.toLowerCase().includes(q));
    if(!items.length){
      const hasAnyOfKind = (adPresets || []).some(it => String(it.kind || "graphic") === kind);
      const empty = document.createElement("div");
      empty.className = "small muted";
      empty.style.padding = "10px";
      empty.textContent = hasAnyOfKind ? "No matches." : (kind === "video" ? "No video presets loaded." : "No image presets loaded.");
      els.adPresetList.appendChild(empty);
      return;
    }

    for(const it of items){
      const row = document.createElement("div");
      row.className = "adPresetRow";
      if(adSelectedPresetId === it.id) row.classList.add("isSelected");

      const main = document.createElement("div");
      main.className = "adPresetMain";
      const lbl = document.createElement("div");
      lbl.className = "adPresetLabel";
      lbl.textContent = it.label;
      if(String(it.kind || "graphic") === "video"){
        const b = document.createElement("span");
        b.className = "adKindBadge";
        b.textContent = "VIDEO";
        lbl.appendChild(b);
      }
      const meta = document.createElement("div");
      meta.className = "adPresetMeta mono";
      meta.textContent = it.url.replace(location.origin, "");
      main.appendChild(lbl);
      main.appendChild(meta);

      const actions = document.createElement("div");
      actions.className = "adPresetActions";

      const btnAdd = document.createElement("button");
      btnAdd.className = "btn tiny";
      btnAdd.type = "button";
      btnAdd.textContent = "Add";
      btnAdd.addEventListener("click", (e) => {
        e.preventDefault(); e.stopPropagation();
        adSelectedPresetId = it.id;
        applyPresetToModal(it, /*preserveLabel*/false);
        submitAdModal({ goLive:false });
      });

      const btnLive = document.createElement("button");
      btnLive.className = "btn tiny good";
      btnLive.type = "button";
      btnLive.textContent = (state.phase === "LIVE" || state.phase === "PAUSED") ? "Arm Next" : "Live";
      btnLive.addEventListener("click", (e) => {
        e.preventDefault(); e.stopPropagation();
        adSelectedPresetId = it.id;
        applyPresetToModal(it, /*preserveLabel*/false);
        submitAdModal({ goLive:true });
      });

      actions.appendChild(btnLive);
      actions.appendChild(btnAdd);

      row.appendChild(main);
      row.appendChild(actions);

      row.addEventListener("click", () => {
        adSelectedPresetId = it.id;
        applyPresetToModal(it, /*preserveLabel*/true);
        renderAdPresetList();
      });

      els.adPresetList.appendChild(row);
    }
  }

  function setAdModalVisible(on){
    if(!els.adModal) return;
    els.adModal.hidden = !on;
    document.body.classList.toggle("modalOpen", !!on);
  }

  function showAdSourceUI(){
    const mode = String(els.adSource?.value || "preset");
    syncAdKindUI();
    if(els.adPresetWrap) els.adPresetWrap.style.display = (mode === "preset") ? "" : "none";
    if(els.adUploadWrap) els.adUploadWrap.style.display = (mode === "upload") ? "" : "none";
    if(els.adUrlWrap) els.adUrlWrap.style.display = (mode === "url") ? "" : "none";
    if(els.adPreviewWrap) els.adPreviewWrap.style.display = "";

// Update button label when LIVE exists
    if(els.btnAdLive){
      const liveish = (state.phase === "LIVE" || state.phase === "PAUSED") && !!state.currentSlotId;
      els.btnAdLive.textContent = liveish ? "Arm Next" : "Go Live";
    }

    updateAdPreview();
  }

  function applyPresetToModal(it, preserveLabel){
    if(!it) return;
    if(els.adSource) els.adSource.value = "preset";
    if(els.adLabel && !preserveLabel){
      const cur = String(els.adLabel.value || "").trim();
      if(!cur) els.adLabel.value = it.label || deriveLabelFromPath(it.url);
      else els.adLabel.value = cur;
    }
    // store selection via hidden select for compatibility
    if(els.adPreset){
      if(!Array.from(els.adPreset.options).some(o => o.value === it.id)){
        const opt = document.createElement("option");
        opt.value = it.id;
        opt.textContent = it.label;
        els.adPreset.appendChild(opt);
      }
      els.adPreset.value = it.id;
    }
    adSelectedPresetId = it.id;
    showAdSourceUI();
    renderAdPresetList();
  }

  function getSelectedPreset(){
    const id = String(adSelectedPresetId || els.adPreset?.value || "").trim();
    return (adPresets || []).find(x => x.id === id) || null;
  }

  
  function getAdKind(){
    const k = String(els.adKind?.value || "graphic").toLowerCase();
    return (k === "video") ? "video" : "graphic";
  }

  function isAdSlotType(t){
    const x = String(t || "");
    return x === "ad_graphic" || x === "ad_video";
  }

  function isProbablyVideoUrl(u){
    const s = String(u || "").toLowerCase();
    return /\.(mp4|webm|ogv|ogg)(\?|#|$)/.test(s);
  }

  function syncAdKindUI(){
    const kind = getAdKind();
    const isVid = (kind === "video");

    if(els.adVideoOptions) els.adVideoOptions.style.display = isVid ? "" : "none";
    if(els.adFile) els.adFile.accept = isVid ? "video/*" : "image/*";

    if(els.adModalTitle) els.adModalTitle.textContent = isVid ? "Video Ad" : "Graphic Ad";
    if(els.adModalSub) els.adModalSub.textContent = isVid ? "Full-screen video on the viewer while LIVE." : "Full-screen on the viewer while LIVE.";

    try{
      if(els.adUploadWrap){
        const lab = els.adUploadWrap.querySelector('label[for="adFile"]') || els.adUploadWrap.querySelector("label");
        if(lab) lab.textContent = isVid ? "Upload video" : "Upload image";
      }
      if(els.adUrlWrap){
        const lab = els.adUrlWrap.querySelector('label[for="adUrl"]') || els.adUrlWrap.querySelector("label");
        if(lab) lab.textContent = isVid ? "Video URL" : "Image URL";
      }
      if(els.adUrl){
        els.adUrl.placeholder = isVid ? "https://... (direct mp4/webm)" : "https://... (image URL)";
      }
    }catch(_){}

    const sel = getSelectedPreset();
    if(sel && String(sel.kind || "graphic") !== kind){
      adSelectedPresetId = null;
      if(els.adPreset) els.adPreset.value = "";
    }
  }

  function clearAdPreviewBlob(){
    if(adPreviewBlobUrl){
      try{ URL.revokeObjectURL(adPreviewBlobUrl); }catch(_){}
      adPreviewBlobUrl = null;
    }
  }

function updateAdPreview(){
    if(!els.adPreviewWrap) return;
    const mode = String(els.adSource?.value || "preset");
    const kind = getAdKind();

    let url = "";
    clearAdPreviewBlob();

    if(mode === "preset"){
      const it = getSelectedPreset();
      url = it?.url || "";
    } else if(mode === "url"){
      url = String(els.adUrl?.value || "").trim();
    } else if(mode === "upload"){
      const f = els.adFile?.files?.[0] || null;
      if(f){
        try{
          adPreviewBlobUrl = URL.createObjectURL(f);
          url = adPreviewBlobUrl;
        }catch(_){ url = ""; }
      }
    }

    if(!url){
      if(els.adPreviewImg){
        els.adPreviewImg.style.display = "none";
        els.adPreviewImg.removeAttribute("src");
      }
      if(els.adPreviewVideo){
        try{ els.adPreviewVideo.pause(); }catch(_){}
        els.adPreviewVideo.style.display = "none";
        els.adPreviewVideo.removeAttribute("src");
      }
      els.adPreviewWrap.style.display = "none";
      return;
    }

    els.adPreviewWrap.style.display = "";

    if(kind === "graphic"){
      if(els.adPreviewVideo){
        try{ els.adPreviewVideo.pause(); }catch(_){}
        els.adPreviewVideo.style.display = "none";
        els.adPreviewVideo.removeAttribute("src");
      }
      if(els.adPreviewImg){
        els.adPreviewImg.style.display = "";
        els.adPreviewImg.src = url;
      }
    } else {
      if(els.adPreviewImg){
        els.adPreviewImg.style.display = "none";
        els.adPreviewImg.removeAttribute("src");
      }
      if(els.adPreviewVideo){
        els.adPreviewVideo.style.display = "";
        els.adPreviewVideo.loop = !!els.adVideoLoop?.checked;
        const audioOn = !!els.adVideoAudio?.checked;
        els.adPreviewVideo.muted = !audioOn;
        els.adPreviewVideo.src = url;
        try{ els.adPreviewVideo.load(); }catch(_){}
        const p = els.adPreviewVideo.play?.();
        if(p && typeof p.catch === "function") p.catch(() => {});
      }
    }
  }

  function openAdModal(editSlotId=null, afterPaperSlotNumber = null){
    if(!els.adModal) return;
    adCtx = editSlotId ? { mode:"edit", slotId: editSlotId } : { mode:"add", slotId: null };
    adInsertAfterPaperSlot = editSlotId ? null : (Math.round(Number(afterPaperSlotNumber || 0)) || null);

    // reset
    if(els.adLabel) els.adLabel.value = "";
    if(els.adUrl) els.adUrl.value = "";
    if(els.adFile) els.adFile.value = "";
    adSelectedPresetId = null;
    if(els.adKind) els.adKind.value = "graphic";
    if(els.adVideoLoop) els.adVideoLoop.checked = false;
    if(els.adVideoAudio) els.adVideoAudio.checked = false;
    clearAdPreviewBlob();


    // load presets list (async; doesn't block opening)
    ensureAdPresets().catch(() => {});

    // if editing, populate from slot
    if(editSlotId){
      const slot = (state.queue || []).find(x => x.id === editSlotId);
      const ad = slot?.ad || {};
      if(els.adLabel) els.adLabel.value = String(slot?.displayName || ad.label || "").trim();

      const kind = (String(ad.kind || "").toLowerCase() === "video" || String(slot?.slotTypeId || "") === "ad_video") ? "video" : "graphic";
      if(els.adKind) els.adKind.value = kind;
      if(kind === "video"){
        if(els.adVideoLoop) els.adVideoLoop.checked = !!ad.loop;
        if(els.adVideoAudio) els.adVideoAudio.checked = !!ad.audioOn;
      }

      const srcMode = String(ad.source || ad.sourceMode || "").toLowerCase();
      if(srcMode === "upload"){
        if(els.adSource) els.adSource.value = "upload";
      } else if(srcMode === "preset"){
        if(els.adSource) els.adSource.value = "preset";
        const u = String(ad.url || "").trim();
        if(u){
          const match = (adPresets || []).find(p => String(p.url || "") === u && String(p.kind || "graphic") === kind);
          if(match) adSelectedPresetId = match.id;
        }
      } else if(srcMode === "url"){
        if(els.adSource) els.adSource.value = "url";
        if(els.adUrl) els.adUrl.value = String(ad.url || "").trim();
      } else {
        if(els.adSource) els.adSource.value = "preset";
      }
    } else {
      // default: presets if available, else upload
      if(els.adSource) els.adSource.value = "preset";
    }

    showAdSourceUI();
    setAdModalVisible(true);
  }

  function closeAdModal(){
    adCtx = null;
    adInsertAfterPaperSlot = null;
    clearAdPreviewBlob();
    setAdModalVisible(false);
  }

  async function buildAdSlotFromModal(){
    const kind = getAdKind();
    const mode = String(els.adSource?.value || "preset");
    let label = OMJN.sanitizeText(els.adLabel?.value || "");

    const ad = {
      kind,
      source: "",
      url: "",
      assetId: "",
      loop: false,
      audioOn: false,
    };

    if(kind === "video"){
      ad.loop = !!els.adVideoLoop?.checked;
      ad.audioOn = !!els.adVideoAudio?.checked;
    }

    if(mode === "preset"){
      const it = getSelectedPreset();
      if(!it) throw new Error("Select a preset.");
      if(String(it.kind || "graphic") !== kind) throw new Error("Selected preset does not match the ad type.");
      ad.source = "preset";
      ad.url = it.url;
      if(!label) label = it.label || deriveLabelFromPath(it.url) || "Ad";
    } else if(mode === "url"){
      const url = String(els.adUrl?.value || "").trim();
      if(!url) throw new Error(kind === "video" ? "Enter a video URL." : "Enter an image URL.");
      ad.source = "url";
      ad.url = url;
      if(!label) label = deriveLabelFromPath(url) || "Ad";
    } else if(mode === "upload"){
      const f = els.adFile?.files?.[0] || null;
      if(!f) throw new Error(kind === "video" ? "Choose a video file to upload." : "Choose an image file to upload.");

      const isVid = /^video\//.test(String(f.type || ""));
      const isImg = /^image\//.test(String(f.type || ""));

      if(kind === "video" && !isVid) throw new Error("That file does not look like a video.");
      if(kind === "graphic" && !isImg) throw new Error("That file does not look like an image.");

      const assetId = OMJN.uid(kind === "video" ? "advid" : "adimg");
      await OMJN.putAsset(assetId, f);
      ad.source = "upload";
      ad.assetId = assetId;
      if(!label) label = deriveLabelFromPath(f.name) || "Ad";
    }

    const slot = {
      id: OMJN.uid("slot"),
      createdAt: Date.now(),
      displayName: label || "Ad",
      slotTypeId: (kind === "video") ? "ad_video" : "ad_graphic",
      minutesOverride: 0,
      customTypeLabel: "",
      status: "QUEUED",
      notes: "",
      media: { path:"", label:"", showDuringLive:false },
      donationText: "",
      ad
    };
    return slot;
  }

  function insertSlotSmart(s, slot){
    const isDone = (x) => x && (x.status === "DONE" || x.status === "SKIPPED");
    s.queue = Array.isArray(s.queue) ? s.queue : [];
    const liveish = (s.phase === "LIVE" || s.phase === "PAUSED") && !!s.currentSlotId;

    if(liveish){
      const li = s.queue.findIndex(x => x.id === s.currentSlotId);
      if(li >= 0){
        s.queue.splice(li+1, 0, slot);
        return;
      }
    }

    const firstDone = s.queue.findIndex(isDone);
    if(firstDone >= 0) s.queue.splice(firstDone, 0, slot);
    else s.queue.push(slot);
  }

  async function submitAdModal({ goLive=false }={}){
    try{
      if(!state) return;
      const liveish = (state.phase === "LIVE" || state.phase === "PAUSED") && !!state.currentSlotId;

      if(adCtx?.mode === "edit" && adCtx.slotId){
        // Update existing slot in-place
        const kind = getAdKind();
        const mode = String(els.adSource?.value || "preset");
        const label = OMJN.sanitizeText(els.adLabel?.value || "");

        const videoOpts = (kind === "video") ? { loop: !!els.adVideoLoop?.checked, audioOn: !!els.adVideoAudio?.checked } : {};
        let newAd = null;

        if(mode === "preset"){
          const it = getSelectedPreset();
          if(!it) throw new Error("Select a preset.");
          if(String(it.kind || "graphic") !== kind) throw new Error("Selected preset does not match the ad type.");
          newAd = { kind, source:"preset", url: it.url, ...videoOpts };
        } else if(mode === "url"){
          const url = String(els.adUrl?.value || "").trim();
          if(!url) throw new Error(kind === "video" ? "Enter a video URL." : "Enter an image URL.");
          newAd = { kind, source:"url", url, ...videoOpts };
        } else if(mode === "upload"){
          const f = els.adFile?.files?.[0] || null;
          if(!f) throw new Error(kind === "video" ? "Choose a video file to upload." : "Choose an image file to upload.");

          const isVid = /^video\//.test(String(f.type || ""));
          const isImg = /^image\//.test(String(f.type || ""));

          if(kind === "video" && !isVid) throw new Error("That file does not look like a video.");
          if(kind === "graphic" && !isImg) throw new Error("That file does not look like an image.");

          const assetId = OMJN.uid(kind === "video" ? "advid" : "adimg");
          await OMJN.putAsset(assetId, f);
          newAd = { kind, source:"upload", assetId, ...videoOpts };
        }
updateState(s => {
          const slot = s.queue.find(x => x.id === adCtx.slotId);
          if(!slot) return;
          slot.slotTypeId = (newAd && newAd.kind === "video") ? "ad_video" : "ad_graphic";
          slot.displayName = label || slot.displayName || "Ad";
          slot.ad = newAd || slot.ad;
        });
        closeAdModal();
        return;
      }

      const slot = await buildAdSlotFromModal();

      updateState(s => {
        const afterPaperSlotNumber = Math.round(Number(adInsertAfterPaperSlot || 0)) || null;
        if(afterPaperSlotNumber) insertSpecialAfterPaperSlot(s, slot, afterPaperSlotNumber);
        else insertSlotSmart(s, slot);

        if(goLive){
          const liveish2 = (s.phase === "LIVE" || s.phase === "PAUSED") && !!s.currentSlotId;
          if(liveish2){
            // Don't interrupt — arm next
            s.operatorPrefs = s.operatorPrefs || {};
            s.operatorPrefs.armedNextSlotId = slot.id;
          } else {
            // Go live immediately
            // Pin to top
            const idx = s.queue.findIndex(x=>x.id===slot.id);
            if(idx > 0){
              const [moved] = s.queue.splice(idx, 1);
              s.queue.unshift(moved);
            }
            s.currentSlotId = slot.id;
            s.phase = "LIVE";
            // Ads are untimed; keep timer stopped
            s.timer.running = false;
            s.timer.startedAt = null;
            s.timer.elapsedMs = 0;
            s.timer.baseDurationMs = 0;
          }
        }
      });

      closeAdModal();
      if(goLive && liveish){
        toast("Armed ad to run next.");
      }
    }catch(err){
      toast(String(err?.message || err || "Ad error"), { tone:"bad" });
    }
  }

  function setIntermissionPresetActive(val){
    const btns = [els.imDur5, els.imDur10, els.imDur15, els.imDurCustom].filter(Boolean);
    for(const b of btns){
      const k = String(b.dataset.mins || "");
      const isActive = (val === "custom") ? (k === "custom") : (k === String(val));
      b.classList.toggle("accent", isActive);
    }
    if(val === "custom"){
      if(els.imCustomWrap) els.imCustomWrap.style.display = "";
      setTimeout(() => { els.imCustomMins?.focus?.(); }, 0);
    }else{
      if(els.imCustomWrap) els.imCustomWrap.style.display = "none";
    }
  }

  function addIntermissionSlotWithOptions(opts = {}){
    const titleRaw = OMJN.sanitizeText(opts.title || "INTERMISSION");
    const title = (titleRaw || "INTERMISSION").toUpperCase();

    let minutesOverride = null;
    const m = Number(opts.minutes);
    if(Number.isFinite(m) && m > 0) minutesOverride = Math.round(m);

    const message = String(opts.message || "").trim() || "WE'LL BE RIGHT BACK";
    const goLive = opts.goLive === true;

    let armedNext = false;
    updateState(s => {
      const slot = {
        id: OMJN.uid("slot"),
        createdAt: Date.now(),
        displayName: title,
        slotTypeId: "intermission",
        minutesOverride: minutesOverride,
        customTypeLabel: "",
        status: "QUEUED",
        notes: "",
        intermissionMessage: message,
        media: { donationUrl: null, imageAssetId: null, mediaLayout: "QR_ONLY" }
      };

      const afterPaperSlotNumber = Math.round(Number(opts.afterPaperSlotNumber || 0)) || null;

      if(goLive){
        if(isLiveishState(s)){
          if(afterPaperSlotNumber) insertSpecialAfterPaperSlot(s, slot, afterPaperSlotNumber);
          else insertIntermissionSlotSmart(s, slot);
          s.operatorPrefs = s.operatorPrefs || {};
          s.operatorPrefs.armedNextSlotId = slot.id;
          armedNext = true;
        }else{
          s.queue = Array.isArray(s.queue) ? s.queue : [];
          s.queue.unshift(slot);
          activateSlotLive(s, slot, { pinToTop:false });
        }
        return;
      }

      if(afterPaperSlotNumber) insertSpecialAfterPaperSlot(s, slot, afterPaperSlotNumber);
      else insertIntermissionSlotSmart(s, slot);
    });

    return { armedNext };
  }

  function commitIntermissionModal({ goLive=false } = {}){
    if(!els.intermissionModal || els.intermissionModal.hidden) return;
    const title = (els.imName?.value || "").trim() || "INTERMISSION";
    const message = (els.imMsg?.value || "").trim() || "WE'LL BE RIGHT BACK";

    let minutes = 10;
    if(imDraft?.minutes === "custom"){
      const n = Math.round(Number(els.imCustomMins?.value || 0));
      if(Number.isFinite(n) && n > 0) minutes = n;
    }else if(Number.isFinite(Number(imDraft?.minutes))){
      minutes = Math.round(Number(imDraft.minutes));
    }
    minutes = clamp(minutes, 1, 600);

    const result = addIntermissionSlotWithOptions({ title, minutes, message, goLive, afterPaperSlotNumber: imInsertAfterPaperSlot });
    closeIntermissionModal();
    render();
    if(result?.armedNext){
      toast("Armed Intermission to run next.");
    }
  }

  function addHouseBandSlot(afterPaperSlotNumber = null){
    openHbBuildModal({ mode: 'add', afterPaperSlotNumber });
  }

  
  function guardedStart(){
    // determine who would start
    const pick = (state.queue || []).find(x => x && x.status === "QUEUED" && !isPaperPlaceholder(x));

    if(!pick) return;
    if(state.operatorPrefs?.startGuard){
      const name = pick ? ((String(pick.slotTypeId || "") === "houseband") ? houseBandQueueTitle(pick.displayName || "") : (pick.displayName || "—")) : "—";
      const ok = confirm(`Start now: "${name}"?`);
      if(!ok) return;
    }
    start();
  }

  function guardedEnd(){
    if(state.operatorPrefs?.endGuard && state.phase !== "SPLASH"){
      const name = (state.queue.find(x=>x.id===state.currentSlotId)?.displayName) || "—";
      const ok = confirm(`End performance and return to Splash? (Current: "${name}")`);
      if(!ok) return;
    }
    endToSplash();
  }

function start(){
    const eligible = (x) => x && x.status === "QUEUED" && !isPaperPlaceholder(x);
    const prePick = (state.queue || []).find(x => eligible(x));
    if(!prePick) return;
    const expectedStartAt = prePick ? (queueEtaMap.get(prePick.id) || null) : null;
    updateState(s => {
      pruneLeadingEmptyPaperSlots(s);
      const pick = s.queue.find(x => eligible(x));
      if(!pick) return;
      if(expectedStartAt) pick.expectedStartAt = expectedStartAt;
      activateSlotLive(s, pick, { pinToTop:true });
    });
  }

  function pause(){
    updateState(s => {
      if(!s.timer.running) return;
      s.timer.elapsedMs = (s.timer.elapsedMs || 0) + (Date.now() - (s.timer.startedAt || Date.now()));
      s.timer.running = false;
      s.timer.startedAt = null;
      s.phase = "PAUSED";
    });
  }

  function resume(){
    updateState(s => {
      if(s.timer.running) return;
      if(!s.currentSlotId) return;
      s.timer.running = true;
      s.timer.startedAt = Date.now();
      s.phase = "LIVE";
    });
  }

  function togglePauseResume(){
    if(state.phase === "PAUSED") return resume();
    return pause();
  }

  function toggleViewerTimer(){
    updateState(s => {
      if(!s.viewerPrefs) s.viewerPrefs = {};
      const show = s.viewerPrefs.showTimer !== false;
      s.viewerPrefs.showTimer = !show;
    });
  }

  function resetTimer(){
    updateState(s => {
      const cur = s.queue.find(x=>x.id===s.currentSlotId);
      if(!cur) return;
      const baseMs = OMJN.effectiveMinutes(s, cur) * 60 * 1000;
      s.timer.baseDurationMs = baseMs;
      s.timer.elapsedMs = 0;
      s.timer.startedAt = s.timer.running ? Date.now() : null;
    });
  }

  function endToSplash(){
    updateState(s => {
      if(!s.currentSlotId){
        clearPendingTransitionForecast(s);
        s.phase = "SPLASH";
        return;
      }
      const idx = s.queue.findIndex(x => x.id === s.currentSlotId);
      const cur = idx >= 0 ? s.queue[idx] : null;
      const endedAt = Date.now();
      const timerSnapshot = OMJN.computeTimer(s);
      if(cur){
        const startedAt = Number(cur.actualStartedAt || s.timer.startedAt || 0);
        const elapsedMs = Number(timerSnapshot?.elapsedMs || 0);
        const scheduledMs = Number(timerSnapshot?.durationMs || 0) || (OMJN.effectiveMinutes(s, cur) * 60 * 1000);
        cur.status = "DONE";
        cur.completedAt = endedAt;
        cur.actualEndedAt = endedAt;
        cur.actualDurationMs = elapsedMs > 0 ? elapsedMs : (startedAt ? Math.max(0, endedAt - startedAt) : null);
        cur.actualWallDurationMs = startedAt ? Math.max(0, endedAt - startedAt) : null;
        cur.scheduledDurationMs = scheduledMs;
      }
      markTransitionPendingFromSlot(s, cur, endedAt);
      // If a HOUSE BAND slot just ended, rotate each featured lineup member
      // to the end of their category queue.
      if(cur && String(cur.slotTypeId || "") === "houseband"){
        const lineup = Array.isArray(cur.hbLineup) ? cur.hbLineup : [];
        for(const entry of lineup){
          const memberId = String(entry?.memberId || entry?.id || "").trim();
          if(memberId) OMJN.rotateHouseBandMemberToEnd(s, memberId);
        }
      }

      // Move completed performer to bottom so QUEUED order always drives Next/On Deck UX
      if(idx >= 0){
        const [moved] = s.queue.splice(idx, 1);
        s.queue.push(moved);
      }

      pruneLeadingEmptyPaperSlots(s);

      // If a slot was armed to run next, start it immediately instead of returning to Splash.
      const armedId = s.operatorPrefs?.armedNextSlotId || null;
      if(armedId){
        const next = s.queue.find(x => x && x.id === armedId && x.status === "QUEUED");
        if(next){
          s.operatorPrefs.armedNextSlotId = null;
          activateSlotLive(s, next, { pinToTop:true });
          return;
        }
        s.operatorPrefs.armedNextSlotId = null;
      }

      // House Band footer is independent; rotation is handled above for HOUSE BAND slots.
      s.currentSlotId = null;
      s.phase = "SPLASH";
      s.timer.running = false;
      s.timer.startedAt = null;
      s.timer.elapsedMs = 0;
      s.timer.baseDurationMs = null;
    });
  }

  function addMinutes(deltaMin){
    updateState(s => {
      const cur = s.queue.find(x=>x.id===s.currentSlotId);
      if(!cur) return;
      const base = (s.timer.baseDurationMs ?? (OMJN.effectiveMinutes(s, cur)*60*1000));
      let next = base + (deltaMin * 60 * 1000);
      const minMs = 60 * 1000;
      if(next < minMs) next = minMs;
      s.timer.baseDurationMs = next;
      // Live timer adjustment only — don\'t mutate slot minutesOverride here.
    });
  }

  function resetShow(){
    const ok = confirm("Start a new show? This clears the queue (images stay in local storage unless you clear browser data).");
    if(!ok) return;
    const fresh = OMJN.defaultState();
    // Preserve user configuration, but CLEAR both queues (performers + house band)
    // Preserve slot types + theme/prefs
    try{ fresh.slotTypes = JSON.parse(JSON.stringify(state.slotTypes || fresh.slotTypes)); }catch(_){ }
    try{ fresh.settings = JSON.parse(JSON.stringify(state.settings || fresh.settings)); }catch(_){ }
    try{ fresh.viewerPrefs = JSON.parse(JSON.stringify(state.viewerPrefs || fresh.viewerPrefs)); }catch(_){ }
    try{ fresh.operatorPrefs = JSON.parse(JSON.stringify(state.operatorPrefs || fresh.operatorPrefs)); }catch(_){ }
    fresh.operatorPrefs.paperSlotCount = PAPER_SLOT_DEFAULT_COUNT;
    fresh.operatorPrefs.retiredPaperSlots = [];
    fresh.operatorPrefs.armedNextSlotId = null;
    // preserve show title
    fresh.showTitle = state.showTitle || fresh.showTitle;
    setState(fresh);
    selectedId = null;
  }

  async function handleImageUpload(file, slotIdOverride){
    const targetId = slotIdOverride || selectedId;
    if(!targetId || !file) return;

    // compress and store
    const { blob, meta } = await OMJN.compressImageFile(file, { maxEdge: 1600, quality: 0.82, mime: "image/webp" });
    if(!blob) return;

    const assetId = OMJN.uid("asset");
    await OMJN.putAsset(assetId, blob);

    updateState(s => {
      s.assetsIndex[assetId] = meta;
      const slot = s.queue.find(x=>x.id===targetId);
      if(!slot) return;
      if(!slot.media) slot.media = { donationUrl:null, imageAssetId:null, mediaLayout:"NONE" };
      slot.media.imageAssetId = assetId;

      // if layout is NONE, default to IMAGE_ONLY
      if(!slot.media.mediaLayout || slot.media.mediaLayout === "NONE"){
        slot.media.mediaLayout = "IMAGE_ONLY";
      }

    });
  }

  function clearImage(slotIdOverride){
    const targetId = slotIdOverride || selectedId;
    if(!targetId) return;
    updateState(s => {
      const slot = s.queue.find(x=>x.id===targetId);
      if(!slot?.media?.imageAssetId) return;
      const assetId = slot.media.imageAssetId;
      slot.media.imageAssetId = null;

      delete s.assetsIndex[assetId];
      // async delete in background (best-effort)
      OMJN.deleteAsset(assetId).catch(()=>{});
    });
  }

  function exportShowState(){
    const stamp = new Date();
    const yyyy = String(stamp.getFullYear());
    const mm = String(stamp.getMonth() + 1).padStart(2, "0");
    const dd = String(stamp.getDate()).padStart(2, "0");
    const hh = String(stamp.getHours()).padStart(2, "0");
    const mi = String(stamp.getMinutes()).padStart(2, "0");
    const filename = `omjn_state_${yyyy}${mm}${dd}_${hh}${mi}.json`;

    const data = JSON.stringify(state, null, 2);
    const blob = new Blob([data], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  async function importShowStateFile(file){
    const text = await file.text();
    const parsed = JSON.parse(text);
    if(!parsed || typeof parsed !== "object") throw new Error("Invalid JSON.");
    if(!Array.isArray(parsed.queue)) parsed.queue = [];
    if(!parsed.viewerPrefs) parsed.viewerPrefs = {};
    if(!parsed.operatorPrefs) parsed.operatorPrefs = parsed.operatorPrefs || {};

    undoStack = [];
    redoStack = [];
    saveHistory();
    setState(parsed);
    OMJN.saveState(parsed);
    OMJN.publish(parsed);
    selectedId = null;
  }

  function exportJSON(){
    exportShowState();
  }

  function importJSON(file){
    importShowStateFile(file).catch((err) => {
      alert("Import failed: " + (err?.message || String(err)));
    });
  }



// ---- Wire up ----
  function toggleCustomAddFields(){
    const isCustom = els.addType.value === "custom";
    els.addCustomWrap.style.display = isCustom ? "flex" : "none";
    els.addCustomMinutesWrap.style.display = isCustom ? "block" : "none";
  }

  
  function openSettingsModal(){
    if(!els.settingsModal) return;
    els.settingsModal.hidden = false;
    refreshModalOpenClass();
    // restore last-opened tab
    try{
      const tab = localStorage.getItem(SETTINGS_TAB_KEY) || "viewer";
      const btn = els.settingsModal.querySelector(`.settingsTabBtn[data-tab="${tab}"]`);
      btn?.click?.();
    }catch(_){/* ignore */}
    // focus close for quick escape
    setTimeout(() => { els.btnCloseSettings?.focus?.(); }, 0);
  }

  function closeSettingsModal(){
    if(!els.settingsModal) return;
    els.settingsModal.hidden = true;
    refreshModalOpenClass();
    els.btnSettings?.focus?.();
  }

function bind(){
    // initial select options
    fillTypeSelect(els.addType, { excludeSpecial:true });
toggleCustomAddFields();
    bindSettings();
    bindPerformerDnD();

    // Crowd prompt quick controls (now in right drawer)
    if(els.btnCrowdPrev) els.btnCrowdPrev.addEventListener("click", (e) => { e.preventDefault(); cycleCrowdPreset(-1); });
    if(els.btnCrowdNext) els.btnCrowdNext.addEventListener("click", (e) => { e.preventDefault(); cycleCrowdPreset(+1); });
    if(els.btnCrowdToggle) els.btnCrowdToggle.addEventListener("click", (e) => {
      e.preventDefault();
      const cfg = getCrowdCfg(state);
      setCrowdEnabled(!cfg.enabled);
      updateCrowdQuickButtons();
      renderCrowdPromptPreview();
    });

    wireCrowdEditorInteractions();
    // Start collapsed by default
    if(els.crowdEditorModal) closeCrowdEditor(true);


    els.addType.addEventListener("change", toggleCustomAddFields);

    els.addName.addEventListener("keydown", (e) => {
      if(e.key === "Enter"){ e.preventDefault(); addPerformer(); }
    });
    els.btnAdd.addEventListener("click", addPerformer);

    if(els.btnAddPaperSlots){
      els.btnAddPaperSlots.addEventListener("click", (e) => {
        e.preventDefault();
        updateState(s => addPaperSlots(s, PAPER_SLOT_ADD_COUNT));
      });
    }

    // Quick add special screens
    if(els.btnAddIntermission){
      els.btnAddIntermission.addEventListener("click", (e) => { e.preventDefault(); openIntermissionModal(); });
    }
    
    if(els.btnAddAd){
      els.btnAddAd.addEventListener("click", (e) => { e.preventDefault(); openAdModal(); });
    }
if(els.btnAddHouseBandSlot){
      els.btnAddHouseBandSlot.addEventListener("click", (e) => { e.preventDefault(); addHouseBandSlot(); });
    }

    // Intermission Builder modal
    if(els.btnImClose) els.btnImClose.addEventListener("click", (e) => { e.preventDefault(); closeIntermissionModal(); });
    if(els.btnImCancel) els.btnImCancel.addEventListener("click", (e) => { e.preventDefault(); closeIntermissionModal(); });
    if(els.btnImLive) els.btnImLive.addEventListener("click", (e) => { e.preventDefault(); commitIntermissionModal({ goLive:true }); });
    if(els.btnImAdd) els.btnImAdd.addEventListener("click", (e) => { e.preventDefault(); commitIntermissionModal({ goLive:false }); });
    if(els.intermissionModal){
      els.intermissionModal.addEventListener("mousedown", (e) => {
        if(e.target === els.intermissionModal) closeIntermissionModal();
      });
    }
    const imPreset = (mins) => (e) => { e.preventDefault(); imDraft = imDraft || { minutes: 10 }; imDraft.minutes = mins; setIntermissionPresetActive(mins); };
    if(els.imDur5) els.imDur5.addEventListener("click", imPreset(5));
    if(els.imDur10) els.imDur10.addEventListener("click", imPreset(10));
    if(els.imDur15) els.imDur15.addEventListener("click", imPreset(15));
    if(els.imDurCustom) els.imDurCustom.addEventListener("click", imPreset("custom"));
    if(els.imName) els.imName.addEventListener("keydown", (e) => { if(e.key === "Enter"){ e.preventDefault(); commitIntermissionModal(); } if(e.key === "Escape"){ e.preventDefault(); closeIntermissionModal(); } });
    // Ad (Graphic) modal
    if(els.btnAdClose) els.btnAdClose.addEventListener("click", (e) => { e.preventDefault(); closeAdModal(); });
    if(els.btnAdCancel) els.btnAdCancel.addEventListener("click", (e) => { e.preventDefault(); closeAdModal(); });
    if(els.btnAdSave) els.btnAdSave.addEventListener("click", (e) => { e.preventDefault(); submitAdModal({ goLive:false }); });
    if(els.btnAdLive) els.btnAdLive.addEventListener("click", (e) => { e.preventDefault(); submitAdModal({ goLive:true }); });
    if(els.adKind) els.adKind.addEventListener("change", () => { syncAdKindUI(); renderAdPresetList(); updateAdPreview(); });
    if(els.adVideoLoop) els.adVideoLoop.addEventListener("change", () => { updateAdPreview(); });
    if(els.adVideoAudio) els.adVideoAudio.addEventListener("change", () => { updateAdPreview(); });
    if(els.adSource) els.adSource.addEventListener("change", () => { showAdSourceUI(); updateAdPreview(); });
    if(els.adUrl) els.adUrl.addEventListener("input", () => { if(!els.adLabel.value) els.adLabel.value = deriveLabelFromPath(els.adUrl.value); updateAdPreview(); });
    if(els.adFile) els.adFile.addEventListener("change", () => { const f = els.adFile.files?.[0]; if(f && !els.adLabel.value) els.adLabel.value = deriveLabelFromPath(f.name); updateAdPreview(); });
    if(els.adPresetSearch) els.adPresetSearch.addEventListener("input", () => { renderAdPresetList(); });
    if(els.btnAdPresetRefresh) els.btnAdPresetRefresh.addEventListener("click", (e) => { e.preventDefault(); ensureAdPresets(true).catch(()=>{}); });
    if(els.btnLoadAdManifest && els.adManifestFile){
      els.btnLoadAdManifest.addEventListener("click", (e) => { e.preventDefault(); els.adManifestFile.click(); });
      els.adManifestFile.addEventListener("change", async () => {
        const f = els.adManifestFile.files?.[0] || null;
        if(!f) return;
        try{
          const txt = await f.text();
          const json = JSON.parse(txt);
          const base = location.href;
          adPresets = normalizeAdManifest(json, base);
          adSelectedPresetId = null;
          if(els.adPresetStatus){
            els.adPresetStatus.style.display = "";
            els.adPresetStatus.textContent = adPresets.length ? `Loaded ${adPresets.length} preset${adPresets.length===1?"":"s"} from file.` : "No presets found in that file.";
          }
          renderAdPresetList();
        }catch(err){
          toast("Manifest load failed.", { tone:"bad" });
        }
      });
    }


    if(els.imCustomMins) els.imCustomMins.addEventListener("keydown", (e) => { if(e.key === "Enter"){ e.preventDefault(); commitIntermissionModal(); } if(e.key === "Escape"){ e.preventDefault(); closeIntermissionModal(); } });


    // House Band Set Builder modal
    if(els.btnHbBuildClose) els.btnHbBuildClose.addEventListener("click", (e) => { e.preventDefault(); closeHbBuildModal(); });
    if(els.btnHbBuildCancel) els.btnHbBuildCancel.addEventListener("click", (e) => { e.preventDefault(); closeHbBuildModal(); });
    if(els.btnHbBuildEnableAll) els.btnHbBuildEnableAll.addEventListener("click", (e) => { e.preventDefault(); enableAllHbBuild(); });
    if(els.btnHbBuildClearAll) els.btnHbBuildClearAll.addEventListener("click", (e) => { e.preventDefault(); clearAllHbBuild(); });
    if(els.btnHbBuildSave) els.btnHbBuildSave.addEventListener("click", (e) => { e.preventDefault(); commitHbBuild(); });

    // Tabs
    function setActiveTab(which){
      const isHB = (which === "hb");
      if(els.tabBtnPerformers) els.tabBtnPerformers.classList.toggle("active", !isHB);
      if(els.tabBtnHouseBand) els.tabBtnHouseBand.classList.toggle("active", isHB);
      if(els.tabPerformers) els.tabPerformers.hidden = isHB;
      if(els.tabHouseBand) els.tabHouseBand.hidden = !isHB;
    }
    if(els.tabBtnPerformers) els.tabBtnPerformers.addEventListener("click", () => setActiveTab("perf"));
    if(els.tabBtnHouseBand) els.tabBtnHouseBand.addEventListener("click", () => setActiveTab("hb"));
    // Viewer footer toggle + formatting
    if(els.toggleHBFooter){
      els.toggleHBFooter.checked = (state.viewerPrefs?.showHouseBandFooter !== false);
      els.toggleHBFooter.addEventListener("change", () => {
        updateState(s => {
          s.viewerPrefs = s.viewerPrefs || {};
          s.viewerPrefs.showHouseBandFooter = !!els.toggleHBFooter.checked;
        });
      });
    }
    if(els.hbFooterFormat){
      const fmt = (state.viewerPrefs?.hbFooterFormat || "categoryFirst");
      els.hbFooterFormat.value = fmt;
      els.hbFooterFormat.addEventListener("change", () => {
        updateState(s => {
          s.viewerPrefs = s.viewerPrefs || {};
          s.viewerPrefs.hbFooterFormat = String(els.hbFooterFormat.value || "categoryFirst");
        });
      });
    }

    // House Band add
    if(els.hbAddName){
      els.hbAddName.addEventListener("keydown", (e) => {
        if(e.key === "Enter"){ e.preventDefault(); addHouseBandMember(); }
      });
    }
    if(els.btnAddHBQ) els.btnAddHBQ.addEventListener("click", addHouseBandMember);
    if(els.hbAddInstrument) els.hbAddInstrument.addEventListener("change", toggleHBCustomField);

    // House Band drag/drop (within each category)
    const hbLists = [...document.querySelectorAll(".hbCatList")];
    for(const listEl of hbLists){
      listEl.addEventListener("dragover", (e) => e.preventDefault());
      listEl.addEventListener("drop", (e) => {
        e.preventDefault();
        const payload = e.dataTransfer.getData("text/plain");
        const [srcCat, draggedId] = String(payload || "").split(":");
        const dstCat = listEl.dataset.hbcat;
        if(!draggedId || !srcCat || !dstCat) return;
        // Keep it simple: reorder within the same category only
        if(srcCat !== dstCat) return;

        const afterElement = getDragAfterElement(listEl, e.clientY);
        updateState(s => {
          OMJN.ensureHouseBandQueues(s);
          const list = s.houseBandQueues?.[dstCat] || [];
          const idxFrom = list.findIndex(x=>x.id===draggedId);
          if(idxFrom < 0) return;
          const [moved] = list.splice(idxFrom, 1);
          const children = [...listEl.querySelectorAll(".queueItem:not(.dragging)")];
          const idxTo = afterElement ? children.indexOf(afterElement) : children.length;
          list.splice(Math.max(0, idxTo), 0, moved);
          s.houseBandQueues[dstCat] = list;
        });
      });
    }

    // House Band: quick jump nav + rotate-top buttons in accordion headers
    if(els.hbNav){
      els.hbNav.addEventListener("click", (e) => {
        const btn = e.target.closest(".hbNavBtn");
        if(!btn) return;
        const cat = btn.dataset.hbnav;
        const details = document.querySelector(`details.hbAcc[data-hbcat="${cat}"]`);
        if(details){
          details.open = true;
          details.scrollIntoView({ block:"start", behavior:"smooth" });
        }
      });
    }
    if(els.hbCats){
      els.hbCats.addEventListener("click", (e) => {
        const btn = e.target.closest(".hbRotateTopBtn");
        if(!btn) return;
        e.preventDefault();
        e.stopPropagation(); // prevent toggling <details> when rotating
        const cat = btn.dataset.rotateTop;
        if(cat) rotateHouseBandTop(cat);
      });
    }


    // Operator prefs are bound in bindSettings(); avoid duplicate listeners here.
els.showTitle.addEventListener("input", () => {
      const v = OMJN.sanitizeText(els.showTitle.value);
      updateState(s => { s.showTitle = v || "Open Mic & Jam Night"; });
    });

    els.btnStart.addEventListener("click", guardedStart);
    els.btnUndo.addEventListener("click", undo);
    els.btnRedo.addEventListener("click", redo);

    if(els.btnPauseResume) els.btnPauseResume.addEventListener("click", togglePauseResume);
    if(els.btnViewerTimerToggle) els.btnViewerTimerToggle.addEventListener("click", toggleViewerTimer);
    els.btnEnd.addEventListener("click", guardedEnd);
    els.btnMinus1.addEventListener("click", () => addMinutes(-1));
    els.btnMinus5.addEventListener("click", () => addMinutes(-5));
    els.btnPlus1.addEventListener("click", () => addMinutes(1));
    els.btnPlus5.addEventListener("click", () => addMinutes(5));
    els.btnMinus30.addEventListener("click", () => addSeconds(-30));
    els.btnPlus30.addEventListener("click", () => addSeconds(30));
    els.btnResetTime.addEventListener("click", resetTimer);


    // Timer-up modal bindings (operator reminder when time hits 0:00)
    if(els.btnTimerUpEnd) els.btnTimerUpEnd.addEventListener("click", () => { closeTimerUpModal(); guardedEnd(); });
    if(els.btnTimerUpPause) els.btnTimerUpPause.addEventListener("click", () => pause());
    if(els.btnTimerUpResume) els.btnTimerUpResume.addEventListener("click", () => resume());
    if(els.btnTimerUpSnooze) els.btnTimerUpSnooze.addEventListener("click", () => {
      const cur = OMJN.computeCurrent(state);
      if(!cur) return closeTimerUpModal();
      timerUpSnoozeForSlotId = cur.id;
      timerUpSnoozeUntil = Date.now() + 30 * 1000;
      closeTimerUpModal();
    });
    if(els.btnTimerUpDismiss) els.btnTimerUpDismiss.addEventListener("click", () => {
      const cur = OMJN.computeCurrent(state);
      if(cur) timerUpDismissedSlotId = cur.id;
      closeTimerUpModal();
    });
    if(els.btnTimerUpPlus30) els.btnTimerUpPlus30.addEventListener("click", () => addSeconds(30));
    if(els.btnTimerUpPlus1) els.btnTimerUpPlus1.addEventListener("click", () => addMinutes(1));
    if(els.btnTimerUpPlus5) els.btnTimerUpPlus5.addEventListener("click", () => addMinutes(5));
    if(els.btnTimerUpReset) els.btnTimerUpReset.addEventListener("click", () => resetTimer());

    // Crowd prompt preview updates while typing
    const cpInputs = [els.crowdPresetName, els.crowdTitle, els.crowdAutoHide, els.crowdLines, els.crowdFooter].filter(Boolean);
    for(const el of cpInputs){
      el.addEventListener("input", () => renderCrowdPromptPreview());
    }

    // Start lightweight UI tick (timer line + reminders)
    startUiTick();


    // House Band


    els.btnReset.addEventListener("click", resetShow);
    els.btnExport.addEventListener("click", exportJSON);
    els.importFile.addEventListener("change", () => {
      const file = els.importFile.files?.[0] || null;
      els.importFile.value = "";
      if(file) importJSON(file);
    });

    // Settings modal
    els.btnSettings.addEventListener("click", openSettingsModal);
    els.btnCloseSettings.addEventListener("click", closeSettingsModal);
    els.settingsModal.addEventListener("mousedown", (e) => {
      if(e.target === els.settingsModal) closeSettingsModal();
    });
    document.addEventListener("keydown", (e) => {
      const k = e.key;

      // If Timer-up modal is open, give it priority (show-critical)
      if(els.timerUpModal && !els.timerUpModal.hidden){
        if(k === "Escape"){
          e.preventDefault();
          els.btnTimerUpDismiss?.click();
          return;
        }
        if(k === "Enter"){
          const ae = document.activeElement;
          // If a button inside the modal is focused, let Enter activate that normally
          if(ae && ae.closest && ae.closest("#timerUpModal") && (ae.tagName||"").toLowerCase() === "button"){
            return;
          }
          e.preventDefault();
          els.btnTimerUpEnd?.click();
          return;
        }
      }

      // Settings modal close
      if(els.intermissionModal && !els.intermissionModal.hidden){
        if(k === "Escape"){
          e.preventDefault();
          closeIntermissionModal();
          return;
        }
        if(k === "Enter"){
          const ae = document.activeElement;
          // Allow Enter to add unless you're typing in the message box
          if(ae && ae.closest && ae.closest("#intermissionModal") && (ae.tagName||"").toLowerCase() === "textarea"){
            return;
          }
          // If a button is focused, let Enter activate it normally
          if(ae && ae.closest && ae.closest("#intermissionModal") && (ae.tagName||"").toLowerCase() === "button"){
            return;
          }
          e.preventDefault();
          commitIntermissionModal();
          return;
        }
      }

      if(k === "Escape" && els.settingsModal && !els.settingsModal.hidden){
        e.preventDefault();
        closeSettingsModal();
        return;
      }

      if(k === "Escape" && els.crowdEditorModal && !els.crowdEditorModal.hidden){
        e.preventDefault();
        closeCrowdEditor(false);
        return;
      }

      // Operator hotkeys (guarded)
      if(!(state.operatorPrefs?.hotkeysEnabled)) return;
      if(isTypingContext(e.target)) return;

      // Don't steal keys if any modal is open (except timer-up handled above)
      if(document.body.classList.contains("modalOpen")) return;

      const isCtrl = e.ctrlKey || e.metaKey;

      // Undo/Redo
      if(isCtrl && !e.shiftKey && (k === "z" || k === "Z")){
        e.preventDefault();
        undo();
        return;
      }
      if(isCtrl && ((k === "y" || k === "Y") || (e.shiftKey && (k === "z" || k === "Z")))){
        e.preventDefault();
        redo();
        return;
      }

      // Space = Start/Pause/Resume
      if(k === " " || k === "Spacebar"){
        e.preventDefault();
        if(state.phase === "SPLASH") guardedStart();
        else if(state.phase === "LIVE") pause();
        else if(state.phase === "PAUSED") resume();
        return;
      }

      // N = End → Splash
      if(k === "n" || k === "N"){
        e.preventDefault();
        guardedEnd();
        return;
      }
    });
  }

  // Subscribe to changes from other tabs (in case operator is duplicated)
  OMJN.subscribe((s) => {
    OMJN.ensureHouseBandQueues(s);
    normalizeQueueSpecialSlots(s);
    state = s;
    OMJN.applyThemeToDocument(document, state);
    render();
  });

  function runOperatorCommand(cmd, payload = {}){
    if(cmd === "AD_ENDED"){
      const slotId = payload?.slotId || null;
      if(!slotId) return;
      if(state.phase !== "LIVE" && state.phase !== "PAUSED") return;
      if(state.currentSlotId !== slotId) return;
      const cur = (state.queue || []).find(x => x && x.id === slotId) || null;
      if(!cur) return;
      const st = String(cur.slotTypeId || "");
      if(st !== "ad_video" && st !== "ad_graphic") return;
      endToSplash();
      return;
    }

    if(cmd === "OPERATOR_START"){
      start();
      return;
    }
    if(cmd === "OPERATOR_END_TO_SPLASH"){
      endToSplash();
      return;
    }
    if(cmd === "OPERATOR_PAUSE"){
      pause();
      return;
    }
    if(cmd === "OPERATOR_RESUME"){
      resume();
      return;
    }
    if(cmd === "OPERATOR_TOGGLE_PAUSE"){
      togglePauseResume();
      return;
    }
    if(cmd === "OPERATOR_ADD_SECONDS"){
      const deltaSec = Number(payload?.deltaSec);
      if(Number.isFinite(deltaSec) && deltaSec !== 0) addSeconds(deltaSec);
      return;
    }
    if(cmd === "OPERATOR_RESET_TIMER"){
      resetTimer();
    }
  }

  // Commands from other tabs (Viewer/Soundboard -> Operator).
  if(typeof OMJN.subscribeCommand === "function"){
    OMJN.subscribeCommand((msg) => {
      try{
        if(!msg || msg.type !== "CMD") return;
        const cmd = String(msg.cmd || "");
        runOperatorCommand(cmd, msg.payload || {});
      }catch(_){ }
    });
  }

    loadHistory();
// Boot
  bind();
  render();
})();
