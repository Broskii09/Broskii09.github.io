/* Viewer UI */
(() => {
  let state = OMJN.loadState();
  OMJN.applyThemeToDocument(document, state);

  let lastRemainingMs = null;
  let lastSlotId = null;
  let overtimeFlashTimeout = null;

  const bg = document.getElementById("bg");
  const overlay = document.getElementById("overlay");
  const splashInfo = document.getElementById("splashInfo");
  const liveFooter = document.getElementById("liveFooter");
  const vShowTitle = document.getElementById("vShowTitle");

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

  const hbLineup = document.getElementById("hbLineup");
  const hbLiveLineup = document.getElementById("hbLiveLineup");
  const lfNext = document.getElementById("lfNext");
  const lfDeck = document.getElementById("lfDeck");

  let currentAssetUrl = null;

  function setBg(){
    const path = state.splash?.backgroundAssetPath || "./assets/splash_BG.jpg";
    bg.style.backgroundImage = `url('${path}')`;
  }

  function renderHouseBandLineup(targetEl, opts={}){
    if(!targetEl) return;
    const compact = !!opts.compact;
    const members = (state.houseBand || []).filter(m => m && m.active !== false);
    targetEl.innerHTML = "";

    if(!members.length){
      const empty = document.createElement("div");
      empty.className = "small";
      empty.style.opacity = ".85";
      empty.textContent = "—";
      targetEl.appendChild(empty);
      return;
    }

    for(const m of members){
      OMJN.normalizeHouseBandMember(m);

      const chip = document.createElement("span");
      chip.className = "hbChip" + ((m.cooldownRemaining > 0) ? " cooling" : "");
      const label = OMJN.houseBandMemberLabel(m) || "—";
      chip.textContent = label;

      // cooldown indicator
      if(m.cooldownRemaining > 0){
        const cd = document.createElement("span");
        cd.className = "hbCd mono";
        cd.textContent = `CD ${m.cooldownRemaining}`;
        chip.appendChild(cd);
      }

      // skill tags
      const tags = Array.isArray(m.skillTags) ? m.skillTags : [];
      for(const t of tags){
        const tag = document.createElement("span");
        tag.className = "hbTag";
        tag.textContent = t;
        chip.appendChild(tag);
      }

      targetEl.appendChild(chip);
    }

    if(compact){
      // nothing special for now; CSS handles it
    }
  }


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
    }, 1050);
  }

  function applyCardCues(remainingMs, warnAtMs, finalAtMs){
    if(!vMainCard) return;

    // One-time flash when crossing into overtime
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
    splashInfo.style.display = "grid";
    if(liveFooter) liveFooter.style.display = "none";

    if(vShowTitle) vShowTitle.textContent = state.showTitle || "Open Mic & Jam Night";

    clearCardCues();
    lastRemainingMs = null;
    lastSlotId = null;

    const [n1, n2] = OMJN.computeNextTwo(state);
    sNext.textContent = n1?.displayName || "TBD";
    sDeck.textContent = n2?.displayName || "TBD";

    // subtext: slot type + minutes
    const sub1 = n1 ? `${OMJN.displaySlotTypeLabel(state, n1)} • ${OMJN.effectiveMinutes(state, n1)}m` : "Sign ups open";
    const sub2 = n2 ? `${OMJN.displaySlotTypeLabel(state, n2)} • ${OMJN.effectiveMinutes(state, n2)}m` : "Get ready";
    sNextSub.textContent = sub1;
    sDeckSub.textContent = sub2;

    renderHouseBandLineup(hbLineup);

    setBg();
  }

  async function renderLive(){
    overlay.style.display = "grid";
    splashInfo.style.display = "none";
    if(liveFooter) liveFooter.style.display = "flex";

    if(vShowTitle) vShowTitle.textContent = state.showTitle || "Open Mic & Jam Night";

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

    // next line
    const [n1] = OMJN.computeNextTwo(state);
    nextLine.innerHTML = `Next: <strong>${n1?.displayName || "—"}</strong>`;

    // Small footer (Next / On Deck) during LIVE
    if(lfNext) lfNext.textContent = n1?.displayName || "—";
    if(lfDeck){
      const [, n2] = OMJN.computeNextTwo(state);
      lfDeck.textContent = n2?.displayName || "—";
    }
    renderHouseBandLineup(hbLiveLineup, { compact:true });

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
    const hasImage = !!(cur.media && cur.media.imageAssetId && ["IMAGE_ONLY","QR_ONLY","IMAGE_PLUS_QR"].includes(cur.media.mediaLayout));
    const hasLink = !!(cur.media && cur.media.donationUrl);
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
    state = s;
    OMJN.applyThemeToDocument(document, state);
    render().catch(()=>{});
  });

  // Boot
  render().catch(()=>{});
  setInterval(tick, 250);
})();
