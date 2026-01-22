/* Operator UI + actions */
(() => {
  let state = OMJN.loadState();
  OMJN.applyThemeToDocument(document, state);
  ensureProfilesShape(state);
  OMJN.ensureHouseBandQueues(state);
  const els = {
    statusBanner: document.getElementById("statusBanner"),
    queue: document.getElementById("queue"),
    addName: document.getElementById("addName"),
    addType: document.getElementById("addType"),
    btnAdd: document.getElementById("btnAdd"),
    profileNames: document.getElementById("profileNames"),
    addCustomWrap: document.getElementById("addCustomWrap"),
    addCustomLabel: document.getElementById("addCustomLabel"),
    addCustomMinutesWrap: document.getElementById("addCustomMinutesWrap"),
    addCustomMinutes: document.getElementById("addCustomMinutes"),

    showTitle: document.getElementById("showTitle"),
    splashPath: document.getElementById("splashPath"),

    startGuard: document.getElementById("startGuard"),
    endGuard: document.getElementById("endGuard"),
    hotkeysEnabled: document.getElementById("hotkeysEnabled"),

    // Settings
    prefCollapseEditor: document.getElementById("prefCollapseEditor"),
    setBgColor: document.getElementById("setBgColor"),
    setPanelColor: document.getElementById("setPanelColor"),
    setAccentColor: document.getElementById("setAccentColor"),
    setTextColor: document.getElementById("setTextColor"),
    setCardColor: document.getElementById("setCardColor"),
    setCardOpacity: document.getElementById("setCardOpacity"),
    setCardOpacityVal: document.getElementById("setCardOpacityVal"),
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
    crowdPromptStatus: document.getElementById("crowdPromptStatus"),
    btnSettingsCrowd: document.getElementById("btnSettingsCrowd"),
    settingsModal: document.getElementById("settingsModal"),
    btnCloseSettings: document.getElementById("btnCloseSettings"),

    statusLine: document.getElementById("statusLine"),
    kpiCurrent: document.getElementById("kpiCurrent"),
    kpiNext: document.getElementById("kpiNext"),
    kpiLeft: document.getElementById("kpiLeft"),
    kpiEstEnd: document.getElementById("kpiEstEnd"),

    btnStart: document.getElementById("btnStart"),
    btnPause: document.getElementById("btnPause"),
    btnResume: document.getElementById("btnResume"),
    btnEnd: document.getElementById("btnEnd"),
    btnUndo: document.getElementById("btnUndo"),
    btnRedo: document.getElementById("btnRedo"),
    btnExportState: document.getElementById("btnExportState"),
    btnImportState: document.getElementById("btnImportState"),
    importStateFile: document.getElementById("importStateFile"),
    btnMinus1: document.getElementById("btnMinus1"),
    btnMinus5: document.getElementById("btnMinus5"),
    btnPlus1: document.getElementById("btnPlus1"),
    btnPlus5: document.getElementById("btnPlus5"),
    btnMinus30: document.getElementById("btnMinus30"),
    btnPlus30: document.getElementById("btnPlus30"),
    btnResetTime: document.getElementById("btnResetTime"),
    timerLine: document.getElementById("timerLine"),

    editCard: document.getElementById("editCard"),
    selId: document.getElementById("selId"),
    editName: document.getElementById("editName"),
    editType: document.getElementById("editType"),
    editCustomWrap: document.getElementById("editCustomWrap"),
    editCustomLabel: document.getElementById("editCustomLabel"),
    editMinutes: document.getElementById("editMinutes"),
    editNotes: document.getElementById("editNotes"),
    editUrl: document.getElementById("editUrl"),
    editLayout: document.getElementById("editLayout"),
    imgFile: document.getElementById("imgFile"),
    btnClearImg: document.getElementById("btnClearImg"),
    btnSkip: document.getElementById("btnSkip"),
    
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
  };

  let selectedId = null;
  // Inline per-row editor (Stage 2)
  let editingId = null;
  let editDraft = null;

  const VIEWER_HEARTBEAT_KEY = "omjn.viewerHeartbeat.v1";

  // ---- Undo/Redo (operator-only) ----
  const HISTORY_KEY = "OMJN_HISTORY_V1";
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

  // ---- Performer profiles (stored in state) ----
  function ensureProfilesShape(s){
    if(!s.profiles) s.profiles = {};
    if(!s.operatorPrefs) s.operatorPrefs = { startGuard:true, endGuard:true, hotkeysEnabled:true };
  }

  // ---- House Band shape ----
  
  function normNameKey(name){
    return OMJN.sanitizeText(name).toLowerCase();
  }

  function getProfileForName(name){
    const key = normNameKey(name);
    if(!key) return null;
    return state.profiles?.[key] || null;
  }

  function upsertProfileFromSlot(slot){
    const key = normNameKey(slot.displayName);
    if(!key) return;

    updateState(s => {
      ensureProfilesShape(s);
      s.profiles[key] = {
        displayName: slot.displayName,
        defaultSlotTypeId: slot.slotTypeId || "musician",
        defaultMinutesOverride: slot.minutesOverride ?? null,
        media: {
          donationUrl: slot?.media?.donationUrl ?? null,
          imageAssetId: slot?.media?.imageAssetId ?? null,
          mediaLayout: slot?.media?.mediaLayout ?? "NONE"
        },
        updatedAt: Date.now()
      };
    }, { recordHistory:false }); // profile updates shouldn't spam undo
  }

  function applyProfileDefaultsToSlot(s, slot, profile){
    if(!profile) return;

    // Slot type + minutes always apply
    slot.slotTypeId = profile.defaultSlotTypeId || slot.slotTypeId;
    slot.minutesOverride = profile.defaultMinutesOverride ?? slot.minutesOverride ?? null;

    // Media defaults: only apply if the profile has an explicit media preference.
    // This lets "new performer" defaults (QR) take effect for legacy profiles that never set media.
    slot.media = slot.media || { donationUrl:null, imageAssetId:null, mediaLayout:"NONE" };

    const pm = profile.media || {};
    const profileHasMedia =
      (!!pm.imageAssetId) ||
      (typeof pm.donationUrl === "string" && pm.donationUrl.trim() !== "") ||
      (typeof pm.mediaLayout === "string" && pm.mediaLayout !== "NONE");

    if(profileHasMedia){
      slot.media.donationUrl = pm.donationUrl ?? slot.media.donationUrl ?? null;
      slot.media.imageAssetId = pm.imageAssetId ?? slot.media.imageAssetId ?? null;
      slot.media.mediaLayout = pm.mediaLayout ?? slot.media.mediaLayout ?? "NONE";
    }
  }



  function visibleSlotTypes(){
    return state.slotTypes.filter(t => (t.enabled !== false));
  }

  function ensureSelectedValid(){
    if(selectedId && !state.queue.some(s=>s.id===selectedId)) selectedId = null;
    if(!selectedId && state.queue.length) selectedId = state.queue.find(s=>s.status==="QUEUED")?.id ?? state.queue[0].id;
  }

  // Select a performer in the queue, and apply sensible defaults for legacy/empty media settings.
  // If a slot has no uploaded image, no URL, and no explicit layout, default it to QR_ONLY so the
  // Viewer shows the default QR image (assets/OMJN-QR.jpg) without extra operator clicks.
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
      slotTypeId: slot?.slotTypeId || "musician",
      customTypeLabel: slot?.customTypeLabel || "",
      minutesOverride: (slot?.minutesOverride ?? ""),
      notes: slot?.notes || "",
      donationUrl: (media.donationUrl || ""),
      mediaLayout: media.mediaLayout || "NONE",
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

    const slotTypeId = String(editDraft.slotTypeId || "musician");
    const customLabel = OMJN.sanitizeText(editDraft.customTypeLabel || "");
    const moRaw = (editDraft.minutesOverride ?? "");
    let minutesOverride = null;
    if(String(moRaw).trim() !== ""){
      const n = Math.round(Number(moRaw));
      if(Number.isFinite(n) && n > 0) minutesOverride = n;
    }

    updateState(s => {
      const slot = s.queue.find(x => x.id === slotId);
      if(!slot) return;
      slot.displayName = name;
      slot.slotTypeId = slotTypeId;
      slot.minutesOverride = minutesOverride;
      slot.customTypeLabel = (slotTypeId === "custom") ? customLabel : "";
      slot.notes = notes;
      if(!slot.media) slot.media = { donationUrl:null, imageAssetId:null, mediaLayout:"NONE" };
      slot.media.donationUrl = url || null;
      slot.media.mediaLayout = layout;

      // profile auto-save (keep existing behavior)
      const key = normNameKey(slot.displayName);
      if(key){
        s.profiles[key] = {
          displayName: slot.displayName,
          defaultSlotTypeId: slot.slotTypeId || "musician",
          defaultMinutesOverride: slot.minutesOverride ?? null,
          media: { donationUrl: slot?.media?.donationUrl ?? null, imageAssetId: slot?.media?.imageAssetId ?? null, mediaLayout: slot?.media?.mediaLayout ?? "NONE" },
          updatedAt: Date.now()
        };
      }
    });

    closeInlineEdit();
    render();
  }

  function cancelInlineEdit(){
    closeInlineEdit();
    render();
  }

  function firstLineOfNotes(txt){
    const s = String(txt || "").trim();
    if(!s) return "";
    // Avoid newline escape issues across environments
    const parts = s.split(String.fromCharCode(10));
    return (parts[0] || "").trim();
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

  function clearImageForSlot(slotId){
    clearImage(slotId);
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
    fillTypeSelect(selType);
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
      const cur = String(selType.value || "musician");
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
    ensureProfilesShape(next);
    OMJN.ensureHouseBandQueues(next);

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
    ensureProfilesShape(s);
    OMJN.ensureHouseBandQueues(s);
    // Ensure performer queue exists so mutators can push safely
    if(!Array.isArray(s.queue)) s.queue = [];
    mutator(s);
    normalizePerformerQueue(s);
    setState(s);
  }

  
  
  function normalizePerformerQueue(s){
    if(!Array.isArray(s.queue)) s.queue = [];
    const isDone = (x) => x && (x.status === "DONE" || x.status === "SKIPPED");
    const active = s.queue.filter(x => !isDone(x));
    const done = s.queue.filter(isDone).slice()
      .sort((a,b) => (a.completedAt || 0) - (b.completedAt || 0));
    // Keep the currently-live slot pinned to top (Operator clarity)
    const lockCurrent = !!s.currentSlotId && (s.phase === "LIVE" || s.phase === "PAUSED");
    if(lockCurrent){
      const liveIdx = active.findIndex(x => x.id === s.currentSlotId);
      if(liveIdx > 0){
        const [live] = active.splice(liveIdx, 1);
        active.unshift(live);
      }
    }

    s.queue = [...active, ...done];
  }

function clamp(n, min, max){ return Math.max(min, Math.min(max, n)); }

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
    const order = ["musician","comedian","poetry","custom"];
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
  }

  function setCrowdEnabled(on){
    updateState(s => { ensureCrowdDefaults(s); s.viewerPrefs.crowdPrompts.enabled = !!on; }, { recordHistory:false });
    scheduleCrowdAutoHide();
  }

  function updateCrowdQuickButtons(){
    if(!els.btnCrowdToggle) return;
    const cfg = getCrowdCfg(state);
    const p = getActiveCrowdPreset(cfg);
    const name = (p?.name || p?.title || "Prompt").trim();
    if(cfg.enabled){
      els.btnCrowdToggle.textContent = `Crowd: ${name}`;
      els.btnCrowdToggle.classList.add("good");
      if(els.crowdPromptStatus) els.crowdPromptStatus.textContent = `ON · ${name}`;
    } else {
      els.btnCrowdToggle.textContent = "Crowd: Off";
      els.btnCrowdToggle.classList.remove("good");
      if(els.crowdPromptStatus) els.crowdPromptStatus.textContent = `OFF · ${name}`;
    }
  }

  // ---- Sponsor Bug (Operator settings) ----
  const SPONSOR_VIEWER_STATUS_KEY = "omjn.sponsorBug.viewerStatus.v1";
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
if(els.prefCollapseEditor){
      els.prefCollapseEditor.checked = !!state.operatorPrefs?.editCollapsed;
    }

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
if(els.prefCollapseEditor){
      els.prefCollapseEditor.addEventListener("change", () => {
        const collapsed = !!els.prefCollapseEditor.checked;
        updateState(s => { s.operatorPrefs.editCollapsed = collapsed; }, { recordHistory:false });
        if(els.editCard) els.editCard.open = !collapsed;
      });
    }
    if(els.editCard){
      els.editCard.addEventListener("toggle", () => {
        const collapsed = !els.editCard.open;
        if(els.prefCollapseEditor) els.prefCollapseEditor.checked = collapsed;
        updateState(s => { s.operatorPrefs.editCollapsed = collapsed; }, { recordHistory:false });
      });
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
  }

function fillTypeSelect(selectEl){
    if(!selectEl) return;
    selectEl.innerHTML = "";
    for(const t of visibleSlotTypes()){
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

  function queueRow(slot){
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
    // Drag-reorder is allowed only for active queued performers, never for the LIVE/PAUSED current slot
    // (and never while the inline editor is open for that slot).
    const canDrag = (slot.status === "QUEUED") && !isLive && !isDone && (editingId !== slot.id);
    div.dataset.id = slot.id;
    if(t?.color) div.style.borderLeft = `6px solid ${t.color}`;

    const handle = document.createElement("div");
    handle.className = "dragHandle";
    handle.textContent = "≡";
    handle.title = canDrag ? "Drag to reorder" : "";
    // prevent row-select clicks when grabbing the handle
    handle.addEventListener("mousedown", (e) => e.stopPropagation());

    // reflect state for CSS (cursor/opacity)
    handle.draggable = !!canDrag;

    if(canDrag){
      // Use the handle as the drag source (more reliable than making the whole row draggable)
      handle.addEventListener("dragstart", (e) => {
        try{
          div.classList.add("dragging");
          e.dataTransfer.effectAllowed = "move";
          // set both for broader browser compatibility
          e.dataTransfer.setData("text/plain", slot.id);
          e.dataTransfer.setData("text", slot.id);
        }catch(_){ }
      });
      handle.addEventListener("dragend", () => {
        div.classList.remove("dragging");
      });
    }

    const main = document.createElement("div");
    main.className = "qMain";
    const top = document.createElement("div");
    top.className = "qTop";
    const name = document.createElement("div");
    name.className = "qName";
    name.textContent = slot.displayName || "—";

    const bType = document.createElement("span");
    bType.className = "badge gold";
    bType.textContent = typeLabel;

    const bMins = document.createElement("span");
    bMins.className = "badge";
    bMins.textContent = `${mins}m`;

    top.appendChild(name);
    top.appendChild(bType);
    top.appendChild(bMins);

    if(isLive){
      const live = document.createElement("span");
      live.className = "badge badgeLive";
      live.textContent = "LIVE";
      top.appendChild(live);
    }
    if(isNext){
      const nx = document.createElement("span");
      nx.className = "badge badgeNext";
      nx.textContent = "NEXT";
      top.appendChild(nx);
    }
    if(isDeck){
      const dk = document.createElement("span");
      dk.className = "badge badgeDeck";
      dk.textContent = "ON DECK";
      top.appendChild(dk);
    }
    if(isDone){
      const dn = document.createElement("span");
      dn.className = "badge badgeDone";
      if(slot.status === "SKIPPED"){
        dn.textContent = slot.noShow ? "NO-SHOW" : "SKIPPED";
      }else{
        dn.textContent = "DONE";
      }
      top.appendChild(dn);
    }

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

    main.appendChild(top);
    const notesLine = firstLineOfNotes(slot.notes);
    if(notesLine){
      const sub = document.createElement("div");
      sub.className = "qNotesSub";
      sub.textContent = notesLine;
      main.appendChild(sub);
    }
    main.appendChild(meta);

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

      // No-show - disabled for current performer
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
    }

    const btnDel = document.createElement("button");
    btnDel.className = "btn tiny danger";
    btnDel.textContent = "✕";
    btnDel.title = "Remove from queue";
    btnDel.addEventListener("click", (e) => {
      e.stopPropagation();
      removeSlot(slot.id);
    });
    actions.appendChild(btnDel);

    // Grid layout expects: handle + main + actions on the first row,
    // then the inline editor (qExpander) spanning full width below.
    div.appendChild(handle);
    div.appendChild(main);
    div.appendChild(actions);

    // Inline expander under row (full-width, below qMain)
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

    const isDone = (x) => x && (x.status === "DONE" || x.status === "SKIPPED");
    const active = (state.queue || []).filter(x => !isDone(x));
    const done = (state.queue || []).filter(isDone);

    if(!active.length){
      const empty = document.createElement("div");
      empty.className = "small";
      empty.textContent = done.length
        ? "No active performers. Completed performers are below."
        : "No active signups yet. Add a performer above.";
      els.queue.appendChild(empty);
    } else {
      for(const slot of active){
        els.queue.appendChild(queueRow(slot));
      }
    }

    if(done.length){
      const divider = document.createElement("div");
      divider.className = "queueDivider";
      const left = document.createElement("div");
      left.textContent = "Completed";
      const right = document.createElement("div");
      right.className = "mono";
      right.textContent = String(done.length);
      divider.appendChild(left);
      divider.appendChild(right);
      els.queue.appendChild(divider);

      for(const slot of done){
        els.queue.appendChild(queueRow(slot));
      }
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
      const draggedId = e.dataTransfer.getData('text/plain') || e.dataTransfer.getData('text');
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


  function requeueSlot(slotId){
    updateState(s => {
      const idx = s.queue.findIndex(x=>x.id===slotId);
      if(idx < 0) return;

      const slot = s.queue[idx];
      if(!slot) return;
      if(slot.status !== "DONE" && slot.status !== "SKIPPED") return;

      slot.status = "QUEUED";
      slot.completedAt = null;
      slot.noShow = false;

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

function renderKPIs(){
    const current = OMJN.computeCurrent(state);
    const [next, deck] = OMJN.computeNextTwo(state);

    els.statusLine.textContent = state.phase;
    els.kpiCurrent.textContent = current ? current.displayName : "—";
    els.kpiNext.textContent = next ? next.displayName : "—";
    if(els.readyNext) els.readyNext.textContent = next ? next.displayName : "—";
    if(els.readyDeck) els.readyDeck.textContent = deck ? deck.displayName : "—";

    // Performers left = current (if LIVE/PAUSED) + queued
    const queued = (state.queue || []).filter(x => x && x.status === "QUEUED");
    const hasCurrent = !!current && (state.phase === "LIVE" || state.phase === "PAUSED");
    const left = queued.length + (hasCurrent ? 1 : 0);
    if(els.kpiLeft) els.kpiLeft.textContent = String(left);

    // Estimated end time based on remaining LIVE time + queued slots
    if(els.kpiEstEnd){
      try{
        let totalMs = 0;
        if(hasCurrent){
          const t = OMJN.computeTimer(state);
          totalMs += Math.max(t.remainingMs || 0, 0);
        }
        for(const s of queued){
          OMJN.normalizeSlot(s);
          totalMs += (OMJN.effectiveMinutes(state, s) * 60 * 1000);
        }
        if(totalMs <= 0){
          els.kpiEstEnd.textContent = "—";
        }else{
          const end = new Date(Date.now() + totalMs);
          els.kpiEstEnd.textContent = end.toLocaleTimeString([], { hour:"numeric", minute:"2-digit" });
        }
      }catch(_){
        els.kpiEstEnd.textContent = "—";
      }
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

  function renderTimerLine(){
    const t = OMJN.computeTimer(state);
    els.timerLine.textContent = `${OMJN.formatMMSS(t.elapsedMs)} / ${OMJN.formatMMSS(t.remainingMs)}`;
  }

  function renderEditor(){
    // Legacy right-drawer editor may not exist (inline expander is primary).
    if(!els.selId || !els.editName || !els.editType || !els.editMinutes || !els.editNotes || !els.editUrl || !els.editLayout) return;
    ensureSelectedValid();
    const slot = state.queue.find(s=>s.id===selectedId) || null;

    if(slot) OMJN.normalizeSlot(slot);

    els.selId.textContent = selectedId ? selectedId : "—";

    if(!slot){
      // disable editor
      els.editName.value = "";
      els.editNotes.value = "";
      els.editUrl.value = "";
      els.editMinutes.value = "";
      return;
    }

    els.editName.value = slot.displayName || "";
    els.editType.value = slot.slotTypeId;
    els.editMinutes.value = (slot.minutesOverride ?? "");
    els.editNotes.value = slot.notes || "";
    els.editUrl.value = slot.media?.donationUrl || "";
    els.editLayout.value = slot.media?.mediaLayout || "NONE";

    const type = OMJN.getSlotType(state, slot.slotTypeId);
    const showCustom = slot.slotTypeId === "custom";
    els.editCustomWrap.style.display = showCustom ? "block" : "none";
    if(showCustom) els.editCustomLabel.value = slot.customTypeLabel || "";
  }


  
  function render(){
    // sync header inputs
    els.showTitle.value = state.showTitle || "";
    els.splashPath.value = state.splash?.backgroundAssetPath || "./assets/splash_BG.jpg";

    renderStatusBanner();

    // Operator prefs
    els.startGuard.checked = !!state.operatorPrefs?.startGuard;
    els.endGuard.checked = !!state.operatorPrefs?.endGuard;
    els.hotkeysEnabled.checked = (state.operatorPrefs?.hotkeysEnabled !== false);

    if(els.toggleHBFooter) els.toggleHBFooter.checked = (state.viewerPrefs?.showHouseBandFooter !== false);
    if(els.hbFooterFormat) els.hbFooterFormat.value = (state.viewerPrefs?.hbFooterFormat || "categoryFirst");

    // Editor collapse
    if(els.editCard) els.editCard.open = !state.operatorPrefs?.editCollapsed;

    try{
      renderSettings();
    }catch(err){
      console.error("renderSettings crashed; continuing to render queue.", err);
    }

    // Undo/redo buttons
    els.btnUndo.disabled = !undoStack.length;
    els.btnRedo.disabled = !redoStack.length;

    // Profiles datalist
    if(els.profileNames){
      const opts = Object.values(state.profiles || {})
        .map(p => p?.displayName)
        .filter(Boolean)
        .sort((a,b)=>a.localeCompare(b));
      els.profileNames.innerHTML = "";
      for(const n of opts){
        const opt = document.createElement("option");
        opt.value = n;
        els.profileNames.appendChild(opt);
      }
    }

    fillTypeSelect(els.addType);
    fillTypeSelect(els.editType);
    toggleCustomAddFields();
    // House Band add controls
    if(els.hbAddInstrument){
      fillHBInstrumentSelect(els.hbAddInstrument);
      toggleHBCustomField();
    }


    renderQueue();
    renderKPIs();
    renderTimerLine();
    renderEditor();
    renderHouseBandCategories();
  }

  // ---- Actions ----
  function addPerformer(){
    const name = OMJN.sanitizeText(els.addName.value);
    if(!name) return;

    updateState(s => {
      const slotTypeId = els.addType.value || "musician";
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
      const prof = s.profiles?.[normNameKey(slot.displayName)] || null;
        if(prof) applyProfileDefaultsToSlot(s, slot, prof);
        s.queue.push(slot);
        // create/update profile for future auto-fill
        if(slot.displayName){
          const key = normNameKey(slot.displayName);
          s.profiles[key] = {
            displayName: slot.displayName,
            defaultSlotTypeId: slot.slotTypeId,
            defaultMinutesOverride: slot.minutesOverride ?? null,
            media: { donationUrl: slot?.media?.donationUrl ?? null, imageAssetId: slot?.media?.imageAssetId ?? null, mediaLayout: slot?.media?.mediaLayout ?? "NONE" },
            updatedAt: Date.now()
          };
        }
    });

    els.addName.value = "";
    els.addName.focus();
  }

  
  function guardedStart(){
    // determine who would start
    const pick = (state.queue || []).find(x => x && x.status === "QUEUED");

    if(state.operatorPrefs?.startGuard){
      const name = pick?.displayName || "—";
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
    updateState(s => {
      const eligible = (x) => x.status==="QUEUED" && true;
      const pick = s.queue.find(x => eligible(x));
      if(!pick) return;

      // Pin live slot to top of the queue for clarity
      const idx = s.queue.findIndex(x=>x.id===pick.id);
      if(idx > 0){
        const [moved] = s.queue.splice(idx, 1);
        s.queue.unshift(moved);
      }

      s.currentSlotId = pick.id;
      s.phase = "LIVE";
      s.timer.running = true;
      s.timer.startedAt = Date.now();
      s.timer.elapsedMs = 0;
      s.timer.baseDurationMs = OMJN.effectiveMinutes(s, pick) * 60 * 1000;
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
        s.phase = "SPLASH";
        return;
      }
      const idx = s.queue.findIndex(x => x.id === s.currentSlotId);
      const cur = idx >= 0 ? s.queue[idx] : null;
      if(cur){ cur.status = "DONE"; cur.completedAt = Date.now(); }

      // Move completed performer to bottom so QUEUED order always drives Next/On Deck UX
      if(idx >= 0){
        const [moved] = s.queue.splice(idx, 1);
        s.queue.push(moved);
      }

      // House Band is independent; no automatic rotation happens here.
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

  function skipSelected(){
    const id = selectedId;
    if(!id) return;
    updateState(s => {
      const slot = s.queue.find(x=>x.id===id);
      if(!slot) return;
      slot.status = "SKIPPED";
      slot.completedAt = Date.now();
      if(s.currentSlotId === slot.id){
        // House Band is independent; skipping a performer doesn't rotate House Band.
        s.currentSlotId = null;
        s.phase = "SPLASH";
        s.timer.running = false;
        s.timer.startedAt = null;
        s.timer.elapsedMs = 0;
        s.timer.baseDurationMs = null;
      }
    });
  }

  function resetShow(){
    const ok = confirm("Start a new show? This clears the queue (images stay in local storage unless you clear browser data).");
    if(!ok) return;
    const fresh = OMJN.defaultState();
    // Preserve user configuration, but CLEAR both queues (performers + house band)
    // - keep profiles for autocomplete
    // - keep slot types + theme/prefs
    try{ fresh.profiles = JSON.parse(JSON.stringify(state.profiles || fresh.profiles)); }catch(_){ }
    try{ fresh.slotTypes = JSON.parse(JSON.stringify(state.slotTypes || fresh.slotTypes)); }catch(_){ }
    try{ fresh.settings = JSON.parse(JSON.stringify(state.settings || fresh.settings)); }catch(_){ }
    try{ fresh.viewerPrefs = JSON.parse(JSON.stringify(state.viewerPrefs || fresh.viewerPrefs)); }catch(_){ }
    try{ fresh.operatorPrefs = JSON.parse(JSON.stringify(state.operatorPrefs || fresh.operatorPrefs)); }catch(_){ }
    // preserve show title + splash path if user changed them
    fresh.showTitle = state.showTitle || fresh.showTitle;
    fresh.splash.backgroundAssetPath = state.splash?.backgroundAssetPath || fresh.splash.backgroundAssetPath;
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
      // profile auto-save
      const key = normNameKey(slot.displayName);
      if(key){
        s.profiles[key] = {
          displayName: slot.displayName,
          defaultSlotTypeId: slot.slotTypeId || "musician",
          defaultMinutesOverride: slot.minutesOverride ?? null,
          media: { donationUrl: slot?.media?.donationUrl ?? null, imageAssetId: slot?.media?.imageAssetId ?? null, mediaLayout: slot?.media?.mediaLayout ?? "NONE" },
          updatedAt: Date.now()
        };
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

      // profile auto-save
      const key = normNameKey(slot.displayName);
      if(key){
        s.profiles[key] = {
          displayName: slot.displayName,
          defaultSlotTypeId: slot.slotTypeId || "musician",
          defaultMinutesOverride: slot.minutesOverride ?? null,
          media: { donationUrl: slot?.media?.donationUrl ?? null, imageAssetId: slot?.media?.imageAssetId ?? null, mediaLayout: slot?.media?.mediaLayout ?? "NONE" },
          updatedAt: Date.now()
        };
      }

      delete s.assetsIndex[assetId];
      // async delete in background (best-effort)
      OMJN.deleteAsset(assetId).catch(()=>{});
    });
  }

  function exportJSON(){
    const blob = new Blob([JSON.stringify(state, null, 2)], { type:"application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `omjn-show-${new Date().toISOString().slice(0,10)}.json`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 500);
  }

  function importJSON(file){
    const reader = new FileReader();
    reader.onload = () => {
      try{
        const imported = JSON.parse(reader.result);
        if(!imported || typeof imported !== "object") throw new Error("Invalid JSON");
        // light validation
        imported.version = imported.version ?? 1;
        imported.features = imported.features ?? {};
        imported.splash = imported.splash ?? { backgroundAssetPath:"./assets/splash_BG.jpg", showNextTwo:true };
        imported.viewerPrefs = imported.viewerPrefs ?? { warnAtSec:120, finalAtSec:30, showOvertime:true, showProgressBar:true, showHouseBandFooter:true };
        imported.assetsIndex = imported.assetsIndex ?? {};
        // Drop legacy Jam mode data (Lineup-only)
        if(Array.isArray(imported.slotTypes)) imported.slotTypes = imported.slotTypes.filter(t => t?.id !== "jam");
        if(Array.isArray(imported.queue)){
          for(const slot of imported.queue){
            if(slot?.slotTypeId === "jam") slot.slotTypeId = "musician";
            if(slot?.jam) delete slot.jam;
          }
        }
        pushUndoSnapshot();
        undoStack = undoStack.slice(-HISTORY_LIMIT);
        redoStack = [];
        setState(imported);
        saveHistory();
        selectedId = null;
      }catch(e){
        alert("Import failed: " + e.message);
      }
    };
    reader.readAsText(file);
  }

  // ---- Editor bindings ----
  // Legacy drawer editor (hidden in current UX)
  // Kept as a safe no-op when the DOM is missing, so it can be removed later without breaking JS.
  function bindEditor(){
    // If the legacy editor isn't in the DOM, do nothing.
    if(!els.editName || !els.editType || !els.editMinutes || !els.editNotes || !els.editUrl || !els.editLayout || !els.imgFile || !els.btnClearImg || !els.btnSkip || !els.editCustomLabel){
      return;
    }

    const withSelected = (mut, opts) => {
      const id = selectedId;
      if(!id) return;
      updateState(s => {
        const slot = s.queue.find(x => x.id === id);
        if(!slot) return;
        mut(s, slot);
      }, opts);
    };

    els.editName.addEventListener("input", () => {
      const v = OMJN.sanitizeText(els.editName.value);
      withSelected((s, slot) => {
        slot.displayName = v;
        // profile auto-save
        const key = normNameKey(slot.displayName);
        if(key){
          s.profiles[key] = {
            displayName: slot.displayName,
            defaultSlotTypeId: slot.slotTypeId || "musician",
            defaultMinutesOverride: slot.minutesOverride ?? null,
            media: { donationUrl: slot?.media?.donationUrl ?? null, imageAssetId: slot?.media?.imageAssetId ?? null, mediaLayout: slot?.media?.mediaLayout ?? "NONE" },
            updatedAt: Date.now()
          };
        }
      }, { recordHistory:false });
    });

    els.editType.addEventListener("change", () => {
      const v = els.editType.value;
      withSelected((s, slot) => {
        slot.slotTypeId = v;
        if(v !== "custom") slot.customTypeLabel = slot.customTypeLabel || "";
        const key = normNameKey(slot.displayName);
        if(key){
          s.profiles[key] = {
            displayName: slot.displayName,
            defaultSlotTypeId: slot.slotTypeId || "musician",
            defaultMinutesOverride: slot.minutesOverride ?? null,
            media: { donationUrl: slot?.media?.donationUrl ?? null, imageAssetId: slot?.media?.imageAssetId ?? null, mediaLayout: slot?.media?.mediaLayout ?? "NONE" },
            updatedAt: Date.now()
          };
        }
      }, { recordHistory:false });
    });

    els.editCustomLabel.addEventListener("input", () => {
      const v = OMJN.sanitizeText(els.editCustomLabel.value);
      withSelected((s, slot) => {
        slot.customTypeLabel = v;
      }, { recordHistory:false });
    });

    els.editMinutes.addEventListener("input", () => {
      const raw = els.editMinutes.value;
      const val = raw === "" ? null : Math.max(1, Math.round(Number(raw)));
      withSelected((s, slot) => {
        slot.minutesOverride = val;
      });
    });

    els.editNotes.addEventListener("input", () => {
      const v = els.editNotes.value;
      withSelected((s, slot) => {
        slot.notes = v;
      });
    });

    els.editUrl.addEventListener("input", () => {
      const v = OMJN.sanitizeText(els.editUrl.value);
      withSelected((s, slot) => {
        if(!slot.media) slot.media = { donationUrl:null, imageAssetId:null, mediaLayout:"NONE" };
        slot.media.donationUrl = v || null;
        const key = normNameKey(slot.displayName);
        if(key){
          s.profiles[key] = {
            displayName: slot.displayName,
            defaultSlotTypeId: slot.slotTypeId || "musician",
            defaultMinutesOverride: slot.minutesOverride ?? null,
            media: { donationUrl: slot?.media?.donationUrl ?? null, imageAssetId: slot?.media?.imageAssetId ?? null, mediaLayout: slot?.media?.mediaLayout ?? "NONE" },
            updatedAt: Date.now()
          };
        }
      }, { recordHistory:false });
    });

    els.editLayout.addEventListener("change", () => {
      const v = els.editLayout.value;
      withSelected((s, slot) => {
        if(!slot.media) slot.media = { donationUrl:null, imageAssetId:null, mediaLayout:"NONE" };
        slot.media.mediaLayout = v;
        const key = normNameKey(slot.displayName);
        if(key){
          s.profiles[key] = {
            displayName: slot.displayName,
            defaultSlotTypeId: slot.slotTypeId || "musician",
            defaultMinutesOverride: slot.minutesOverride ?? null,
            media: { donationUrl: slot?.media?.donationUrl ?? null, imageAssetId: slot?.media?.imageAssetId ?? null, mediaLayout: slot?.media?.mediaLayout ?? "NONE" },
            updatedAt: Date.now()
          };
        }
      }, { recordHistory:false });
    });

    els.imgFile.addEventListener("change", async () => {
      const file = els.imgFile.files?.[0] || null;
      els.imgFile.value = "";
      const id = selectedId; // capture to avoid async races
      if(file && id) await handleImageUpload(file, id);
    });

    els.btnClearImg.addEventListener("click", () => clearImage(selectedId));
    els.btnSkip.addEventListener("click", skipSelected);
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
    document.body.classList.add("modalOpen");
    // focus close for quick escape
    setTimeout(() => { els.btnCloseSettings?.focus?.(); }, 0);
  }

  function closeSettingsModal(){
    if(!els.settingsModal) return;
    els.settingsModal.hidden = true;
    document.body.classList.remove("modalOpen");
    els.btnSettings?.focus?.();
  }

function bind(){
    // initial select options
    fillTypeSelect(els.addType);
    fillTypeSelect(els.editType);
    toggleCustomAddFields();
    bindSettings();
    bindEditor();
    bindPerformerDnD();

    // Crowd prompt quick controls (now in right drawer)
    if(els.btnCrowdPrev) els.btnCrowdPrev.addEventListener("click", (e) => { e.preventDefault(); cycleCrowdPreset(-1); renderSettings(); });
    if(els.btnCrowdNext) els.btnCrowdNext.addEventListener("click", (e) => { e.preventDefault(); cycleCrowdPreset(+1); renderSettings(); });
    if(els.btnCrowdToggle) els.btnCrowdToggle.addEventListener("click", (e) => {
      e.preventDefault();
      const cfg = getCrowdCfg(state);
      setCrowdEnabled(!cfg.enabled);
      renderSettings();
    });
    if(els.btnSettingsCrowd) els.btnSettingsCrowd.addEventListener("click", (e) => {
      e.preventDefault();
      openSettingsModal();
      // scroll to Crowd section if present
      setTimeout(() => {
        document.getElementById("setCrowdEnabled")?.scrollIntoView?.({ behavior:"smooth", block:"start" });
      }, 50);
    });

    els.addType.addEventListener("change", toggleCustomAddFields);

    els.addName.addEventListener("keydown", (e) => {
      if(e.key === "Enter"){ e.preventDefault(); addPerformer(); }
    });
    els.btnAdd.addEventListener("click", addPerformer);

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

    els.splashPath.addEventListener("input", () => {
      const v = OMJN.sanitizeText(els.splashPath.value);
        updateState(s => { s.splash.backgroundAssetPath = v || "./assets/splash_BG.jpg"; });
    });

    els.btnStart.addEventListener("click", guardedStart);
    els.btnUndo.addEventListener("click", undo);
    els.btnRedo.addEventListener("click", redo);

    // Export/Import state
    if(els.btnExportState){
      els.btnExportState.addEventListener("click", () => {
        try{
          const stamp = new Date();
          const yyyy = String(stamp.getFullYear());
          const mm = String(stamp.getMonth()+1).padStart(2,"0");
          const dd = String(stamp.getDate()).padStart(2,"0");
          const hh = String(stamp.getHours()).padStart(2,"0");
          const mi = String(stamp.getMinutes()).padStart(2,"0");
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
        }catch(err){
          alert("Export failed.\n\n" + (err?.message || String(err)));
        }
      });
    }

    if(els.btnImportState && els.importStateFile){
      els.btnImportState.addEventListener("click", () => els.importStateFile.click());
      els.importStateFile.addEventListener("change", async () => {
        const file = els.importStateFile.files && els.importStateFile.files[0];
        els.importStateFile.value = "";
        if(!file) return;
        try{
          const text = await file.text();
          const parsed = JSON.parse(text);
          if(!parsed || typeof parsed !== "object") throw new Error("Invalid JSON.");
          if(!Array.isArray(parsed.queue)) parsed.queue = [];
          if(!parsed.viewerPrefs) parsed.viewerPrefs = {};
          if(!parsed.operatorPrefs) parsed.operatorPrefs = parsed.operatorPrefs || {};
          // Apply and clear undo/redo history (import is a new baseline)
          undoStack = [];
          redoStack = [];
          saveHistory();
          setState(parsed);
          OMJN.saveState(parsed);
          OMJN.publish(parsed);
        }catch(err){
          alert("Import failed.\n\n" + (err?.message || String(err)));
        }
      });
    }
    els.btnPause.addEventListener("click", pause);
    els.btnResume.addEventListener("click", resume);
    els.btnEnd.addEventListener("click", guardedEnd);
    els.btnMinus1.addEventListener("click", () => addMinutes(-1));
    els.btnMinus5.addEventListener("click", () => addMinutes(-5));
    els.btnPlus1.addEventListener("click", () => addMinutes(1));
    els.btnPlus5.addEventListener("click", () => addMinutes(5));
    els.btnMinus30.addEventListener("click", () => addSeconds(-30));
    els.btnPlus30.addEventListener("click", () => addSeconds(30));
    els.btnResetTime.addEventListener("click", resetTimer);
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
      if(e.key === "Escape" && !els.settingsModal.hidden) closeSettingsModal();
    });
  }

  // Subscribe to changes from other tabs (in case operator is duplicated)
  OMJN.subscribe((s) => {
    ensureProfilesShape(s);
    OMJN.ensureHouseBandQueues(s);
    state = s;
    render();
  });

    loadHistory();
// Boot
  bind();
  render();
})();
