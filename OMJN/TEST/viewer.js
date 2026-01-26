/* Viewer UI */
(() => {
  let state = OMJN.loadState();
  OMJN.applyThemeToDocument(document, state);

  let lastRemainingMs = null;
  let lastSlotId = null;
  let overtimeFlashTimeout = null;

  let lastPhase = state.phase;
  let startIntroPending = false;
  let startIntroTimeout = null;
  let lastCue = null;

  // Default QR image shown when a performer uses a QR layout but has no custom upload.
  const DEFAULT_QR_SRC = "./assets/OMJN-QR.png";

  const bg = document.getElementById("bg");
  const root = document.getElementById("root");
  const overlay = document.getElementById("overlay");
  const splashInfo = document.getElementById("splashInfo");
  const liveFooterBar = document.getElementById("liveFooterBar");

  // Sponsor bug overlay
  const sponsorLayer = document.getElementById("sponsorLayer");
  const sponsorBug = document.getElementById("sponsorBug");
  const sponsorImg = document.getElementById("sponsorImg");
  const SPONSOR_VIEWER_STATUS_KEY = "omjn.sponsorBug.viewerStatus.v1";

 // Crowd Prompts overlay (full-screen text slide)
  const crowdLayer = document.getElementById("crowdLayer");
  const crowdTitleEl = document.getElementById("crowdTitle");
  const crowdLinesEl = document.getElementById("crowdLines");
  const crowdFooterEl = document.getElementById("crowdFooter");


  const vMainCard = document.getElementById("vMainCard");
  const nowName = document.getElementById("nowName");
  const timerEl = document.getElementById("timer");
  const chipState = document.getElementById("chipState");
  const chipType = document.getElementById("chipType");
  const chipOver = document.getElementById("chipOver");
  const chipWarn = document.getElementById("chipWarn");
  const chipFinal = document.getElementById("chipFinal");
  const liveNextUp = document.getElementById("liveNextUp");
  const liveOnDeck = document.getElementById("liveOnDeck");

  const startBanner = document.getElementById("startBanner");
  const startBannerName = document.getElementById("startBannerName");


  const vMedia = document.getElementById("vMedia");
  const donationCard = document.getElementById("donationCard");
  const mediaBox = document.getElementById("mediaBox");

  const mediaImg = document.getElementById("mediaImg");
  const mediaEmpty = document.getElementById("mediaEmpty");
  const donationText = document.getElementById("donationText");

  const sNext = document.getElementById("sNext");
  const sDeck = document.getElementById("sDeck");
  const sNextSub = document.getElementById("sNextSub");
  const sDeckSub = document.getElementById("sDeckSub");

  const hbLineup = document.getElementById("hbLineup");
  const hbLiveLineup = document.getElementById("hbLiveLineup");

  // Mic visualizer
  const vVizWrap = document.getElementById("vVizWrap");
  const vViz = document.getElementById("vViz");
  const btnVizMic = document.getElementById("btnVizMic");

  // Operator uses this to show Viewer connection status
  const VIEWER_HEARTBEAT_KEY = "omjn.viewerHeartbeat.v1";
  setInterval(() => {
    try{ localStorage.setItem(VIEWER_HEARTBEAT_KEY, String(Date.now())); }catch(_){ }
  }, 1000);

  let currentAssetUrl = null;
  let lastMediaKey = null;
  let lastBgPath = null;

  // Sponsor bug runtime
  let currentSponsorObjectUrl = null;
  let lastSponsorKey = null;
  let sponsorLoadToken = 0;

  // --- Visualizer runtime ---
  const viz = {
    stream: null,
    audioCtx: null,
    analyser: null,
    data: null,
    raf: null,
    running: false,
    dpr: 1,
  };

  function vizEnabled(){
    return !!(state.viewerPrefs?.visualizerEnabled);
  }
  function vizSensitivity(){
    const n = Number(state.viewerPrefs?.visualizerSensitivity);
    return Number.isFinite(n) ? Math.max(0.25, Math.min(4, n)) : 1.0;
  }

  function vizShouldRender(){
    return state.phase === "LIVE" && vizEnabled() && !!viz.analyser && !!vVizWrap;
  }

  function resizeVizCanvas(){
    if(!vViz) return;
    const rect = vViz.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    viz.dpr = dpr;
    const w = Math.max(1, Math.round(rect.width * dpr));
    const h = Math.max(1, Math.round(rect.height * dpr));
    if(vViz.width !== w) vViz.width = w;
    if(vViz.height !== h) vViz.height = h;
  }

  function getAccent(){
    const c = getComputedStyle(document.documentElement).getPropertyValue("--accent").trim();
    return c || "#00c2ff";
  }

  function drawRoundedRect(ctx, x, y, w, h, r){
    const rr = Math.max(0, Math.min(r, Math.min(w, h) / 2));
    if(typeof ctx.roundRect === "function"){
      ctx.beginPath();
      ctx.roundRect(x, y, w, h, rr);
      ctx.fill();
      return;
    }
    // fallback path
    ctx.beginPath();
    ctx.moveTo(x + rr, y);
    ctx.lineTo(x + w - rr, y);
    ctx.quadraticCurveTo(x + w, y, x + w, y + rr);
    ctx.lineTo(x + w, y + h - rr);
    ctx.quadraticCurveTo(x + w, y + h, x + w - rr, y + h);
    ctx.lineTo(x + rr, y + h);
    ctx.quadraticCurveTo(x, y + h, x, y + h - rr);
    ctx.lineTo(x, y + rr);
    ctx.quadraticCurveTo(x, y, x + rr, y);
    ctx.closePath();
    ctx.fill();
  }

  function renderVizFrame(){
    if(!vizShouldRender()){
      viz.running = false;
      viz.raf = null;
      return;
    }

    const ctx = vViz.getContext("2d", { alpha: true });
    if(!ctx){
      viz.running = false;
      viz.raf = null;
      return;
    }

    const w = vViz.width;
    const h = vViz.height;
    ctx.clearRect(0, 0, w, h);

    viz.analyser.getByteFrequencyData(viz.data);

    const bars = 64; // TV-friendly
    const mid = h / 2;
    const gap = Math.max(1, Math.round(2 * viz.dpr));
    const barW = Math.max(1, Math.floor((w - (gap * (bars - 1))) / bars));
    const stride = Math.max(1, Math.floor(viz.data.length / bars));

    const accent = getAccent();
    ctx.fillStyle = accent;

    const sens = vizSensitivity();
    const maxHalf = Math.max(1, Math.floor(mid - 6 * viz.dpr));
    const radius = Math.max(2, Math.round(6 * viz.dpr));

    for(let i = 0; i < bars; i++){
      const v = viz.data[i * stride] / 255; // 0..1
      // soft curve so lows still move, highs don't peg
      const curved = Math.pow(v, 0.65);
      const amp = Math.min(1, curved * sens);
      const bh = Math.max(1, Math.floor(amp * maxHalf));
      const x = i * (barW + gap);

      // draw top and bottom mirrored from center
      drawRoundedRect(ctx, x, mid - bh, barW, bh, radius);
      drawRoundedRect(ctx, x, mid, barW, bh, radius);
    }

    viz.raf = requestAnimationFrame(renderVizFrame);
  }

  async function enableMicForVisualizer(){
    try{
      if(viz.stream) return true;
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      viz.stream = stream;

      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      viz.audioCtx = new AudioCtx();
      const src = viz.audioCtx.createMediaStreamSource(stream);
      viz.analyser = viz.audioCtx.createAnalyser();
      viz.analyser.fftSize = 1024;
      viz.analyser.smoothingTimeConstant = 0.85;
      src.connect(viz.analyser);
      viz.data = new Uint8Array(viz.analyser.frequencyBinCount);

      // canvas sizing
      resizeVizCanvas();
      window.addEventListener("resize", resizeVizCanvas);

      // only render when LIVE
      maybeStartViz();
      return true;
    }catch(err){
      console.warn("Mic visualizer enable failed:", err);
      return false;
    }
  }

  function maybeStartViz(){
    if(!vizShouldRender()){
      if(vVizWrap) vVizWrap.style.display = "none";
      if(viz.running && viz.raf){
        cancelAnimationFrame(viz.raf);
        viz.raf = null;
      }
      viz.running = false;
      return;
    }
    if(vVizWrap) vVizWrap.style.display = "block";
    if(!viz.running){
      viz.running = true;
      viz.raf = requestAnimationFrame(renderVizFrame);
    }
  }

  function updateVizSetupButton(){
    if(!btnVizMic) return;
    const shouldShow = (state.phase === "SPLASH") && vizEnabled() && !viz.stream;
    btnVizMic.style.display = shouldShow ? "inline-flex" : "none";
  }

  function setBg(){
    const path = state.splash?.backgroundAssetPath || "./assets/splash_BG.jpg";
    if(path === lastBgPath) return;
    lastBgPath = path;
    bg.style.backgroundImage = `url('${path}')`;
  }

  function renderHouseBandLineup(targetEl, opts={}){
    if(!targetEl) return;
    const top = OMJN.getHouseBandTopPerCategory(state);
    const fmt = (state.viewerPrefs?.hbFooterFormat || "categoryFirst");
    targetEl.innerHTML = "";
    if(!top.length) return;

    const instrumentLabel = (m) => {
      if(!m) return "";
      if(m.instrumentId === "custom") return OMJN.sanitizeText(m.customInstrument || "");
      return (OMJN.houseBandInstrumentOptions().find(x => x.id === m.instrumentId)?.label || "");
    };

    for(const item of top){
      const m = item.member;
      const chip = document.createElement("span");
      chip.className = "hbChip" + (opts.compact ? " hbChipFooter" : "");

      const name = OMJN.sanitizeText(m?.name || "");
      const inst = instrumentLabel(m);
      const cat = item.categoryLabel;
      let txt = "";

      const catLower = (cat || "").toLowerCase();
      const instLower = (inst || "").toLowerCase();
      const instExtra = (inst && instLower && instLower !== catLower) ? inst : "";

      if(fmt === "nameFirst"){
        if(name){
          txt = instExtra ? `${name} (${cat} - ${instExtra})` : `${name} (${cat})`;
        }else if(inst){
          txt = instExtra ? `${instExtra} (${cat})` : `${cat}: ${inst}`;
        }else{
          txt = cat;
        }
      }else{
        // categoryFirst (default)
        if(name && instExtra) txt = `${cat}: ${name} (${instExtra})`;
        else if(name) txt = `${cat}: ${name}`;
        else if(inst) txt = `${cat}: ${inst}`;
        else txt = cat;
      }

      chip.textContent = txt;
      targetEl.appendChild(chip);
    }
  }


  function clearCardCues(){
    if(!vMainCard) return;
    vMainCard.classList.remove("pulseWarn","pulseFinal","overtimeFlash","pulseWarnOnce","pulseFinalOnce","cue-warn","cue-final","cue-overtime");
    if(overtimeFlashTimeout){
      clearTimeout(overtimeFlashTimeout);
      overtimeFlashTimeout = null;
    }
  }

  function triggerOvertimeFlash(){
    if(!vMainCard) return;
    // Remove pulse so flash stands out
    vMainCard.classList.remove("pulseWarn","pulseFinal");

    // Restart animation reliably
    vMainCard.classList.remove("overtimeFlash");
    void vMainCard.offsetWidth; // force reflow
    vMainCard.classList.add("overtimeFlash");

    if(overtimeFlashTimeout) clearTimeout(overtimeFlashTimeout);
    overtimeFlashTimeout = setTimeout(() => {
      vMainCard.classList.remove("overtimeFlash");
      overtimeFlashTimeout = null;
    }, 1050);
  }

  
  function triggerStartIntro(name){
    if(!root) return;
    if(startIntroTimeout){
      clearTimeout(startIntroTimeout);
      startIntroTimeout = null;
    }
    if(startBannerName) startBannerName.textContent = name || "—";
    if(startBanner) startBanner.style.display = "flex";
    root.classList.add("startIntro");
    startIntroTimeout = setTimeout(() => {
      root.classList.remove("startIntro");
      if(startBanner) startBanner.style.display = "none";
      startIntroTimeout = null;
    }, 1600);
  }

function applyCardCues(remainingMs, warnAtMs, finalAtMs){
    if(!vMainCard) return;

    // One-time flash when crossing into overtime
    if(lastRemainingMs !== null && lastRemainingMs > 0 && remainingMs <= 0){
      triggerOvertimeFlash();
    }

    // Cue state (color shift + gentle glow), plus a one-time pulse when crossing thresholds
    const cue = (remainingMs <= 0) ? "overtime"
      : (remainingMs <= finalAtMs) ? "final"
      : (remainingMs <= warnAtMs) ? "warn"
      : "normal";

    vMainCard.classList.remove("cue-warn","cue-final","cue-overtime");
    if(cue === "warn") vMainCard.classList.add("cue-warn");
    if(cue === "final") vMainCard.classList.add("cue-final");
    if(cue === "overtime") vMainCard.classList.add("cue-overtime");

    // One-time pulse when entering warn/final (not continuous)
    vMainCard.classList.remove("pulseWarnOnce","pulseFinalOnce");
    if(lastCue && lastCue !== cue){
      if(cue === "warn"){
        vMainCard.classList.add("pulseWarnOnce");
        setTimeout(() => vMainCard.classList.remove("pulseWarnOnce"), 750);
      } else if(cue === "final"){
        vMainCard.classList.add("pulseFinalOnce");
        setTimeout(() => vMainCard.classList.remove("pulseFinalOnce"), 750);
      }
    }
    lastCue = cue;

    lastRemainingMs = remainingMs;
  }

  async function setMedia(slot){
    // Avoid expensive IndexedDB reads + image reloads on every 250ms tick.
    const media = slot?.media || {};
    const mediaKey = slot
      ? `${slot.id}|${media.mediaLayout || ""}|${media.imageAssetId || ""}`
      : "none";
    if(mediaKey === lastMediaKey) return;
    lastMediaKey = mediaKey;

    // Clear old URL
    if(currentAssetUrl){
      URL.revokeObjectURL(currentAssetUrl);
      currentAssetUrl = null;
    }

    if(!slot){
      mediaBox.style.display = "none";
      mediaImg.style.display = "none";
      mediaEmpty.style.display = "none";
      return;
    }

    const layout = media.mediaLayout || "NONE";
    const hasUploaded = !!media.imageAssetId;
    const usesDefaultQr = !hasUploaded && ["QR_ONLY","IMAGE_PLUS_QR"].includes(layout);

    const wantImage = ["IMAGE_ONLY","QR_ONLY","IMAGE_PLUS_QR"].includes(layout) && (hasUploaded || usesDefaultQr);

    if(!wantImage){
      mediaBox.style.display = "none";
      mediaImg.style.display = "none";
      mediaEmpty.style.display = "none";
      return;
    }

    // If the performer is set to a QR layout but has no custom upload, show the site default QR.
    if(usesDefaultQr){
      mediaImg.src = DEFAULT_QR_SRC;
      mediaImg.style.display = "block";
      mediaEmpty.style.display = "none";
      mediaBox.style.display = "flex";
      return;
    }

    const blob = await OMJN.getAsset(media.imageAssetId);
    if(!blob){
      // If the uploaded asset can't be loaded (e.g., cleared storage), fall back to the default QR for QR layouts.
      if(["QR_ONLY","IMAGE_PLUS_QR"].includes(layout)){
        mediaImg.src = DEFAULT_QR_SRC;
        mediaImg.style.display = "block";
        mediaEmpty.style.display = "none";
        mediaBox.style.display = "flex";
      } else {
        mediaBox.style.display = "none";
        mediaImg.style.display = "none";
        mediaEmpty.style.display = "none";
      }
      return;
    }

    currentAssetUrl = URL.createObjectURL(blob);
    mediaImg.src = currentAssetUrl;
    mediaImg.style.display = "block";
    mediaEmpty.style.display = "none";
    mediaBox.style.display = "flex";
  }

  // --- Sponsor bug ---
  const SPONSOR_BASE_PAD = 48; // match viewerOverlay padding

  function getSponsorCfg(){
    const d = OMJN.defaultState();
    return state.viewerPrefs?.sponsorBug || d.viewerPrefs.sponsorBug;
  }

  function writeSponsorStatus(payload){
    try{
      const obj = Object.assign({ at: Date.now() }, payload || {});
      localStorage.setItem(SPONSOR_VIEWER_STATUS_KEY, JSON.stringify(obj));
    }catch(_){ }
  }

  function hideSponsor(reason){
    if(sponsorLayer) sponsorLayer.style.display = "none";
    if(currentSponsorObjectUrl){
      try{ URL.revokeObjectURL(currentSponsorObjectUrl); }catch(_){ }
      currentSponsorObjectUrl = null;
    }
    if(sponsorImg) sponsorImg.src = "";
    writeSponsorStatus({ ok: true, hidden: true, reason: reason || "hidden" });
  }

  async function setSponsorBug(){
    if(!sponsorLayer || !sponsorBug || !sponsorImg) return;

    const cfg = getSponsorCfg() || {};
    const url = String(cfg.url || "").trim();
    const footerVisible = !!(liveFooterBar && liveFooterBar.style.display !== "none" && !liveFooterBar.hidden);

    // Hide sponsor bug during Crowd Prompts slides (clean interstitial)
    const crowdOn = !!(state.viewerPrefs?.crowdPrompts?.enabled);
    if(crowdOn){
      hideSponsor("crowd-prompts");
      return;
    }

    // Max size cap: % of current viewport (vmin)
    const maxPctRaw = Number(cfg.maxSizePct ?? 18);
    const maxPct = Number.isFinite(maxPctRaw) ? Math.max(5, Math.min(25, maxPctRaw)) : 18;
    const vmin = Math.max(1, Math.min(window.innerWidth || 1, window.innerHeight || 1));
    const sponsorCapPx = Math.max(1, Math.round(vmin * (maxPct / 100)));

    const key = JSON.stringify({
      enabled: !!cfg.enabled,
      liveOnly: !!cfg.showLiveOnly,
      phase: state.phase,
      sourceType: cfg.sourceType || "upload",
      uploadAssetId: cfg.uploadAssetId || null,
      url,
      position: cfg.position || "TR",
      scale: cfg.scale,
      maxSizePct: cfg.maxSizePct,
      sponsorCapPx,
      opacity: cfg.opacity,
      safeMargin: cfg.safeMargin,
      footerVisible
    });
    if(key === lastSponsorKey) return;
    lastSponsorKey = key;

    const shouldShow = !!cfg.enabled && (!cfg.showLiveOnly || state.phase === "LIVE");
    if(!shouldShow){
      hideSponsor(cfg.enabled ? "not-live" : "disabled");
      return;
    }

    // Layout
    const pos = String(cfg.position || "TR").toUpperCase();
    const safe = Math.max(0, Math.min(200, parseInt(cfg.safeMargin ?? 16, 10) || 0));
    const pad = SPONSOR_BASE_PAD + safe;

    let bottomExtra = 0;
    if(footerVisible && (pos === "BL" || pos === "BR")){
      try{
        const r = liveFooterBar.getBoundingClientRect();
        bottomExtra = Math.round(r.height + 18);
      }catch(_){ }
    }

    sponsorBug.classList.remove("posTL","posTR","posBL","posBR");
    sponsorBug.classList.add("pos" + (pos === "TL" || pos === "TR" || pos === "BL" || pos === "BR" ? pos : "TR"));

    sponsorBug.style.top = "";
    sponsorBug.style.right = "";
    sponsorBug.style.bottom = "";
    sponsorBug.style.left = "";

    if(pos === "TL"){
      sponsorBug.style.top = pad + "px";
      sponsorBug.style.left = pad + "px";
    }else if(pos === "TR"){
      sponsorBug.style.top = pad + "px";
      sponsorBug.style.right = pad + "px";
    }else if(pos === "BL"){
      sponsorBug.style.bottom = (pad + bottomExtra) + "px";
      sponsorBug.style.left = pad + "px";
    }else{
      sponsorBug.style.bottom = (pad + bottomExtra) + "px";
      sponsorBug.style.right = pad + "px";
    }

    const scale = Math.max(0.25, Math.min(2, Number(cfg.scale ?? 1)));
    const opacity = Math.max(0, Math.min(1, Number(cfg.opacity ?? 1)));
    sponsorBug.style.setProperty("--sponsorScale", String(scale));
    sponsorBug.style.setProperty("--sponsorCap", sponsorCapPx + "px");
    sponsorBug.style.opacity = String(opacity);

    // Pick source (chosen type, then fallback)
    const prefer = (cfg.sourceType === "url") ? ["url","upload"] : ["upload","url"];

    let used = null;
    let blob = null;
    for(const m of prefer){
      if(m === "upload" && cfg.uploadAssetId){
        try{ blob = await OMJN.getAsset(cfg.uploadAssetId); }catch(_){ blob = null; }
        if(blob){ used = "upload"; break; }
      }
      if(m === "url" && url){
        used = "url";
        break;
      }
    }

    if(!used){
      hideSponsor("missing-source");
      writeSponsorStatus({ ok:false, hidden:true, error:"missing-source" });
      return;
    }

    // Clear prior object url if switching away from upload
    if(used !== "upload" && currentSponsorObjectUrl){
      try{ URL.revokeObjectURL(currentSponsorObjectUrl); }catch(_){ }
      currentSponsorObjectUrl = null;
    }

    if(used === "upload"){
      if(currentSponsorObjectUrl){
        try{ URL.revokeObjectURL(currentSponsorObjectUrl); }catch(_){ }
      }
      currentSponsorObjectUrl = URL.createObjectURL(blob);
      sponsorImg.onload = null;
      sponsorImg.onerror = null;
      sponsorImg.src = currentSponsorObjectUrl;
      sponsorLayer.style.display = "block";
      writeSponsorStatus({ ok:true, hidden:false, source:"upload" });
      return;
    }

    // URL source: validate load
    const tok = ++sponsorLoadToken;
    const loaded = await new Promise(resolve => {
      sponsorImg.onload = () => resolve(true);
      sponsorImg.onerror = () => resolve(false);
      sponsorImg.src = url;
    });
    if(tok != sponsorLoadToken) return; // stale update

    if(loaded){
      sponsorLayer.style.display = "block";
      writeSponsorStatus({ ok:true, hidden:false, source:"url" });
    }else{
      sponsorLayer.style.display = "none";
      sponsorImg.src = "";
      writeSponsorStatus({ ok:false, hidden:true, source:"url", error:"bad-url" });
    }
  }



  // --- Crowd Prompts (Viewer) ---
  function getCrowdCfg(){
    const d = OMJN.defaultState();
    return state.viewerPrefs?.crowdPrompts || d.viewerPrefs.crowdPrompts;
  }

  function getActiveCrowdPreset(cfg){
    if(!cfg) return null;
    const presets = Array.isArray(cfg.presets) ? cfg.presets : [];
    const id = String(cfg.activePresetId || "");
    return presets.find(p => p && String(p.id) === id) || presets[0] || null;
  }

  function renderCrowdPrompts(){
    if(!root || !crowdLayer) return;

    const cfg = getCrowdCfg() || {};
    const enabled = !!cfg.enabled;

    root.classList.toggle("isCrowd", enabled);
    crowdLayer.setAttribute("aria-hidden", enabled ? "false" : "true");

    if(!enabled) return;

    const p = getActiveCrowdPreset(cfg) || {};
    let title = String(p.title || "").trim();
    const footer = String(p.footer || "").trim();
    const rawLines = Array.isArray(p.lines) ? p.lines : [];
    const lines = rawLines.map(v => String(v || "").trim()).filter(v => v.length);

    if(!title && !lines.length && !footer){
      title = "CROWD PROMPT";
      lines.push("Configure prompts in Operator → Crowd Prompts.");
    }

    if(crowdTitleEl) crowdTitleEl.textContent = title || "CROWD PROMPT";

    if(crowdFooterEl){
      crowdFooterEl.textContent = footer;
      crowdFooterEl.style.display = footer ? "" : "none";
    }

    if(crowdLinesEl){
      crowdLinesEl.replaceChildren();
      if(lines.length){
        crowdLinesEl.style.display = "flex";
        for(const t of lines){
          const div = document.createElement("div");
          div.className = "vCrowdLine";
          div.textContent = t;
          crowdLinesEl.appendChild(div);
        }
      }else{
        crowdLinesEl.style.display = "none";
      }
    }
  }

  function renderSplash(){
    overlay.style.display = "none";
    splashInfo.style.display = "grid";
    if(liveFooterBar) liveFooterBar.style.display = "none";
    if(root){
      root.classList.remove("hasHbFooter");
      root.classList.remove("isLive");
      root.classList.add("isSplash");
    }
    if(startBanner) startBanner.style.display = "none";
    if(root) root.classList.remove("startIntro");

    clearCardCues();
    lastRemainingMs = null;
    lastSlotId = null;
    lastCue = null;

    // Ensure we release any previously-loaded image when switching away from LIVE.
    setMedia(null).catch(() => {});

    const [n1, n2] = OMJN.computeNextTwo(state);
    sNext.textContent = n1?.displayName || "TBD";
    sDeck.textContent = n2?.displayName || "TBD";

    // subtext: slot type + minutes
    const sub1 = n1 ? `${OMJN.displaySlotTypeLabel(state, n1)} • ${OMJN.effectiveMinutes(state, n1)}m` : "Sign ups open";
    const sub2 = n2 ? `${OMJN.displaySlotTypeLabel(state, n2)} • ${OMJN.effectiveMinutes(state, n2)}m` : "Get ready";
    sNextSub.textContent = sub1;
    sDeckSub.textContent = sub2;

    // Respect the Operator toggle for House Band visibility on Splash
    const footerEnabled = (state.viewerPrefs?.showHouseBandFooter !== false);

    renderHouseBandLineup(hbLineup, { maxQueued: 10 });
    // Hide the House Band card on Splash when toggle is off OR empty
    const hbCard = hbLineup?.closest?.(".vBandCard");
    const hasHB = (hbLineup && hbLineup.childElementCount);
    if(hbCard) hbCard.style.display = (footerEnabled && hasHB) ? "" : "none";

    setBg();
  }

  async function renderLive(){
    overlay.style.display = "grid";
    splashInfo.style.display = "none";
    if(root){
      root.classList.remove("isSplash");
      root.classList.add("isLive");
    }
    // Show footer only if enabled AND there is at least one active House Band member queued
    const hbHasAny = (OMJN.getHouseBandTopPerCategory(state).length > 0);
    const footerEnabled = (state.viewerPrefs?.showHouseBandFooter !== false);
    const showFooter = (footerEnabled && hbHasAny);
    if(liveFooterBar){
      liveFooterBar.style.display = showFooter ? "flex" : "none";
      liveFooterBar.hidden = !showFooter;
      if(!showFooter && hbLiveLineup) hbLiveLineup.innerHTML = "";
    }
    if(root) root.classList.toggle("hasHbFooter", showFooter);

    const cur = OMJN.computeCurrent(state);
    if(!cur){
      renderSplash();
      return;
    }

    // Reset cue tracking when slot changes
    if(lastSlotId !== cur.id){
      clearCardCues();
      lastRemainingMs = null;
      lastSlotId = cur.id;
    }

    const type = OMJN.getSlotType(state, cur.slotTypeId);
    nowName.textContent = cur.displayName || "—";
    chipType.textContent = OMJN.displaySlotTypeLabel(state, cur);

    if(startIntroPending){
      triggerStartIntro(cur.displayName || "—");
      startIntroPending = false;
    }

    // Next / On Deck (LIVE)
    const [n1, n2] = OMJN.computeNextTwo(state);
    if(liveNextUp) liveNextUp.textContent = n1?.displayName || "—";
    if(liveOnDeck) liveOnDeck.textContent = n2?.displayName || "—";

    // timer
    const t = OMJN.computeTimer(state);
    const remainingMs = t.remainingMs;
    const overtimeMs = t.overtimeMs;

    timerEl.textContent = OMJN.formatMMSS(remainingMs);

    // chips
    chipState.textContent = state.phase === "PAUSED" ? "PAUSED" : "LIVE";
    chipState.className = "vChip " + (state.phase === "PAUSED" ? "warn" : "good");

    // warning thresholds
    const warnAtMs = (state.viewerPrefs?.warnAtSec ?? 120) * 1000;
    const finalAtMs = (state.viewerPrefs?.finalAtSec ?? 30) * 1000;

    chipWarn.style.display = (remainingMs > 0 && remainingMs <= warnAtMs && remainingMs > finalAtMs) ? "inline-flex" : "none";
    chipFinal.style.display = (remainingMs > 0 && remainingMs <= finalAtMs) ? "inline-flex" : "none";

    // overtime chip
    if(overtimeMs > 0){
      chipOver.style.display = "inline-flex";
      chipOver.textContent = `Overtime +${OMJN.formatMMSS(overtimeMs)}`;
      chipOver.className = "vChip final";
    } else {
      chipOver.style.display = "none";
    }

    // cues on main card (pulse + overtime flash)
    applyCardCues(remainingMs, warnAtMs, finalAtMs);

    // House Band footer during LIVE (HB only)
    renderHouseBandLineup(hbLiveLineup, { compact: true });

    // donation link
    const url = cur.media?.donationUrl || "";
    if(url){
      donationText.textContent = url;
      donationCard.style.display = "block";
    } else {
      donationText.textContent = "";
      donationCard.style.display = "none";
    }

    // media
    await setMedia(cur);

    // hide media column entirely if nothing exists (no awkward blanks)
    const m = cur.media || {};
    const layout = m.mediaLayout || "NONE";
    const hasImage = (layout === "IMAGE_ONLY") ? !!m.imageAssetId : (layout === "QR_ONLY" || layout === "IMAGE_PLUS_QR");
    const hasLink = !!m.donationUrl;
    if(!hasImage && !hasLink){
      vMedia.style.display = "none";
      overlay.style.gridTemplateColumns = "1fr";
    } else {
      vMedia.style.display = "flex";
      overlay.style.gridTemplateColumns = "1.25fr .75fr";
    }

    setBg();
  }

  async function render(){
    if(state.phase === "SPLASH" || !state.currentSlotId){
      renderSplash();
    }else{
      await renderLive();
    }

    // Crowd Prompts overlay (can show during any phase)
    renderCrowdPrompts();

    // Visualizer UI (LIVE-only) + Splash setup button
    updateVizSetupButton();
    maybeStartViz();

    // Sponsor bug overlay
    await setSponsorBug();
  }

  // animate timer locally without spamming BroadcastChannel
  function tick(){
    render().catch(()=>{});
  }

  // Subscribe to state updates
  OMJN.subscribe((s) => {
    const prevPhase = state?.phase;
    state = s;
    if(prevPhase === "SPLASH" && (state.phase === "LIVE" || state.phase === "PAUSED") && state.currentSlotId){
      startIntroPending = true;
    }
    lastPhase = state.phase;

    OMJN.applyThemeToDocument(document, state);
    render().catch(()=>{});
  });

  // Boot
  // Setup mic enable button (shown only on SPLASH when needed)
  if(btnVizMic){
    btnVizMic.addEventListener("click", async () => {
      const ok = await enableMicForVisualizer();
      if(ok) updateVizSetupButton();
    });
  }

  // If mic permission is already granted, we can enable without a click.
  (async () => {
    try{
      if(!vizEnabled()) return;
      if(!navigator.permissions?.query) return;
      const p = await navigator.permissions.query({ name: "microphone" });
      if(p?.state === "granted"){
        await enableMicForVisualizer();
      }
    }catch(_){ }
  })();

  render().catch(()=>{});
  setInterval(tick, 250);
})();
