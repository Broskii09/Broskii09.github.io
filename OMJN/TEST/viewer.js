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
  const DEFAULT_QR_SRC = "./assets/OMJN-QR.jpg";

  const bg = document.getElementById("bg");
  const root = document.getElementById("root");
  const overlay = document.getElementById("overlay");
  const splashInfo = document.getElementById("splashInfo");
  const liveFooterBar = document.getElementById("liveFooterBar");

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

  let currentAssetUrl = null;
  let lastMediaKey = null;
  let lastBgPath = null;

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
  render().catch(()=>{});
  setInterval(tick, 250);
})();
