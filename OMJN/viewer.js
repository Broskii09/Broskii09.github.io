/* Viewer UI */
(() => {
  let state = OMJN.loadState();
  OMJN.applyThemeToDocument(document, state);
  let lastRemainingMs = null;
  let overtimeFlashTimeout = null;

  const bg = document.getElementById("bg");
  const overlay = document.getElementById("overlay");
  const splashInfo = document.getElementById("splashInfo");

  const vMainCard = document.getElementById("vMainCard");
  const nowName = document.getElementById("nowName");
  const timerEl = document.getElementById("timer");
  const chipState = document.getElementById("chipState");
  const chipType = document.getElementById("chipType");
  const chipOver = document.getElementById("chipOver");
  const chipWarn = document.getElementById("chipWarn");
  const chipFinal = document.getElementById("chipFinal");
  const nextLine = document.getElementById("nextLine");

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

  const jamSpot = document.getElementById("jamSpot");
  const jamSpotName = document.getElementById("jamSpotName");

  let currentAssetUrl = null;

  function setBg(){
    const path = state.splash?.backgroundAssetPath || "./assets/splash.svg";
    bg.style.backgroundImage = `url('${path}')`;
  }

  async function setMedia(slot){
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

    const media = slot.media || {};
    const wantImage = ["IMAGE_ONLY","QR_ONLY","IMAGE_PLUS_QR"].includes(media.mediaLayout) && !!media.imageAssetId;

    if(!wantImage){
      mediaBox.style.display = "none";
      mediaImg.style.display = "none";
      mediaEmpty.style.display = "none";
      return;
    }

    const blob = await OMJN.getAsset(media.imageAssetId);
    if(!blob){
      mediaBox.style.display = "none";
      mediaImg.style.display = "none";
      mediaEmpty.style.display = "none";
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
    splashInfo.style.display = "flex";

    const [n1, n2] = OMJN.computeNextTwo(state);
    sNext.textContent = n1?.displayName || "TBD";
    sDeck.textContent = n2?.displayName || "TBD";

    // little subtext: show slot type + minutes
    const sub1 = n1 ? `${OMJN.displaySlotTypeLabel(state, n1)} • ${OMJN.effectiveMinutes(state, n1)}m` : "Sign ups open";
    const sub2 = n2 ? `${OMJN.displaySlotTypeLabel(state, n2)} • ${OMJN.effectiveMinutes(state, n2)}m` : "Get ready";
    sNextSub.textContent = sub1;
    sDeckSub.textContent = sub2;

    // background is splash graphic
    setBg();
  }

  async function renderLive(){
    overlay.style.display = "grid";
    splashInfo.style.display = "none";

    const cur = OMJN.computeCurrent(state);
    if(!cur){
      renderSplash();
      return;
    }

    const type = OMJN.getSlotType(state, cur.slotTypeId);
    nowName.textContent = cur.displayName || "—";
    chipType.textContent = OMJN.displaySlotTypeLabel(state, cur);

    // timer
    const t = OMJN.computeTimer(state);
    const remainingMs = t.remainingMs;
    const overtimeMs = t.overtimeMs;

    timerEl.textContent = OMJN.formatMMSS(remainingMs);

    // chips
    chipState.textContent = state.phase === "PAUSED" ? "PAUSED" : "LIVE";
    chipState.className = "vChip " + (state.phase === "PAUSED" ? "warn" : "good");

    // warning thresholds
    const warnAt = (state.viewerPrefs?.warnAtSec ?? 120) * 1000;
    const finalAt = (state.viewerPrefs?.finalAtSec ?? 30) * 1000;

    chipWarn.style.display = (remainingMs > 0 && remainingMs <= warnAt && remainingMs > finalAt) ? "inline-flex" : "none";
    chipFinal.style.display = (remainingMs > 0 && remainingMs <= finalAt) ? "inline-flex" : "none";

    // overtime
    if(overtimeMs > 0){
      chipOver.style.display = "inline-flex";
      chipOver.textContent = `Overtime +${OMJN.formatMMSS(overtimeMs)}`;
      chipOver.className = "vChip final";
    } else {
      chipOver.style.display = "none";
    }

    // next line
    const [n1] = OMJN.computeNextTwo(state);
    nextLine.innerHTML = `Next: <strong>${n1?.displayName || "—"}</strong>`;

    // donation link
    const url = cur.media?.donationUrl || "";
    if(url){
      donationText.textContent = url;
      donationCard.style.display = "block";
    } else {
      donationText.textContent = "";
      donationCard.style.display = "none";
    }

    // jam spotlight
    const showJam = type.isJamMode && state.features?.jamEnabled;
    if(showJam && cur.jam){
      const active = cur.jam.subList?.find(x=>x.id===cur.jam.activeJamEntryId) || null;
      jamSpot.hidden = false;
      jamSpotName.textContent = active?.name || "—";
    }else{
      jamSpot.hidden = true;
    }

    // media
    await setMedia(cur);

    const hasImage = !!(cur.media && cur.media.imageAssetId && ["IMAGE_ONLY","QR_ONLY","IMAGE_PLUS_QR"].includes(cur.media.mediaLayout));
    const hasLink = !!(cur.media && cur.media.donationUrl);
    if(!hasImage && !hasLink){
      vMedia.style.display = "none";
      overlay.style.gridTemplateColumns = "1fr";
    } else {
      vMedia.style.display = "flex";
      overlay.style.gridTemplateColumns = "1.25fr .75fr";
    }

    // keep background as splash or could be dark; use splash for consistency
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
    // Only rerender parts that need to update every frame? For MVP, rerender is fine.
    render().catch(()=>{});
  }

  // Subscribe to state updates
  OMJN.subscribe((s) => {
    state = s;
    render().catch(()=>{});
  });

  // Boot
  render().catch(()=>{});
  setInterval(tick, 250);
})();
  function clearCardCues(){
    if(!vMainCard) return;
    vMainCard.classList.remove("pulseWarn","pulseFinal","overtimeFlash");
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
    }, 1150);
  }

  function applyCardCues(remainingMs, warnAtMs, finalAtMs){
    if(!vMainCard) return;

    // Detect transition into overtime for one-time flash
    if(lastRemainingMs !== null && lastRemainingMs > 0 && remainingMs <= 0){
      triggerOvertimeFlash();
    }

    // Pulse behavior only while time is still remaining
    vMainCard.classList.remove("pulseWarn","pulseFinal");
    if(remainingMs > 0 && remainingMs <= warnAtMs && remainingMs > finalAtMs){
      vMainCard.classList.add("pulseWarn");
    } else if(remainingMs > 0 && remainingMs <= finalAtMs){
      vMainCard.classList.add("pulseFinal");
    }

    lastRemainingMs = remainingMs;
  }


