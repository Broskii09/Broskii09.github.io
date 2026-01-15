/* Operator UI + actions */
(() => {
  let state = OMJN.loadState();
  OMJN.applyThemeToDocument(document, state);
  ensureProfilesShape(state);
  OMJN.ensureHouseBandQueues(state);
  const els = {
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
    slotTypesEditor: document.getElementById("slotTypesEditor"),
    btnExportSettings: document.getElementById("btnExportSettings"),
    importSettingsFile: document.getElementById("importSettingsFile"),
    btnResetSettings: document.getElementById("btnResetSettings"),

    btnExport: document.getElementById("btnExport"),
    importFile: document.getElementById("importFile"),
    btnReset: document.getElementById("btnReset"),

    btnSettings: document.getElementById("btnSettings"),
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
    btnSelectNext: document.getElementById("btnSelectNext"),

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
    if(s.currentSlotId){
      const liveIdx = active.findIndex(x => x.id === s.currentSlotId);
      if(liveIdx > 0){
        const [live] = active.splice(liveIdx, 1);
        active.unshift(live);
      }
    }

    s.queue = [...active, ...done];

    // Keep selectedNextId valid
    if(s.selectedNextId){
      const ok = s.queue.some(x => x.id === s.selectedNextId && x.status === "QUEUED" && x.id !== s.currentSlotId);
      if(!ok) s.selectedNextId = null;
    }
  }

function clamp(n, min, max){ return Math.max(min, Math.min(max, n)); }

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
    const isLive = (slot.id === state.currentSlotId);
    const isDone = (slot.status === "DONE" || slot.status === "SKIPPED");
    const isNext = (!isLive && !isDone && n1 && slot.id === n1.id);
    const isDeck = (!isLive && !isDone && n2 && slot.id === n2.id);

    div.className = "queueItem";
    if(isLive) div.classList.add("livePinned");
    if(isNext) div.classList.add("isNext");
    if(isDeck) div.classList.add("isDeck");
    if(isDone) div.classList.add("isDone");
    if(slot.status !== "QUEUED") div.classList.add("notQueued");

    div.draggable = (slot.status === "QUEUED") && !isLive && !isDone;
    div.dataset.id = slot.id;
    if(t?.color) div.style.borderLeft = `6px solid ${t.color}`;

    if(div.draggable){
      div.addEventListener("dragstart", (e) => {
        div.classList.add("dragging");
        e.dataTransfer.setData("text/plain", slot.id);
      });
      div.addEventListener("dragend", () => div.classList.remove("dragging"));
    }

    const handle = document.createElement("div");
    handle.className = "dragHandle";
    handle.textContent = "≡";

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
      dn.textContent = (slot.status === "SKIPPED") ? "NO-SHOW" : "DONE";
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
    main.appendChild(meta);

const actions = document.createElement("div");
actions.className = "qActions";

const btnSel = document.createElement("button");
btnSel.className = "btn tiny";
btnSel.textContent = (selectedId === slot.id) ? "Selected" : "Select";
btnSel.addEventListener("click", (e) => {
  e.stopPropagation();
  selectSlot(slot.id);
});
actions.appendChild(btnSel);

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

    div.appendChild(handle);
    div.appendChild(main);
    div.appendChild(actions);

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
    const els = [...container.querySelectorAll('.queueItem:not(.dragging)')];
    return els.reduce((closest, child) => {
      const box = child.getBoundingClientRect();
      const offset = y - box.top - box.height / 2;
      if(offset < 0 && offset > closest.offset){
        return { offset, element: child };
      } else {
        return closest;
      }
    }, { offset: Number.NEGATIVE_INFINITY, element: null }).element;
  }

  function moveSlot(slotId, delta){
    updateState(s => {
      const idx = s.queue.findIndex(x=>x.id===slotId);
      if(idx < 0) return;

      const slot = s.queue[idx];
      if(!slot) return;
      if(slot.status === "DONE" || slot.status === "SKIPPED") return; // completed lives in Completed tab

      // do not move the live slot
      if(slotId === s.currentSlotId) return;

      const liveIdx = s.currentSlotId ? s.queue.findIndex(x=>x.id===s.currentSlotId) : -1;
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

      // move to bottom of Active (before first completed)
      const [moved] = s.queue.splice(idx, 1);
      const doneStart = s.queue.findIndex(x => x.status === "DONE" || x.status === "SKIPPED");
      const insertAt = (doneStart >= 0) ? doneStart : s.queue.length;
      s.queue.splice(insertAt, 0, moved);

      if(!s.currentSlotId && !s.selectedNextId){
        s.selectedNextId = moved.id;
      }
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
      if(s.selectedNextId === slotId){
        const next = s.queue.find(x=>x.status==="QUEUED" && true);
        s.selectedNextId = next ? next.id : null;
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

  function renderTimerLine(){
    const t = OMJN.computeTimer(state);
    els.timerLine.textContent = `${OMJN.formatMMSS(t.elapsedMs)} / ${OMJN.formatMMSS(t.remainingMs)}`;
  }

  function renderEditor(){
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

    // Operator prefs
    els.startGuard.checked = !!state.operatorPrefs?.startGuard;
    els.endGuard.checked = !!state.operatorPrefs?.endGuard;
    els.hotkeysEnabled.checked = (state.operatorPrefs?.hotkeysEnabled !== false);

    if(els.toggleHBFooter) els.toggleHBFooter.checked = (state.viewerPrefs?.showHouseBandFooter !== false);
    if(els.hbFooterFormat) els.hbFooterFormat.value = (state.viewerPrefs?.hbFooterFormat || "categoryFirst");

    // Editor collapse
    if(els.editCard) els.editCard.open = !state.operatorPrefs?.editCollapsed;

    renderSettings();

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
      if(!s.selectedNextId && !s.currentSlotId){
        s.selectedNextId = slot.id;
      }
    });

    els.addName.value = "";
    els.addName.focus();
  }

  function setAsNext(slotId){
    updateState(s => {
      const slot = s.queue.find(x=>x.id===slotId);
      if(!slot) return;

      slot.status = "QUEUED";

      if(s.currentSlotId){
        const curIdx = s.queue.findIndex(x=>x.id===s.currentSlotId);
        const idx = s.queue.findIndex(x=>x.id===slotId);
        if(curIdx >= 0 && idx >= 0){
          const [moved] = s.queue.splice(idx, 1);
          const insertAt = Math.min(curIdx + 1, s.queue.length);
          s.queue.splice(insertAt, 0, moved);
        }
      } else {
        const idx = s.queue.findIndex(x=>x.id===slotId);
        if(idx >= 0){
          const [moved] = s.queue.splice(idx, 1);
          const firstQueuedIdx = s.queue.findIndex(x=>x.status==="QUEUED");
          const insertAt = firstQueuedIdx >= 0 ? firstQueuedIdx : s.queue.length;
          s.queue.splice(insertAt, 0, moved);
        }
        s.selectedNextId = slotId;
      }
    });
  }

  
  function guardedStart(){
    // determine who would start
    const pick = (() => {
      const eligible = (x) => x.status==="QUEUED" && true;
      return state.queue.find(x=>x.id===state.selectedNextId && eligible(x)) || state.queue.find(x=>eligible(x));
    })();

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
      const pick = s.queue.find(x=>x.id===s.selectedNextId && eligible(x)) || s.queue.find(x=>eligible(x));
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

      // pre-select next eligible slot
      const next = s.queue.find(x=>x.id!==pick.id && eligible(x));
      s.selectedNextId = next ? next.id : null;
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
      const cur = s.queue.find(x=>x.id===s.currentSlotId);
      if(cur){ cur.status = "DONE"; cur.completedAt = Date.now(); }
      // House Band is independent; no automatic rotation happens here.
      s.currentSlotId = null;
      s.phase = "SPLASH";
      s.timer.running = false;
      s.timer.startedAt = null;
      s.timer.elapsedMs = 0;
      s.timer.baseDurationMs = null;
      // auto-select next queued
      const next = s.queue.find(x=>x.status==="QUEUED" && true);
      s.selectedNextId = next ? next.id : null;
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
    if(!selectedId) return;
    updateState(s => {
      const slot = s.queue.find(x=>x.id===selectedId);
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
      if(s.selectedNextId === slot.id){
        const next = s.queue.find(x=>x.status==="QUEUED" && true);
        s.selectedNextId = next ? next.id : null;
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

  async function handleImageUpload(file){
    if(!selectedId || !file) return;

    // compress and store
    const { blob, meta } = await OMJN.compressImageFile(file, { maxEdge: 1600, quality: 0.82, mime: "image/webp" });
    if(!blob) return;

    const assetId = OMJN.uid("asset");
    await OMJN.putAsset(assetId, blob);

    updateState(s => {
      s.assetsIndex[assetId] = meta;
      const slot = s.queue.find(x=>x.id===selectedId);
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

  function clearImage(){
    if(!selectedId) return;
    updateState(s => {
      const slot = s.queue.find(x=>x.id===selectedId);
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
  function bindEditor(){
    els.editName.addEventListener("input", () => {
      const v = OMJN.sanitizeText(els.editName.value);
      if(!selectedId) return;
      updateState(s => {
        const slot = s.queue.find(x=>x.id===selectedId);
        if(slot){
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
        }
      }, { recordHistory:false });
    });

    els.editType.addEventListener("change", () => {
      if(!selectedId) return;
      const v = els.editType.value;
      updateState(s => {
        const slot = s.queue.find(x=>x.id===selectedId);
        if(!slot) return;
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

    els.editMinutes.addEventListener("input", () => {
      if(!selectedId) return;
      const raw = els.editMinutes.value;
      const val = raw === "" ? null : Math.max(1, Math.round(Number(raw)));
      updateState(s => {
        const slot = s.queue.find(x=>x.id===selectedId);
        if(slot) slot.minutesOverride = val;
      });
    });

    els.editNotes.addEventListener("input", () => {
      if(!selectedId) return;
      const v = els.editNotes.value;
      updateState(s => {
        const slot = s.queue.find(x=>x.id===selectedId);
        if(slot) slot.notes = v;
      });
    });

    els.editUrl.addEventListener("input", () => {
      if(!selectedId) return;
      const v = OMJN.sanitizeText(els.editUrl.value);
      updateState(s => {
        const slot = s.queue.find(x=>x.id===selectedId);
        if(!slot) return;
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
      if(!selectedId) return;
      const v = els.editLayout.value;
      updateState(s => {
        const slot = s.queue.find(x=>x.id===selectedId);
        if(!slot) return;
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
      });
    });

    els.imgFile.addEventListener("change", async () => {
      const file = els.imgFile.files?.[0] || null;
      els.imgFile.value = "";
      if(file) await handleImageUpload(file);
    });

    els.btnClearImg.addEventListener("click", clearImage);
    els.btnSkip.addEventListener("click", skipSelected);
    els.btnSelectNext.addEventListener("click", () => selectedId && setAsNext(selectedId));

        els.editCustomLabel.addEventListener("input", () => {
      if(!selectedId) return;
      const v = OMJN.sanitizeText(els.editCustomLabel.value);
      updateState(s => {
        const slot = s.queue.find(x=>x.id===selectedId);
        if(slot) slot.customTypeLabel = v;
      });
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

    // House Band
    if(els.btnAddHB){
      els.btnAddHB.addEventListener("click", () => {
        updateState(s => {
          OMJN.ensureHouseBandQueues(s);
          s.houseBand.push({
            id: OMJN.uid("hb"),
            name: "",
            instrumentId: "guitar",
            customInstrument: "",
            skillTags: [],
            active: true,
            cooldownLength: 0,
            cooldownRemaining: 0
          });
        });
      });
    }


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


    
    // Queue drag/drop (bind once)
    els.queue.addEventListener("dragover", (e) => {
      e.preventDefault();
    });
    els.queue.addEventListener("drop", (e) => {
      e.preventDefault();
      const draggedId = e.dataTransfer.getData("text/plain");
      if(!draggedId) return;
      const afterElement = getDragAfterElement(els.queue, e.clientY);
      updateState(s => {
        const idxFrom = s.queue.findIndex(x=>x.id===draggedId);
        if(idxFrom < 0) return;

        const movedCandidate = s.queue[idxFrom];
        if(!movedCandidate) return;
        if(movedCandidate.status === "DONE" || movedCandidate.status === "SKIPPED") return;

        const [moved] = s.queue.splice(idxFrom, 1);

        const liveIdx = s.currentSlotId ? s.queue.findIndex(x=>x.id===s.currentSlotId) : -1;
        const minIdx = (liveIdx >= 0) ? liveIdx + 1 : 0;

        const doneStart = s.queue.findIndex(x => x.status === "DONE" || x.status === "SKIPPED");
        const activeEnd = (doneStart >= 0) ? doneStart : s.queue.length;

        if(!afterElement){
          // drop at end of ACTIVE (before Completed section)
          const insertAt = Math.max(minIdx, activeEnd);
          s.queue.splice(insertAt, 0, moved);
        }else{
          let idxTo = s.queue.findIndex(x=>x.id===afterElement.dataset.id);
          if(idxTo < 0) idxTo = activeEnd;
          // never insert above the live slot and never insert into Completed
          idxTo = Math.max(minIdx, Math.min(activeEnd, idxTo));
          s.queue.splice(idxTo, 0, moved);
        }
      });
    });

bindEditor();

    // Hotkeys (operator)
    function isTypingContext(){
      const a = document.activeElement;
      if(!a) return false;
      const tag = (a.tagName || "").toLowerCase();
      if(tag === "input" || tag === "textarea" || tag === "select") return true;
      if(a.isContentEditable) return true;
      return false;
    }

    function handleHotkeys(e){
      // disable shortcuts while Settings modal is open
      if(els.settingsModal && !els.settingsModal.hidden) return;
      if(state.operatorPrefs?.hotkeysEnabled === false) return;

      const isMac = navigator.platform.toLowerCase().includes("mac");
      const mod = isMac ? e.metaKey : e.ctrlKey;

      // Undo/Redo
      if(mod && e.key.toLowerCase() === "z"){
        e.preventDefault();
        if(e.shiftKey) redo(); else undo();
        return;
      }
      if(mod && e.key.toLowerCase() === "y"){
        e.preventDefault();
        redo();
        return;
      }

      // If typing in fields, allow only special case: Enter on addName
      if(isTypingContext()){
        if(document.activeElement === els.addName && e.key === "Enter"){
          e.preventDefault();
          addPerformer();
        }
        return;
      }

      const k = e.key.toLowerCase();
      // House Band rotation shortcuts (Alt+1..7)
      if(e.altKey && !mod && !e.shiftKey && !isTypingContext()){
        const map = { "1":"drums", "2":"vocals", "3":"keys", "4":"guitar", "5":"bass", "6":"percussion", "7":"other" };
        const cat = map[k];
        if(cat){
          e.preventDefault();
          rotateHouseBandTop(cat);
          return;
        }
      }
      if(k === " "){
        e.preventDefault();
        if(state.phase === "SPLASH") guardedStart();
        else if(state.phase === "LIVE") pause();
        else if(state.phase === "PAUSED") resume();
        return;
      }
      if(k === "n"){
        e.preventDefault();
        guardedEnd();
        return;
      }
      if(k === "j"){
        return;
      }
      if(e.key === "Delete" || e.key === "Backspace"){
        if(selectedId){
          e.preventDefault();
          removeSlot(selectedId);
        }
        return;
      }
      if(k === "arrowup"){
        if(selectedId){
          e.preventDefault();
          moveSlot(selectedId, -1);
        }
        return;
      }
      if(k === "arrowdown"){
        if(selectedId){
          e.preventDefault();
          moveSlot(selectedId, 1);
        }
        return;
      }
    }

    document.addEventListener("keydown", handleHotkeys);



    // live timer UI update loop
    setInterval(() => {
      renderTimerLine();
    }, 250);
  }

  // Subscribe to changes from other tabs (in case operator is duplicated)
  OMJN.subscribe((s) => {
    state = s;
    render();
  });

    loadHistory();
// Boot
  bind();
  render();
})();
