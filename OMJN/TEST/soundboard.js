/* Soundboard page (public Google Drive folder or local) */
(() => {
  let state = OMJN.loadState();
  OMJN.applyThemeToDocument(document, state);

  // ---- DOM ----
  const els = {
    phase: document.getElementById("sbPhase"),
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
    resetTime: document.getElementById("sbResetTime"),
    stopAll: document.getElementById("sbStopAll"),

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

    enableOverlay: document.getElementById("sbEnable"),
    enableBtn: document.getElementById("sbEnableBtn"),
  };

  // ---- Audio engine ----
  const AudioCtx = window.AudioContext || window.webkitAudioContext;
  const ctx = new AudioCtx();
  let audioEnabled = false;

  // fileId -> { meta, buffer, loading:boolean }
  const soundCache = new Map();
  // soundKey -> current source node (for stop)
  const playing = new Map(); // soundId -> Set<AudioBufferSourceNode>

  function showEnableOverlay(show){
    els.enableOverlay.style.display = show ? "flex" : "none";
  }

  showEnableOverlay(true);
  els.enableBtn.addEventListener("click", async () => {
    try{
      await ctx.resume();
      audioEnabled = true;
      showEnableOverlay(false);
      setStatus("Audio enabled.", false);
    }catch(e){
      setStatus("Could not enable audio. Try clicking again.", true);
    }
  });

  function setStatus(msg, isErr=false){
    if(!els.status) return;
    els.status.textContent = msg;
    els.status.style.color = isErr ? "var(--danger,#ff6b6b)" : "";
  }

  function stopSound(soundId){
    const set = playing.get(soundId);
    if(!set || !set.size) return;
    // stop all currently playing instances of this sound
    for(const src of Array.from(set)){
      try{ src.stop(0); }catch(_){}
    }
    playing.delete(soundId);
    const padEl = document.querySelector(`.sbPad[data-sound-id="${CSS.escape(soundId)}"]`);
    if(padEl) padEl.classList.remove("playing");
  }

  function stopAll(){
    for(const [k, set] of playing.entries()){
      for(const src of Array.from(set)){
        try{ src.stop(0); }catch(_){ }
      }
    }
    playing.clear();
    // remove active state from pads
    document.querySelectorAll(".sbPad.playing").forEach(el => el.classList.remove("playing"));
  }

  els.stopAll.addEventListener("click", stopAll);

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
    for(const c of categories){
      for(const s of c.sounds){
        s._catLabel = c.label;
        s._catId = c.id;
        s._displayName = stripExt(s.name);
        s._nameNorm = norm(s._displayName);
        s._tokens = s._nameNorm.split(" ").filter(Boolean);
        s._acronym = s._tokens.map(t => t[0]).join("");
      }
    }
  }

  function setSearchQuery(q){
    searchQuery = String(q || "");
    if(els.search && els.search.value !== searchQuery) els.search.value = searchQuery;
    if(els.searchClear) els.searchClear.style.display = searchQuery.trim() ? "block" : "none";
  }

  // ---- UI rendering ----
  function renderCategories(){
    els.cats.innerHTML = "";
    const btnAll = document.createElement("button");
    btnAll.className = "sbCat" + (activeCategoryId==="__all" ? " active" : "");
    btnAll.dataset.cat="__all";
    btnAll.textContent = "All";
    els.cats.appendChild(btnAll);

    for(const c of categories){
      const b = document.createElement("button");
      b.className = "sbCat" + (activeCategoryId===c.id ? " active" : "");
      b.dataset.cat = c.id;
      const count = c.sounds.length;
      b.innerHTML = `<span>${escapeHtml(c.label)}</span><span class="sbCount">${count}</span>`;
      els.cats.appendChild(b);
    }
  }

  function renderPads(){
    els.pads.innerHTML = "";
    const q = String(searchQuery || "").trim();
    const qNorm = norm(q);
    const qTokens = qNorm ? qNorm.split(" ").filter(Boolean) : [];

    let soundsToShow = [];
    if(qNorm){
      // Global fuzzy search across all categories (fast, keyboard-first)
      const allSounds = categories.flatMap(c => c.sounds);
      const scored = [];
      for(const s of allSounds){
        const sc = scoreSound(qNorm, qTokens, s);
        if(sc > 0) scored.push({ s, sc });
      }
      scored.sort((a,b) => (b.sc - a.sc) || String(a.s._displayName||"").localeCompare(String(b.s._displayName||"")));
      soundsToShow = scored.map(x => x.s);
      els.padsTitle.textContent = "Results";
      if(els.resultMeta) els.resultMeta.textContent = soundsToShow.length
        ? `${soundsToShow.length} match(es) for “${q}” • Enter plays the selected result • 1–9/0 triggers the first 10 pads (when not typing).`
        : `No matches for “${q}”.`;
    }else{
      // Category view
      soundsToShow = (activeCategoryId === "__all")
        ? categories.flatMap(c => c.sounds)
        : (categories.find(c => c.id === activeCategoryId)?.sounds || []);

      els.padsTitle.textContent = (activeCategoryId === "__all")
        ? "All"
        : (categories.find(c => c.id === activeCategoryId)?.label || "—");
      if(els.resultMeta) els.resultMeta.textContent = "Tip: type anywhere to search • Enter plays the selected result • 1–9/0 triggers the first 10 pads (when not typing).";
    }

    lastRendered = soundsToShow;
    if(selectedIdx >= lastRendered.length) selectedIdx = 0;

    if(!soundsToShow.length){
      const empty = document.createElement("div");
      empty.className = "small";
      empty.style.opacity = ".9";
      empty.textContent = qNorm
        ? "No results. Try a different search."
        : "No sounds found. Add files to your Drive folder and hit Refresh.";
      els.pads.appendChild(empty);
      return;
    }

    soundsToShow.forEach((s, i) => {
      const wrap = document.createElement("div");
      wrap.className = "sbPadWrap";
      wrap.dataset.soundId = s.id;

      const pad = document.createElement("button");
      pad.type = "button";
      pad.className = "sbPad";
      pad.dataset.soundId = s.id;

      const hk = (i < 10) ? (i===9 ? "0" : String(i+1)) : "";
      pad.innerHTML = `
        <div class="sbPadTop">
          <div class="sbPadName">${qNorm ? highlightName(s._displayName || stripExt(s.name), qTokens) : escapeHtml(s._displayName || stripExt(s.name))}</div>
          ${hk ? `<div class="sbHotkey">${hk}</div>` : ``}
        </div>
        <div class="sbPadMeta">
          ${(qNorm || activeCategoryId === "__all") ? `<span class="sbPill">${escapeHtml(s._catLabel || "General")}</span>` : ``}
          <span class="sbLoad" id="load_${s.id}">—</span>
        </div>
      `;

      pad.addEventListener("click", () => {
        selectedIdx = i;
        updateSelected(false);
        playSound(s);
      });
      wrap.appendChild(pad);

      const controls = document.createElement("div");
      controls.className = "sbPadControls";
      controls.innerHTML = `
        <button type="button" class="sbMiniBtn sbStopBtn" data-sound-id="${escapeHtml(s.id)}">Stop</button>
        <button type="button" class="sbMiniBtn sbLayerBtn ${isLayerEnabled(s.id) ? "on" : ""}" data-sound-id="${escapeHtml(s.id)}" aria-pressed="${isLayerEnabled(s.id) ? "true" : "false"}">Layer</button>
      `;
      wrap.appendChild(controls);

      // wire control events
      controls.querySelector(".sbStopBtn")?.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();
        stopSound(s.id);
      });
      controls.querySelector(".sbLayerBtn")?.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();
        const enabled = !isLayerEnabled(s.id);
        setLayerEnabled(s.id, enabled);
        e.currentTarget.classList.toggle("on", enabled);
        e.currentTarget.setAttribute("aria-pressed", enabled ? "true" : "false");
      });

      els.pads.appendChild(wrap);

      // selected state
      if(i === selectedIdx) wrap.classList.add("selected");

      // update load label
      updateLoadLabel(s.id);
    });

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

      // slight gain to avoid surprises
      const gain = ctx.createGain();
      gain.gain.value = 1.0;

      src.connect(gain).connect(ctx.destination);
      // By default, clicking a pad restarts the sound.
      // If Layer is enabled for this sound, clicks overlap instead.
      if(!isLayerEnabled(sound.id)){
        stopSound(sound.id);
      }
      if(padEl) padEl.classList.add("playing");

      let set = playing.get(sound.id);
      if(!set){ set = new Set(); playing.set(sound.id, set); }
      set.add(src);

      src.onended = () => {
        const set = playing.get(sound.id);
        if(set){
          set.delete(src);
          if(set.size === 0){
            playing.delete(sound.id);
            if(padEl) padEl.classList.remove("playing");
          }
        }else{
          if(padEl) padEl.classList.remove("playing");
        }
      };

      src.start(0);
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

  window.addEventListener("keydown", (e) => {
    const tag = (document.activeElement && document.activeElement.tagName) ? document.activeElement.tagName.toLowerCase() : "";
    const isTypingField = (tag === "input" || tag === "textarea" || tag === "select");

    // Cmd/Ctrl+K focuses search
    if((e.ctrlKey || e.metaKey) && (e.key.toLowerCase() === "k")){
      e.preventDefault();
      els.search?.focus();
      try{ els.search?.select(); }catch(_){ }
      return;
    }

    // Escape clears search (when not typing in an input, or when input is search itself)
    if(e.key === "Escape" && String(searchQuery||"").trim()){
      if(!isTypingField || document.activeElement === els.search){
        e.preventDefault();
        setSearchQuery("");
        selectedIdx = 0;
        renderPads();
      }
      return;
    }

    // If a typing field is focused, do not steal other hotkeys (except the search input handler above)
    if(isTypingField) return;

    const qActive = !!String(searchQuery||"").trim();

    // Hotkeys 1–9/0 trigger the first 10 pads *when not searching*
    if(!e.altKey && !e.ctrlKey && !e.metaKey && !qActive){
      const key = e.key;
      let idx = -1;
      if(key >= "1" && key <= "9") idx = (parseInt(key, 10) - 1);
      if(key === "0") idx = 9;
      if(idx >= 0){
        const pads = [...document.querySelectorAll(".sbPad")];
        const pad = pads[idx];
        if(pad){ pad.click(); }
        return;
      }
    }

    // Arrow navigation + Enter to play selected (when search is active)
    if(qActive){
      if(e.key === "ArrowDown"){ e.preventDefault(); clampSelected(+1); return; }
      if(e.key === "ArrowUp"){ e.preventDefault(); clampSelected(-1); return; }
      if(e.key === "Enter"){ e.preventDefault(); playSelected(); return; }
      if(e.key === "Backspace"){
        e.preventDefault();
        const next = String(searchQuery || "").slice(0, -1);
        setSearchQuery(next);
        scheduleSearchRender();
        return;
      }
    }

    // Type-anywhere to search (best UX for live ops)
    if(!e.altKey && !e.ctrlKey && !e.metaKey && e.key && e.key.length === 1){
      // prevent browser scroll / quickfind behavior (spacebar especially)
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

  // Try local manifest first (optional), then user can refresh from Drive.
  // Try local manifest first (optional). Then auto-refresh from Drive using baked defaults.
  (async () => {
    try{ await loadLocalManifest(); }catch(_){}
    // Auto-populate from Drive once on load
    try{
      const hasKey = !!String(els.apiKey.value||"").trim();
      const hasFolder = !!String(els.folder.value||"").trim();
      if(hasKey && hasFolder) els.refresh.click();
    }catch(_){}
  })();


  // ---- Refresh sounds ----
  els.refresh.addEventListener("click", async () => {
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
  });

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
      const pick = s.queue.find(x => x.id === s.selectedNextId && eligible(x)) || s.queue.find(eligible);
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

      const next = s.queue.find(x => x.id !== pick.id && eligible(x));
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

  function endToSplash(){
    updateState(s => {
      if(!s.currentSlotId){
        s.phase = "SPLASH";
        return;
      }
      const cur = s.queue.find(x=>x.id===s.currentSlotId);
      if(cur){ cur.status = "DONE"; cur.completedAt = Date.now(); }
      s.currentSlotId = null;
      s.phase = "SPLASH";
      s.timer.running = false;
      s.timer.startedAt = null;
      s.timer.elapsedMs = 0;
      s.timer.baseDurationMs = null;
      const next = s.queue.find(x=>x.status==="QUEUED");
      s.selectedNextId = next ? next.id : null;
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
  els.resetTime.addEventListener("click", resetTime);

  // ---- Meta render ----
  function renderMeta(){
    els.phase.textContent = state.phase || "—";
    const cur = state.queue.find(x=>x.id===state.currentSlotId) || null;
    els.now.textContent = cur?.displayName || "—";
    const [n1, n2] = OMJN.computeNextTwo(state);
    els.next.textContent = n1?.displayName || "—";
    els.deck.textContent = n2?.displayName || "—";

    const t = OMJN.computeTimer(state);
    els.timer.textContent = OMJN.formatMMSS(t.remainingMs || 0);
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