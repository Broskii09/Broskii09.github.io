/**
 * OMJN - Shared state + persistence + realtime channel
 * Static site friendly: BroadcastChannel for live sync, localStorage for state, IndexedDB for images.
 */
const OMJN = (() => {
  const CHANNEL_NAME = "omjn_channel_v1";
  const STORAGE_KEY = "omjn.showState.v1";
  const ASSET_DB = { name: "omjn_assets_v1", store: "assets" };

  const now = () => Date.now();

  function uid(prefix="id"){
    return `${prefix}_${Math.random().toString(16).slice(2)}_${Date.now().toString(16)}`;
  }

  function defaultState(){
    return {
      version: 1,
      showTitle: "Open Mic & Jam Night",
      phase: "SPLASH", // SPLASH | LIVE | PAUSED
      features: { jamEnabled: false },
      operatorPrefs: { startGuard: true, endGuard: true, hotkeysEnabled: true },
      profiles: {},
      splash: { backgroundAssetPath: "./assets/splash.svg", showNextTwo: true },
      viewerPrefs: { warnAtSec: 120, finalAtSec: 30, showOvertime: true, showProgressBar: true },
      slotTypes: [
        { id:"standard", label:"Standard", defaultMinutes:15, isJamMode:false },
        { id:"quick", label:"Quick", defaultMinutes:5, isJamMode:false },
        { id:"feature", label:"Feature", defaultMinutes:20, isJamMode:false },
        { id:"band", label:"Band", defaultMinutes:25, isJamMode:false },
        { id:"custom", label:"Custom", defaultMinutes:15, isJamMode:false },
        { id:"jam", label:"Jam Block", defaultMinutes:15, isJamMode:true },
      ],
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
      if(!raw) return defaultState();
      const s = JSON.parse(raw);
      // minimal migration hooks
      if(!s.version) s.version = 1;
      if(!s.features) s.features = { jamEnabled: false };
      if(!s.operatorPrefs) s.operatorPrefs = { startGuard:true, endGuard:true, hotkeysEnabled:true };
      if(!s.profiles) s.profiles = {};
      if(!s.splash) s.splash = { backgroundAssetPath: "./assets/splash.svg", showNextTwo: true };
      if(!s.viewerPrefs) s.viewerPrefs = { warnAtSec: 120, finalAtSec: 30, showOvertime: true, showProgressBar: true };
      if(!s.assetsIndex) s.assetsIndex = {};
      // Ensure slotTypes include Custom (migration)
      if(Array.isArray(s.slotTypes) && !s.slotTypes.some(t=>t.id==="custom")){
        // insert before Jam if present, else at end
        const jamIdx = s.slotTypes.findIndex(t=>t.id==="jam");
        const insertAt = jamIdx >= 0 ? jamIdx : s.slotTypes.length;
        s.slotTypes.splice(insertAt, 0, { id:"custom", label:"Custom", defaultMinutes:15, isJamMode:false });
      }
      if(!s.selectedNextId) s.selectedNextId = s.currentSlotId ? null : (s.queue?.find(x=>x.status==="QUEUED")?.id ?? null);
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

function ensureJamShape(slot){
    if(slot.jam) return slot;
    slot.jam = {
      title: "Jam",
      subList: [],
      activeJamEntryId: null,
      rotationMode: "MANUAL",
      rotationSeconds: 180
    };
    return slot;
  }

  function computeNextTwo(state){
    const queued = state.queue.filter(s => {
      if(s.status !== "QUEUED") return false;
      if(s.id === state.currentSlotId) return false;
      const t = getSlotType(state, s.slotTypeId);
      if(t.isJamMode && !(state.features?.jamEnabled)) return false;
      return true;
    });
    return [queued[0] || null, queued[1] || null];
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

  return {
    uid, defaultState, loadState, saveState, publish, subscribe,
    getSlotType, effectiveMinutes, displaySlotTypeLabel, normalizeSlot, ensureJamShape, computeNextTwo, computeCurrent, computeTimer,
    openAssetDB, putAsset, getAsset, deleteAsset, compressImageFile,
    formatMMSS, sanitizeText
  };
})();
