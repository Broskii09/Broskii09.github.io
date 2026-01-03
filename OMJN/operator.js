/* Operator UI + actions */
(() => {
  let state = OMJN.loadState();
  const els = {
    queue: document.getElementById("queue"),
    addName: document.getElementById("addName"),
    addType: document.getElementById("addType"),
    btnAdd: document.getElementById("btnAdd"),
    addCustomWrap: document.getElementById("addCustomWrap"),
    addCustomLabel: document.getElementById("addCustomLabel"),
    addCustomMinutesWrap: document.getElementById("addCustomMinutesWrap"),
    addCustomMinutes: document.getElementById("addCustomMinutes"),
    jamEnabled: document.getElementById("jamEnabled"),

    showTitle: document.getElementById("showTitle"),
    splashPath: document.getElementById("splashPath"),

    btnExport: document.getElementById("btnExport"),
    importFile: document.getElementById("importFile"),
    btnReset: document.getElementById("btnReset"),

    statusLine: document.getElementById("statusLine"),
    kpiCurrent: document.getElementById("kpiCurrent"),
    kpiNext: document.getElementById("kpiNext"),

    btnStart: document.getElementById("btnStart"),
    btnPause: document.getElementById("btnPause"),
    btnResume: document.getElementById("btnResume"),
    btnEnd: document.getElementById("btnEnd"),
    btnMinus1: document.getElementById("btnMinus1"),
    btnMinus5: document.getElementById("btnMinus5"),
    btnPlus1: document.getElementById("btnPlus1"),
    btnPlus5: document.getElementById("btnPlus5"),
    btnResetTime: document.getElementById("btnResetTime"),
    timerLine: document.getElementById("timerLine"),

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

    jamPanel: document.getElementById("jamPanel"),
    jamTitle: document.getElementById("jamTitle"),
    jamAdd: document.getElementById("jamAdd"),
    btnJamAdd: document.getElementById("btnJamAdd"),
    btnJamRotate: document.getElementById("btnJamRotate"),
    jamList: document.getElementById("jamList"),
  };

  let selectedId = null;

  function visibleSlotTypes(){
    return state.slotTypes.filter(t => state.features.jamEnabled ? true : !t.isJamMode);
  }

  function ensureSelectedValid(){
    if(selectedId && !state.queue.some(s=>s.id===selectedId)) selectedId = null;
    if(!selectedId && state.queue.length) selectedId = state.queue.find(s=>s.status==="QUEUED")?.id ?? state.queue[0].id;
  }

  function publish(){
    OMJN.publish(state);
  }

  function setState(next){
    state = next;
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

  function updateState(mutator){
    const s = cloneState(state);
    mutator(s);
    setState(s);
  }

  function fillTypeSelect(selectEl, includeJam){
    selectEl.innerHTML = "";
    for(const t of (includeJam ? state.slotTypes : visibleSlotTypes())){
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
    div.className = "queueItem";
    div.draggable = slot.status === "QUEUED";
    div.dataset.id = slot.id;

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

    if(slot.id === state.currentSlotId){
      const live = document.createElement("span");
      live.className = "badge gold";
      live.textContent = "LIVE";
      top.appendChild(live);
    }
    if(slot.id === state.selectedNextId && !state.currentSlotId){
      const nx = document.createElement("span");
      nx.className = "badge gold";
      nx.textContent = "NEXT";
      top.appendChild(nx);
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
      selectedId = slot.id;
      render();
    });

    const btnUp = document.createElement("button");
    btnUp.className = "btn tiny";
    btnUp.textContent = "↑";
    btnUp.title = "Move up";
    btnUp.disabled = slot.status !== "QUEUED";
    btnUp.addEventListener("click", (e) => {
      e.stopPropagation();
      moveSlot(slot.id, -1);
    });

    const btnDn = document.createElement("button");
    btnDn.className = "btn tiny";
    btnDn.textContent = "↓";
    btnDn.title = "Move down";
    btnDn.disabled = slot.status !== "QUEUED";
    btnDn.addEventListener("click", (e) => {
      e.stopPropagation();
      moveSlot(slot.id, +1);
    });

    actions.appendChild(btnSel);
    actions.appendChild(btnUp);
    actions.appendChild(btnDn);

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
      selectedId = slot.id;
      render();
    });

    return div;
  }

  function renderQueue(){
    els.queue.innerHTML = "";
    const list = state.queue;
    if(!list.length){
      const empty = document.createElement("div");
      empty.className = "small";
      empty.textContent = "No signups yet. Add a performer above.";
      els.queue.appendChild(empty);
      return;
    }

    for(const slot of list){
      if(slot.slotTypeId === "jam" && !state.features.jamEnabled) continue;
      els.queue.appendChild(queueRow(slot));
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
      const idx2 = Math.max(0, Math.min(s.queue.length-1, idx + delta));
      if(idx2 === idx) return;
      const [it] = s.queue.splice(idx, 1);
      s.queue.splice(idx2, 0, it);
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
        const next = s.queue.find(x=>x.status==="QUEUED" && (s.features?.jamEnabled || OMJN.getSlotType(s, x.slotTypeId).isJamMode === false));
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

function renderKPIs(){
    const current = OMJN.computeCurrent(state);
    const [next] = OMJN.computeNextTwo(state);
    els.statusLine.textContent = state.phase;
    els.kpiCurrent.textContent = current ? current.displayName : "—";
    els.kpiNext.textContent = next ? next.displayName : "—";
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
    const showJam = state.features.jamEnabled && type.isJamMode;
    els.jamPanel.style.display = showJam ? "block" : "none";

    if(showJam){
      OMJN.ensureJamShape(slot);
      els.jamTitle.value = slot.jam.title || "Jam";
      renderJamList(slot);
    }
  }

  function renderJamList(jamSlot){
    const jam = jamSlot.jam;
    els.jamList.innerHTML = "";

    const activeId = jam.activeJamEntryId;
    const list = jam.subList || [];

    if(!list.length){
      const empty = document.createElement("div");
      empty.className = "small";
      empty.textContent = "No jam participants yet.";
      els.jamList.appendChild(empty);
      return;
    }

    for(const entry of list){
      const div = document.createElement("div");
      div.className = "queueItem";
      div.dataset.id = entry.id;

      const handle = document.createElement("div");
      handle.className = "dragHandle";
      handle.textContent = "♪";

      const main = document.createElement("div");
      main.className = "qMain";
      const top = document.createElement("div");
      top.className = "qTop";
      const nm = document.createElement("div");
      nm.className = "qName";
      nm.textContent = entry.name;

      const badge = document.createElement("span");
      badge.className = "badge";
      badge.textContent = entry.status;

      if(entry.id === activeId){
        const a = document.createElement("span");
        a.className = "badge gold";
        a.textContent = "SPOTLIGHT";
        top.appendChild(a);
      }
      top.appendChild(nm);
      top.appendChild(badge);

      main.appendChild(top);

      const actions = document.createElement("div");
      actions.className = "qActions";

      const btnSpot = document.createElement("button");
      btnSpot.className = "btn tiny";
      btnSpot.textContent = "Spot";
      btnSpot.addEventListener("click", () => {
        updateState(s => {
          const sl = s.queue.find(x=>x.id===jamSlot.id);
          if(!sl?.jam) return;
          sl.jam.activeJamEntryId = entry.id;
        });
      });

      const btnDone = document.createElement("button");
      btnDone.className = "btn tiny good";
      btnDone.textContent = "Done";
      btnDone.addEventListener("click", () => {
        updateState(s => {
          const sl = s.queue.find(x=>x.id===jamSlot.id);
          const e = sl?.jam?.subList?.find(x=>x.id===entry.id);
          if(e) e.status = "DONE";
          if(sl?.jam?.activeJamEntryId === entry.id) sl.jam.activeJamEntryId = null;
        });
      });

      const btnSkip = document.createElement("button");
      btnSkip.className = "btn tiny danger";
      btnSkip.textContent = "Skip";
      btnSkip.addEventListener("click", () => {
        updateState(s => {
          const sl = s.queue.find(x=>x.id===jamSlot.id);
          const e = sl?.jam?.subList?.find(x=>x.id===entry.id);
          if(e) e.status = "SKIPPED";
          if(sl?.jam?.activeJamEntryId === entry.id) sl.jam.activeJamEntryId = null;
        });
      });

      actions.appendChild(btnSpot);
      actions.appendChild(btnDone);
      actions.appendChild(btnSkip);

      div.appendChild(handle);
      div.appendChild(main);
      div.appendChild(actions);

      els.jamList.appendChild(div);
    }
  }

  function render(){
    // sync header inputs
    els.showTitle.value = state.showTitle || "";
    els.splashPath.value = state.splash?.backgroundAssetPath || "./assets/splash.svg";
    els.jamEnabled.checked = !!state.features.jamEnabled;

    fillTypeSelect(els.addType, false);
    fillTypeSelect(els.editType, true);
    toggleCustomAddFields();
    els.addType.addEventListener("change", toggleCustomAddFields);

    renderQueue();
    renderKPIs();
    renderTimerLine();
    renderEditor();
  }

  // ---- Actions ----
  function addPerformer(){
    const name = OMJN.sanitizeText(els.addName.value);
    if(!name) return;

    updateState(s => {
      const slotTypeId = els.addType.value || "standard";
      const isCustom = slotTypeId === "custom";
      const customTypeLabel = isCustom ? OMJN.sanitizeText(els.addCustomLabel.value) : "";
      const customMinutesRaw = isCustom ? els.addCustomMinutes.value : "";
      const customMinutes = (isCustom && customMinutesRaw !== "") ? Math.max(1, Math.round(Number(customMinutesRaw))) : null;
      const slot = {
        id: OMJN.uid("slot"),
        displayName: name,
        slotTypeId,
        minutesOverride: customMinutes,
        customTypeLabel,
        status: "QUEUED",
        notes: "",
        media: { donationUrl: null, imageAssetId: null, mediaLayout: "NONE" }
      };
      if(slotTypeId === "jam") {
        OMJN.ensureJamShape(slot);
        slot.jam.title = "Jam";
      }
      s.queue.push(slot);
      if(!s.selectedNextId && !s.currentSlotId){
        const t = OMJN.getSlotType(s, slot.slotTypeId);
        if(!(t.isJamMode && !s.features?.jamEnabled)) s.selectedNextId = slot.id;
      }
    });

    els.addName.value = "";
    if(els.addCustomLabel) els.addCustomLabel.value = "";
    if(els.addCustomMinutes) els.addCustomMinutes.value = "";
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

  function start(){
    updateState(s => {
      if(s.phase === "LIVE") return;
      // choose selectedNextId if valid, else first queued
      const eligible = (x) => x.status==="QUEUED" && (s.features?.jamEnabled || OMJN.getSlotType(s, x.slotTypeId).isJamMode === false);
      const pick = s.queue.find(x=>x.id===s.selectedNextId && eligible(x)) || s.queue.find(x=>eligible(x));
      if(!pick) return;
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
      const cur = s.queue.find(x=>x.id===s.currentSlotId);
      if(cur) cur.status = "DONE";
      s.currentSlotId = null;
      s.phase = "SPLASH";
      s.timer.running = false;
      s.timer.startedAt = null;
      s.timer.elapsedMs = 0;
      s.timer.baseDurationMs = null;
      // auto-select next queued
      const next = s.queue.find(x=>x.status==="QUEUED" && (s.features?.jamEnabled || OMJN.getSlotType(s, x.slotTypeId).isJamMode === false));
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
      const effective = Math.round((s.timer.baseDurationMs / 60000));
      cur.minutesOverride = effective;
    });
  }

  function skipSelected(){
    if(!selectedId) return;
    updateState(s => {
      const slot = s.queue.find(x=>x.id===selectedId);
      if(!slot) return;
      slot.status = "SKIPPED";
      if(s.currentSlotId === slot.id){
        s.currentSlotId = null;
        s.phase = "SPLASH";
        s.timer.running = false;
        s.timer.startedAt = null;
        s.timer.elapsedMs = 0;
        s.timer.baseDurationMs = null;
      }
      if(s.selectedNextId === slot.id){
        const next = s.queue.find(x=>x.status==="QUEUED" && (s.features?.jamEnabled || OMJN.getSlotType(s, x.slotTypeId).isJamMode === false));
        s.selectedNextId = next ? next.id : null;
      }
    });
  }

  function resetShow(){
    const ok = confirm("Start a new show? This clears the queue (images stay in local storage unless you clear browser data).");
    if(!ok) return;
    const fresh = OMJN.defaultState();
    // preserve splash path if user changed it
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
    });
  }

  function clearImage(){
    if(!selectedId) return;
    updateState(s => {
      const slot = s.queue.find(x=>x.id===selectedId);
      if(!slot?.media?.imageAssetId) return;
      const assetId = slot.media.imageAssetId;
      slot.media.imageAssetId = null;
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
    a.click();
    URL.revokeObjectURL(url);
  }

  function importJSON(file){
    const reader = new FileReader();
    reader.onload = () => {
      try{
        const imported = JSON.parse(reader.result);
        if(!imported || typeof imported !== "object") throw new Error("Invalid JSON");
        // light validation
        imported.version = imported.version ?? 1;
        imported.features = imported.features ?? { jamEnabled:false };
        imported.splash = imported.splash ?? { backgroundAssetPath:"./assets/splash.svg", showNextTwo:true };
        imported.viewerPrefs = imported.viewerPrefs ?? { warnAtSec:120, finalAtSec:30, showOvertime:true, showProgressBar:true };
        imported.assetsIndex = imported.assetsIndex ?? {};
        setState(imported);
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
        if(slot) slot.displayName = v;
      });
    });

    els.editType.addEventListener("change", () => {
      if(!selectedId) return;
      const v = els.editType.value;
      updateState(s => {
        const slot = s.queue.find(x=>x.id===selectedId);
        if(!slot) return;
        slot.slotTypeId = v;
        if(v === "jam") OMJN.ensureJamShape(slot);
        if(v !== "custom") slot.customTypeLabel = slot.customTypeLabel || "";
      });
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
      });
    });

    els.editLayout.addEventListener("change", () => {
      if(!selectedId) return;
      const v = els.editLayout.value;
      updateState(s => {
        const slot = s.queue.find(x=>x.id===selectedId);
        if(!slot) return;
        if(!slot.media) slot.media = { donationUrl:null, imageAssetId:null, mediaLayout:"NONE" };
        slot.media.mediaLayout = v;
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

    // Jam bindings
    els.jamTitle.addEventListener("input", () => {
      if(!selectedId) return;
      const v = OMJN.sanitizeText(els.jamTitle.value);
      updateState(s => {
        const slot = s.queue.find(x=>x.id===selectedId);
        if(!slot) return;
        OMJN.ensureJamShape(slot);
        slot.jam.title = v || "Jam";
      });
    });

    const jamAddNow = () => {
      if(!selectedId) return;
      const name = OMJN.sanitizeText(els.jamAdd.value);
      if(!name) return;
      updateState(s => {
        const slot = s.queue.find(x=>x.id===selectedId);
        if(!slot) return;
        OMJN.ensureJamShape(slot);
        slot.jam.subList.push({ id: OMJN.uid("jam"), name, status:"IN_POOL" });
        if(!slot.jam.activeJamEntryId) slot.jam.activeJamEntryId = slot.jam.subList[0].id;
      });
      els.jamAdd.value = "";
      els.jamAdd.focus();
    };
    els.btnJamAdd.addEventListener("click", jamAddNow);
    els.jamAdd.addEventListener("keydown", (e) => {
      if(e.key === "Enter"){ e.preventDefault(); jamAddNow(); }
    });

    els.btnJamRotate.addEventListener("click", () => {
      if(!selectedId) return;
      updateState(s => {
        const slot = s.queue.find(x=>x.id===selectedId);
        if(!slot?.jam?.subList?.length) return;
        const list = slot.jam.subList.filter(x=>x.status==="IN_POOL");
        if(!list.length) return;
        const idx = list.findIndex(x=>x.id===slot.jam.activeJamEntryId);
        const next = list[(idx+1) % list.length];
        slot.jam.activeJamEntryId = next.id;
      });
    });
  }

  // ---- Wire up ----
  function toggleCustomAddFields(){
    const isCustom = els.addType.value === "custom";
    els.addCustomWrap.style.display = isCustom ? "flex" : "none";
    els.addCustomMinutesWrap.style.display = isCustom ? "block" : "none";
  }

  function bind(){
    // initial select options
    fillTypeSelect(els.addType, false);
    fillTypeSelect(els.editType, true);
    toggleCustomAddFields();

    els.addName.addEventListener("keydown", (e) => {
      if(e.key === "Enter"){ e.preventDefault(); addPerformer(); }
    });
    els.btnAdd.addEventListener("click", addPerformer);

    els.jamEnabled.addEventListener("change", () => {
      updateState(s => {
        s.features.jamEnabled = !!els.jamEnabled.checked;
        // if jam disabled and selected slot is jam, nudge selection
        if(!s.features.jamEnabled){
          if(s.currentSlotId){
            const cur = s.queue.find(x=>x.id===s.currentSlotId);
            if(cur?.slotTypeId==="jam") { /* allow existing; just hide adding */ }
          }
          if(s.selectedNextId){
            const nx = s.queue.find(x=>x.id===s.selectedNextId);
            if(nx?.slotTypeId==="jam") s.selectedNextId = s.queue.find(x=>x.status==="QUEUED" && x.slotTypeId!=="jam")?.id ?? null;
          }
        }
      });
    });

    els.showTitle.addEventListener("input", () => {
      const v = OMJN.sanitizeText(els.showTitle.value);
      updateState(s => { s.showTitle = v || "Open Mic & Jam Night"; });
    });

    els.splashPath.addEventListener("input", () => {
      let v = OMJN.sanitizeText(els.splashPath.value);
      if(v && !/^https?:\/\//i.test(v) && v.startsWith("/")) v = "." + v; // /assets/... -> ./assets/...
      updateState(s => {
        s.splash.backgroundAssetPath = v || "./assets/splash.svg";
        // If operator manually sets a path, prefer it over uploaded asset
        if(s.splash) s.splash.backgroundAssetId = null;
      });
    });

els.btnStart.addEventListener("click", start);
    els.btnPause.addEventListener("click", pause);
    els.btnResume.addEventListener("click", resume);
    els.btnEnd.addEventListener("click", endToSplash);
    els.btnMinus1.addEventListener("click", () => addMinutes(-1));
    els.btnMinus5.addEventListener("click", () => addMinutes(-5));
    els.btnPlus1.addEventListener("click", () => addMinutes(1));
    els.btnPlus5.addEventListener("click", () => addMinutes(5));
    els.btnResetTime.addEventListener("click", resetTimer);

    els.btnReset.addEventListener("click", resetShow);
    els.btnExport.addEventListener("click", exportJSON);
    els.importFile.addEventListener("change", () => {
      const file = els.importFile.files?.[0] || null;
      els.importFile.value = "";
      if(file) importJSON(file);
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
        const [moved] = s.queue.splice(idxFrom, 1);
        if(!afterElement){
          s.queue.push(moved);
        }else{
          const idxTo = s.queue.findIndex(x=>x.id===afterElement.dataset.id);
          s.queue.splice(Math.max(idxTo,0), 0, moved);
        }
      });
    });
bindEditor();

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

  // Boot
  bind();
  render();
})();
