/* Viewer UI */
(() => {
  let state = OMJN.loadState();
  OMJN.applyThemeToDocument(document, state);

  let adBlobUrl = null;

  // ---- Element refs ----
  const el = {
    bg: document.getElementById("bg"),
    root: document.getElementById("root"),
    overlay: document.getElementById("overlay"),
    splashInfo: document.getElementById("splashInfo"),

    // Ads
    adLayer: document.getElementById("adLayer"),
    adImg: document.getElementById("adImg"),
    adVideo: document.getElementById("adVideo"),
    adFail: document.getElementById("adFail"),
    liveFooterBar: document.getElementById("liveFooterBar"),

    // Start intro
    startBanner: document.getElementById("startBanner"),
    startBannerName: document.getElementById("startBannerName"),

    // LIVE main card
    vMainCard: document.getElementById("vMainCard"),
    nowLabel: document.getElementById("nowLabel"),
    nowName: document.getElementById("nowName"),
    hbInstruments: document.getElementById("hbInstruments"),
    timer: document.getElementById("timer"),
    chipState: document.getElementById("chipState"),
    chipType: document.getElementById("chipType"),
    chipOver: document.getElementById("chipOver"),
    chipWarn: document.getElementById("chipWarn"),
    chipFinal: document.getElementById("chipFinal"),
    liveNextUp: document.getElementById("liveNextUp"),
    liveOnDeck: document.getElementById("liveOnDeck"),

    // Progress bar
    progress: document.getElementById("vProgress"),
    progressFill: document.getElementById("vProgressFill"),

    // Media column
    vMedia: document.getElementById("vMedia"),
    vMediaPane: document.getElementById("vMediaPane"),
    donationCard: document.getElementById("donationCard"),
    donationText: document.getElementById("donationText"),
    mediaBox: document.getElementById("mediaBox"),
    mediaImg: document.getElementById("mediaImg"),
    mediaEmpty: document.getElementById("mediaEmpty"),

    // Splash cards
    sNext: document.getElementById("sNext"),
    sDeck: document.getElementById("sDeck"),
    sNextSub: document.getElementById("sNextSub"),
    sDeckSub: document.getElementById("sDeckSub"),

    // House band
    hbLineup: document.getElementById("hbLineup"),
    hbLiveLineup: document.getElementById("hbLiveLineup"),

    // Crowd Prompts
    crowdLayer: document.getElementById("crowdLayer"),
    crowdTitle: document.getElementById("crowdTitle"),
    crowdLines: document.getElementById("crowdLines"),
    crowdFooter: document.getElementById("crowdFooter"),

    // Sponsor bug
    sponsorLayer: document.getElementById("sponsorLayer"),
    sponsorBug: document.getElementById("sponsorBug"),
    sponsorImg: document.getElementById("sponsorImg"),

    // Mic visualizer
    vVizWrap: document.getElementById("vVizWrap"),
    vViz: document.getElementById("vViz"),
    vVizHint: document.getElementById("vVizHint"),
    btnVizMic: document.getElementById("btnVizMic"),
  };

  // House Band instrument labels (for chipType when featuring a member)
  const HB_INST_LABEL = (() => {
    try{
      const m = new Map();
      for(const x of OMJN.houseBandInstrumentOptions()){
        if(x && x.id) m.set(String(x.id), String(x.label || x.id));
      }
      return m;
    }catch(_){
      return new Map();
    }
  })();

  // Default QR image shown when a performer uses a QR layout but has no custom upload.
  const DEFAULT_QR_SRC = "./assets/OMJN-QR.png";

  // Operator uses this to show Viewer connection status
  const VIEWER_HEARTBEAT_KEY = "omjn.viewerHeartbeat.v1";
  setInterval(() => {
    try { localStorage.setItem(VIEWER_HEARTBEAT_KEY, String(Date.now())); } catch (_) {}
  }, 1000);

  // ---- Render caches ----
  let lastPhaseKey = null;
  let lastBgPath = null;

  let lastSlotId = null;
  let lastSlotStaticKey = null;
  let lastNextDeckKey = null;
  let lastLayoutKey = null;

  let lastSplashKey = null;

  let lastHbSplashKey = null;
  let lastHbLiveKey = null;

  let lastTimerText = null;
  let lastChipStateKey = null;
  let lastWarnFinalKey = null;
  let lastProgressKey = null;

  // Cue tracking
  let lastRemainingMs = null;
  let overtimeFlashTimeout = null;
  let lastCue = null;

  // Start intro runtime
  let startIntroPending = false;
  let startIntroTimeout = null;

  // Media runtime
  let currentAssetUrl = null;
  let lastMediaKey = null;
  let mediaToken = 0;

  function cleanName(v) {
    // Be defensive: remove zero-width characters that can make a name "look blank"
    // while still being a non-empty string.
    let s = String(v ?? "");
    s = s.replace(/[\u200B-\u200D\uFEFF\u2060]/g, "");
    s = s.replace(/\s+/g, " ").trim();
    return s || "—";
  }

  function slotName(slot) {
    return cleanName(slot?.displayName ?? slot?.name ?? slot?.performerName ?? slot?.title ?? "");
  }

  // Sponsor bug runtime
  const SPONSOR_VIEWER_STATUS_KEY = "omjn.sponsorBug.viewerStatus.v1";
  let currentSponsorObjectUrl = null;
  let lastSponsorKey = null;
  let sponsorLoadToken = 0;

  // Crowd prompts runtime (local auto-hide)
  let crowdVisible = false;
  let lastCrowdKey = null;
  let crowdHideTimeout = null;

  // --- Visualizer runtime ---
  const viz = {
    stream: null,
    audioCtx: null,
    analyser: null,
    dataFreq: null,
    dataTime: null,
    raf: null,
    running: false,
    dpr: 1,
  };

  function vizEnabled() {
    return !!(state.viewerPrefs?.visualizerEnabled);
  }
  function vizSensitivity() {
    const n = Number(state.viewerPrefs?.visualizerSensitivity);
    return Number.isFinite(n) ? Math.max(0.25, Math.min(4, n)) : 1.0;
  }
  function vizMode(){
    const m = String(state.viewerPrefs?.visualizerMode || "eq").toLowerCase();
    return (m === "volume") ? "volume" : "eq";
  }
  function vizDirection(){
    const d = String(state.viewerPrefs?.visualizerDirection || "mirror").toLowerCase();
    return (d === "ltr") ? "ltr" : "mirror";
  }
  function vizShouldShowWrap(){
    return state.phase === "LIVE" && vizEnabled() && !!el.vVizWrap;
  }
  function vizCanRender(){
    return vizShouldShowWrap() && !!viz.analyser;
  }

  function resizeVizCanvas() {
    if (!el.vViz) return;
    const rect = el.vViz.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    viz.dpr = dpr;
    const w = Math.max(1, Math.round(rect.width * dpr));
    const h = Math.max(1, Math.round(rect.height * dpr));
    if (el.vViz.width !== w) el.vViz.width = w;
    if (el.vViz.height !== h) el.vViz.height = h;
  
    viz.layoutDirty = true;
  }

  function getAccent() {
    const c = getComputedStyle(document.documentElement).getPropertyValue("--accent").trim();
    return c || "#00c2ff";
  }

  function drawRoundedRect(ctx, x, y, w, h, r) {
    const rr = Math.max(0, Math.min(r, Math.min(w, h) / 2));
    if (typeof ctx.roundRect === "function") {
      ctx.beginPath();
      ctx.roundRect(x, y, w, h, rr);
      ctx.fill();
      return;
    }
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

  function buildVizBandRanges(binCount, sampleRate, bands){
    const nyq = (sampleRate || 48000) / 2;
    const minF = 50;
    const maxF = Math.min(16000, nyq * 0.95);
    const ranges = [];
    const ratio = maxF / minF;

    for(let i=0;i<bands;i++){
      const t0 = i / bands;
      const t1 = (i + 1) / bands;
      const f0 = minF * Math.pow(ratio, t0);
      const f1 = minF * Math.pow(ratio, t1);

      const b0 = Math.max(0, Math.min(binCount - 1, Math.floor((f0 / nyq) * binCount)));
      const b1 = Math.max(0, Math.min(binCount - 1, Math.floor((f1 / nyq) * binCount)));
      ranges.push([b0, Math.max(b0, b1)]);
    }
    return ranges;
  }

  function renderVizFrame() {
    if (!vizCanRender()) {
      viz.running = false;
      viz.raf = null;
      return;
    }

    const ctx = el.vViz.getContext("2d", { alpha: true });
    if (!ctx) {
      viz.running = false;
      viz.raf = null;
      return;
    }

    const w = el.vViz.width;
    const h = el.vViz.height;

    // Clear
    ctx.clearRect(0, 0, w, h);
    // Pull visualizer data

    const dpr = viz.dpr || 1;
    const sens = vizSensitivity();
    const mode = vizMode();
    const dir = vizDirection();

    const padX = Math.round(10 * dpr);
    const padY = Math.round(10 * dpr);
    const baseY = h - padY;
    const maxH = Math.max(1, (h - padY - padY));

    // --- Club-style EQ sizing ---
    const availW = Math.max(1, w - padX * 2);
    const barStep = Math.max(10, Math.round(18 * dpr)); // target px per bar+gap
    let totalBars = Math.max(25, Math.floor(availW / barStep));

    if (dir === "mirror") {
      totalBars = Math.max(31, Math.min(121, totalBars));
      if (totalBars % 2 === 0) totalBars -= 1; // keep odd so we have a true center bar
    } else {
      totalBars = Math.max(24, Math.min(96, totalBars));
    }

    const bands = (dir === "mirror") ? ((totalBars + 1) >> 1) : totalBars;

    // Rebuild per-band buffers when layout/mode changes
    const layoutKey = `${mode}:${dir}:${bands}:${w}x${h}:${dpr}`;
    if (viz.layoutDirty || viz.lastLayoutKey !== layoutKey) {
      viz.lastLayoutKey = layoutKey;
      viz.layoutDirty = false;
      viz.bands = bands;
      viz.levels = new Float32Array(bands);
      viz.bandRanges = null;     // rebuilt lazily for EQ
      viz.volWeights = null;     // rebuilt lazily for volume
    }

    // Compute volume or EQ data
    let volumeRms = 0;
    if (mode === "volume") {
      if (!viz.dataTime || viz.dataTime.length !== (viz.analyser?.fftSize || 2048)) {
        viz.dataTime = new Uint8Array(viz.analyser?.fftSize || 2048);
      }
      viz.analyser.getByteTimeDomainData(viz.dataTime);
      let sum = 0;
      for (let i = 0; i < viz.dataTime.length; i++) {
        const x = (viz.dataTime[i] - 128) / 128; // -1..1
        sum += x * x;
      }
      volumeRms = Math.sqrt(sum / Math.max(1, viz.dataTime.length));
      // Club-ish curve: boost quieter levels, soft-limit loud levels
      volumeRms = Math.min(1, Math.pow(volumeRms, 0.55) * sens * 2.1);
    } else {
      if (!viz.dataFreq || viz.dataFreq.length !== viz.analyser.frequencyBinCount) {
        viz.dataFreq = new Uint8Array(viz.analyser.frequencyBinCount);
      }
      viz.analyser.getByteFrequencyData(viz.dataFreq);

      if (!viz.bandRanges || !Array.isArray(viz.bandRanges) || viz.bandRanges.length !== bands) {
        viz.bandRanges = buildVizBandRanges(viz.analyser.frequencyBinCount, viz.audioCtx?.sampleRate || 48000, bands);
      }
    }

    // Calculate target levels per band with club-style "smile" weighting
    for (let i = 0; i < bands; i++) {
      const t = (bands > 1) ? (i / (bands - 1)) : 0; // 0=low, 1=high
      let target = 0;

      if (mode === "volume") {
        if (!viz.volWeights || viz.volWeights.length !== bands) {
          viz.volWeights = new Float32Array(bands);
          for (let k = 0; k < bands; k++) {
            const tt = (bands > 1) ? (k / (bands - 1)) : 0;
            // subtle arc (keeps the center-ish bands a bit taller)
            viz.volWeights[k] = 0.75 + 0.35 * Math.sin(tt * Math.PI);
          }
        }
        target = volumeRms * (viz.volWeights[i] || 1);
      } else {
        const r = (viz.bandRanges && viz.bandRanges[i]) ? viz.bandRanges[i] : [0, 0];
        const b0 = r[0] | 0;
        const b1 = r[1] | 0;

        let sum = 0;
        let count = 0;
        for (let b = b0; b <= b1; b++) {
          const vv = (viz.dataFreq[b] || 0) / 255; // 0..1
          sum += vv * vv;
          count++;
        }
        const rms = count ? Math.sqrt(sum / count) : 0;

        // More club-like bounce: lower exponent boosts quieter bands
        target = Math.min(1, Math.pow(rms, 0.42) * sens * 1.25);

        // "Smile" weighting: bass strongest, treble moderate, mids a bit lower
        const bass = Math.pow(1 - t, 1.55);
        const treble = Math.pow(t, 1.35);
        const smileW = 0.85 + 0.95 * (bass + 0.65 * treble);
        target = Math.min(1, target * smileW);
      }

      const cur = viz.levels[i] || 0;
      // Snappier highs
      const attack = 0.62 + 0.22 * t; // 0.62..0.84
      const decay  = 0.12 + 0.06 * t; // 0.12..0.18
      viz.levels[i] = target > cur ? (cur + (target - cur) * attack) : (cur + (target - cur) * decay);
    }

    // Draw bars
    const gap = Math.max(1, Math.round(2 * dpr));
    const barW = Math.max(1, Math.floor((availW - gap * (totalBars - 1)) / totalBars));
    const radius = Math.max(2, Math.round(6 * dpr));

    const accent = getAccent();
    ctx.fillStyle = accent;

    const centerPos = (totalBars - 1) / 2;

    for (let pos = 0; pos < totalBars; pos++) {
      const bandIndex = (dir === "mirror") ? Math.abs(pos - centerPos) | 0 : pos;
      const amp = viz.levels[bandIndex] || 0;
      const bh = Math.max(1, Math.floor(amp * maxH));
      const x = padX + pos * (barW + gap);
      drawRoundedRect(ctx, x, baseY - bh, barW, bh, radius);
    }



    viz.raf = requestAnimationFrame(renderVizFrame);
  }

  async function enableMicForVisualizer() {
    try {
      if (viz.stream) return true;
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      viz.stream = stream;

      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      viz.audioCtx = new AudioCtx();
      try{ await viz.audioCtx.resume(); }catch(_){ }
      const src = viz.audioCtx.createMediaStreamSource(stream);
      viz.analyser = viz.audioCtx.createAnalyser();
      // EQ-style spectrum
      viz.analyser.fftSize = 2048;
      viz.analyser.smoothingTimeConstant = 0.45;
      viz.analyser.minDecibels = -95;
      viz.analyser.maxDecibels = -25;

      src.connect(viz.analyser);
      viz.dataFreq = new Uint8Array(viz.analyser.frequencyBinCount);
      viz.dataTime = new Uint8Array(viz.analyser.fftSize);
      viz.levels = null;
      viz.bandRanges = null;
      viz.volWeights = null;
      viz.layoutDirty = true;

      resizeVizCanvas();
      window.addEventListener("resize", resizeVizCanvas);

      maybeStartViz();
      return true;
    } catch (err) {
      console.warn("Mic visualizer enable failed:", err);
      return false;
    }
  }

  function maybeStartViz() {
    if (!el.vVizWrap) return;

    const shouldShowWrap = vizShouldShowWrap();
    if (!shouldShowWrap) {
      el.vVizWrap.style.display = "none";
      el.vVizWrap.classList.remove("needsMic");
      if (el.vVizHint) el.vVizHint.style.display = "none";
      if (viz.running && viz.raf) {
        cancelAnimationFrame(viz.raf);
        viz.raf = null;
      }
      viz.running = false;
      return;
    }

    // Show wrap even if mic isn't enabled yet — so the user knows it's “on”
    el.vVizWrap.style.display = "block";

    const needsMic = vizEnabled() && !viz.stream;
    if (needsMic) {
      el.vVizWrap.classList.add("needsMic");
      if (el.vVizHint) el.vVizHint.style.display = "flex";
      // Don't run a render loop until we have an analyser
      if (viz.running && viz.raf) {
        cancelAnimationFrame(viz.raf);
        viz.raf = null;
      }
      viz.running = false;
      // Clear canvas
      try{
        const ctx = el.vViz?.getContext?.("2d", { alpha: true });
        if(ctx) ctx.clearRect(0,0,el.vViz.width, el.vViz.height);
      }catch(_){}
      return;
    }

    el.vVizWrap.classList.remove("needsMic");
    if (el.vVizHint) el.vVizHint.style.display = "none";

    if (!vizCanRender()) {
      // mic granted but analyser not ready yet
      return;
    }

    if (!viz.running) {
      viz.running = true;
      viz.raf = requestAnimationFrame(renderVizFrame);
    }
  }

  function updateVizSetupButton() {
    if (!el.btnVizMic) return;
    // Show whenever visualizer is enabled but mic isn't granted yet.
    const shouldShow = vizEnabled() && !viz.stream;
    el.btnVizMic.style.display = shouldShow ? "inline-flex" : "none";
  }

  // ---- Background ----
  function setBg() {
    const path = state.splash?.backgroundAssetPath || "./assets/splash_BG.jpg";
    if (path === lastBgPath) return;
    lastBgPath = path;
    if (el.bg) el.bg.style.backgroundImage = `url('${path}')`;
  }

  // ---- House Band ----
  function renderHouseBandLineup(targetEl, opts = {}) {
    if (!targetEl) return;
    const top = OMJN.getHouseBandTopPerCategory(state);
    const fmt = state.viewerPrefs?.hbFooterFormat || "categoryFirst";
    targetEl.innerHTML = "";
    if (!top.length) return;

    const instrumentLabel = (m) => {
      if (!m) return "";
      if (m.instrumentId === "custom") return OMJN.sanitizeText(m.customInstrument || "");
      return OMJN.houseBandInstrumentOptions().find((x) => x.id === m.instrumentId)?.label || "";
    };

    for (const item of top) {
      const m = item.member;
      const chip = document.createElement("span");
      chip.className = "hbChip" + (opts.compact ? " hbChipFooter" : "");

      const name = OMJN.sanitizeText(m?.name || "");
      const inst = instrumentLabel(m);
      const cat = item.categoryLabel;
      let txt = "";

      const catLower = (cat || "").toLowerCase();
      const instLower = (inst || "").toLowerCase();
      const instExtra = inst && instLower && instLower !== catLower ? inst : "";

      if (fmt === "nameFirst") {
        if (name) {
          txt = instExtra ? `${name} (${cat} - ${instExtra})` : `${name} (${cat})`;
        } else if (inst) {
          txt = instExtra ? `${instExtra} (${cat})` : `${cat}: ${inst}`;
        } else {
          txt = cat;
        }
      } else {
        if (name && instExtra) txt = `${cat}: ${name} (${instExtra})`;
        else if (name) txt = `${cat}: ${name}`;
        else if (inst) txt = `${cat}: ${inst}`;
        else txt = cat;
      }

      chip.textContent = txt;
      targetEl.appendChild(chip);
    }
  }

  function hbKey() {
    const top = OMJN.getHouseBandTopPerCategory(state);
    const fmt = state.viewerPrefs?.hbFooterFormat || "categoryFirst";
    return JSON.stringify({ fmt, top: top.map((t) => ({ c: t.categoryLabel, n: t.member?.name || "", i: t.member?.instrumentId || "", x: t.member?.customInstrument || "" })) });
  }

  // ---- Card cues ----
  function clearCardCues() {
    if (!el.vMainCard) return;
    el.vMainCard.classList.remove(
      "pulseWarn",
      "pulseFinal",
      "overtimeFlash",
      "pulseWarnOnce",
      "pulseFinalOnce",
      "cue-warn",
      "cue-final",
      "cue-overtime"
    );
    if (overtimeFlashTimeout) {
      clearTimeout(overtimeFlashTimeout);
      overtimeFlashTimeout = null;
    }
  }

  function triggerOvertimeFlash() {
    if (!el.vMainCard) return;
    el.vMainCard.classList.remove("pulseWarn", "pulseFinal");
    el.vMainCard.classList.remove("overtimeFlash");
    void el.vMainCard.offsetWidth;
    el.vMainCard.classList.add("overtimeFlash");

    if (overtimeFlashTimeout) clearTimeout(overtimeFlashTimeout);
    overtimeFlashTimeout = setTimeout(() => {
      el.vMainCard.classList.remove("overtimeFlash");
      overtimeFlashTimeout = null;
    }, 1050);
  }

  function applyCardCues(remainingMs, warnAtMs, finalAtMs) {
    if (!el.vMainCard) return;

    if (lastRemainingMs !== null && lastRemainingMs > 0 && remainingMs <= 0) {
      triggerOvertimeFlash();
    }

    const cue = remainingMs <= 0 ? "overtime" : remainingMs <= finalAtMs ? "final" : remainingMs <= warnAtMs ? "warn" : "normal";

    el.vMainCard.classList.remove("cue-warn", "cue-final", "cue-overtime");
    if (cue === "warn") el.vMainCard.classList.add("cue-warn");
    if (cue === "final") el.vMainCard.classList.add("cue-final");
    if (cue === "overtime") el.vMainCard.classList.add("cue-overtime");

    el.vMainCard.classList.remove("pulseWarnOnce", "pulseFinalOnce");
    if (lastCue && lastCue !== cue) {
      if (cue === "warn") {
        el.vMainCard.classList.add("pulseWarnOnce");
        setTimeout(() => el.vMainCard.classList.remove("pulseWarnOnce"), 750);
      } else if (cue === "final") {
        el.vMainCard.classList.add("pulseFinalOnce");
        setTimeout(() => el.vMainCard.classList.remove("pulseFinalOnce"), 750);
      }
    }
    lastCue = cue;
    lastRemainingMs = remainingMs;
  }

  // ---- Start intro ----
  function triggerStartIntro(name) {
    if (!el.root) return;
    if (startIntroTimeout) {
      clearTimeout(startIntroTimeout);
      startIntroTimeout = null;
    }

    // No lower-third banner — we just punch in the hero card briefly.
    el.root.classList.add("startIntro");
    startIntroTimeout = setTimeout(() => {
      el.root.classList.remove("startIntro");
      startIntroTimeout = null;
    }, 650);
  }

  // ---- Media ----
  async function setMedia(slot) {
    const media = slot?.media || {};
    const mediaKey = slot ? `${slot.id}|${media.mediaLayout || ""}|${media.imageAssetId || ""}` : "none";
    if (mediaKey === lastMediaKey) return;
    lastMediaKey = mediaKey;

    const tok = ++mediaToken;

    if (currentAssetUrl) {
      try { URL.revokeObjectURL(currentAssetUrl); } catch (_) {}
      currentAssetUrl = null;
    }

    if (!slot) {
      if (el.mediaBox) el.mediaBox.style.display = "none";
      if (el.mediaImg) el.mediaImg.style.display = "none";
      if (el.mediaEmpty) el.mediaEmpty.style.display = "none";
      return;
    }

    const layout = media.mediaLayout || "NONE";
    const hasUploaded = !!media.imageAssetId;
    const usesDefaultQr = !hasUploaded && ["QR_ONLY", "IMAGE_PLUS_QR"].includes(layout);
    const wantImage = ["IMAGE_ONLY", "QR_ONLY", "IMAGE_PLUS_QR"].includes(layout) && (hasUploaded || usesDefaultQr);

    if (!wantImage) {
      if (el.mediaBox) el.mediaBox.style.display = "none";
      if (el.mediaImg) el.mediaImg.style.display = "none";
      if (el.mediaEmpty) el.mediaEmpty.style.display = "none";
      return;
    }

    if (usesDefaultQr) {
      if (tok !== mediaToken) return;
      el.mediaImg.src = DEFAULT_QR_SRC;
      el.mediaImg.style.display = "block";
      el.mediaEmpty.style.display = "none";
      el.mediaBox.style.display = "flex";
      return;
    }

    let blob = null;
    try {
      blob = await OMJN.getAsset(media.imageAssetId);
    } catch (_) {
      blob = null;
    }
    if (tok !== mediaToken) return;

    if (!blob) {
      if (["QR_ONLY", "IMAGE_PLUS_QR"].includes(layout)) {
        el.mediaImg.src = DEFAULT_QR_SRC;
        el.mediaImg.style.display = "block";
        el.mediaEmpty.style.display = "none";
        el.mediaBox.style.display = "flex";
      } else {
        el.mediaBox.style.display = "none";
        el.mediaImg.style.display = "none";
        el.mediaEmpty.style.display = "none";
      }
      return;
    }

    currentAssetUrl = URL.createObjectURL(blob);
    el.mediaImg.src = currentAssetUrl;
    el.mediaImg.style.display = "block";
    el.mediaEmpty.style.display = "none";
    el.mediaBox.style.display = "flex";
  }

  // ---- Sponsor bug ----
  function getSponsorCfg() {
    const d = OMJN.defaultState();
    return state.viewerPrefs?.sponsorBug || d.viewerPrefs.sponsorBug;
  }

  function writeSponsorStatus(payload) {
    try {
      const obj = Object.assign({ at: Date.now() }, payload || {});
      localStorage.setItem(SPONSOR_VIEWER_STATUS_KEY, JSON.stringify(obj));
    } catch (_) {}
  }

  function hideSponsor(reason) {
    if (el.sponsorLayer) el.sponsorLayer.style.display = "none";
    if (currentSponsorObjectUrl) {
      try { URL.revokeObjectURL(currentSponsorObjectUrl); } catch (_) {}
      currentSponsorObjectUrl = null;
    }
    if (el.sponsorImg) el.sponsorImg.src = "";
    writeSponsorStatus({ ok: true, hidden: true, reason: reason || "hidden" });
  }

  function getSafeInsets() {
    // Values are resolved from env(safe-area-inset-*). If unsupported, these are 0.
    try {
      const cs = getComputedStyle(el.root || document.documentElement);
      const t = parseInt(cs.getPropertyValue("--safe-top"), 10) || 0;
      const r = parseInt(cs.getPropertyValue("--safe-right"), 10) || 0;
      const b = parseInt(cs.getPropertyValue("--safe-bottom"), 10) || 0;
      const l = parseInt(cs.getPropertyValue("--safe-left"), 10) || 0;
      const p = parseInt(cs.getPropertyValue("--vPad"), 10) || 48;
      return { t, r, b, l, p };
    } catch (_) {
      return { t: 0, r: 0, b: 0, l: 0, p: 48 };
    }
  }

  async function setSponsorBug() {
    if (!el.sponsorLayer || !el.sponsorBug || !el.sponsorImg) return;

    const cfg = getSponsorCfg() || {};
    const url = String(cfg.url || "").trim();
    const footerVisible = !!(el.liveFooterBar && el.liveFooterBar.style.display !== "none" && !el.liveFooterBar.hidden);

    // Hide sponsor bug during Crowd Prompts slides (clean interstitial)
    if (crowdVisible) {
      hideSponsor("crowd-prompts");
      return;
    }

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
      footerVisible,
    });
    if (key === lastSponsorKey) return;
    lastSponsorKey = key;

    const shouldShow = !!cfg.enabled && (!cfg.showLiveOnly || state.phase === "LIVE");
    if (!shouldShow) {
      hideSponsor(cfg.enabled ? "not-live" : "disabled");
      return;
    }

    const pos = String(cfg.position || "TR").toUpperCase();
    const safe = Math.max(0, Math.min(200, parseInt(cfg.safeMargin ?? 16, 10) || 0));
    const insets = getSafeInsets();

    // Base padding matches viewerOverlay; plus safe-area inset on that edge.
    const basePad = insets.p;

    let padTop = basePad + safe + insets.t;
    let padRight = basePad + safe + insets.r;
    let padBottom = basePad + safe + insets.b;
    let padLeft = basePad + safe + insets.l;

    let bottomExtra = 0;
    if (footerVisible && (pos === "BL" || pos === "BR")) {
      try {
        const r = el.liveFooterBar.getBoundingClientRect();
        bottomExtra = Math.round(r.height + 18);
      } catch (_) {}
    }

    el.sponsorBug.classList.remove("posTL", "posTR", "posBL", "posBR");
    el.sponsorBug.classList.add("pos" + (pos === "TL" || pos === "TR" || pos === "BL" || pos === "BR" ? pos : "TR"));

    el.sponsorBug.style.top = "";
    el.sponsorBug.style.right = "";
    el.sponsorBug.style.bottom = "";
    el.sponsorBug.style.left = "";

    if (pos === "TL") {
      el.sponsorBug.style.top = padTop + "px";
      el.sponsorBug.style.left = padLeft + "px";
    } else if (pos === "TR") {
      el.sponsorBug.style.top = padTop + "px";
      el.sponsorBug.style.right = padRight + "px";
    } else if (pos === "BL") {
      el.sponsorBug.style.bottom = padBottom + bottomExtra + "px";
      el.sponsorBug.style.left = padLeft + "px";
    } else {
      el.sponsorBug.style.bottom = padBottom + bottomExtra + "px";
      el.sponsorBug.style.right = padRight + "px";
    }

    const scale = Math.max(0.25, Math.min(2, Number(cfg.scale ?? 1)));
    const opacity = Math.max(0, Math.min(1, Number(cfg.opacity ?? 1)));
    el.sponsorBug.style.setProperty("--sponsorScale", String(scale));
    el.sponsorBug.style.setProperty("--sponsorCap", sponsorCapPx + "px");
    el.sponsorBug.style.opacity = String(opacity);

    const prefer = cfg.sourceType === "url" ? ["url", "upload"] : ["upload", "url"];

    let used = null;
    let blob = null;
    for (const m of prefer) {
      if (m === "upload" && cfg.uploadAssetId) {
        try { blob = await OMJN.getAsset(cfg.uploadAssetId); } catch (_) { blob = null; }
        if (blob) {
          used = "upload";
          break;
        }
      }
      if (m === "url" && url) {
        used = "url";
        break;
      }
    }

    if (!used) {
      hideSponsor("missing-source");
      writeSponsorStatus({ ok: false, hidden: true, error: "missing-source" });
      return;
    }

    if (used !== "upload" && currentSponsorObjectUrl) {
      try { URL.revokeObjectURL(currentSponsorObjectUrl); } catch (_) {}
      currentSponsorObjectUrl = null;
    }

    if (used === "upload") {
      if (currentSponsorObjectUrl) {
        try { URL.revokeObjectURL(currentSponsorObjectUrl); } catch (_) {}
      }
      currentSponsorObjectUrl = URL.createObjectURL(blob);
      el.sponsorImg.onload = null;
      el.sponsorImg.onerror = null;
      el.sponsorImg.src = currentSponsorObjectUrl;
      el.sponsorLayer.style.display = "block";
      writeSponsorStatus({ ok: true, hidden: false, source: "upload" });
      return;
    }

    const tok = ++sponsorLoadToken;
    const loaded = await new Promise((resolve) => {
      el.sponsorImg.onload = () => resolve(true);
      el.sponsorImg.onerror = () => resolve(false);
      el.sponsorImg.src = url;
    });
    if (tok !== sponsorLoadToken) return;

    if (loaded) {
      el.sponsorLayer.style.display = "block";
      writeSponsorStatus({ ok: true, hidden: false, source: "url" });
    } else {
      el.sponsorLayer.style.display = "none";
      el.sponsorImg.src = "";
      writeSponsorStatus({ ok: false, hidden: true, source: "url", error: "bad-url" });
    }
  }

  // ---- Crowd Prompts (Viewer) ----
  function getCrowdCfg() {
    const d = OMJN.defaultState();
    return state.viewerPrefs?.crowdPrompts || d.viewerPrefs.crowdPrompts;
  }

  function getActiveCrowdPreset(cfg) {
    if (!cfg) return null;
    const presets = Array.isArray(cfg.presets) ? cfg.presets : [];
    const id = String(cfg.activePresetId || "");
    return presets.find((p) => p && String(p.id) === id) || presets[0] || null;
  }

  function applyCrowdVisibility() {
    if (!el.root || !el.crowdLayer) return;
    el.root.classList.toggle("isCrowd", !!crowdVisible);
    el.crowdLayer.setAttribute("aria-hidden", crowdVisible ? "false" : "true");
  }

  function renderCrowdPrompts() {
    if (!el.root || !el.crowdLayer) return;

    const cfg = getCrowdCfg() || {};
    const enabled = !!cfg.enabled;
    const p = getActiveCrowdPreset(cfg) || {};

    const autoHideSeconds = Math.max(0, Number(p.autoHideSeconds || 0) || 0);
    const title = String(p.title || "").trim();
    const footer = String(p.footer || "").trim();
    const rawLines = Array.isArray(p.lines) ? p.lines : [];
    const lines = rawLines.map((v) => String(v || "").trim()).filter((v) => v.length);

    const key = JSON.stringify({ enabled, id: String(p.id || ""), title, footer, lines, autoHideSeconds });

    // If operator changed prompt or toggled it, reset local visibility + timers.
    if (key !== lastCrowdKey) {
      lastCrowdKey = key;

      if (crowdHideTimeout) {
        clearTimeout(crowdHideTimeout);
        crowdHideTimeout = null;
      }

      crowdVisible = enabled;

      // Render content (even if auto-hide will kick in)
      const safeTitle = title || (enabled ? "CROWD PROMPT" : "");
      if (el.crowdTitle) el.crowdTitle.textContent = safeTitle || "CROWD PROMPT";

      if (el.crowdFooter) {
        el.crowdFooter.textContent = footer;
        el.crowdFooter.style.display = footer ? "" : "none";
      }

      if (el.crowdLines) {
        el.crowdLines.replaceChildren();
        if (lines.length) {
          el.crowdLines.style.display = "flex";
          for (const t of lines) {
            const div = document.createElement("div");
            div.className = "vCrowdLine";
            div.textContent = t;
            el.crowdLines.appendChild(div);
          }
        } else {
          el.crowdLines.style.display = "none";
        }
      }

      applyCrowdVisibility();

      if (enabled && autoHideSeconds > 0) {
        crowdHideTimeout = setTimeout(() => {
          crowdVisible = false;
          applyCrowdVisibility();
          // Sponsor may be suppressed while prompts are visible.
          setSponsorBug().catch(() => {});
        }, Math.round(autoHideSeconds * 1000));
      }

      // Sponsor may need to hide/show immediately.
      setSponsorBug().catch(() => {});
      return;
    }

    // If operator turned it off, ensure local visibility is off.
    if (!enabled && crowdVisible) {
      crowdVisible = false;
      applyCrowdVisibility();
      setSponsorBug().catch(() => {});
    }
  }

  // ---- Phase shell ----
  function showSplashShell() {
    // Visibility handled by CSS via .isSplash/.isLive classes.
    if (el.overlay) el.overlay.setAttribute("aria-hidden", "true");
    if (el.splashInfo) el.splashInfo.setAttribute("aria-hidden", "false");
    if (el.liveFooterBar) {
      el.liveFooterBar.style.display = "none";
      el.liveFooterBar.hidden = true;
    }
    if (el.root) {
      el.root.classList.remove("hasHbFooter", "isLive", "startIntro");
      el.root.classList.add("isSplash");
    }

    // Reset LIVE-only caches
    clearCardCues();
    lastRemainingMs = null;
    lastCue = null;
    lastTimerText = null;
    lastWarnFinalKey = null;
    lastChipStateKey = null;
    lastProgressKey = null;

    // Release any LIVE image
    setMedia(null).catch(() => {});

    updateVizSetupButton();
    maybeStartViz();
  }

  function showLiveShell(showFooter) {
    // Visibility handled by CSS via .isSplash/.isLive classes.
    if (el.overlay) el.overlay.setAttribute("aria-hidden", "false");
    if (el.splashInfo) el.splashInfo.setAttribute("aria-hidden", "true");
    if (el.root) {
      el.root.classList.remove("isSplash");
      el.root.classList.add("isLive");
      el.root.classList.toggle("hasHbFooter", !!showFooter);
    }
    if (el.liveFooterBar) {
      el.liveFooterBar.style.display = showFooter ? "flex" : "none";
      el.liveFooterBar.hidden = !showFooter;
    }
    updateVizSetupButton();
    maybeStartViz();
  }

  function renderPhaseShell() {
    const isLiveish = (state.phase === "LIVE" || state.phase === "PAUSED") && !!state.currentSlotId;
    const phaseKey = JSON.stringify({ p: state.phase, cur: state.currentSlotId || null });
    if (phaseKey === lastPhaseKey) return;
    lastPhaseKey = phaseKey;

    if (!isLiveish) {
      showSplashShell();
    } else {
      // Footer visibility depends on HB + toggle
      const hbHasAny = OMJN.getHouseBandTopPerCategory(state).length > 0;
      const footerEnabled = state.viewerPrefs?.showHouseBandFooter !== false;
      showLiveShell(footerEnabled && hbHasAny);
    }
  }

  // ---- Splash render (state-driven) ----
  function renderSplashStatic() {
    const [n1, n2] = OMJN.computeNextTwo(state);
    const showNextTwo = state.splash?.showNextTwo !== false;

    const key = JSON.stringify({
      showNextTwo,
      n1: n1 ? { id: n1.id, n: n1.displayName, t: OMJN.displaySlotTypeLabel(state, n1), m: OMJN.effectiveMinutes(state, n1) } : null,
      n2: n2 ? { id: n2.id, n: n2.displayName, t: OMJN.displaySlotTypeLabel(state, n2), m: OMJN.effectiveMinutes(state, n2) } : null,
      hb: hbKey(),
      hbEnabled: state.viewerPrefs?.showHouseBandFooter !== false,
    });
    if (key === lastSplashKey) return;
    lastSplashKey = key;

    // Next / Deck cards
    if (el.sNext) el.sNext.textContent = showNextTwo ? (n1 ? slotName(n1) : "TBD") : "";
    if (el.sDeck) el.sDeck.textContent = showNextTwo ? (n2 ? slotName(n2) : "TBD") : "";

    const sub1 = n1 ? `${OMJN.displaySlotTypeLabel(state, n1)} • ${OMJN.effectiveMinutes(state, n1)}m` : "Sign ups open";
    const sub2 = n2 ? `${OMJN.displaySlotTypeLabel(state, n2)} • ${OMJN.effectiveMinutes(state, n2)}m` : "Get ready";
    if (el.sNextSub) el.sNextSub.textContent = showNextTwo ? sub1 : "";
    if (el.sDeckSub) el.sDeckSub.textContent = showNextTwo ? sub2 : "";

    // Optionally hide the Next/Deck cards entirely
    try {
      const nextCard = el.sNext?.closest?.(".vSplashCard");
      const deckCard = el.sDeck?.closest?.(".vSplashCard");
      if (nextCard) nextCard.style.display = showNextTwo ? "" : "none";
      if (deckCard) deckCard.style.display = showNextTwo ? "" : "none";
    } catch (_) {}

    // House Band card on Splash
    const footerEnabled = state.viewerPrefs?.showHouseBandFooter !== false;
    const hbTop = OMJN.getHouseBandTopPerCategory(state);
    const hbCard = el.hbLineup?.closest?.(".vBandCard");

    const hbK = hbKey();
    if (hbK !== lastHbSplashKey) {
      lastHbSplashKey = hbK;
      renderHouseBandLineup(el.hbLineup, { maxQueued: 10 });
    }

    const hasHB = !!(el.hbLineup && el.hbLineup.childElementCount);
    if (hbCard) hbCard.style.display = footerEnabled && hbTop.length && hasHB ? "" : "none";

    setBg();
  }

  // ---- LIVE render (state-driven, no timer tick) ----
  function renderNextDeckStatic() {
    const [n1, n2] = OMJN.computeNextTwo(state);
    const key = JSON.stringify({
      cur: state.currentSlotId || null,
      n1: n1 ? { id: n1.id, n: String(n1.displayName || "").trim() } : null,
      n2: n2 ? { id: n2.id, n: String(n2.displayName || "").trim() } : null,
    });
    if (key === lastNextDeckKey) return;
    lastNextDeckKey = key;

    if (el.liveNextUp) el.liveNextUp.textContent = slotName(n1);
    if (el.liveOnDeck) el.liveOnDeck.textContent = slotName(n2);
  }

  function renderLiveStatic() {
    const cur = OMJN.computeCurrent(state);
    if (!cur) return;

    const slotTypeId = String(cur.slotTypeId || "");
    const isHB = slotTypeId === "houseband";
    const isIM = slotTypeId === "intermission";

    if(el.root){
      el.root.classList.toggle("isHB", isHB);
      el.root.classList.toggle("isIM", isIM);
    }

    // Compute headline + chipType for special screens
    let nowLabelText = "NOW PERFORMING";
    let nowNameText = slotName(cur);
    let chipTypeText = OMJN.displaySlotTypeLabel(state, cur);
    let hbInstrumentsText = "";

    if(isIM){
      nowLabelText = "INTERMISSION";
      nowNameText = cleanName(cur.intermissionMessage || "WE'LL BE RIGHT BACK");
      chipTypeText = "INTERMISSION";
    }else if(isHB){
      nowLabelText = "HOUSE BAND";
      const lineup = Array.isArray(cur.hbLineup) ? cur.hbLineup : [];
      const names = lineup.map(x => cleanName(x?.name || "")).filter(Boolean);
      const roles = lineup.map(x => cleanName(x?.instrumentLabel || x?.instrument || "")).filter(Boolean);
      if(names.length){
        nowNameText = names.join(" • ");
      }else{
        nowNameText = "HOUSE BAND";
      }
      hbInstrumentsText = roles.join(" • ");
      chipTypeText = "HOUSE BAND";
    }

    // Defensive: if the headline name somehow ends up blank, restore it.
    if (el.nowName && !String(el.nowName.textContent || "").replace(/[\u200B-\u200D\uFEFF\u2060]/g, "").trim()) {
      el.nowName.textContent = nowNameText;
    }

    // Slot change reset
    if (lastSlotId !== cur.id) {
      clearCardCues();
      lastRemainingMs = null;
      lastCue = null;
      lastSlotId = cur.id;

      // Force timer/progress repaint immediately
      lastTimerText = null;
      lastWarnFinalKey = null;
      lastChipStateKey = null;
      lastProgressKey = null;
    }

    // Update main identity / type / donation / media + layout in a keyed way
    const donationUrl = String(cur.media?.donationUrl || "").trim();
    const media = cur.media || {};
    const mediaLayout = media.mediaLayout || "NONE";
    const staticKey = JSON.stringify({
      id: cur.id,
      nowLabelText,
      nowNameText,
      hbInstrumentsText,
      chipTypeText,
      donationUrl,
      mediaLayout,
      imageAssetId: media.imageAssetId || null,
    });

    if (staticKey !== lastSlotStaticKey) {
      lastSlotStaticKey = staticKey;

      if (el.nowLabel) el.nowLabel.textContent = nowLabelText;
      if (el.nowName) el.nowName.textContent = nowNameText;
      if (el.hbInstruments){
        const show = isHB && !!hbInstrumentsText;
        el.hbInstruments.style.display = show ? "" : "none";
        el.hbInstruments.textContent = show ? hbInstrumentsText : "";
      }
      if (el.chipType) el.chipType.textContent = chipTypeText;

      if (startIntroPending) {
        // For special screens, animate the headline name (message/member).
        triggerStartIntro(nowNameText);
        startIntroPending = false;
      }

      // Donation
      if (donationUrl) {
        if (el.donationText) el.donationText.textContent = donationUrl;
        if (el.donationCard) el.donationCard.style.display = "block";
      } else {
        if (el.donationText) el.donationText.textContent = "";
        if (el.donationCard) el.donationCard.style.display = "none";
      }

      // Media (async)
      setMedia(cur).catch(() => {});

      // Hero card: show/hide the embedded media section
      const hasImage = mediaLayout === "IMAGE_ONLY" ? !!media.imageAssetId : mediaLayout === "QR_ONLY" || mediaLayout === "IMAGE_PLUS_QR";
      const hasLink = !!donationUrl;
      const showMedia = hasImage || hasLink;

      // Media layout hint classes (used by CSS to size the media box correctly)
      const isQrLayout = mediaLayout === "QR_ONLY" || mediaLayout === "IMAGE_PLUS_QR";
      const isImageOnly = mediaLayout === "IMAGE_ONLY";
      if (el.root) {
        el.root.classList.toggle("mediaQR", isQrLayout);
        el.root.classList.toggle("mediaImage", isImageOnly);
      }

      const layoutKey = JSON.stringify({ showMedia });
      if (layoutKey !== lastLayoutKey) {
        lastLayoutKey = layoutKey;
        if (el.root) el.root.classList.toggle("noMediaPane", !showMedia);
        if (el.vMediaPane) el.vMediaPane.style.display = showMedia ? "block" : "none";
        if (el.vMedia) el.vMedia.style.display = showMedia ? "flex" : "none";
      }

      // Progress bar visibility toggle (static) (static)
      const showProgress = state.viewerPrefs?.showProgressBar !== false;
      if (el.progress) {
        el.progress.hidden = !showProgress;
        el.progress.setAttribute("aria-hidden", showProgress ? "false" : "true");
      }
    }

    // Next/Deck
    renderNextDeckStatic();

    // House Band footer (LIVE)
    const hbK = hbKey();
    if (hbK !== lastHbLiveKey) {
      lastHbLiveKey = hbK;
      renderHouseBandLineup(el.hbLiveLineup, { compact: true });
    }

    // Background
    setBg();
  }

  // ---- LIVE timer tick (cheap) ----
  function updateTimerAndCues() {
    const isLiveish = (state.phase === "LIVE" || state.phase === "PAUSED") && !!state.currentSlotId;
    if (!isLiveish) return;

    const cur = OMJN.computeCurrent(state);
    if (!cur) return;

    const t = OMJN.computeTimer(state);
    const remainingMs = t.remainingMs;
    const overtimeMs = t.overtimeMs;

    // Timer text
    const timerText = OMJN.formatMMSS(remainingMs);
    if (timerText !== lastTimerText) {
      lastTimerText = timerText;
      if (el.timer) el.timer.textContent = timerText;
    }

    // Phase chip
    const chipStateKey = state.phase;
    if (chipStateKey !== lastChipStateKey) {
      lastChipStateKey = chipStateKey;
      if (el.chipState) {
        el.chipState.textContent = state.phase === "PAUSED" ? "PAUSED" : "LIVE";
        el.chipState.className = "vChip " + (state.phase === "PAUSED" ? "warn" : "good");
      }
    }

    // Threshold chips
    const warnAtMs = (state.viewerPrefs?.warnAtSec ?? 120) * 1000;
    const finalAtMs = (state.viewerPrefs?.finalAtSec ?? 30) * 1000;

    const warnShow = remainingMs > 0 && remainingMs <= warnAtMs && remainingMs > finalAtMs;
    const finalShow = remainingMs > 0 && remainingMs <= finalAtMs;
    const overShow = overtimeMs > 0 && (state.viewerPrefs?.showOvertime !== false);

    const warnFinalKey = JSON.stringify({ warnShow, finalShow, overShow, overtimeText: overShow ? OMJN.formatMMSS(overtimeMs) : "" });
    if (warnFinalKey !== lastWarnFinalKey) {
      lastWarnFinalKey = warnFinalKey;
      if (el.chipWarn) el.chipWarn.style.display = warnShow ? "inline-flex" : "none";
      if (el.chipFinal) el.chipFinal.style.display = finalShow ? "inline-flex" : "none";
      if (el.chipOver) {
        if (overShow) {
          el.chipOver.style.display = "inline-flex";
          el.chipOver.textContent = `Overtime +${OMJN.formatMMSS(overtimeMs)}`;
          el.chipOver.className = "vChip final";
        } else {
          el.chipOver.style.display = "none";
        }
      }
    }

    // Progress bar (optional)
    if (el.progress && !el.progress.hidden && el.progressFill) {
      const frac = t.durationMs > 0 ? (t.elapsedMs / t.durationMs) : 0;
      const clamped = Math.max(0, Math.min(1, frac));
      const over = frac > 1;

      const progressKey = `${Math.round(clamped * 1000)}|${over ? 1 : 0}`;
      if (progressKey !== lastProgressKey) {
        lastProgressKey = progressKey;
        el.progress.classList.toggle("overtime", over);
        el.progressFill.style.transform = `scaleX(${clamped})`;
      }
    }

    // Cues
    applyCardCues(remainingMs, warnAtMs, finalAtMs);

    // Visualizer gating
    maybeStartViz();
  }

  // ---- Main render (state-driven) ----
  
  // ---- Ads (Graphic + Video) ----
  async function setAdVisible(on){
    if(!el.adLayer) return;
    el.adLayer.style.display = on ? "" : "none";
    el.root?.classList.toggle("isAd", !!on);

    if(!on){
      if(el.adFail) el.adFail.style.display = "none";

      if(el.adImg){
        el.adImg.style.display = "none";
        el.adImg.removeAttribute("src");
      }
      if(el.adVideo){
        try{ el.adVideo.pause(); }catch(_){}
        el.adVideo.style.display = "none";
        el.adVideo.removeAttribute("src");
        el.adVideo.loop = false;
        el.adVideo.muted = true;
      }

      if(adBlobUrl){
        try{ URL.revokeObjectURL(adBlobUrl); }catch(_){}
        adBlobUrl = null;
      }
    }
  }

  async function renderAdSlot(slot){
    const ad = slot?.ad || {};
    const kind = (String(ad.kind || "").toLowerCase() === "video" || String(slot?.slotTypeId || "") === "ad_video") ? "video" : "graphic";
    const source = String(ad.source || ad.sourceMode || "").toLowerCase();
    let src = "";

    if(source === "upload" && ad.assetId){
      try{
        const blob = await OMJN.getAsset(ad.assetId);
        if(blob){
          if(adBlobUrl){
            try{ URL.revokeObjectURL(adBlobUrl); }catch(_){}
            adBlobUrl = null;
          }
          adBlobUrl = URL.createObjectURL(blob);
          src = adBlobUrl;
        }
      }catch(_){ /* ignore */ }
    } else {
      src = String(ad.url || "").trim();
    }

    if(!src){
      if(el.adFail) el.adFail.style.display = "";
      return;
    }
    if(el.adFail) el.adFail.style.display = "none";

    // Video
    if(kind === "video" && el.adVideo){
      if(el.adImg){
        el.adImg.style.display = "none";
        el.adImg.removeAttribute("src");
      }

      el.adVideo.style.display = "";
      el.adVideo.loop = !!ad.loop;
      el.adVideo.muted = !(ad.audioOn === true);
      el.adVideo.onerror = () => { if(el.adFail) el.adFail.style.display = ""; };
      el.adVideo.src = src;
      try{ el.adVideo.load(); }catch(_){}
      const p = el.adVideo.play?.();
      if(p && typeof p.catch === "function") p.catch(() => {});
      return;
    }

    // Image
    if(el.adVideo){
      try{ el.adVideo.pause(); }catch(_){}
      el.adVideo.style.display = "none";
      el.adVideo.removeAttribute("src");
    }

    if(!el.adImg) return;
    el.adImg.style.display = "";

    await new Promise((resolve) => {
      if(!el.adImg) return resolve();
      el.adImg.onerror = () => {
        if(el.adFail) el.adFail.style.display = "";
        resolve();
      };
      el.adImg.onload = () => resolve();
      el.adImg.src = src;
    });
  }

function renderStateDriven() {
    renderPhaseShell();

    const isLiveish = (state.phase === "LIVE" || state.phase === "PAUSED") && !!state.currentSlotId;
    const cur = isLiveish ? (state.queue || []).find(x => x && x.id === state.currentSlotId) : null;
    const isAd = !!cur && (String(cur.slotTypeId || "") === "ad_graphic" || String(cur.slotTypeId || "") === "ad_video");

    if (!isLiveish) {
      setAdVisible(false);
      renderSplashStatic();
    } else if (isAd) {
      // Ad mode: full-screen image, no timer/next/deck/sponsor/viz/footer
      showLiveShell(false);
      setAdVisible(true);
      renderAdSlot(cur).catch(() => {});
    } else {
      setAdVisible(false);
      // Footer visibility may change if HB changes (toggle handled by state)
      const hbHasAny = OMJN.getHouseBandTopPerCategory(state).length > 0;
      const footerEnabled = state.viewerPrefs?.showHouseBandFooter !== false;
      showLiveShell(footerEnabled && hbHasAny);
      renderLiveStatic();
    }

    // Crowd Prompts overlay (can show during any phase)
    renderCrowdPrompts();

    // Sponsor bug overlay (state-driven; also called when crowd visibility changes)
    setSponsorBug().catch(() => {});

    // Visualizer setup button
    updateVizSetupButton();
    maybeStartViz();

    // Apply theme
    OMJN.applyThemeToDocument(document, state);

  let adBlobUrl = null;

    // Ensure timer UI is correct immediately
    updateTimerAndCues();
  }

  // ---- Subscribe to state updates ----
  OMJN.subscribe((s) => {
    const prevPhase = state?.phase;
    state = s;

    if (prevPhase === "SPLASH" && (state.phase === "LIVE" || state.phase === "PAUSED") && state.currentSlotId) {
      startIntroPending = true;
    }

    renderStateDriven();
  });

  // ---- Boot ----
  if (el.btnVizMic) {
    el.btnVizMic.addEventListener("click", async () => {
      const ok = await enableMicForVisualizer();
      if (ok) updateVizSetupButton();
    });
  }
  // Also allow clicking the visualizer area itself to grant mic access.
  if (el.vVizWrap) {
    el.vVizWrap.addEventListener("click", async () => {
      if (!vizEnabled() || viz.stream) return;
      const ok = await enableMicForVisualizer();
      if (ok) updateVizSetupButton();
    });
  }

  // If mic permission is already granted, we can enable without a click.
  (async () => {
    try {
      if (!vizEnabled()) return;
      if (!navigator.permissions?.query) return;
      const p = await navigator.permissions.query({ name: "microphone" });
      if (p?.state === "granted") {
        await enableMicForVisualizer();
      }
    } catch (_) {}
  })();

  // Reposition sponsor bug on resize (safe areas + footer height)
  window.addEventListener("resize", () => {
    lastSponsorKey = null;
    setSponsorBug().catch(() => {});
    resizeVizCanvas();
  });

  renderStateDriven();

  // Cheap live timer updates
  setInterval(updateTimerAndCues, 120);
})();
