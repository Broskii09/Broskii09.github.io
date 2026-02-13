/**
 * OMJN - Shared state + persistence + realtime channel
 * Static site friendly: BroadcastChannel for live sync, localStorage for state, IndexedDB for images.
 */
const OMJN = (() => {
  const LEGACY_STORAGE_KEY = "omjn.showState.v1";

// Scope storage by path so /OMJN and /OMJN/TEST don't share state.
// GitHub Pages uses a single origin (broskii09.github.io), and Web Storage + IndexedDB + BroadcastChannel
// are origin-scoped (not directory-scoped), so we namespace keys by environment.
const APP_SCOPE = (() => {
  try{
    const parts = (location.pathname || "").split("/").filter(Boolean).map(s => s.toLowerCase());
    return parts.includes("test") ? "test" : "prod";
  }catch(_){
    return "prod";
  }
})();

const CHANNEL_NAME = `omjn_${APP_SCOPE}_channel_v1`;
const STORAGE_KEY = `omjn.${APP_SCOPE}.showState.v1`;
const ASSET_DB = { name: `omjn_${APP_SCOPE}_assets_v1`, store: "assets" };

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
      // Updated automatically on every publish()
      lastSavedAt: null,
      showTitle: "Open Mic & Jam Night",
      phase: "SPLASH", // SPLASH | LIVE | PAUSED
operatorPrefs: { startGuard:true, endGuard:true, hotkeysEnabled:true, editCollapsed:false },
      profiles: {},
        splash: { backgroundAssetPath: "./assets/splash_BG.jpg", showNextTwo: true },
      viewerPrefs: {
        warnAtSec: 120,
        finalAtSec: 30,
        showOvertime: true,
        showProgressBar: true,
        // Viewer legibility
        autoScale: true,
        scaleBias: 1.0,
        // 0 / 0.03 / 0.06 / 0.09
        safeAreaPct: 0.03,
        showHouseBandFooter:true,
        hbFooterFormat:"categoryFirst",
        // Mic-based audio visualizer (Viewer)
        visualizerEnabled: false,
        visualizerSensitivity: 1.0,
        // eq (spectrum) or volume (level)
        visualizerMode: "eq",
        // mirror (center-out) or ltr (left-to-right)
        visualizerDirection: "mirror",

        sponsorBug: {
          enabled: false,
          showLiveOnly: true,
          sourceType: "upload", // upload | url
          uploadAssetId: null,
          url: "",
          position: "TR", // TL | TR | BL | BR
          scale: 1.0,
          maxSizePct: 18,
          opacity: 1.0,
          safeMargin: 16,
        },

        // Full-screen Crowd Prompts slides (House Rules + hype prompts)
        crowdPrompts: {
          enabled: false,
          activePresetId: "house_rules",
          presets: [
            {
              id: "house_rules",
              name: "House Rules",
              title: "HOUSE RULES",
              lines: [
                "Be respectful — cheer for everyone.",
                "Keep it moving — set up fast.",
                "No hate speech or harassment.",
                "Tip your host & bartenders."
              ],
              footer: "Thanks for being here!",
              autoHideSeconds: 0
            },
            {
              id: "cheer",
              name: "Cheer",
              title: "CHEER!",
              lines: ["Make some noise for the next performer!"],
              footer: "",
              autoHideSeconds: 5
            },
            {
              id: "applause",
              name: "Applause",
              title: "APPLAUSE",
              lines: ["Give it up!"],
              footer: "",
              autoHideSeconds: 4
            },
            {
              id: "noise",
              name: "Make Some Noise",
              title: "MAKE SOME NOISE",
              lines: [],
              footer: "",
              autoHideSeconds: 4
            },
            {
              id: "custom",
              name: "Custom",
              title: "CUSTOM PROMPT",
              lines: [""],
              footer: "",
              autoHideSeconds: 0
            }
          ]
        },
      },
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
        { id:"comedian", label:"Comedian", defaultMinutes:10, isJamMode:false, color:"#2dd4bf", enabled:true },
        { id:"poetry", label:"Poetry", defaultMinutes:10, isJamMode:false, color:"#fbbf24", enabled:true },
        { id:"custom", label:"Custom", defaultMinutes:15, isJamMode:false, color:"#a3a3a3", enabled:true },
        { id:"houseband", label:"House Band", defaultMinutes:15, isJamMode:false, color:"#22c55e", enabled:false, special:true },
        { id:"intermission", label:"Intermission", defaultMinutes:10, isJamMode:false, color:"#a855f7", enabled:false, special:true },
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
      timer: { running:false, startedAt:null, pausedAt:null, elapsedMs:0, baseDurationMs:null },
      assetsIndex: {} // assetId -> { mime, w, h, bytes, createdAt }
    };
  }

  function loadState(){
  try{
    const raw = localStorage.getItem(STORAGE_KEY);
    const d = defaultState();

    // One-time migration: PROD picks up legacy unscoped key, then deletes it.
    let effectiveRaw = raw;
    if(!effectiveRaw && APP_SCOPE === "prod"){
      const legacy = localStorage.getItem(LEGACY_STORAGE_KEY);
      if(legacy){
        effectiveRaw = legacy;
        try{
          localStorage.setItem(STORAGE_KEY, legacy);
          localStorage.removeItem(LEGACY_STORAGE_KEY);
        }catch(_){}
      }
    }

    if(!effectiveRaw) return d;

    const s = JSON.parse(effectiveRaw);

      if(!s.version) s.version = 1;
      if(s.lastSavedAt === undefined) s.lastSavedAt = null;
if(!s.operatorPrefs) s.operatorPrefs = { startGuard:true, endGuard:true, hotkeysEnabled:true, editCollapsed:false };
      if(s.operatorPrefs.editCollapsed === undefined) s.operatorPrefs.editCollapsed = false;

      if(!s.profiles) s.profiles = {};
      if (!s.splash) s.splash = { backgroundAssetPath: "./assets/splash_BG.jpg", showNextTwo: true };
      if(!s.viewerPrefs) s.viewerPrefs = d.viewerPrefs;
      // Viewer legibility prefs
      if(s.viewerPrefs.autoScale === undefined) s.viewerPrefs.autoScale = (d.viewerPrefs.autoScale !== false);
      if(s.viewerPrefs.scaleBias === undefined) s.viewerPrefs.scaleBias = Number(d.viewerPrefs.scaleBias ?? 1.0);
      else {
        const b = Number(s.viewerPrefs.scaleBias);
        s.viewerPrefs.scaleBias = Number.isFinite(b) ? Math.max(0.90, Math.min(1.40, b)) : 1.0;
      }
      if(s.viewerPrefs.safeAreaPct === undefined) s.viewerPrefs.safeAreaPct = Number(d.viewerPrefs.safeAreaPct ?? 0.03);
      else {
        const raw = Number(s.viewerPrefs.safeAreaPct);
        const allowed = [0, 0.03, 0.06, 0.09];
        const v = Number.isFinite(raw) ? raw : 0;
        s.viewerPrefs.safeAreaPct = allowed.reduce((best, cur) => (Math.abs(cur - v) < Math.abs(best - v) ? cur : best), allowed[0]);
      }
      if(s.viewerPrefs.visualizerEnabled === undefined) s.viewerPrefs.visualizerEnabled = false;
      if(s.viewerPrefs.visualizerSensitivity === undefined) s.viewerPrefs.visualizerSensitivity = 1.0;
      if(s.viewerPrefs.visualizerMode === undefined) s.viewerPrefs.visualizerMode = "eq";
      if(s.viewerPrefs.visualizerDirection === undefined) s.viewerPrefs.visualizerDirection = "mirror";
      if(!s.viewerPrefs.sponsorBug) s.viewerPrefs.sponsorBug = d.viewerPrefs.sponsorBug;
      else {
        const b = s.viewerPrefs.sponsorBug;
        const bd = d.viewerPrefs.sponsorBug;
        for(const k of Object.keys(bd)){
          if(b[k] === undefined) b[k] = bd[k];
        }
      }
      // Crowd Prompts migration
      if(!s.viewerPrefs.crowdPrompts) s.viewerPrefs.crowdPrompts = d.viewerPrefs.crowdPrompts;
      else {
        const c = s.viewerPrefs.crowdPrompts;
        const cd = d.viewerPrefs.crowdPrompts;
        for(const k of Object.keys(cd)){
          if(c[k] === undefined) c[k] = cd[k];
        }
        if(!Array.isArray(c.presets) || !c.presets.length) c.presets = cd.presets;
        // Ensure preset shapes (merge defaults by id)
        const byId = new Map((cd.presets || []).map(p => [p.id, p]));
        c.presets = (c.presets || []).map(p => Object.assign({}, byId.get(p.id) || {}, p || {}));
        if(!c.activePresetId || !c.presets.some(p => p.id === c.activePresetId)){
          c.activePresetId = (c.presets[0] && c.presets[0].id) ? c.presets[0].id : cd.activePresetId;
        }
      }
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

      // Consolidate legacy special slot types (prevents duplicates like "Graphic Ad" vs "Ad (Graphic)")
      {
        const alias = new Map([
          ["adGraphic", "ad_graphic"],
          ["graphicAd", "ad_graphic"],
          ["graphic_ad", "ad_graphic"],
          ["houseBand", "houseband"],
          ["house_band", "houseband"],
          ["intermissionBreak", "intermission"],
          ["break", "intermission"],
        ]);

        // Alias by label for older builds that used different IDs.
        for(const t of (s.slotTypes || [])){
          const id = String(t?.id || "");
          const label = String(t?.label || "");
          if(!id || alias.has(id)) continue;
          if(/ad\s*\(\s*graphic\s*\)/i.test(label) || /graphic\s*ad/i.test(label)){
            alias.set(id, "ad_graphic");
            continue;
          }
          if(/house\s*band/i.test(label)){
            alias.set(id, "houseband");
            continue;
          }
          if(/intermission/i.test(label)){
            alias.set(id, "intermission");
            continue;
          }
        }

        // Remap existing queue items to canonical IDs.
        for(const slot of (s.queue || [])){
          const mapped = alias.get(String(slot?.slotTypeId || ""));
          if(mapped) slot.slotTypeId = mapped;
        }

        // Remove aliased slotTypes if the canonical type exists.
        const coreIds = new Set((d.slotTypes || []).map(t => t.id));
        if(Array.isArray(s.slotTypes)){
          const present = new Set(s.slotTypes.map(t => t?.id).filter(Boolean));
          const toRemove = new Set();
          for(const [from, to] of alias.entries()){
            if(from === to) continue;
            if(coreIds.has(to) && present.has(from) && present.has(to)) toRemove.add(from);
          }
          if(toRemove.size){
            s.slotTypes = s.slotTypes.filter(t => t && t.id && !toRemove.has(t.id));
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

      // Normalize ordering so dropdowns match the default order.
      // Prevents newly-added core types (like "poetry") from always appearing at the end
      // when a user already has slotTypes saved in localStorage.
      {
        const coreOrder = (d.slotTypes || []).map(t => t.id);
        const coreSet = new Set(coreOrder);

        const byId = new Map();
        for(const t of (s.slotTypes || [])){
          if(t && t.id) byId.set(t.id, t);
        }

        const ordered = [];
        for(const id of coreOrder){
          const t = byId.get(id);
          if(t){
            ordered.push(t);
            byId.delete(id);
          }
        }

        // Keep any extra (non-core) types in their existing relative order.
        const extras = (s.slotTypes || []).filter(t => t && t.id && !coreSet.has(t.id));
        s.slotTypes = [...ordered, ...extras];
      }

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
  

  // Flatten HB members into a single combined ordering.
  // merge:
  // - "concat" (default): category order, then list order
  // - "roundRobin": interleave categories while respecting each category queue order
  function allHouseBandMembers(state, opts={}){
    ensureHouseBandQueues(state);
    const activeOnly = !!opts.activeOnly;
    const merge = String(opts.merge || "concat");

    const buckets = HOUSE_BAND_CATEGORIES.map(cat => {
      const list = state.houseBandQueues?.[cat.key] || [];
      const items = [];
      for(const m of list){
        normalizeHouseBandMember(m);
        if(activeOnly && m.active === false) continue;
        items.push({ categoryKey: cat.key, categoryLabel: cat.label, member: { ...m } });
      }
      return items;
    });

    if(merge === "roundRobin"){
      const out = [];
      const ptr = buckets.map(() => 0);
      let advanced = true;
      while(advanced){
        advanced = false;
        for(let i=0;i<buckets.length;i++){
          const list = buckets[i];
          const p = ptr[i];
          if(p < list.length){
            out.push(list[p]);
            ptr[i] = p + 1;
            advanced = true;
          }
        }
      }
      return out;
    }

    // concat
    return buckets.flat();
  }

  function findHouseBandMemberById(state, memberId){
    const id = String(memberId || "").trim();
    if(!id) return null;
    ensureHouseBandQueues(state);
    for(const cat of HOUSE_BAND_CATEGORIES){
      const list = state.houseBandQueues?.[cat.key] || [];
      const m = list.find(x => {
        normalizeHouseBandMember(x);
        return x.id === id;
      });
      if(m) return { categoryKey: cat.key, categoryLabel: cat.label, member: { ...m } };
    }
    return null;
  }

  // House Band "feature" pick for a HOUSE BAND slot
  // Priority: explicit override (hbFeaturedId) → locked pick at start (hbShownId) → first active in HB lists
  function getHouseBandFeaturedForSlot(state, slot){
    ensureHouseBandQueues(state);
    const forcedId = String(slot?.hbFeaturedId || "").trim();
    const lockedId = String(slot?.hbShownId || "").trim();
    const pickId = forcedId || lockedId;
    if(pickId){
      const found = findHouseBandMemberById(state, pickId);
      if(found) return found;
    }
    const first = allHouseBandMembers(state, { activeOnly:true, merge:"roundRobin" })[0] || null;
    return first;
  }

  // --- House Band Set Builder helpers ---

  function houseBandInstrumentLabelForMember(m){
    if(!m) return "";
    const instId = String(m.instrumentId || "").trim();
    if(instId === "custom") return sanitizeText(m.customInstrument || "");
    return (HOUSE_BAND_INSTRUMENTS.find(x => x.id === instId)?.label || "");
  }

  function houseBandMembersInCategory(state, categoryKey, opts={}){
  ensureHouseBandQueues(state);
  const key = String(categoryKey || "").trim();
  const cat = HOUSE_BAND_CATEGORIES.find(c => c.key === key) || { key, label: key };
  const activeOnly = (opts.activeOnly !== false);
  const list = Array.isArray(state.houseBandQueues?.[key]) ? state.houseBandQueues[key] : [];
  const out = [];
  for(const m of list){
    normalizeHouseBandMember(m);
    if(activeOnly && m.active === false) continue;
    out.push({ categoryKey: key, categoryLabel: cat.label, member: { ...m } });
  }
  return out;
}

function houseBandSuggestedInCategory(state, categoryKey){
  // Suggested = first ACTIVE member in the category's current order
  const list = houseBandMembersInCategory(state, categoryKey, { activeOnly: true });
  return list[0] || null;
}

function houseBandActiveMembersByCategory(state){
  // Map categoryKey -> array of {categoryKey, categoryLabel, member}
  ensureHouseBandQueues(state);
  const out = {};
  for(const cat of HOUSE_BAND_CATEGORIES){
    out[cat.key] = houseBandMembersInCategory(state, cat.key, { activeOnly: true });
  }
  return out;
}

function houseBandSuggestedInCategory(state, categoryKey){
  // Suggested = first ACTIVE member in the category's current order
  const list = houseBandMembersInCategory(state, categoryKey, { activeOnly: true });
  return list[0] || null;
}

function houseBandActiveMembersByCategory(state){
  // Map categoryKey -> array of {categoryKey, categoryLabel, member}
  ensureHouseBandQueues(state);
  const out = {};
  for(const cat of HOUSE_BAND_CATEGORIES){
    out[cat.key] = houseBandMembersInCategory(state, cat.key, { activeOnly: true });
  }
  return out;
}

  // Reorder a category so the selected member is FIRST, and the previously suggested
  // (first active) member becomes SECOND ("skipped → next").
  // This avoids sending a skipped player to the back; they become the next opportunity.
  function reorderHouseBandCategorySelectedWithSuggestedNext(state, categoryKey, selectedMemberId){
    ensureHouseBandQueues(state);
    const key = String(categoryKey || "").trim();
    if(!HOUSE_BAND_CATEGORIES.some(c => c.key === key)) return { suggestedId: null };

    const list = state.houseBandQueues[key] || [];
    // Suggested = first ACTIVE in current order
    const suggested = list.find(m => {
      normalizeHouseBandMember(m);
      return m.active !== false;
    }) || null;
    const suggestedId = suggested?.id || null;

    const selId = String(selectedMemberId || "").trim();
    if(!selId) return { suggestedId };

    const selIdx = list.findIndex(m => {
      normalizeHouseBandMember(m);
      return m.id === selId;
    });
    if(selIdx < 0) return { suggestedId };

    const selected = list[selIdx];
    const useSuggestedSecond = (suggestedId && suggestedId !== selId);
    const suggestedObj = useSuggestedSecond
      ? (list.find(m => {
          normalizeHouseBandMember(m);
          return m.id === suggestedId;
        }) || null)
      : null;

    const next = [];
    next.push(selected);
    if(suggestedObj) next.push(suggestedObj);

    for(const m of list){
      normalizeHouseBandMember(m);
      if(m.id === selId) continue;
      if(suggestedObj && m.id === suggestedObj.id) continue;
      next.push(m);
    }

    state.houseBandQueues[key] = next;
    return { suggestedId };
  }

  function buildHouseBandLineupFromSelections(state, selections){
    ensureHouseBandQueues(state);
    const sel = (selections && typeof selections === "object") ? selections : {};
    const out = [];
    for(const cat of HOUSE_BAND_CATEGORIES){
      const memberId = String(sel[cat.key] || "").trim();
      if(!memberId) continue;
      const found = findHouseBandMemberById(state, memberId);
      if(!found?.member) continue;
      const m = found.member;
      const inst = sanitizeText(houseBandInstrumentLabelForMember(m) || cat.label || "");
      out.push({
        categoryKey: cat.key,
        categoryLabel: cat.label,
        memberId: m.id,
        name: sanitizeText(m.name || ""),
        instrumentLabel: inst,
        instrument: inst
      });
    }
    return out;
  }


  function computeNextTwo(state){
    const hasCurrent = !!state.currentSlotId && (state.phase === "LIVE" || state.phase === "PAUSED");
    const q = Array.isArray(state.queue) ? state.queue : [];
    if(hasCurrent){
      const idx = q.findIndex(s => s && s.id === state.currentSlotId);
      const tail = (idx >= 0 ? q.slice(idx+1) : q).filter(s => s && s.status === "QUEUED");
      const next1 = tail[0] || null;
      const next2 = tail[1] || null;
      return [next1, next2];
    }
    const head = q.filter(s => s && s.status === "QUEUED");
    return [head[0] || null, head[1] || null];
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
    if(!("indexedDB" in window)) return Promise.reject(new Error("IndexedDB not available"));
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

async function loadBitmapFromFile(f){
  // Safari compatibility: createImageBitmap may be missing or fail for some image types.
  if(typeof createImageBitmap === "function"){
    try{ return await createImageBitmap(f); }catch(_){ /* fall through */ }
  }
  const url = URL.createObjectURL(f);
  try{
    const img = new Image();
    img.decoding = "async";
    img.src = url;
    await new Promise((res, rej) => {
      img.onload = () => res(true);
      img.onerror = () => rej(new Error("Image decode failed"));
    });
    return img;
  } finally {
    try{ URL.revokeObjectURL(url); }catch(_){}
  }
}


    const bmp = await loadBitmapFromFile(file);
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
      // Stamp save time (used by Operator status banner)
      state.lastSavedAt = now();
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
    allHouseBandMembers, findHouseBandMemberById, getHouseBandFeaturedForSlot,
    houseBandInstrumentLabelForMember, houseBandMembersInCategory, houseBandActiveMembersByCategory, houseBandSuggestedInCategory,
    reorderHouseBandCategorySelectedWithSuggestedNext, buildHouseBandLineupFromSelections,

    

    computeNextTwo, computeCurrent, computeTimer,
    openAssetDB, putAsset, getAsset, deleteAsset, compressImageFile,
    formatMMSS, sanitizeText, applyThemeToDocument
  };
})();
