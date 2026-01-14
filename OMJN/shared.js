/**
 * OMJN - Shared state + persistence + realtime channel
 * Static site friendly: BroadcastChannel for live sync, localStorage for state, IndexedDB for images.
 */
const OMJN = (() => {
  const CHANNEL_NAME = "omjn_channel_v1";
  const STORAGE_KEY = "omjn.showState.v1";
  const ASSET_DB = { name: "omjn_assets_v1", store: "assets" };

  // ---- House Band ----
  // Default instrument list (intentionally excludes fiddle/violin and horns).
  // UI should offer a "Custom" option that uses member.customInstrument.
  const HOUSE_BAND_INSTRUMENTS = [
    { id:"guitar",      label:"Guitar" },
    { id:"acoustic",    label:"Acoustic Guitar" },
    { id:"electric",    label:"Electric Guitar" },
    { id:"bass",        label:"Bass" },
    { id:"drums",       label:"Drums" },
    { id:"keys",        label:"Keys" },
    { id:"piano",       label:"Piano" },
    { id:"vocals",      label:"Vocals" },
    { id:"percussion",  label:"Percussion" },
    { id:"harmonica",   label:"Harmonica" },
    { id:"mandolin",    label:"Mandolin" },
    { id:"banjo",       label:"Banjo" },
    { id:"ukulele",     label:"Ukulele" },
    { id:"other",       label:"Other" },
    { id:"custom",      label:"Custom" },
  ];

  // Fixed/predetermined categories for House Band rotation + viewer display.
  // Each category is its own queue; "Rotate" moves a member to the end of *their* category.
  const HOUSE_BAND_CATEGORIES = [
    { key:"drums",      label:"Drums" },
    { key:"vocals",     label:"Vocals" },
    { key:"keys",       label:"Keys" },
    { key:"guitar",     label:"Guitar" },
    { key:"bass",       label:"Bass" },
    { key:"percussion", label:"Percussion" },
    { key:"other",      label:"Other" },
  ];

  const now = () => Date.now();

  function uid(prefix="id"){
    return `${prefix}_${Math.random().toString(16).slice(2)}_${Date.now().toString(16)}`;
  }

  function defaultState(){
    return {
      version: 1,
      showTitle: "Open Mic & Jam Night",
      phase: "SPLASH", // SPLASH | LIVE | PAUSED
operatorPrefs: { startGuard:true, endGuard:true, hotkeysEnabled:true, editCollapsed:false },
      profiles: {},
        splash: { backgroundAssetPath: "./assets/splash_BG.jpg", showNextTwo: true },
      viewerPrefs: { warnAtSec: 120, finalAtSec: 30, showOvertime: true, showProgressBar: true , showHouseBandFooter:true, hbFooterFormat:"categoryFirst" },
      settings: {
        theme: {
          vars: { bg:"#0b172e", panel:"#0f2140", panel2:"#132a52", text:"#e7eefb", muted:"#a5b4d6", accent:"#00c2ff" },
          viewerCard: { hex:"#000000", opacity:0.90 }
        },
        viewerCues: {
          warnHex:"#00c2ff", warnAlpha:0.12, warnDurSec:3.2,
          finalHex:"#2dd4bf", finalAlpha:0.18, finalDurSec:1.4,
          overtimeHex:"#ff0000", overtimeAlpha:0.85
        }
      },
      slotTypes: [
        { id:"musician", label:"Musician", defaultMinutes:15, isJamMode:false, color:"#00c2ff", enabled:true },
          { id: "comedian", label: "Comedian", defaultMinutes: 10, isJamMode: false, color: "#2dd4bf", enabled: true },
          { id: "poetry", label: "Poetry", defaultMinutes: 10, isJamMode: false, color: "#a78bfa", enabled: true },
        { id:"custom", label:"Custom", defaultMinutes:15, isJamMode:false, color:"#a3a3a3", enabled:true },
],
      // House Band: independent per-instrument queues.
      // Viewer footer shows the FIRST active person from each category.
      houseBandQueues: {
        drums: [],
        vocals: [],
        keys: [],
        guitar: [],
        bass: [],
        percussion: [],
        other: [],
      },
      queue: [],
      currentSlotId: null,
      selectedNextId: null,
      timer: { running:false, startedAt:null, pausedAt:null, elapsedMs:0, baseDurationMs:null },
      assetsIndex: {} // assetId -> { mime, w, h, bytes, createdAt }
    };
  }

  function loadState(){
    try{
      const raw = localStorage.getItem(STORAGE_KEY);
      const d = defaultState();
      if(!raw) return d;

      const s = JSON.parse(raw);

      if(!s.version) s.version = 1;
if(!s.operatorPrefs) s.operatorPrefs = { startGuard:true, endGuard:true, hotkeysEnabled:true, editCollapsed:false };
      if(s.operatorPrefs.editCollapsed === undefined) s.operatorPrefs.editCollapsed = false;

      if(!s.profiles) s.profiles = {};
      if (!s.splash) s.splash = { backgroundAssetPath: "./assets/splash_BG.jpg", showNextTwo: true };
      if(!s.viewerPrefs) s.viewerPrefs = d.viewerPrefs;
      // Timer migration: normalize shape
      if(!s.timer) s.timer = { running:false, startedAt:null, pausedAt:null, elapsedMs:0, baseDurationMs:null };
      if(typeof s.timer.elapsedMs !== "number") s.timer.elapsedMs = 0;
      if(s.timer.startedAt === 0) s.timer.startedAt = null;
      if(s.timer.pausedAt === 0) s.timer.pausedAt = null;
      if(s.timer.baseDurationMs === 0) s.timer.baseDurationMs = null;

      if(!s.settings) s.settings = d.settings;

      if(!s.assetsIndex) s.assetsIndex = {};
      if(!Array.isArray(s.queue)) s.queue = [];
      if(!s.timer) s.timer = { running:false, startedAt:0, pausedAt:0, accumulatedPauseMs:0, baseDurationMs:0 };
      if(!s.phase) s.phase = "SPLASH";
      if(s.currentSlotId === undefined) s.currentSlotId = null;
      if(s.selectedNextId === undefined) s.selectedNextId = null;
      if(!s.history) s.history = { undo:[], redo:[] };

      // House Band migration (Step 4)
      // New schema: houseBandQueues (fixed categories, each with its own queue).
      // Migrate from any legacy schema by collecting known lists and distributing into categories.
      if(!s.houseBandQueues || typeof s.houseBandQueues !== "object"){
        s.houseBandQueues = {
          drums: [],
          vocals: [],
          keys: [],
          guitar: [],
          bass: [],
          percussion: [],
          other: [],
        };
      }
      for(const cat of HOUSE_BAND_CATEGORIES){
        if(!Array.isArray(s.houseBandQueues[cat.key])) s.houseBandQueues[cat.key] = [];
      }

      // Gather candidates from older versions
      const legacyLists = [];
      if(Array.isArray(s.houseBand)) legacyLists.push(s.houseBand);
      if(Array.isArray(s.houseBandQueue)) legacyLists.push(s.houseBandQueue);
      if(Array.isArray(s.houseBandCooldown)) legacyLists.push(s.houseBandCooldown);
      if(s.houseBandCurrent && typeof s.houseBandCurrent === "object") legacyLists.push([s.houseBandCurrent]);

      const seen = new Set();
      for(const list of legacyLists){
        for(const rawMember of list){
          if(!rawMember || typeof rawMember !== "object") continue;
          normalizeHouseBandMember(rawMember);
          if(!rawMember.id) rawMember.id = uid("hb");
          if(seen.has(rawMember.id)) continue;
          seen.add(rawMember.id);
          const catKey = houseBandCategoryKeyForMember(rawMember);
          if(!Array.isArray(s.houseBandQueues[catKey])) s.houseBandQueues[catKey] = [];
          s.houseBandQueues[catKey].push(rawMember);
        }
      }

      // Normalize members in the new schema
      for(const cat of HOUSE_BAND_CATEGORIES){
        for(const m of s.houseBandQueues[cat.key]) normalizeHouseBandMember(m);
      }

      // Slot types + migration from older templates
      if(!Array.isArray(s.slotTypes) || !s.slotTypes.length){
        s.slotTypes = d.slotTypes;
      }

      const isOldDefaults =
        Array.isArray(s.slotTypes) &&
        s.slotTypes.length >= 5 &&
        s.slotTypes.some(t=>t.id==="standard" && t.label==="Standard") &&
        s.slotTypes.some(t=>t.id==="feature" && t.label==="Feature");

      if(isOldDefaults){
        s.slotTypes = d.slotTypes;
        const map = { standard:"musician", band:"musician", quick:"musician", feature:"comedian", custom:"custom", jam:"musician" };
        for(const slot of s.queue){
          if(map[slot.slotTypeId]) slot.slotTypeId = map[slot.slotTypeId];
          if(!s.slotTypes.find(t=>t.id===slot.slotTypeId)){
            slot.slotTypeId = "musician";
          }
        }
      }

      // Ensure core types exist (custom included)
      for(const core of d.slotTypes){
        if(!s.slotTypes.some(t=>t.id===core.id)){
          s.slotTypes.push({ ...core });
        }
      }

      // Drop legacy Jam type if present
      s.slotTypes = s.slotTypes.filter(t => t.id !== "jam");

      // Ensure slotType fields exist
      for(const t of s.slotTypes){
        if(t.enabled === undefined) t.enabled = true;
        if(!t.color) t.color = "#00c2ff";
        if(t.defaultMinutes === undefined) t.defaultMinutes = 15;
        if(t.isJamMode === undefined) t.isJamMode = false;
        if(!t.label) t.label = t.id;
      }

      // Normalize queue slots and fix unknown type ids
      for(const slot of s.queue){
        normalizeSlot(slot);
        if(slot.slotTypeId === "jam"){
          slot.slotTypeId = "musician";
          if(slot.jam) delete slot.jam;
        }
        if(!s.slotTypes.find(t=>t.id===slot.slotTypeId)){
          slot.slotTypeId = "musician";
        }
      }

      if(s.selectedNextId === null && !s.currentSlotId){
        s.selectedNextId = (s.queue.find(x=>x.status==="QUEUED")?.id ?? null);
      }

      return s;
    }catch(e){
      console.warn("Failed to load state, resetting:", e);
      return defaultState();
    }
  }


  function saveState(state){
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }

  function getSlotType(state, slotTypeId){
    return state.slotTypes.find(t=>t.id===slotTypeId) || state.slotTypes[0];
  }

  function effectiveMinutes(state, slot){
    const t = getSlotType(state, slot.slotTypeId);
    return Number.isFinite(slot.minutesOverride) && slot.minutesOverride !== null ? Number(slot.minutesOverride) : Number(t.defaultMinutes);
  }

  
  function displaySlotTypeLabel(state, slot){
    const t = getSlotType(state, slot.slotTypeId);
    if(slot.slotTypeId === "custom"){
      const custom = sanitizeText(slot.customTypeLabel || "");
      return custom || t.label;
    }
    return t.label;
  }

  function normalizeSlot(slot){
    if(!slot.media) slot.media = { donationUrl: null, imageAssetId: null, mediaLayout: "NONE" };
    if(!("customTypeLabel" in slot)) slot.customTypeLabel = "";
    return slot;
  }

  function houseBandInstrumentOptions(){
    // Return a copy to prevent accidental mutation.
    return HOUSE_BAND_INSTRUMENTS.map(x => ({ ...x }));
  }

  function normalizeHouseBandMember(m){
    if(!m || typeof m !== "object") return m;

    if(!m.id) m.id = uid("hb");
    m.name = sanitizeText(m.name || "");

    // instrumentId: one of HOUSE_BAND_INSTRUMENTS ids; "custom" enables customInstrument.
    if(!m.instrumentId) m.instrumentId = "guitar";
    const valid = HOUSE_BAND_INSTRUMENTS.some(x => x.id === m.instrumentId);
    if(!valid) m.instrumentId = "custom";

    if(m.instrumentId !== "custom") m.customInstrument = "";
    if(m.customInstrument === undefined) m.customInstrument = "";
    m.customInstrument = sanitizeText(m.customInstrument);

    // Optional skill tags (array of short strings)
    if(!Array.isArray(m.skillTags)) m.skillTags = [];
    m.skillTags = m.skillTags
      .map(x => sanitizeText(x))
      .filter(Boolean)
      .slice(0, 10);

    if(m.active === undefined) m.active = true;

    // Cooldown: based on how many *performers* must pass in the queue.
    if(!Number.isFinite(m.cooldownLength)) m.cooldownLength = 0;
    if(!Number.isFinite(m.cooldownRemaining)) m.cooldownRemaining = 0;
    m.cooldownLength = Math.max(0, Math.floor(Number(m.cooldownLength)));
    m.cooldownRemaining = Math.max(0, Math.floor(Number(m.cooldownRemaining)));

    return m;
  }

  function houseBandMemberLabel(m){
    if(!m) return "";
    const name = sanitizeText(m.name || "");
    const inst = (m.instrumentId === "custom")
      ? sanitizeText(m.customInstrument || "")
      : (HOUSE_BAND_INSTRUMENTS.find(x => x.id === m.instrumentId)?.label || "");
    if(!name && !inst) return "";
    if(!inst) return name;
    if(!name) return inst;
    return `${name} (${inst})`;
  }

  
  function houseBandCategories(){
    return HOUSE_BAND_CATEGORIES.map(x => ({ ...x }));
  }

  function houseBandCategoryKeyForInstrumentId(instrumentId){
    const id = String(instrumentId || "").trim();
    if(id === "drums") return "drums";
    if(id === "vocals") return "vocals";
    if(id === "keys" || id === "piano") return "keys";
    if(id === "bass") return "bass";
    if(id === "percussion") return "percussion";
    if(id === "guitar" || id === "acoustic" || id === "electric") return "guitar";
    return "other";
  }

  function houseBandCategoryKeyForMember(m){
    return houseBandCategoryKeyForInstrumentId(m?.instrumentId);
  }

  function ensureHouseBandQueues(state){
    if(!state || typeof state !== "object") return;
    if(!state.houseBandQueues || typeof state.houseBandQueues !== "object") state.houseBandQueues = {};
    for(const cat of HOUSE_BAND_CATEGORIES){
      if(!Array.isArray(state.houseBandQueues[cat.key])) state.houseBandQueues[cat.key] = [];
      for(const m of state.houseBandQueues[cat.key]) normalizeHouseBandMember(m);
    }
  }

  function addHouseBandMember(state, member){
    ensureHouseBandQueues(state);
    normalizeHouseBandMember(member);
    const catKey = houseBandCategoryKeyForMember(member);
    state.houseBandQueues[catKey].push(member);
  }

  function removeHouseBandMember(state, memberId){
    ensureHouseBandQueues(state);
    for(const cat of HOUSE_BAND_CATEGORIES){
      state.houseBandQueues[cat.key] = state.houseBandQueues[cat.key].filter(m => m.id !== memberId);
    }
  }

  // "Cooldown" in the new model: move the member to the end of their category queue.
  function rotateHouseBandMemberToEnd(state, memberId){
    ensureHouseBandQueues(state);
    for(const cat of HOUSE_BAND_CATEGORIES){
      const list = state.houseBandQueues[cat.key];
      const idx = list.findIndex(m => m.id === memberId);
      if(idx < 0) continue;
      const [m] = list.splice(idx, 1);
      list.push(m);
      return;
    }
  }

  // Move the FIRST active member in a category to the end (quick "Rotate Top").
  function rotateHouseBandTopToEnd(state, categoryKey){
    ensureHouseBandQueues(state);
    const key = String(categoryKey || "");
    const list = state.houseBandQueues?.[key];
    if(!Array.isArray(list) || !list.length) return;
    const idx = list.findIndex(m => {
      normalizeHouseBandMember(m);
      return m.active !== false;
    });
    if(idx < 0) return;
    const [m] = list.splice(idx, 1);
    list.push(m);
  }

  function reorderHouseBandCategory(state, categoryKey, orderedIds){
    ensureHouseBandQueues(state);
    const key = String(categoryKey || "").trim();
    if(!HOUSE_BAND_CATEGORIES.some(c => c.key === key)) return;
    const list = state.houseBandQueues[key] || [];
    const map = new Map(list.map(m => [m.id, m]));
    const next = [];
    for(const id of (orderedIds || [])){
      if(map.has(id)) next.push(map.get(id));
    }
    // Append any members that weren't included (safety)
    for(const m of list){
      if(!next.includes(m)) next.push(m);
    }
    state.houseBandQueues[key] = next;
  }

  // Viewer helper: first ACTIVE member from each category, in a consistent order.
  function getHouseBandTopPerCategory(state){
    ensureHouseBandQueues(state);
    const out = [];
    for(const cat of HOUSE_BAND_CATEGORIES){
      const list = state.houseBandQueues[cat.key] || [];
      const top = list.find(m => {
        normalizeHouseBandMember(m);
        return m.active !== false;
      });
      if(top) out.push({ categoryKey: cat.key, categoryLabel: cat.label, member: { ...top } });
    }
    return out;
  }
  function computeNextTwo(state){
    const eligible = (s) => s && s.status === "QUEUED" && s.id !== state.currentSlotId;
    const queued = state.queue.filter(eligible);

    const next1 = queued.find(x => x.id === state.selectedNextId) || queued[0] || null;
    const next2 = next1 ? (queued.find(x => x.id !== next1.id) || null) : null;

    return [next1, next2];
  }

  function computeCurrent(state){
    return state.queue.find(s=>s.id===state.currentSlotId) || null;
  }

  function computeTimer(state){
    const current = computeCurrent(state);
    if(!current) return { elapsedMs:0, durationMs:0, remainingMs:0, overtimeMs:0, running:false };

    const durationMs = (state.timer.baseDurationMs ?? (effectiveMinutes(state, current) * 60 * 1000));
    let elapsedMs = state.timer.elapsedMs || 0;

    if(state.timer.running && state.timer.startedAt){
      elapsedMs += (now() - state.timer.startedAt);
    }
    if(elapsedMs < 0) elapsedMs = 0;

    const remainingMs = Math.max(durationMs - elapsedMs, 0);
    const overtimeMs  = Math.max(elapsedMs - durationMs, 0);
    return { elapsedMs, durationMs, remainingMs, overtimeMs, running: !!state.timer.running };
  }

  // ---- IndexedDB helpers for assets (compressed images) ----
  function openAssetDB(){
    return new Promise((resolve, reject) => {
      const req = indexedDB.open(ASSET_DB.name, 1);
      req.onupgradeneeded = () => {
        const db = req.result;
        if(!db.objectStoreNames.contains(ASSET_DB.store)){
          db.createObjectStore(ASSET_DB.store);
        }
      };
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error);
    });
  }

  async function putAsset(assetId, blob){
    const db = await openAssetDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(ASSET_DB.store, "readwrite");
      tx.objectStore(ASSET_DB.store).put(blob, assetId);
      tx.oncomplete = () => resolve(true);
      tx.onerror = () => reject(tx.error);
    });
  }

  async function getAsset(assetId){
    const db = await openAssetDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(ASSET_DB.store, "readonly");
      const req = tx.objectStore(ASSET_DB.store).get(assetId);
      req.onsuccess = () => resolve(req.result || null);
      req.onerror = () => reject(req.error);
    });
  }

  async function deleteAsset(assetId){
    const db = await openAssetDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(ASSET_DB.store, "readwrite");
      tx.objectStore(ASSET_DB.store).delete(assetId);
      tx.oncomplete = () => resolve(true);
      tx.onerror = () => reject(tx.error);
    });
  }

  // ---- Image compression (client-side) ----
  async function compressImageFile(file, opts={}){
    // opts: maxEdge, quality, mime
    const maxEdge = opts.maxEdge ?? 1600;
    const quality = opts.quality ?? 0.82;
    const outMime = opts.mime ?? "image/webp";

    const bmp = await createImageBitmap(file);
    const w0 = bmp.width, h0 = bmp.height;

    const scale = Math.min(1, maxEdge / Math.max(w0, h0));
    const w = Math.max(1, Math.round(w0 * scale));
    const h = Math.max(1, Math.round(h0 * scale));

    const canvas = document.createElement("canvas");
    canvas.width = w; canvas.height = h;
    const ctx = canvas.getContext("2d", { alpha: true });

    ctx.drawImage(bmp, 0, 0, w, h);

    const blob = await new Promise(resolve => canvas.toBlob(resolve, outMime, quality));
    const bytes = blob ? blob.size : 0;

    return { blob, meta: { mime: blob?.type || outMime, w, h, bytes, createdAt: now() } };
  }

  // ---- BroadcastChannel pub/sub ----
  const bc = ("BroadcastChannel" in window) ? new BroadcastChannel(CHANNEL_NAME) : null;

  function publish(state){
    try{
      saveState(state);
      if(bc) bc.postMessage({ type:"STATE", payload: state });
      else {
        // fallback: storage event
        localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
      }
    }catch(e){
      console.error("Publish failed:", e);
    }
  }

  function subscribe(onState){
    if(bc){
      bc.onmessage = (ev) => {
        if(ev?.data?.type === "STATE" && ev.data.payload){
          onState(ev.data.payload);
        }
      };
    }
    window.addEventListener("storage", (e) => {
      if(e.key === STORAGE_KEY && e.newValue){
        try{ onState(JSON.parse(e.newValue)); } catch(_){}
      }
    });
  }

  // ---- Pure helpers ----
  function formatMMSS(ms){
    const totalSec = Math.floor(ms / 1000);
    const m = Math.floor(totalSec / 60);
    const s = totalSec % 60;
    return `${m}:${String(s).padStart(2,"0")}`;
  }

  function sanitizeText(s){
    return String(s ?? "").replace(/\s+/g," ").trim();
  }

  function hexToRgb(hex){
    const h = String(hex || "").trim().replace(/^#/, "");
    if(h.length === 3){
      const r = parseInt(h[0]+h[0], 16);
      const g = parseInt(h[1]+h[1], 16);
      const b = parseInt(h[2]+h[2], 16);
      return { r, g, b };
    }
    if(h.length !== 6) return null;
    const r = parseInt(h.slice(0,2), 16);
    const g = parseInt(h.slice(2,4), 16);
    const b = parseInt(h.slice(4,6), 16);
    if(Number.isNaN(r) || Number.isNaN(g) || Number.isNaN(b)) return null;
    return { r, g, b };
  }

  function rgbaFromHex(hex, a){
    const rgb = hexToRgb(hex);
    if(!rgb) return null;
    const alpha = Math.max(0, Math.min(1, Number(a)));
    return `rgba(${rgb.r},${rgb.g},${rgb.b},${alpha})`;
  }

  function applyThemeToDocument(doc, state){
    try{
      const root = doc?.documentElement;
      if(!root) return;

      const vars = state?.settings?.theme?.vars || {};
      for(const [k,v] of Object.entries(vars)){
        if(v) root.style.setProperty(`--${k}`, v);
      }

      const card = state?.settings?.theme?.viewerCard || { hex:"#000000", opacity:0.9 };
      const cardBg = rgbaFromHex(card.hex, card.opacity) || "rgba(0,0,0,.90)";
      root.style.setProperty("--card-bg", cardBg);

      const cues = state?.settings?.viewerCues || {};
      const warnBg = rgbaFromHex(cues.warnHex || "#00c2ff", cues.warnAlpha ?? 0.12) || "rgba(0, 180, 255, .12)";
      const finalBg = rgbaFromHex(cues.finalHex || "#2dd4bf", cues.finalAlpha ?? 0.18) || "rgba(0, 220, 200, .18)";
      const overBg = rgbaFromHex(cues.overtimeHex || "#ff0000", cues.overtimeAlpha ?? 0.85) || "rgba(255,0,0,.85)";

      root.style.setProperty("--pulse-warn-bg", warnBg);
      root.style.setProperty("--pulse-final-bg", finalBg);
      root.style.setProperty("--overtime-flash-bg", overBg);

      const warnDur = (Number(cues.warnDurSec) || 3.2);
      const finalDur = (Number(cues.finalDurSec) || 1.4);
      root.style.setProperty("--pulse-warn-dur", `${warnDur}s`);
      root.style.setProperty("--pulse-final-dur", `${finalDur}s`);
    }catch(_){}
  }


  return {
    uid, defaultState, loadState, saveState, publish, subscribe,
    getSlotType, effectiveMinutes, displaySlotTypeLabel, normalizeSlot,
    // House Band
    houseBandInstrumentOptions, houseBandCategories,
    normalizeHouseBandMember, houseBandMemberLabel,
    houseBandCategoryKeyForInstrumentId, houseBandCategoryKeyForMember,
    ensureHouseBandQueues, addHouseBandMember, removeHouseBandMember,
    rotateHouseBandMemberToEnd, rotateHouseBandTopToEnd, reorderHouseBandCategory, getHouseBandTopPerCategory,
    computeNextTwo, computeCurrent, computeTimer,
    openAssetDB, putAsset, getAsset, deleteAsset, compressImageFile,
    formatMMSS, sanitizeText, applyThemeToDocument
  };
})();
