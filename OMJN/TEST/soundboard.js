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
  const playing = new Map();

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

  function stopAll(){
    for(const [k, src] of playing.entries()){
      try{ src.stop(0); }catch(_){}
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
    const soundsToShow = (activeCategoryId==="__all")
      ? categories.flatMap(c => c.sounds.map(s => ({...s, _cat:c.label})))
      : (categories.find(c=>c.id===activeCategoryId)?.sounds || []).map(s => ({...s, _cat:null}));

    els.padsTitle.textContent = (activeCategoryId==="__all")
      ? "All"
      : (categories.find(c=>c.id===activeCategoryId)?.label || "—");

    if(!soundsToShow.length){
      const empty = document.createElement("div");
      empty.className = "small";
      empty.style.opacity = ".9";
      empty.textContent = "No sounds found. Add files to your Drive folder and hit Refresh.";
      els.pads.appendChild(empty);
      return;
    }

    soundsToShow.forEach((s, i) => {
      const pad = document.createElement("button");
      pad.className = "sbPad";
      pad.dataset.soundId = s.id;

      const hk = (i < 10) ? (i===9 ? "0" : String(i+1)) : "";
      pad.innerHTML = `
        <div class="sbPadTop">
          <div class="sbPadName">${escapeHtml(stripExt(s.name))}</div>
          ${hk ? `<div class="sbHotkey">${hk}</div>` : ``}
        </div>
        <div class="sbPadMeta">
          ${s._cat ? `<span class="sbPill">${escapeHtml(s._cat)}</span>` : ``}
          <span class="sbLoad" id="load_${s.id}">—</span>
        </div>
      `;

      pad.addEventListener("click", () => playSound(s));
      els.pads.appendChild(pad);

      // update load label
      updateLoadLabel(s.id);
    });
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
      if(padEl) padEl.classList.add("playing");

      const buffer = await ensureDecoded(sound);
      const src = ctx.createBufferSource();
      src.buffer = buffer;

      // slight gain to avoid surprises
      const gain = ctx.createGain();
      gain.gain.value = 1.0;

      src.connect(gain).connect(ctx.destination);

      // stop previous instance of same sound if still running
      const prev = playing.get(sound.id);
      if(prev){ try{ prev.stop(0); }catch(_){} }
      playing.set(sound.id, src);

      src.onended = () => {
        if(playing.get(sound.id) === src) playing.delete(sound.id);
        if(padEl) padEl.classList.remove("playing");
      };

      src.start(0);
    }catch(e){
      console.error(e);
      setStatus(`Could not play "${sound.name}".`, true);
    }
  }

  // ---- Keyboard hotkeys (1-9/0) ----
  window.addEventListener("keydown", (e) => {
    if(e.altKey || e.ctrlKey || e.metaKey) return;
    const tag = (document.activeElement && document.activeElement.tagName) ? document.activeElement.tagName.toLowerCase() : "";
    if(tag === "input" || tag === "textarea" || tag === "select") return;

    const key = e.key;
    let idx = -1;
    if(key >= "1" && key <= "9") idx = (parseInt(key, 10) - 1);
    if(key === "0") idx = 9;
    if(idx < 0) return;

    const pads = [...document.querySelectorAll(".sbPad")];
    const pad = pads[idx];
    if(!pad) return;
    pad.click();
  });

  // ---- Category selection ----
  els.cats.addEventListener("click", (e) => {
    const btn = e.target.closest(".sbCat");
    if(!btn) return;
    activeCategoryId = btn.dataset.cat || "__all";
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

  const cfg = loadCfg();
  if(cfg.apiKey) els.apiKey.value = cfg.apiKey;
  if(cfg.folder) els.folder.value = cfg.folder;
  if(cfg.preload !== undefined) els.preload.checked = !!cfg.preload;

  els.apiKey.addEventListener("change", saveCfg);
  els.folder.addEventListener("change", saveCfg);
  els.preload.addEventListener("change", saveCfg);

  // Try local manifest first (optional), then user can refresh from Drive.
  loadLocalManifest();


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
      activeCategoryId = "__all";
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