

// ---- UI scope (separate /TEST vs /OMJN) ----
const SB_UI_SCOPE = (() => {
  const p = (location.pathname || "").toLowerCase();
  return p.includes("/omjn/test") ? "test" : "prod";
})();

/* Soundboard page (public Google Drive folder or local) */
(() => {
  let state = OMJN.loadState();
  OMJN.applyThemeToDocument(document, state);

  // ---- DOM ----
  const els = {
    phase: document.getElementById("sbPhase"),
    phaseDot: document.getElementById("sbPhaseDot"),
    timer: document.getElementById("sbTimer"),
    now: document.getElementById("sbNow"),
    next: document.getElementById("sbNext"),
    deck: document.getElementById("sbDeck"),

    start: document.getElementById("sbStart"),
    pause: document.getElementById("sbPause"),
    resume: document.getElementById("sbResume"),
    end: document.getElementById("sbEnd"),
    minus30: document.getElementById("sbMinus30"),
    plus30: document.getElementById("sbPlus30"),
    minus1: document.getElementById("sbMinus1"),
    minus5: document.getElementById("sbMinus5"),
    plus1: document.getElementById("sbPlus1"),
    plus5: document.getElementById("sbPlus5"),
    resetTime: document.getElementById("sbResetTime"),

    compactToggle: document.getElementById("sbCompactToggle"),
    stickyRow2Toggle: document.getElementById("sbStickyRow2Toggle"),
    stickyHeader: document.getElementById("sbStickyHeader"),
    row2: document.getElementById("sbRow2"),
    safariTip: document.getElementById("sbSafariTip"),

    embedSelect: document.getElementById("sbEmbedSelect"),
    embedAdd: document.getElementById("sbEmbedAdd"),
    embedRemove: document.getElementById("sbEmbedRemove"),
    splitHandle: document.getElementById("sbSplitHandle"),
    embedFrameWrap: document.getElementById("sbEmbedFrameWrap"),
    embedModal: document.getElementById("sbEmbedModal"),
    embedClose: document.getElementById("sbEmbedClose"),
    embedCancel: document.getElementById("sbEmbedCancel"),
    embedSave: document.getElementById("sbEmbedSave"),
    embedName: document.getElementById("sbEmbedName"),
    embedCode: document.getElementById("sbEmbedCode"),
    stopAll: document.getElementById("sbStopAll"),

    masterVol: document.getElementById("sbMasterVol"),
    masterVolReadout: document.getElementById("sbMasterVolReadout"),
    masterVolReset: document.getElementById("sbMasterVolReset"),

    apiKey: document.getElementById("sbApiKey"),
    folder: document.getElementById("sbFolder"),
    refresh: document.getElementById("sbRefresh"),
    preload: document.getElementById("sbPreload"),
    status: document.getElementById("sbStatus"),

    cats: document.getElementById("sbCats"),
    pads: document.getElementById("sbPads"),
    padsTitle: document.getElementById("sbPadsTitle"),
    search: document.getElementById("sbSearch"),
    searchClear: document.getElementById("sbSearchClear"),
    resultMeta: document.getElementById("sbResultMeta"),
    stopFade: document.getElementById("sbStopFade"),
    freezeHotkeys: document.getElementById("sbFreezeHotkeys"),

    enableOverlay: document.getElementById("sbEnable"),
    enableBtn: document.getElementById("sbEnableBtn"),

    settingsBtn: document.getElementById("sbSettingsBtn"),
    settingsModal: document.getElementById("sbSettingsModal"),
    settingsClose: document.getElementById("sbSettingsClose"),
  };

// ---- UI prefs (compact rows + optional sticky controls) ----
const UI_PREF_KEY = `omjn.sb.ui.v1.${SB_UI_SCOPE}`;

function loadUiPrefs(){
  try{
    const raw = localStorage.getItem(UI_PREF_KEY);
    const obj = raw ? JSON.parse(raw) : null;
    return {
      compact: !!obj?.compact,
      stickyControls: !!obj?.stickyControls
    };
  }catch(_){
    return { compact:false, stickyControls:false };
  }
}

function saveUiPrefs(prefs){
  try{ localStorage.setItem(UI_PREF_KEY, JSON.stringify(prefs)); }catch(_){}
}

function applyStickyVars(){
  // Row2 sticks inside the cardBody scroller (which starts below the header),
  // so sticky top is normally 0. If the header is moved into the same scroller
  // in a future layout, we automatically account for it.
  let stickyTop = 0;
  const row2 = els.row2;
  const header = els.stickyHeader;

  try{
    const scroller = row2?.closest(".cardBody") || document.scrollingElement || document.documentElement;
    if(scroller && header && scroller.contains(header)){
      stickyTop = header.offsetHeight || 0;
    }
  }catch(_){
    stickyTop = 0;
  }

  document.documentElement.style.setProperty("--sbStickyTop", `${Math.max(0, stickyTop|0)}px`);

  // Side pane should tuck under Row2 only when sticky controls are enabled.
  const row2H = (document.body.classList.contains("sbRow2Sticky") && row2) ? row2.offsetHeight : 0;
  document.documentElement.style.setProperty("--sbRow2H", `${Math.max(0, row2H|0)}px`);
}

function initUiPrefs(){
  const prefs = loadUiPrefs();

  // Defaults: expanded + non-sticky until user opts in
  if(els.compactToggle){
    els.compactToggle.checked = prefs.compact;
    document.body.classList.toggle("sbCompact", prefs.compact);
    els.compactToggle.addEventListener("change", () => {
      prefs.compact = !!els.compactToggle.checked;
      document.body.classList.toggle("sbCompact", prefs.compact);
      saveUiPrefs(prefs);
      applyStickyVars();
    });
  }

  if(els.stickyRow2Toggle){
    els.stickyRow2Toggle.checked = prefs.stickyControls;
    document.body.classList.toggle("sbRow2Sticky", prefs.stickyControls);
    els.stickyRow2Toggle.addEventListener("change", () => {
      prefs.stickyControls = !!els.stickyRow2Toggle.checked;
      document.body.classList.toggle("sbRow2Sticky", prefs.stickyControls);
      saveUiPrefs(prefs);
      applyStickyVars();
    });
  }

  // keep sticky offset accurate
  applyStickyVars();
  window.addEventListener("resize", () => applyStickyVars());
  setTimeout(applyStickyVars, 50);
}


  // ---- Audio engine ----
  const AudioCtx = window.AudioContext || window.webkitAudioContext;
  const ctx = new AudioCtx();
  let audioEnabled = false;

  // ---- Volume (master + per-sound) ----
  // Slider scale is 0–100. 50% = unity (1.0). Above 50% boosts gain.
  const MASTER_VOL_KEY = "omjn_soundboard_master_vol_v1";
  const SOUND_VOL_KEY  = "omjn_soundboard_sound_vol_v1";

  function clamp(n, min, max){ return Math.max(min, Math.min(max, n)); }

  function sliderToGain(v){
    const n = clamp(Number(v), 0, 100);
    if(n <= 50) return n / 50;               // 0..1
    return 1 + ((n - 50) / 50) * 1.5;        // 1..2.5
  }

  function loadJson(key, fallback){
    try{ return JSON.parse(localStorage.getItem(key) || ""); }catch(_){ return fallback; }
  }
  function saveJson(key, obj){
    try{ localStorage.setItem(key, JSON.stringify(obj)); }catch(_){}
  }

  // ---- Stop Fade (persisted) ----
  const STOP_FADE_KEY = "omjn_soundboard_stop_fade_v1";
  let stopFadeMs = parseInt(localStorage.getItem(STOP_FADE_KEY) || "150", 10);
  if(!Number.isFinite(stopFadeMs) || stopFadeMs < 0) stopFadeMs = 150;

  if(els.stopFade){
    els.stopFade.value = String(stopFadeMs);
    els.stopFade.addEventListener("change", () => {
      const v = parseInt(els.stopFade.value, 10);
      stopFadeMs = (Number.isFinite(v) && v >= 0) ? v : 150;
      try{ localStorage.setItem(STOP_FADE_KEY, String(stopFadeMs)); }catch(_){}
    });
  }

  let masterVol = clamp(parseInt(localStorage.getItem(MASTER_VOL_KEY) || "50", 10), 0, 100);

  const masterGain = ctx.createGain();
  masterGain.gain.value = sliderToGain(masterVol);

  // Simple limiter to reduce clipping if master gain is boosted.
  const limiter = ctx.createDynamicsCompressor();
  try{
    limiter.threshold.value = -1;
    limiter.knee.value = 0;
    limiter.ratio.value = 20;
    limiter.attack.value = 0.003;
    limiter.release.value = 0.25;
  }catch(_){}
  masterGain.connect(limiter).connect(ctx.destination);

  const soundVolPrefs = loadJson(SOUND_VOL_KEY, {});
  function getSoundVolPercent(soundId){
    const v = soundVolPrefs[soundId];
    const n = (v === undefined) ? 50 : clamp(parseInt(v, 10), 0, 100);
    return Number.isFinite(n) ? n : 50;
  }
  function setSoundVolPercent(soundId, v){
    soundVolPrefs[soundId] = clamp(parseInt(v, 10), 0, 100);
    saveJson(SOUND_VOL_KEY, soundVolPrefs);
  }

  function applySoundVolToPlaying(soundId){
    const set = playing.get(soundId);
    if(!set || !set.size) return;
    const g = sliderToGain(getSoundVolPercent(soundId));
    for(const inst of Array.from(set)){
      try{ inst.gain.gain.value = g; }catch(_){}
    }
  }


  function updateMasterVolUI(){
    if(!els.masterVolReadout) return;
    const g = sliderToGain(masterVol);
    els.masterVolReadout.textContent = `${masterVol}% (${g.toFixed(2)}x)`;
  }

  if(els.masterVol){
    els.masterVol.value = String(masterVol);
    updateMasterVolUI();

    function resetMasterVol(){
      masterVol = 50;
      localStorage.setItem(MASTER_VOL_KEY, "50");
      els.masterVol.value = "50";
      masterGain.gain.value = sliderToGain(masterVol);
      updateMasterVolUI();
    }

    els.masterVol.addEventListener("input", () => {
      masterVol = clamp(parseInt(els.masterVol.value, 10), 0, 100);
      localStorage.setItem(MASTER_VOL_KEY, String(masterVol));
      masterGain.gain.value = sliderToGain(masterVol);
      updateMasterVolUI();
    });

    // Double-click: reset to default (50% / unity)
    els.masterVol.addEventListener("dblclick", (e) => {
      e.preventDefault();
      e.stopPropagation();
      resetMasterVol();
    });

    // Reset button (if present)
    if(els.masterVolReset){
      els.masterVolReset.addEventListener("click", (e) => {
        e.preventDefault();
        resetMasterVol();
      });
    }
  }


  // fileId -> { meta, buffer, loading:boolean }
  const soundCache = new Map();
  // soundId -> Set<{src:AudioBufferSourceNode, gain:GainNode}> (for stop / live volume updates)
  const playing = new Map();

  function showEnableOverlay(show){
    if(!els.enableOverlay) return;
    els.enableOverlay.style.display = show ? "flex" : "none";
  }

  audioEnabled = (ctx.state === "running");
  showEnableOverlay(!audioEnabled);
  initUiPrefs();

  // ---- Settings modal (volume, fade, hotkeys, source) ----
  function openSettingsModal(){
    if(!els.settingsModal) return;
    els.settingsModal.hidden = false;
    document.body.classList.add("modalOpen");
    setTimeout(() => {
      // Focus first interactive control for quick keyboard use
      (els.masterVol || els.apiKey || els.folder)?.focus?.();
    }, 0);
  }

  function closeSettingsModal(){
    if(!els.settingsModal) return;
    els.settingsModal.hidden = true;
    document.body.classList.remove("modalOpen");
  }

  function initSettingsModal(){
    if(els.settingsBtn){
      els.settingsBtn.addEventListener("click", (e) => {
        e.preventDefault();
        openSettingsModal();
      });
    }

    if(els.settingsClose){
      els.settingsClose.addEventListener("click", (e) => {
        e.preventDefault();
        closeSettingsModal();
      });
    }

    // Click on the dark overlay closes
    if(els.settingsModal){
      els.settingsModal.addEventListener("click", (e) => {
        if(e.target === els.settingsModal) closeSettingsModal();
      });
    }

    // Esc closes (capture so it beats search / other handlers)
    document.addEventListener("keydown", (e) => {
      if(e.key === "Escape" && els.settingsModal && !els.settingsModal.hidden){
        e.preventDefault();
        e.stopPropagation();
        closeSettingsModal();
      }
    }, true);
  }

  initSettingsModal();

// Enable audio (bind to any enable button, even if markup changes)
const _enableBtns = Array.from(document.querySelectorAll("#sbEnableBtn"));
for(const btn of _enableBtns){
  btn.addEventListener("click", async () => {
    try{
      // First attempt: resume the context
      await ctx.resume();

      // Safari sometimes needs an extra silent start/stop to fully unlock output
      if(ctx.state !== "running"){
        try{
          const osc = ctx.createOscillator();
          const g = ctx.createGain();
          g.gain.value = 0;
          osc.connect(g).connect(ctx.destination);
          osc.start();
          osc.stop(ctx.currentTime + 0.01);
        }catch(_){}
        await ctx.resume();
      }

      audioEnabled = (ctx.state === "running");
      if(audioEnabled){
        showEnableOverlay(false);
        setStatus("Audio enabled.", false);
      }else{
        showEnableOverlay(true);
        setStatus("Audio is still blocked. Try clicking again.", true);
      }
    }catch(e){
      showEnableOverlay(true);
      setStatus("Could not enable audio. Try clicking again.", true);
    }
  });
}
function setStatus(msg, isErr=false){
    if(!els.status) return;
    els.status.textContent = msg;
    els.status.style.color = isErr ? "var(--danger,#ff6b6b)" : "";
  }

  function stopSound(soundId, fadeMs = stopFadeMs){
    const set = playing.get(soundId);
    if(!set || !set.size) return;
    const f = Math.max(0, Number(fadeMs || 0));
    if(f <= 0){
      for(const inst of Array.from(set)){
        try{ inst.src.stop(0); }catch(_){ }
      }
      playing.delete(soundId);
      const padEl = document.querySelector(`.sbPad[data-sound-id="${CSS.escape(soundId)}"]`);
      if(padEl) padEl.classList.remove("playing");
      return;
    }

    // Fade-out: schedule gain ramp then stop. UI clears on 'ended'.
    const t0 = ctx.currentTime;
    const dur = Math.min(5000, f) / 1000;
    for(const inst of Array.from(set)){
      try{
        const g = inst.gain.gain;
        g.cancelScheduledValues(t0);
        g.setValueAtTime(g.value, t0);
        g.linearRampToValueAtTime(0, t0 + dur);
        inst.src.stop(t0 + dur + 0.015);
      }catch(_){
        try{ inst.src.stop(0); }catch(__){}
      }
    }
  }

  function stopAll(fadeMs = stopFadeMs){
    const f = Math.max(0, Number(fadeMs || 0));
    if(f <= 0){
      for(const [, set] of playing.entries()){
        for(const inst of Array.from(set)){
          try{ inst.src.stop(0); }catch(_){ }
        }
      }
      playing.clear();
      document.querySelectorAll(".sbPad.playing").forEach(el => el.classList.remove("playing"));
      return;
    }

    const t0 = ctx.currentTime;
    const dur = Math.min(5000, f) / 1000;
    for(const [, set] of playing.entries()){
      for(const inst of Array.from(set)){
        try{
          const g = inst.gain.gain;
          g.cancelScheduledValues(t0);
          g.setValueAtTime(g.value, t0);
          g.linearRampToValueAtTime(0, t0 + dur);
          inst.src.stop(t0 + dur + 0.015);
        }catch(_){
          try{ inst.src.stop(0); }catch(__){}
        }
      }
    }
  }

  els.stopAll.addEventListener("click", () => stopAll(stopFadeMs));

  // ---- IndexedDB cache ----
  const DB_NAME = "omjn_soundboard";
  const STORE = "files";
  function openDB(){
    return new Promise((resolve, reject) => {
      const req = indexedDB.open(DB_NAME, 1);
      req.onupgradeneeded = () => {
        const db = req.result;
        if(!db.objectStoreNames.contains(STORE)){
          db.createObjectStore(STORE, { keyPath:"id" });
        }
      };
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error);
    });
  }

  async function idbGet(id){
    const db = await openDB();
    return new Promise((resolve) => {
      const tx = db.transaction(STORE, "readonly");
      const st = tx.objectStore(STORE);
      const rq = st.get(id);
      rq.onsuccess = () => resolve(rq.result || null);
      rq.onerror = () => resolve(null);
    });
  }

  async function idbPut(rec){
    const db = await openDB();
    return new Promise((resolve) => {
      const tx = db.transaction(STORE, "readwrite");
      tx.objectStore(STORE).put(rec);
      tx.oncomplete = () => resolve(true);
      tx.onerror = () => resolve(false);
    });
  }

  // ---- Drive API helpers ----
  function parseFolderId(s){
    const t = String(s || "").trim();
    if(!t) return "";
    // if it's already an id
    if(/^[a-zA-Z0-9_-]{10,}$/.test(t) && !t.includes("/")) return t;
    const m1 = t.match(/\/folders\/([a-zA-Z0-9_-]+)/);
    if(m1) return m1[1];
    const m2 = t.match(/[?&]id=([a-zA-Z0-9_-]+)/);
    if(m2) return m2[1];
    return t; // fallback
  }

  async function driveList(apiKey, parentId){
    const q = encodeURIComponent(`'${parentId}' in parents and trashed=false`);
    const fields = encodeURIComponent("files(id,name,mimeType,modifiedTime,size)");
    const url = `https://www.googleapis.com/drive/v3/files?q=${q}&fields=${fields}&orderBy=name&pageSize=1000&key=${encodeURIComponent(apiKey)}`;
    const r = await fetch(url);
    if(!r.ok) throw new Error(`Drive list failed (${r.status})`);
    const j = await r.json();
    return Array.isArray(j.files) ? j.files : [];
  }

  function isFolder(f){
    return f.mimeType === "application/vnd.google-apps.folder";
  }

  function isAudio(f){
    const name = (f.name || "").toLowerCase();
    const byExt = (/(\.mp3|\.wav|\.ogg|\.m4a|\.aac|\.flac)$/).test(name);
    const byMime = String(f.mimeType || "").startsWith("audio/");
    return byMime || byExt;
  }

  function driveDownloadUrl(apiKey, fileId){
    return `https://www.googleapis.com/drive/v3/files/${encodeURIComponent(fileId)}?alt=media&key=${encodeURIComponent(apiKey)}`;
  }

  // ---- Model: categories -> sounds ----
  let categories = []; // [{id,label, sounds:[{id,name,downloadUrl,modifiedTime,mimeType}]}]
  let activeCategoryId = "__all";

  // soundId -> sound object (rebuilt on refresh)
  let soundById = new Map();

  // ---- Favorites + Recents (persisted across shows) ----
  const FAV_KEY = "omjn_soundboard_favs_v1";
  const RECENTS_KEY = "omjn_soundboard_recents_v1";
  const RECENTS_CAP = 60;

  let favList = loadJson(FAV_KEY, []);
  if(!Array.isArray(favList)) favList = [];
  let favSet = new Set(favList);

  let recents = loadJson(RECENTS_KEY, []);
  if(!Array.isArray(recents)) recents = [];

  function saveFavList(){
    // de-dupe while preserving order
    const seen = new Set();
    favList = favList.filter(id => {
      if(seen.has(id)) return false;
      seen.add(id);
      return true;
    });
    favSet = new Set(favList);
    saveJson(FAV_KEY, favList);
  }

  function saveRecents(){
    const seen = new Set();
    recents = recents.filter(id => {
      if(seen.has(id)) return false;
      seen.add(id);
      return true;
    }).slice(0, RECENTS_CAP);
    saveJson(RECENTS_KEY, recents);
  }

  function toggleFavorite(soundId){
    if(!soundId) return;
    if(favSet.has(soundId)){
      favList = favList.filter(x => x !== soundId);
    }else{
      favList = [soundId, ...favList.filter(x => x !== soundId)];
    }
    saveFavList();
    renderCategories();
    if(activeCategoryId === "__favorites") selectedIdx = 0;
    renderPads();
  }

  function recordRecent(soundId){
    if(!soundId) return;
    recents = [soundId, ...recents.filter(x => x !== soundId)].slice(0, RECENTS_CAP);
    saveRecents();
    renderCategories();
  }

  function pruneFavRecents(){
    // Drop IDs that no longer exist (deleted/renamed/manifest changed)
    if(!soundById || !soundById.size) return;
    const exists = (id) => soundById.has(id);
    const nextFav = favList.filter(exists);
    const nextRec = recents.filter(exists);
    if(nextFav.length !== favList.length){ favList = nextFav; saveFavList(); }
    if(nextRec.length !== recents.length){ recents = nextRec; saveRecents(); }
  }

  function getFavSounds(){
    return favList.map(id => soundById.get(id)).filter(Boolean);
  }

  function getRecentSounds(){
    return recents.map(id => soundById.get(id)).filter(Boolean);
  }

  // ---- Learning Hotkeys (decayed usage + pinning) ----
  const USAGE_KEY = "omjn_soundboard_usage_v1";
  const PINS_KEY = "omjn_soundboard_pins_v1";
  const FREEZE_KEY = "omjn_soundboard_freeze_hotkeys_v1";
  const SNAPSHOT_KEY = "omjn_soundboard_hotkeys_snapshot_v1";
  const HOTKEY_KEYS = ["1","2","3","4","5","6","7","8","9","0"];
  const HALF_LIFE_DAYS = 7;
  const DECAY_LAMBDA = Math.log(2) / (HALF_LIFE_DAYS * 24 * 60 * 60 * 1000);

  let usage = loadJson(USAGE_KEY, {});
  if(!usage || typeof usage !== "object") usage = {};
  let pinned = loadJson(PINS_KEY, {});
  if(!pinned || typeof pinned !== "object") pinned = {};
  let freezeHotkeys = (localStorage.getItem(FREEZE_KEY) === "1");
  let snapshot = loadJson(SNAPSHOT_KEY, {});
  if(!snapshot || typeof snapshot !== "object") snapshot = {};

  let hotkeyAssign = {};   // key -> soundId
  let hotkeyBySound = {};  // soundId -> key

  if(els.freezeHotkeys){
    els.freezeHotkeys.checked = !!freezeHotkeys;
    els.freezeHotkeys.addEventListener("change", () => {
      freezeHotkeys = !!els.freezeHotkeys.checked;
      try{ localStorage.setItem(FREEZE_KEY, freezeHotkeys ? "1" : "0"); }catch(_){ }
      if(freezeHotkeys){
        computeHotkeys({ updateSnapshot: true });
      }else{
        computeHotkeys();
      }
    });
  }

  function decayedScore(rec, nowMs){
    const score = Number(rec?.score || 0);
    const ts = Number(rec?.ts || nowMs);
    if(!Number.isFinite(score) || score <= 0) return 0;
    if(!Number.isFinite(ts)) return score;
    const age = Math.max(0, nowMs - ts);
    return score * Math.exp(-DECAY_LAMBDA * age);
  }

  function bumpUsage(soundId){
    const now = Date.now();
    const rec = usage[soundId] || { score: 0, ts: now };
    const next = decayedScore(rec, now) + 1;
    usage[soundId] = { score: next, ts: now };
    saveJson(USAGE_KEY, usage);
    if(!freezeHotkeys){
      computeHotkeys();
    }
  }

  function getPinnedKeyForSound(soundId){
    for(const k of HOTKEY_KEYS){
      if(pinned[k] === soundId) return k;
    }
    return "";
  }

  function setPinnedKey(slotKey, soundId){
    // Enforce uniqueness: a sound can only be pinned to one key
    if(soundId){
      for(const k of HOTKEY_KEYS){
        if(pinned[k] === soundId) delete pinned[k];
      }
    }

    if(slotKey && soundId){
      pinned[slotKey] = soundId;
    }else if(slotKey){
      delete pinned[slotKey];
    }

    saveJson(PINS_KEY, pinned);
    computeHotkeys();
    renderPads();
  }

  function computeHotkeys(opts={}){
    const now = Date.now();
    const all = Array.from(soundById.values());
    const ranked = all
      .map(s => ({ id: s.id, score: decayedScore(usage[s.id], now), name: String(s._displayName || s.name || "") }))
      .sort((a,b) => (b.score - a.score) || a.name.localeCompare(b.name))
      .map(x => x.id);

    const used = new Set();
    const out = {};

    // 1) pins first
    for(const key of HOTKEY_KEYS){
      const id = pinned[key];
      if(id && soundById.has(id) && !used.has(id)){
        out[key] = id;
        used.add(id);
      }
    }

    // 2) frozen snapshot next
    const hasSnapshot = snapshot && Object.keys(snapshot).length > 0;
    const snap = (freezeHotkeys && hasSnapshot && !opts.updateSnapshot) ? snapshot : null;

    let idx = 0;
    const nextRanked = () => {
      while(idx < ranked.length){
        const id = ranked[idx++];
        if(!id) continue;
        if(used.has(id)) continue;
        return id;
      }
      return null;
    };

    for(const key of HOTKEY_KEYS){
      if(out[key]) continue;
      let candidate = snap ? snap[key] : null;
      if(candidate && soundById.has(candidate) && !used.has(candidate)){
        out[key] = candidate;
        used.add(candidate);
        continue;
      }
      const pick = nextRanked();
      if(pick){
        out[key] = pick;
        used.add(pick);
      }
    }

    hotkeyAssign = out;
    hotkeyBySound = {};
    for(const key of HOTKEY_KEYS){
      const id = out[key];
      if(id) hotkeyBySound[id] = key;
    }

    if(freezeHotkeys && (opts.updateSnapshot || !hasSnapshot)){
      snapshot = { ...out };
      saveJson(SNAPSHOT_KEY, snapshot);
    }
  }

  // ---- Search / filter state ----
  let searchQuery = "";
  let selectedIdx = 0;
  let lastRendered = []; // sound objects in current view order

  // Normalization helpers (fast fuzzy search)
  const HAS_UNICODE = (() => {
    try{ new RegExp("[^\\p{L}\\p{N}\\s]","u"); return true; }catch(_){ return false; }
  })();

  function norm(s){
    const raw = String(s || "").toLowerCase();
    const base = raw.replace(/[_\-]+/g, " ");
    if(HAS_UNICODE){
      return base
        .replace(/[^\p{L}\p{N}\s]/gu, "")
        .replace(/\s+/g, " ")
        .trim();
    }
    return base
      .replace(/[^a-z0-9\s]/g, "")
      .replace(/\s+/g, " ")
      .trim();
  }

  function isSubsequence(q, t){
    let i = 0, j = 0;
    while(i < q.length && j < t.length){
      if(q[i] === t[j]) i++;
      j++;
    }
    return i === q.length;
  }

  function scoreSound(qNorm, qTokens, s){
    if(!qNorm) return 0;
    const n = s._nameNorm || "";
    if(!n) return 0;
    if(n === qNorm) return 1000;

    let score = 0;
    if(n.startsWith(qNorm)) score += 700;
    if(n.includes(qNorm)) score += 450;

    // token presence (order-independent)
    let hits = 0;
    for(const qt of qTokens){
      if(!qt) continue;
      if(n.includes(qt)) hits++;
    }
    if(hits === qTokens.length) score += 350 + hits * 20;
    else score += hits * 45;

    const ac = s._acronym || "";
    if(ac.startsWith(qNorm)) score += 220;
    else if(qNorm.length >= 2 && isSubsequence(qNorm, ac)) score += 140;

    if(qNorm.length >= 3 && isSubsequence(qNorm, n)) score += 90;

    // small preference for shorter names when tied
    score += Math.max(0, 30 - Math.min(30, n.length)) * 0.5;
    return score;
  }

  function escapeRegExp(s){
    return String(s).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  }

  function highlightName(displayName, qTokens){
    // highlight direct token matches only (keeps it readable)
    let out = escapeHtml(displayName);
    const tokens = (qTokens || []).map(t => String(t||"").trim()).filter(t => t.length >= 2);
    if(!tokens.length) return out;

    // Replace longer tokens first to reduce nested marks
    tokens.sort((a,b) => b.length - a.length);
    for(const tok of tokens){
      const re = new RegExp(`(${escapeRegExp(tok)})`, "ig");
      out = out.replace(re, `<mark class="sbMark">$1</mark>`);
    }
    return out;
  }

  function indexSounds(){
    soundById = new Map();
    for(const c of categories){
      for(const s of c.sounds){
        s._catLabel = c.label;
        s._catId = c.id;
        s._displayName = stripExt(s.name);
        s._nameNorm = norm(s._displayName);
        s._tokens = s._nameNorm.split(" ").filter(Boolean);
        s._acronym = s._tokens.map(t => t[0]).join("");
        soundById.set(s.id, s);
      }
    }
    pruneFavRecents();
    computeHotkeys();
  }

  function setSearchQuery(q){
    searchQuery = String(q || "");
    if(els.search && els.search.value !== searchQuery) els.search.value = searchQuery;
    if(els.searchClear) els.searchClear.style.display = searchQuery.trim() ? "block" : "none";
  }

  // ---- UI rendering ----

  // ---- UI rendering ----
  function renderCategories(){
    els.cats.innerHTML = "";

    const mkBtn = (catId, label, count) => {
      const b = document.createElement("button");
      b.className = "sbCat" + (activeCategoryId===catId ? " active" : "");
      b.dataset.cat = catId;
      if(typeof count === "number"){
        b.innerHTML = `<span>${escapeHtml(label)}</span><span class="sbCount">${count}</span>`;
      }else{
        b.textContent = label;
      }
      return b;
    };

    // Primary buckets
    els.cats.appendChild(mkBtn("__all", "All", categories.reduce((n,c)=>n + (c.sounds?.length||0), 0)));

    const favCount = getFavSounds().length;
    const recCount = getRecentSounds().length;
    els.cats.appendChild(mkBtn("__favorites", "★ Favorites", favCount));
    els.cats.appendChild(mkBtn("__recents", "⏱ Recents", recCount));

    const sep = document.createElement("div");
    sep.className = "sbCatSep";
    els.cats.appendChild(sep);

    // Folder categories
    for(const c of categories){
      const count = c.sounds.length;
      els.cats.appendChild(mkBtn(c.id, c.label, count));
    }
  }

  function getCategoryLabel(catId){
    if(catId === "__all") return "All";
    if(catId === "__favorites") return "Favorites";
    if(catId === "__recents") return "Recents";
    return categories.find(c => c.id === catId)?.label || "—";
  }

  function getBaseSoundsForActiveCategory(){
    if(activeCategoryId === "__all") return categories.flatMap(c => c.sounds);
    if(activeCategoryId === "__favorites") return getFavSounds();
    if(activeCategoryId === "__recents") return getRecentSounds();
    return categories.find(c => c.id === activeCategoryId)?.sounds || [];
  }

  function renderPads(){
    els.pads.innerHTML = "";
    const q = String(searchQuery || "").trim();
    const qNorm = norm(q);
    const qTokens = qNorm ? qNorm.split(" ").filter(Boolean) : [];

    const baseSounds = getBaseSoundsForActiveCategory();
    const scopeLabel = getCategoryLabel(activeCategoryId);

    let soundsToShow = [];
    if(qNorm){
      const scored = [];
      for(const s of baseSounds){
        const sc = scoreSound(qNorm, qTokens, s);
        if(sc > 0) scored.push({ s, sc });
      }
      scored.sort((a,b) => (b.sc - a.sc) || String(a.s._displayName||"").localeCompare(String(b.s._displayName||"")));
      soundsToShow = scored.map(x => x.s);

      els.padsTitle.textContent = "Results";
      if(els.resultMeta){
        if(soundsToShow.length){
          const inScope = (activeCategoryId === "__all") ? "" : ` in ${scopeLabel}`;
          els.resultMeta.textContent = `${soundsToShow.length} match(es)${inScope} for “${q}” • Up/Down selects • Enter plays • Esc clears`;
        }else{
          const inScope = (activeCategoryId === "__all") ? "" : ` in ${scopeLabel}`;
          els.resultMeta.textContent = `No matches${inScope} for “${q}”.`;
        }
      }
    }else{
      soundsToShow = baseSounds;
      els.padsTitle.textContent = scopeLabel;
      if(els.resultMeta){
        els.resultMeta.textContent = "Tip: type anywhere to search • Up/Down selects • Enter plays • 1–9/0 triggers your Learning Hotkeys (when not typing).";
      }
    }

    lastRendered = soundsToShow;
    if(selectedIdx >= lastRendered.length) selectedIdx = 0;

    if(!soundsToShow.length){
      const empty = document.createElement("div");
      empty.className = "small";
      empty.style.opacity = "0.85";
      empty.style.padding = "12px";
      empty.textContent = qNorm ? "No results." : "No sounds in this category.";
      els.pads.appendChild(empty);
      return;
    }

    for(let i=0; i<soundsToShow.length; i++){
      const s = soundsToShow[i];
      const wrap = document.createElement("div");
      wrap.className = "sbPadWrap" + (i === selectedIdx ? " selected" : "");

      const pad = document.createElement("button");
      pad.className = "sbPad";
      pad.dataset.soundId = s.id;

      const hk = hotkeyBySound[s.id] || "";
      const displayName = s._displayName || stripExt(s.name);
      const nameHtml = qNorm ? highlightName(displayName, qTokens) : escapeHtml(displayName);
      const showCatPill = !!qNorm || (activeCategoryId === "__all" || activeCategoryId === "__favorites" || activeCategoryId === "__recents");

      pad.innerHTML = `
        <div class="sbPadTop">
          <div style="min-width:0;">
            <div class="sbPadName">${nameHtml}</div>
          </div>
          ${hk ? `<div class="sbHotkey" title="Learning hotkey">${escapeHtml(hk)}</div>` : ""}
        </div>
        <div class="sbPadMeta">
          ${showCatPill ? `<div class="sbPill">${escapeHtml(s._catLabel || "")}</div>` : ""}
          <div class="sbLoad" id="load_${escapeHtml(s.id)}"></div>
        </div>
      `;

      pad.addEventListener("click", () => playSound(s));

      // Controls row
      const controls = document.createElement("div");
      controls.className = "sbPadControls";

      const favOn = favSet.has(s.id);
      const favBtn = document.createElement("button");
      favBtn.type = "button";
      favBtn.className = "sbMiniBtn sbFavMini" + (favOn ? " on" : "");
      favBtn.textContent = "★";
      favBtn.title = favOn ? "Unfavorite" : "Favorite";
      favBtn.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();
        toggleFavorite(s.id);
      });

      const stopBtn = document.createElement("button");
      stopBtn.type = "button";
      stopBtn.className = "sbMiniBtn";
      stopBtn.textContent = "Stop";
      stopBtn.title = "Stop (uses Stop Fade)";
      stopBtn.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();
        stopSound(s.id, stopFadeMs);
      });

      const layerBtn = document.createElement("button");
      layerBtn.type = "button";
      layerBtn.className = "sbMiniBtn" + (isLayerEnabled(s.id) ? " on" : "");
      layerBtn.textContent = "Layer";
      layerBtn.title = "Allow overlap / layering";
      layerBtn.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();
        toggleLayer(s.id);
        layerBtn.classList.toggle("on", isLayerEnabled(s.id));
      });

      const pinSelect = document.createElement("select");
      pinSelect.className = "sbPinSelect";
      pinSelect.setAttribute("aria-label", "Pin to hotkey slot");
      pinSelect.title = "Pin to 1–9/0";
      pinSelect.innerHTML = `<option value="">📌 —</option>` + HOTKEY_KEYS.map(k => `<option value="${k}">📌 ${k}</option>`).join("");
      const currentPin = getPinnedKeyForSound(s.id);
      pinSelect.value = currentPin || "";
      pinSelect.addEventListener("change", (e) => {
        e.stopPropagation();
        const next = pinSelect.value;
        const prev = currentPin;
        if(!next){
          if(prev) setPinnedKey(prev, null);
        }else{
          setPinnedKey(next, s.id);
        }
      });
      // prevent pad click when interacting
      pinSelect.addEventListener("pointerdown", (e) => e.stopPropagation());
      pinSelect.addEventListener("mousedown", (e) => e.stopPropagation());

      const volWrap = document.createElement("div");
      volWrap.className = "sbPadVolWrap";
      const current = getSoundVolPercent(s.id);
      volWrap.innerHTML = `
        <input type="range" class="sbRange sbSoundVol" min="0" max="100" step="1" value="${current}" data-sound-id="${escapeHtml(s.id)}" aria-label="Volume for ${escapeHtml(displayName)}"/>
        <div class="sbVolPct mono" data-sound-id="${escapeHtml(s.id)}">${current}%</div>
      `;
      const slider = volWrap.querySelector(".sbSoundVol");
      const pct = volWrap.querySelector(".sbVolPct");
      slider.addEventListener("input", () => {
        const v = clamp(parseInt(slider.value, 10), 0, 100);
        setSoundVolPercent(s.id, v);
        pct.textContent = `${v}%`;
        applySoundVolToPlaying(s.id);
      });
      slider.addEventListener("dblclick", (e) => {
        e.preventDefault();
        e.stopPropagation();
        slider.value = "50";
        setSoundVolPercent(s.id, 50);
        pct.textContent = "50%";
        applySoundVolToPlaying(s.id);
      });
      slider.addEventListener("pointerdown", (e) => e.stopPropagation());
      slider.addEventListener("mousedown", (e) => e.stopPropagation());

      controls.appendChild(favBtn);
      controls.appendChild(stopBtn);
      controls.appendChild(layerBtn);
      controls.appendChild(pinSelect);
      controls.appendChild(volWrap);

      wrap.appendChild(pad);
      wrap.appendChild(controls);
      els.pads.appendChild(wrap);
    }

    updateSelected(false);
  }

  function updateSelected(doScroll){
    const wraps = [...document.querySelectorAll(".sbPadWrap")];
    wraps.forEach((w, idx) => w.classList.toggle("selected", idx === selectedIdx));
    if(doScroll){
      const sel = wraps[selectedIdx];
      if(sel) sel.scrollIntoView({ block:"nearest", behavior:"smooth" });
    }
  }

  function clampSelected(delta){
    if(!lastRendered.length) return;
    selectedIdx = Math.max(0, Math.min(lastRendered.length - 1, selectedIdx + delta));
    updateSelected(true);
  }

  function playSelected(){
    const s = lastRendered[selectedIdx];
    if(s) playSound(s);
  }

  function updateLoadLabel(soundId){
    const el = document.getElementById(`load_${soundId}`);
    if(!el) return;
    const c = soundCache.get(soundId);
    if(!c){
      el.textContent = "not loaded";
      return;
    }
    if(c.loading){
      el.textContent = "loading…";
      return;
    }
    if(c.buffer){
      el.textContent = "ready";
      return;
    }
    el.textContent = "not loaded";
  }

  function escapeHtml(s){
    return String(s ?? "").replace(/[&<>"\']/g, ch => ({ "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","\'":"&#39;" }[ch]));
  }
  function stripExt(name){
    return String(name||"").replace(/\.[^\.]+$/, "");
  }

  // ---- Playback ----
  async function ensureDecoded(sound){
    let entry = soundCache.get(sound.id);
    if(entry?.buffer) return entry.buffer;
    if(entry?.loading) {
      // wait for it
      return new Promise((resolve, reject) => {
        const t0 = Date.now();
        const iv = setInterval(() => {
          const e = soundCache.get(sound.id);
          if(e?.buffer){ clearInterval(iv); resolve(e.buffer); }
          if(Date.now() - t0 > 20000){ clearInterval(iv); reject(new Error("Timeout loading sound")); }
        }, 120);
      });
    }

    entry = { meta: sound, buffer:null, loading:true };
    soundCache.set(sound.id, entry);
    updateLoadLabel(sound.id);

    // IndexedDB hit?
    const cached = await idbGet(sound.id);
    let blob = cached?.blob || null;
    const same = cached && cached.modifiedTime === sound.modifiedTime;

    if(!blob || !same){
      const r = await fetch(sound.downloadUrl);
      if(!r.ok) throw new Error(`Download failed (${r.status})`);
      blob = await r.blob();
      await idbPut({ id:sound.id, name:sound.name, modifiedTime:sound.modifiedTime, mimeType:sound.mimeType, blob });
    }

    const ab = await blob.arrayBuffer();
    const buf = await ctx.decodeAudioData(ab.slice(0));
    entry.buffer = buf;
    entry.loading = false;
    soundCache.set(sound.id, entry);
    updateLoadLabel(sound.id);
    return buf;
  }

  async function playSound(sound){
    if(!audioEnabled){
      showEnableOverlay(true);
      return;
    }
    try{
      const padEl = document.querySelector(`.sbPad[data-sound-id="${CSS.escape(sound.id)}"]`);

      const buffer = await ensureDecoded(sound);
      const src = ctx.createBufferSource();
      src.buffer = buffer;

      // Per-sound gain (50% = unity). Master gain is applied globally.
      const gain = ctx.createGain();
      gain.gain.value = sliderToGain(getSoundVolPercent(sound.id));

      src.connect(gain).connect(masterGain);
      // By default, clicking a pad restarts the sound.
      // If Layer is enabled for this sound, clicks overlap instead.
      if(!isLayerEnabled(sound.id)){
        stopSound(sound.id, 0);
      }
      if(padEl) padEl.classList.add("playing");

      let set = playing.get(sound.id);
      if(!set){ set = new Set(); playing.set(sound.id, set); }
      const inst = { src, gain };
      set.add(inst);

      src.onended = () => {
        const set = playing.get(sound.id);
        if(set){
          set.delete(inst);
          if(set.size === 0){
            playing.delete(sound.id);
            if(padEl) padEl.classList.remove("playing");
          }
        }else{
          if(padEl) padEl.classList.remove("playing");
        }
      };

      src.start(0);

      // Successful play => update Recents + Learning score
      recordRecent(sound.id);
      bumpUsage(sound.id);
    }catch(e){
      console.error(e);
      setStatus(`Could not play "${sound.name}".`, true);
    }
  }

  // ---- Search + keyboard-first controls ----
  let searchDebounce = null;
  function scheduleSearchRender(){
    if(searchDebounce) clearTimeout(searchDebounce);
    searchDebounce = setTimeout(() => {
      selectedIdx = 0;
      renderPads();
    }, 90);
  }

  if(els.search){
    els.search.addEventListener("input", () => {
      setSearchQuery(els.search.value);
      scheduleSearchRender();
    });

    els.search.addEventListener("keydown", (e) => {
      // result navigation while focus remains in the input
      if(e.key === "ArrowDown"){ e.preventDefault(); clampSelected(+1); return; }
      if(e.key === "ArrowUp"){ e.preventDefault(); clampSelected(-1); return; }
      if(e.key === "Enter"){ e.preventDefault(); playSelected(); return; }
      if(e.key === "Escape"){
        if(String(searchQuery||"").trim()){
          e.preventDefault();
          setSearchQuery("");
          selectedIdx = 0;
          renderPads();
        }
      }
    });
  }

  if(els.searchClear){
    els.searchClear.addEventListener("click", (e) => {
      e.preventDefault();
      setSearchQuery("");
      selectedIdx = 0;
      renderPads();
      els.search?.focus();
    });
  }

  
  // Hotkey guard: do not run shortcuts while a text-entry control is focused
  function isTypingContext(el = document.activeElement){
    if(!el) return false;
    if(!!el.isContentEditable) return true;

    const tag = (el.tagName||"").toLowerCase();
    if(tag === "input" || tag === "textarea" || tag === "select") return true;

    const role = (el.getAttribute && el.getAttribute("role")) ? String(el.getAttribute("role")).toLowerCase() : "";
    if(role === "textbox" || role === "searchbox" || role === "combobox") return true;

    if(el.closest){
      const host = el.closest('input, textarea, select, [contenteditable="true"], [role="textbox"], [role="searchbox"], [role="combobox"]');
      if(host) return true;
    }
    return false;
  }

  function isTypingEvent(e){
    if(isTypingContext(document.activeElement)) return true;
    if(isTypingContext(e?.target || null)) return true;

    const path = (e && typeof e.composedPath === "function") ? e.composedPath() : null;
    if(path && path.length){
      for(const node of path){
        if(node && node.nodeType === 1 && isTypingContext(node)) return true;
      }
    }
    return false;
  }

  window.addEventListener("keydown", (e) => {
    const activeEl = document.activeElement;
    const isTypingField = isTypingEvent(e);
    const isSearchFocused = (activeEl === els.search);

    // Cmd/Ctrl+K focuses search
    if((e.ctrlKey || e.metaKey) && (e.key.toLowerCase() === "k")){
      e.preventDefault();
      els.search?.focus();
      try{ els.search?.select(); }catch(_){ }
      return;
    }

    const qActive = !!String(searchQuery || "").trim();

    // Escape clears and exits search
    if(e.key === "Escape"){
      if(qActive){
        if(!isTypingField || isSearchFocused){
          e.preventDefault();
          setSearchQuery("");
          selectedIdx = 0;
          renderPads();
        }
      }
      if(isSearchFocused){
        // Exit search mode even if already empty
        e.preventDefault();
        try{ els.search.blur(); }catch(_){ }
      }
      return;
    }

    // ---- STOP HOTKEYS ----
    // SPACE = Stop All (panic stop) (always instant)
    if(!isTypingField && e.code === "Space"){
      e.preventDefault();
      stopAll(0);
      return;
    }

    // SHIFT+S = Stop selected sound (uses Stop Fade)
    if(!isTypingField && e.shiftKey && !e.ctrlKey && !e.metaKey && !e.altKey && e.key.toLowerCase() === "s"){
      e.preventDefault();
      const sel = lastRendered[selectedIdx];
      if(sel) stopSound(sel.id, stopFadeMs);
      else stopAll(stopFadeMs);
      return;
    }

    // If a non-search typing field is focused, do not steal hotkeys
    if(isTypingField && !isSearchFocused) return;

    // Arrow navigation + Enter to play selected (when search is active)
    if(qActive){
      if(e.key === "ArrowDown"){ e.preventDefault(); clampSelected(+1); return; }
      if(e.key === "ArrowUp"){ e.preventDefault(); clampSelected(-1); return; }
      if(e.key === "Enter"){ e.preventDefault(); playSelected(); return; }
      if(!isSearchFocused && e.key === "Backspace"){
        e.preventDefault();
        const next = String(searchQuery || "").slice(0, -1);
        setSearchQuery(next);
        scheduleSearchRender();
        return;
      }
    }

    // While search input is focused, let it handle typing normally (after nav above)
    if(isSearchFocused) return;

    // Learning hotkeys 1–9/0 (global, not per-folder) *when not searching*
    if(!e.altKey && !e.ctrlKey && !e.metaKey && !qActive){
      const key = e.key;
      if(HOTKEY_KEYS.includes(key)){
        const id = hotkeyAssign[key];
        const s = id ? soundById.get(id) : null;
        if(s){
          e.preventDefault();
          playSound(s);
        }
        return; // digits are reserved for hotkeys when not searching
      }
    }

    // Type-anywhere to search (best UX for live ops)
    if(!e.altKey && !e.ctrlKey && !e.metaKey && e.key && e.key.length === 1){
      e.preventDefault();
      els.search?.focus();
      const next = String(searchQuery || "") + e.key;
      setSearchQuery(next);
      scheduleSearchRender();
    }
  });

  // ---- Category selection ----
  els.cats.addEventListener("click", (e) => {
    const btn = e.target.closest(".sbCat");
    if(!btn) return;
    activeCategoryId = btn.dataset.cat || "__all";
    // switching categories is a deliberate navigation: clear search so it doesn't feel "stuck"
    if(String(searchQuery||"").trim()) setSearchQuery("");
    selectedIdx = 0;
    renderCategories();
    renderPads();
  });

  
  // ---- Local manifest fallback ----
  async function loadLocalManifest(){
    try{
      const r = await fetch("./soundboard_manifest.json", { cache: "no-cache" });
      if(!r.ok) return false;
      const j = await r.json();
      if(!j || !Array.isArray(j.categories)) return false;

      categories = j.categories.map((c, ci) => ({
        id: `local_${ci}`,
        label: c.label || `Category ${ci+1}`,
        sounds: Array.isArray(c.sounds) ? c.sounds.map((s, si) => ({
          id: `local_${ci}_${si}`,
          name: s.name || `Sound ${si+1}`,
          mimeType: s.mimeType || "",
          modifiedTime: "local",
          downloadUrl: s.url,
        })) : []
      })).filter(c => c.sounds.length);

      indexSounds();

      activeCategoryId = "__all";
      renderCategories();
      renderPads();

      const total = categories.reduce((n,c)=>n + c.sounds.length, 0);
      if(total){
        setStatus(`Loaded ${total} sound(s) from local soundboard_manifest.json.`, false);
      }
      if(els.preload.checked){
        preloadAllVisible();
      }
      return total > 0;
    }catch(_){
      return false;
    }
  }

// ---- Drive config persistence ----
    // ---- Baked-in Drive config (public folder) ----
  // NOTE: In a static site this key is visible in source; restrict it by HTTP referrer + Drive API only.
  const DEFAULT_DRIVE_API_KEY = "AIzaSyCMdXo_5usjx4UcQkeDwbY1zl73HLO0AhA";
  const DEFAULT_DRIVE_FOLDER = "1S3MJnnsvpMKmE5pNKqdw2PxoYQeCEF54";

const CFG_KEY = "omjn_soundboard_drive_cfg_v1";
  function loadCfg(){
    try{ return JSON.parse(localStorage.getItem(CFG_KEY) || "{}"); }catch(_){ return {}; }
  }
  function saveCfg(){
    const cfg = {
      apiKey: String(els.apiKey.value||"").trim(),
      folder: String(els.folder.value||"").trim(),
      preload: !!els.preload.checked
    };
    localStorage.setItem(CFG_KEY, JSON.stringify(cfg));
  }

  
  // ---- Per-sound Layer (overlap) preference ----
  const LAYER_KEY = "omjn_soundboard_layer_v1";
  function loadLayerPrefs(){
    try{ return JSON.parse(localStorage.getItem(LAYER_KEY) || "{}"); }catch(_){ return {}; }
  }
  function saveLayerPrefs(){
    localStorage.setItem(LAYER_KEY, JSON.stringify(layerPrefs));
  }
  const layerPrefs = loadLayerPrefs();
  function isLayerEnabled(soundId){
    return !!layerPrefs[soundId];
  }
  function setLayerEnabled(soundId, enabled){
    if(enabled) layerPrefs[soundId] = true;
    else delete layerPrefs[soundId];
    saveLayerPrefs();
  }

const cfg = loadCfg();
  if(cfg.apiKey) els.apiKey.value = cfg.apiKey;
  if(cfg.folder) els.folder.value = cfg.folder;
  if(cfg.preload !== undefined) els.preload.checked = !!cfg.preload;

  // If user hasn't configured Drive yet, use baked-in defaults.
  if(!String(els.apiKey.value||"").trim()) els.apiKey.value = DEFAULT_DRIVE_API_KEY;
  if(!String(els.folder.value||"").trim()) els.folder.value = DEFAULT_DRIVE_FOLDER;
  saveCfg(); // persist defaults locally so you don't have to re-enter them


  els.apiKey.addEventListener("change", saveCfg);
  els.folder.addEventListener("change", saveCfg);
  els.preload.addEventListener("change", saveCfg);

// ---- Refresh sounds ----
async function refreshFromDrive(){
  saveCfg();
  const apiKey = String(els.apiKey.value||"").trim();
  const folderId = parseFolderId(els.folder.value);
  if(!apiKey || !folderId){
    setStatus("Please enter an API key and Drive folder.", true);
    return;
  }
  setStatus("Loading sounds from Drive…", false);
  try{
    const rootChildren = await driveList(apiKey, folderId);
    const subfolders = rootChildren.filter(isFolder);

    const rootSounds = rootChildren.filter(f => !isFolder(f) && isAudio(f));
    const cats = [];

    if(rootSounds.length){
      cats.push({
        id: "general",
        label: "General",
        sounds: rootSounds.map(f => ({
          id: f.id,
          name: f.name,
          mimeType: f.mimeType,
          modifiedTime: f.modifiedTime,
          downloadUrl: driveDownloadUrl(apiKey, f.id),
        }))
      });
    }

    // Load each subfolder as a category
    for(const sf of subfolders){
      let files = [];
      try{
        files = await driveList(apiKey, sf.id);
      }catch(e){
        console.warn("Subfolder list failed:", sf.name, e);
      }
      const aud = files.filter(f => !isFolder(f) && isAudio(f));
      if(!aud.length) continue;
      cats.push({
        id: sf.id,
        label: sf.name,
        sounds: aud.map(f => ({
          id: f.id,
          name: f.name,
          mimeType: f.mimeType,
          modifiedTime: f.modifiedTime,
          downloadUrl: driveDownloadUrl(apiKey, f.id),
        }))
      });
    }

    categories = cats;
    indexSounds();
    activeCategoryId = "__all";
    setSearchQuery("");
    selectedIdx = 0;
    renderCategories();
    renderPads();

    const total = categories.reduce((n,c) => n + c.sounds.length, 0);
    setStatus(`Loaded ${total} sound(s) across ${categories.length} category(ies).`, false);

    // Optional preload
    if(els.preload.checked){
      preloadAllVisible();
    }
  }catch(e){
    console.error(e);
    setStatus("Could not load Drive folder. Check API key, sharing, and folder ID.", true);
  }
}

els.refresh.addEventListener("click", refreshFromDrive);

// Try local manifest first (optional). Then auto-refresh from Drive using baked defaults.
(async () => {
  try{ await loadLocalManifest(); }catch(_){ }
  try{
    const hasKey = !!String(els.apiKey.value||"").trim();
    const hasFolder = !!String(els.folder.value||"").trim();
    if(hasKey && hasFolder) await refreshFromDrive();
  }catch(_){ }
})();

  async function preloadAllVisible(){
    const sounds = categories.flatMap(c => c.sounds);
    if(!sounds.length) return;

    setStatus(`Preloading ${sounds.length}…`, false);
    let ok = 0;
    for(const s of sounds){
      try{
        await ensureDecoded(s);
        ok++;
      }catch(_){}
    }
    setStatus(`Preloaded ${ok}/${sounds.length}.`, false);
    renderPads();
  }

  // ---- Live controls (minimal) ----
  function updateState(mut){
    const s = JSON.parse(JSON.stringify(state));
    mut(s);
    // normalize + theme
    state = s;
    OMJN.applyThemeToDocument(document, state);
    OMJN.publish(state);
    renderMeta();
  }

  function start(){
    updateState(s => {
      const eligible = (x) => x.status === "QUEUED";
      const pick = s.queue.find(eligible);
      if(!pick) return;

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

  function endToSplash(){
    updateState(s => {
      if(!s.currentSlotId){
        s.phase = "SPLASH";
        return;
      }
      const cur = s.queue.find(x=>x.id===s.currentSlotId);
      if(cur){ cur.status = "DONE"; cur.completedAt = Date.now(); }
      const idx = s.queue.findIndex(x=>x.id===cur.id);
      if(idx >= 0){
        const [moved] = s.queue.splice(idx, 1);
        s.queue.push(moved);
      }
      s.currentSlotId = null;
      s.phase = "SPLASH";
      s.timer.running = false;
      s.timer.startedAt = null;
      s.timer.elapsedMs = 0;
      s.timer.baseDurationMs = null;
    });
  }

  function addSeconds(delta){
    updateState(s => {
      const cur = s.queue.find(x=>x.id===s.currentSlotId);
      if(!cur) return;
      const base = (s.timer.baseDurationMs ?? (OMJN.effectiveMinutes(s, cur) * 60 * 1000));
      let next = base + (delta * 1000);
      const minMs = 30 * 1000;
      if(next < minMs) next = minMs;
      s.timer.baseDurationMs = next;
    });
  }

  function resetTime(){
    updateState(s => {
      const cur = s.queue.find(x=>x.id===s.currentSlotId);
      if(!cur) return;
      const baseMs = OMJN.effectiveMinutes(s, cur) * 60 * 1000;
      s.timer.baseDurationMs = baseMs;
      s.timer.elapsedMs = 0;
      s.timer.startedAt = s.timer.running ? Date.now() : null;
    });
  }

  els.start.addEventListener("click", start);
  els.pause.addEventListener("click", pause);
  els.resume.addEventListener("click", resume);
  els.end.addEventListener("click", endToSplash);
  els.minus30.addEventListener("click", () => addSeconds(-30));
  els.plus30.addEventListener("click", () => addSeconds(30));
  if(els.minus1) els.minus1.addEventListener("click", () => addSeconds(-60));
  if(els.minus5) els.minus5.addEventListener("click", () => addSeconds(-300));
  if(els.plus1) els.plus1.addEventListener("click", () => addSeconds(60));
  if(els.plus5) els.plus5.addEventListener("click", () => addSeconds(300));
  els.resetTime.addEventListener("click", resetTime);

  

// ---- Music embed pane ----
const SB_SCOPE = (() => {
  const p = (location.pathname || "").toLowerCase();
  return p.includes("/omjn/test") ? "test" : "prod";
})();

const EMBED_STORE_KEY = `omjn.sb.embeds.v1.${SB_SCOPE}`;
const EMBED_WIDTH_KEY = `omjn.sb.embedWidth.v1.${SB_SCOPE}`;

const DEFAULT_EMBEDS = [
  {
    id: "apple_openmic",
    name: "Apple Music — Open Mic Jam Night",
    provider: "apple",
    src: "https://embed.music.apple.com/us/playlist/open-mic-jam-night/pl.u-8aAVXGlf7bj2b0",
    height: 450,
    allow: "autoplay *; encrypted-media *; fullscreen *; clipboard-write",
    sandbox: "allow-forms allow-popups allow-same-origin allow-scripts allow-storage-access-by-user-activation allow-top-navigation-by-user-activation"
  },
  {
    id: "spotify_openmic",
    name: "Spotify — Open Mic Jam Night",
    provider: "spotify",
    src: "https://open.spotify.com/embed/playlist/3Gy0gpRkViCUgUrVVVQ9PX?utm_source=generator&theme=0",
    height: 352,
    allow: "autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture",
    sandbox: null
  }
];

function safeJsonParse(raw){
  try{ return JSON.parse(raw); }catch(_){ return null; }
}

function loadEmbedModel(){
  const raw = localStorage.getItem(EMBED_STORE_KEY);
  const obj = safeJsonParse(raw);
  return {
    selectedId: obj?.selectedId || DEFAULT_EMBEDS[0].id,
    embeds: Array.isArray(obj?.embeds) ? obj.embeds : []
  };
}

function saveEmbedModel(model){
  try{
    localStorage.setItem(EMBED_STORE_KEY, JSON.stringify(model));
  }catch(e){
    console.warn("Could not save embeds:", e);
  }
}

function getAllEmbeds(model){
  const customs = (model.embeds || []).filter(x => x && x.id && x.src);
  return [...DEFAULT_EMBEDS, ...customs];
}

function sanitizeUrl(url){
  try{
    const u = new URL(url, location.href);
    if(u.protocol !== "https:") return null;
    return u.toString();
  }catch(_){
    return null;
  }
}

function parseIframeCode(code){
  const str = String(code || "");
  const m = str.match(/<iframe[\s\S]*?\s+src\s*=\s*["']([^"']+)["'][\s\S]*?>/i);
  if(!m) return null;
  const src = sanitizeUrl(m[1]);
  if(!src) return null;

  const h = str.match(/\sheight\s*=\s*["']?(\d{2,4})["']?/i);
  const height = h ? Math.max(200, Math.min(900, parseInt(h[1], 10))) : 352;

  const allow = (str.match(/\sallow\s*=\s*["']([^"']+)["']/i)?.[1] || "").trim() || "autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture";
  const sandbox = (str.match(/\ssandbox\s*=\s*["']([^"']+)["']/i)?.[1] || "").trim() || null;

  return { src, height, allow, sandbox };
}

function openEmbedModal(){
  if(!els.embedModal) return;
  els.embedName.value = "";
  els.embedCode.value = "";
  els.embedModal.hidden = false;
  document.body.classList.add("modalOpen");
  setTimeout(() => els.embedName?.focus(), 0);
}

function closeEmbedModal(){
  if(!els.embedModal) return;
  els.embedModal.hidden = true;
  document.body.classList.remove("modalOpen");
}

function setEmbedPaneWidth(px){
  const val = Math.max(280, Math.min(760, px|0));
  document.documentElement.style.setProperty("--sbEmbedW", `${val}px`);
  try{ localStorage.setItem(EMBED_WIDTH_KEY, String(val)); }catch(_){}
}

function loadEmbedPaneWidth(){
  const raw = localStorage.getItem(EMBED_WIDTH_KEY);
  const v = parseInt(raw || "", 10);
  setEmbedPaneWidth(Number.isFinite(v) ? v : 420);
}


function renderEmbedSelect(model){
  if(!els.embedSelect) return;
  const all = getAllEmbeds(model);
  els.embedSelect.innerHTML = "";
  for(const e of all){
    const opt = document.createElement("option");
    opt.value = e.id;
    opt.textContent = e.name || e.id;
    els.embedSelect.appendChild(opt);
  }
  els.embedSelect.value = model.selectedId;
}

function renderEmbedFrame(model){
  if(!els.embedFrameWrap) return;
  const all = getAllEmbeds(model);
  const e = all.find(x => x.id === model.selectedId) || all[0];
  if(!e) return;

  els.embedFrameWrap.innerHTML = "";
  const iframe = document.createElement("iframe");
  iframe.src = e.src;
  iframe.height = String(e.height || 352);
  iframe.allow = e.allow || "autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture";
  iframe.loading = "lazy";
  iframe.referrerPolicy = "no-referrer";
  iframe.setAttribute("frameborder", "0");
  if(e.sandbox) iframe.setAttribute("sandbox", e.sandbox);
  els.embedFrameWrap.appendChild(iframe);

  // Remove button only for custom embeds
  const isDefault = DEFAULT_EMBEDS.some(d => d.id === e.id);
  if(els.embedRemove){
    els.embedRemove.disabled = isDefault;
    els.embedRemove.style.opacity = isDefault ? ".5" : "1";
  }
}

function initEmbeds(){
  if(!els.embedSelect || !els.embedFrameWrap) return;

  let model = loadEmbedModel();
  renderEmbedSelect(model);
  renderEmbedFrame(model);
  loadEmbedPaneWidth();

// Splitter (drag divider) to resize embed pane vs soundboard pane
if(els.splitHandle){
  const handle = els.splitHandle;
  const root = document.documentElement;

  function clampW(px){
    return Math.max(280, Math.min(760, px|0));
  }

  function applyW(px){
    const val = clampW(px);
    root.style.setProperty("--sbEmbedW", `${val}px`);
    try{ localStorage.setItem(EMBED_WIDTH_KEY, String(val)); }catch(_){}
  }

  // Initialize from stored width
  try{
    const raw = localStorage.getItem(EMBED_WIDTH_KEY);
    const v = parseInt(raw || "", 10);
    if(Number.isFinite(v)) applyW(v);
    else applyW(420);
  }catch(_){
    applyW(420);
  }

  let dragging = false;

  function getMainBounds(){
    // sbMain is the parent of panes
    const main = handle.parentElement;
    return main ? main.getBoundingClientRect() : null;
  }

  function onMove(e){
    if(!dragging) return;
    const b = getMainBounds();
    if(!b) return;
    const x = e.clientX;
    const newW = b.right - x;
    applyW(newW);
    e.preventDefault();
  }

  function stopDrag(){
    if(!dragging) return;
    dragging = false;
    document.body.classList.remove("sbResizing");
    window.removeEventListener("pointermove", onMove, {passive:false});
    window.removeEventListener("pointerup", stopDrag);
  }

  handle.addEventListener("pointerdown", (e) => {
    // left button only
    if(e.button !== 0) return;
    dragging = true;
    handle.setPointerCapture?.(e.pointerId);
    document.body.classList.add("sbResizing");
    window.addEventListener("pointermove", onMove, {passive:false});
    window.addEventListener("pointerup", stopDrag);
    e.preventDefault();
  });

  handle.addEventListener("dblclick", () => applyW(420));

  // Keyboard accessibility
  handle.addEventListener("keydown", (e) => {
    const step = e.shiftKey ? 80 : 20;
    if(e.key === "ArrowLeft"){
      e.preventDefault();
      const raw = root.style.getPropertyValue("--sbEmbedW").replace("px","").trim();
      const cur = parseInt(raw || localStorage.getItem(EMBED_WIDTH_KEY) || "420", 10);
      applyW(cur - step);
    }else if(e.key === "ArrowRight"){
      e.preventDefault();
      const raw = root.style.getPropertyValue("--sbEmbedW").replace("px","").trim();
      const cur = parseInt(raw || localStorage.getItem(EMBED_WIDTH_KEY) || "420", 10);
      applyW(cur + step);
    }
  });
}

  els.embedSelect.addEventListener("change", () => {
    model.selectedId = els.embedSelect.value;
    saveEmbedModel(model);
    renderEmbedFrame(model);
  });

  if(els.embedAdd) els.embedAdd.addEventListener("click", openEmbedModal);
  if(els.embedClose) els.embedClose.addEventListener("click", closeEmbedModal);
  if(els.embedCancel) els.embedCancel.addEventListener("click", closeEmbedModal);

  if(els.embedSave) els.embedSave.addEventListener("click", () => {
    const name = (els.embedName.value || "").trim() || "Custom Embed";
    const parsed = parseIframeCode(els.embedCode.value || "");
    if(!parsed){
      alert("Could not find a valid <iframe src=\"https://...\"> in that embed code.");
      return;
    }
    const id = `custom_${Date.now()}`;
    const custom = {
      id,
      name,
      provider: "custom",
      src: parsed.src,
      height: parsed.height,
      allow: parsed.allow,
      sandbox: parsed.sandbox
    };
    model.embeds = [...(model.embeds || []), custom];
    model.selectedId = id;
    saveEmbedModel(model);
    renderEmbedSelect(model);
    renderEmbedFrame(model);
    closeEmbedModal();
  });

  if(els.embedRemove) els.embedRemove.addEventListener("click", () => {
    const id = model.selectedId;
    if(DEFAULT_EMBEDS.some(d => d.id === id)) return;
    if(!confirm("Remove this custom embed?")) return;
    model.embeds = (model.embeds || []).filter(x => x.id !== id);
    model.selectedId = DEFAULT_EMBEDS[0].id;
    saveEmbedModel(model);
    renderEmbedSelect(model);
    renderEmbedFrame(model);
  });
}

initEmbeds();

// Safari autoplay note for embeds (dismiss on first interaction)
(function initSafariTip(){
  if(!els.safariTip || !els.embedFrameWrap) return;
  const ua = navigator.userAgent || "";
  const isSafari = /Safari/.test(ua) && !/Chrome|Chromium|Edg/.test(ua);
  const TIP_KEY = `omjn.sb.safariEmbedTipDismissed.v1.${SB_UI_SCOPE}`;
  if(!isSafari) return;
  try{
    const dismissed = localStorage.getItem(TIP_KEY) === "1";
    if(!dismissed) els.safariTip.hidden = false;
  }catch(_){
    els.safariTip.hidden = false;
  }
  const dismiss = () => {
    els.safariTip.hidden = true;
    try{ localStorage.setItem(TIP_KEY, "1"); }catch(_){}
  };
  els.embedFrameWrap.addEventListener("pointerdown", dismiss, { once:true });
  els.embedFrameWrap.addEventListener("keydown", (e) => {
    if(e.key === "Enter" || e.key === " "){ dismiss(); }
  });
})();


// ---- Meta render ----
  function renderMeta(){
    // Phase
    const ph = (state && state.phase) ? state.phase : "—";
    if(els.phase) els.phase.textContent = ph;

    // Phase dot styling
    if(els.phaseDot){
      els.phaseDot.classList.remove("good","warn","bad");
      if(ph === "LIVE") els.phaseDot.classList.add("good");
      else if(ph === "PAUSED") els.phaseDot.classList.add("warn");
    }

    // State-aware transport buttons (reduce mis-clicks)
    if(els.start)  els.start.disabled  = (ph !== "SPLASH");
    if(els.pause)  els.pause.disabled  = (ph !== "LIVE");
    if(els.resume) els.resume.disabled = (ph !== "PAUSED");
    if(els.end)    els.end.disabled    = !(ph === "LIVE" || ph === "PAUSED");

    // Now / Next / Deck
    const q = (state && Array.isArray(state.queue)) ? state.queue : [];
    const cur = q.find(x => x && x.id === state.currentSlotId) || null;
    if(els.now)  els.now.textContent  = (cur && cur.displayName) ? cur.displayName : "—";

    const pair = (typeof OMJN !== "undefined" && OMJN && typeof OMJN.computeNextTwo === "function")
      ? OMJN.computeNextTwo(state)
      : [null, null];
    const n1 = pair[0], n2 = pair[1];
    if(els.next) els.next.textContent = (n1 && n1.displayName) ? n1.displayName : "—";
    if(els.deck) els.deck.textContent = (n2 && n2.displayName) ? n2.displayName : "—";

    // Timer
    if(els.timer && typeof OMJN !== "undefined" && OMJN && typeof OMJN.computeTimer === "function" && typeof OMJN.formatMMSS === "function"){
      const t = OMJN.computeTimer(state) || {};
      els.timer.textContent = OMJN.formatMMSS(t.remainingMs || 0);
    }
  }

  // Tick timer display

  setInterval(renderMeta, 250);
  renderMeta();

  // Subscribe to state changes from operator/viewer
  OMJN.subscribe((s) => {
    state = s;
    OMJN.applyThemeToDocument(document, state);
    renderMeta();
  });

})();