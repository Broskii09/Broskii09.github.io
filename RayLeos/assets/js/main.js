(() => {
  const SITE = window.RAYLEOS_CONFIG || {};
  const base = SITE.basePath || '/RayLeos';
  const BOOKING_EMAIL = SITE.bookingEmail || 'Booking@rayleos.com';
  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

  function isExternalHref(href){
    if (!href || href.startsWith('#') || /^(mailto|tel):/i.test(href)) return false;
    try {
      const url = new URL(href, window.location.href);
      return url.origin !== window.location.origin;
    } catch { return false; }
  }
  function enhanceExternalLinks(root = document){
    $$('a[href]', root).forEach(el => {
      if (!isExternalHref(el.getAttribute('href'))) return;
      el.setAttribute('target', '_blank');
      el.setAttribute('rel', 'noopener noreferrer');
      if (!/\(opens in a new tab\)$/i.test(el.getAttribute('aria-label') || '')) {
        const label = (el.getAttribute('aria-label') || el.textContent || 'External link').trim();
        el.setAttribute('aria-label', `${label} (opens in a new tab)`);
      }
    });
  }
  function initPhotoPreview(){
    const photos = $$('img[data-photo-preview]');
    if (!photos.length) return;
    let lastTrigger = null;
    const modal = document.createElement('div');
    modal.className = 'photo-lightbox';
    modal.hidden = true;
    modal.setAttribute('role', 'dialog');
    modal.setAttribute('aria-modal', 'true');
    modal.setAttribute('aria-label', 'Photo preview');
    modal.innerHTML = `<div class="photo-lightbox__panel" role="document">
      <button class="photo-lightbox__close" type="button">Close</button>
      <img class="photo-lightbox__image" alt="">
      <p class="photo-lightbox__caption"></p>
    </div>`;
    document.body.appendChild(modal);
    const closeBtn = $('.photo-lightbox__close', modal);
    const previewImg = $('.photo-lightbox__image', modal);
    const caption = $('.photo-lightbox__caption', modal);
    function openPhoto(trigger){
      lastTrigger = trigger;
      const src = trigger.currentSrc || trigger.src;
      const alt = trigger.getAttribute('alt') || 'Ray Leo’s photo';
      previewImg.src = src;
      previewImg.alt = alt;
      caption.textContent = alt;
      modal.hidden = false;
      document.body.classList.add('photo-preview-open');
      closeBtn.focus({ preventScroll:true });
    }
    function closePhoto(){
      if (modal.hidden) return;
      modal.hidden = true;
      document.body.classList.remove('photo-preview-open');
      previewImg.removeAttribute('src');
      if (lastTrigger && document.contains(lastTrigger)) lastTrigger.focus({ preventScroll:true });
    }
    photos.forEach(photo => {
      photo.classList.add('photo-preview-trigger');
      photo.setAttribute('role', 'button');
      photo.setAttribute('tabindex', '0');
      photo.setAttribute('aria-label', `Preview photo: ${photo.getAttribute('alt') || 'Ray Leo’s photo'}`);
      photo.addEventListener('click', () => openPhoto(photo));
      photo.addEventListener('keydown', event => {
        if (event.key !== 'Enter' && event.key !== ' ') return;
        event.preventDefault();
        openPhoto(photo);
      });
    });
    closeBtn.addEventListener('click', closePhoto);
    modal.addEventListener('click', event => { if (event.target === modal) closePhoto(); });
    document.addEventListener('keydown', event => { if (event.key === 'Escape') closePhoto(); });
  }
  function initHeroParallax(){
    const heroes = $$('[data-parallax-hero]');
    if (!heroes.length) return;

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const enabled = SITE.enableHeroParallax !== false && !reducedMotion;
    let ticking = false;

    function clamp(value, min, max){
      return Math.min(Math.max(value, min), max);
    }
    function getSpeed(hero){
      const inlineSpeed = Number(hero.dataset.parallaxSpeed);
      if (Number.isFinite(inlineSpeed) && inlineSpeed > 0) return inlineSpeed;
      const cssSpeed = Number(window.getComputedStyle(hero).getPropertyValue('--hero-parallax-speed'));
      return Number.isFinite(cssSpeed) && cssSpeed > 0 ? cssSpeed : 0.75;
    }
    function update(){
      const vh = window.innerHeight || 1;
      heroes.forEach(hero => {
        if (!enabled) {
          hero.style.setProperty('--hero-parallax-y', '0px');
          return;
        }
        const rect = hero.getBoundingClientRect();
        const progress = ((rect.top + rect.height / 2) - vh / 2) / vh;
        const y = clamp(progress * -120 * getSpeed(hero), -120, 120);
        hero.style.setProperty('--hero-parallax-y', `${y.toFixed(1)}px`);
      });
      ticking = false;
    }
    function requestUpdate(){
      if (!ticking) {
        window.requestAnimationFrame(update);
        ticking = true;
      }
    }
    window.addEventListener('scroll', requestUpdate, { passive:true });
    window.addEventListener('resize', requestUpdate);
    requestUpdate();
  }

  // Dynamic config links/text
  $$('[data-booking-email]').forEach(el => { el.textContent = BOOKING_EMAIL; el.href = `mailto:${BOOKING_EMAIL}`; });
  $$('[data-config-href]').forEach(el => { const key = el.getAttribute('data-config-href'); if (SITE[key]) el.href = SITE[key]; });
  $$('[data-config-text]').forEach(el => { const key = el.getAttribute('data-config-text'); if (SITE[key]) el.textContent = SITE[key]; });
  $$('[data-menu-embed]').forEach(el => { if (SITE.menuPdfEmbedUrl) el.src = SITE.menuPdfEmbedUrl; });
  enhanceExternalLinks();
  initPhotoPreview();
  initHeroParallax();

  // Mobile nav
  const toggle = $('[data-menu-toggle]');
  const nav = $('[data-primary-nav]');
  toggle?.addEventListener('click', () => {
    const open = nav?.classList.toggle('is-open');
    toggle.setAttribute('aria-expanded', String(!!open));
  });

  // Reveal animation
  const revealEls = $$('.reveal');
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver(entries => {
      entries.forEach(entry => { if (entry.isIntersecting) { entry.target.classList.add('is-visible'); io.unobserve(entry.target); } });
    }, { threshold: 0.12, rootMargin: '0px 0px -7% 0px' });
    revealEls.forEach(el => io.observe(el));
  } else {
    revealEls.forEach(el => el.classList.add('is-visible'));
  }

  // Light parallax/photo drift
  const driftEls = $$('.parallax-drift');
  let ticking = false;
  function updateDrift(){
    const vh = window.innerHeight || 1;
    driftEls.forEach(el => {
      const rect = el.getBoundingClientRect();
      const drift = Number(el.dataset.drift || 0.08);
      const progress = ((rect.top + rect.height / 2) - vh / 2) / vh;
      el.style.transform = `translate3d(0, ${progress * -70 * drift}px, 0)`;
    });
    ticking = false;
  }
  function requestDrift(){ if (!ticking) { window.requestAnimationFrame(updateDrift); ticking = true; } }
  if (driftEls.length && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    window.addEventListener('scroll', requestDrift, { passive:true });
    window.addEventListener('resize', requestDrift);
    requestDrift();
  }

  function escapeHTML(value){ return String(value ?? '').replace(/[&<>'"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c])); }
  function escapeAttr(value){ return escapeHTML(value); }
  function parseDate(dateString){ const d = new Date(`${dateString}T12:00:00`); return Number.isNaN(d.getTime()) ? null : d; }
  function formatDate(dateString, part = 'full'){
    const d = parseDate(dateString);
    if (!d) return dateString || 'Date TBA';
    if (part === 'month') return d.toLocaleDateString(undefined, { month:'short' });
    if (part === 'day') return d.toLocaleDateString(undefined, { day:'2-digit' });
    if (part === 'weekday') return d.toLocaleDateString(undefined, { weekday:'short' });
    return d.toLocaleDateString(undefined, { weekday:'short', month:'short', day:'numeric', year:'numeric' });
  }
  function isFutureish(event){
    const d = parseDate(event.date); if (!d) return true;
    const today = new Date(); today.setHours(0,0,0,0);
    return d >= today;
  }
  function sortByDate(a,b){ return String(a.date).localeCompare(String(b.date)) || String(a.startTime||'').localeCompare(String(b.startTime||'')); }
  function normalizeClass(value){ return String(value || '').toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,''); }

  // Forgiving calendar title parser for future automation.
  function parseCalendarTitle(summary = ''){
    const clean = String(summary || '').trim();
    const parts = clean.split(/\s[-–—]\s/);
    if (parts.length > 1) {
      const last = parts[parts.length - 1].trim();
      const name = parts.slice(0, -1).join(' - ').trim();
      const status = normalizeStatus(last, clean);
      // If the final segment is not status-like, fall back to whole-title scan.
      if (status !== 'review') return { eventName:name, rawStatus:last, status };
    }
    const status = normalizeStatus('', clean);
    const prefixMatch = clean.match(/^(HOLD\s*\d*|NEEDS?\s+OPENERS?|NEEDS?\s+BANDS?|CONFIRMED|PRIVATE|BLACKOUT|CANCELLED|CANCELED|NO\s+SHOW)\s*[-–—]?\s*(.*)$/i);
    if (prefixMatch) return { eventName:(prefixMatch[2] || clean).trim(), rawStatus:prefixMatch[1], status };
    return { eventName:clean, rawStatus:'', status };
  }
  function normalizeStatus(rawStatus = '', fullTitle = ''){
    const value = `${rawStatus} ${fullTitle}`.toUpperCase().replace(/\s+/g,' ').trim();
    if (/\bNO\s+SHOW\b|\bNO\s+TRIVIA\b/.test(value)) return 'no-show';
    if (/\bCANCELLED\b|\bCANCELED\b/.test(value)) return 'cancelled';
    if (/\bPRIVATE\b/.test(value)) return 'private';
    if (/\bBLACKOUT\b|\bCLOSED\b/.test(value)) return 'blackout';
    if (/\bNEEDS?\s+OPENERS?\b|\bNEED\s+OPENERS?\b/.test(value)) return 'needs-opener';
    if (/\bNEEDS?\s+BANDS?\b|\bNEED\s+BANDS?\b/.test(value)) return 'needs-bands';
    if (/\bHOLD\s*1\b|\bHOLD1\b/.test(value)) return 'hold-1';
    if (/\bHOLD\s*2\b|\bHOLD2\b/.test(value)) return 'hold-2';
    if (/\bHOLD\s*3\b|\bHOLD3\b/.test(value)) return 'hold-3';
    if (/\bHOLD\b/.test(value)) return 'hold';
    if (/\bCONFIRMED\b|\bCONFIRM\b/.test(value)) return 'confirmed';
    return 'review';
  }
  function publicAvailabilityStatus(status){
    const value = normalizeClass(status);
    if (value === 'confirmed' || value === 'booked') return 'Booked';
    if (value.startsWith('hold')) return 'Hold';
    if (value === 'needs-opener' || value === 'needs-bands' || value === 'needs-support') return 'Needs Support';
    if (value === 'private' || value === 'blackout' || value === 'unavailable') return 'Unavailable';
    if (value === 'cancelled' || value === 'no-show') return 'Hidden';
    return status || 'Review';
  }
  function inquiryTypeForStatus(status){
    const value = normalizeClass(publicAvailabilityStatus(status));
    if (value === 'needs-support') return 'Opening/support slot inquiry';
    if (value === 'hold') return 'Question about a held date';
    if (value === 'booked') return 'Backup/waitlist inquiry';
    if (value === 'unavailable') return 'Other date question';
    return 'General booking inquiry';
  }
  function inquiryButtonForStatus(status){
    const publicStatus = publicAvailabilityStatus(status);
    const value = normalizeClass(publicStatus);
    if (value === 'needs-support') return 'Inquire About Opening';
    if (value === 'hold') return 'Ask About This Hold';
    if (value === 'booked') return 'Ask Anyway';
    if (value === 'unavailable') return 'Unavailable';
    return 'Inquire About This Date';
  }
  function buildBookingInquiryUrl(item, time, status){
    const params = new URLSearchParams();
    if (item.date) params.set('date', item.date);
    if (time) params.set('time', time);
    if (status) params.set('status', status);
    params.set('type', inquiryTypeForStatus(status));
    return `${base}/booking/?${params.toString()}#booking-form`;
  }
  window.RayLeosCalendar = { parseCalendarTitle, normalizeStatus, publicAvailabilityStatus, inquiryTypeForStatus };

  function showVisibility(event){
    return normalizeClass(event.visibility || 'public');
  }
  function isPublicShow(event){
    return normalizeStatus(event.status, event.calendarTitle || event.title) === 'confirmed' && showVisibility(event) === 'public';
  }
  function eventTime(event, key, legacyKey){
    return event[key] || event[legacyKey] || '';
  }
  function eventAgePolicy(event){
    return event.agePolicy || event.age || 'All ages unless noted';
  }
  function eventDetailUrl(event){
    return event.ticketUrl || event.detailUrl || SITE.eventbriteUrl || SITE.facebookUrl || '#';
  }
  function eventDetailLabel(event){
    if (event.ticketUrl) return event.ticketLabel || 'Tickets';
    return event.detailLabel || event.ticketLabel || 'Event details';
  }

  function showCard(event, compact = false){
    const title = event.title || parseCalendarTitle(event.calendarTitle || '').eventName || 'Show TBA';
    const lineupItems = Array.isArray(event.lineup) ? event.lineup.filter(Boolean) : [];
    const supportItems = Array.isArray(event.support) ? event.support.filter(Boolean) : [];
    const lineup = lineupItems.length ? `<div class="show-lineup">${lineupItems.map(escapeHTML).join(' &bull; ')}</div>` : '';
    const support = compact && supportItems.length ? `<p class="show-support">With ${supportItems.slice(0, 3).map(escapeHTML).join(' &bull; ')}</p>` : '';
    const tags = (event.tags || []).slice(0, 3).map(t => `<span class="pill teal">${escapeHTML(t)}</span>`).join('');
    const doors = eventTime(event, 'doorsTime', 'doors');
    const show = eventTime(event, 'showTime', 'show') || event.startTime;
    const url = eventDetailUrl(event);
    const label = eventDetailLabel(event);
    const compactClass = compact ? ' show-card-compact' : '';
    const statusEyebrow = compact ? '' : '<span class="eyebrow">Confirmed show</span>';
    const description = compact ? '' : `<p class="show-desc">${escapeHTML(event.publicDescription || 'Check the latest listing for details.')}</p>`;
    const tagLine = !compact && tags ? `<div class="show-tags" aria-label="Show tags">${tags}</div>` : '';
    const meta = compact
      ? `<div class="meta-line show-meta-compact"><span class="pill red">${escapeHTML(show ? `Show ${show}` : 'Time TBA')}</span></div>`
      : `<div class="meta-line">
          <span class="pill gold">${escapeHTML(doors ? `Doors ${doors}` : 'Doors TBA')}</span>
          <span class="pill red">${escapeHTML(show ? `Show ${show}` : 'Time TBA')}</span>
          <span class="pill">${escapeHTML(event.price || 'Check listing')}</span>
          <span class="pill">${escapeHTML(eventAgePolicy(event))}</span>
        </div>`;
    return `<article class="show-card${compactClass} reveal">
      <div class="date-block" aria-label="${escapeAttr(formatDate(event.date))}">
        <span class="month">${escapeHTML(formatDate(event.date, 'month'))}</span>
        <span class="day">${escapeHTML(formatDate(event.date, 'day'))}</span>
        <span class="weekday">${escapeHTML(formatDate(event.date, 'weekday'))}</span>
      </div>
      <div class="show-body">
        ${statusEyebrow}
        <h3>${escapeHTML(title)}</h3>
        ${lineup}
        ${support}
        ${meta}
        ${description}
        ${tagLine}
        <div class="button-row"><a class="btn btn-secondary" href="${escapeAttr(url)}">${escapeHTML(label)}</a></div>
      </div>
    </article>`;
  }

  const showTargets = $$('[data-shows-list]');
  const previewTargets = $$('[data-shows-preview]');
  if (showTargets.length || previewTargets.length) {
    fetch(`${base}/assets/data/shows.json`, { cache:'no-cache' })
      .then(r => r.ok ? r.json() : Promise.reject(new Error('shows.json not found')))
      .then(items => {
        const shows = items.filter(isFutureish).filter(isPublicShow).sort(sortByDate);
        showTargets.forEach(t => { t.innerHTML = shows.length ? shows.map(e => showCard(e)).join('') : '<p>No public shows are listed yet. Check Facebook for the latest updates.</p>'; });
        previewTargets.forEach(t => { t.innerHTML = shows.length ? shows.slice(0,4).map(e => showCard(e,true)).join('') : '<p>No public shows are listed yet. Check Facebook for the latest updates.</p>'; });
        showTargets.concat(previewTargets).forEach(enhanceExternalLinks);
        $$('.reveal').forEach(el => el.classList.add('is-visible'));
      })
      .catch(() => { showTargets.concat(previewTargets).forEach(t => t.innerHTML = '<p>Shows are being updated. Check Facebook or Eventbrite for the latest details.</p>'); });
  }

  const availabilityTargets = $$('[data-availability-list]');
  if (availabilityTargets.length) {
    fetch(`${base}/assets/data/availability.json`, { cache:'no-cache' })
      .then(r => r.ok ? r.json() : Promise.reject(new Error('availability.json not found')))
      .then(items => {
        const visible = items.filter(isFutureish).filter(item => publicAvailabilityStatus(item.status) !== 'Hidden').sort(sortByDate);
        availabilityTargets.forEach(t => {
          t.innerHTML = visible.length ? visible.map(item => {
            const status = publicAvailabilityStatus(item.status);
            const cls = normalizeClass(status);
            const time = item.startTime === 'All day' ? 'All day' : [item.startTime, item.endTime].filter(Boolean).join('–');
            const label = inquiryButtonForStatus(status);
            const disabled = normalizeClass(status) === 'unavailable';
            const href = buildBookingInquiryUrl(item, time, status);
            const action = disabled
              ? `<span class="btn btn-disabled" aria-disabled="true">${escapeHTML(label)}</span>`
              : `<a class="btn btn-secondary" href="${escapeAttr(href)}" data-inquire-date="${escapeAttr(item.date)}" data-inquire-time="${escapeAttr(time || '')}" data-inquire-status="${escapeAttr(status)}" data-inquire-type="${escapeAttr(inquiryTypeForStatus(status))}">${escapeHTML(label)}</a>`;
            return `<div class="availability-item">
              <div><span class="status ${cls}">${escapeHTML(status)}</span></div>
              <div><strong>${escapeHTML(formatDate(item.date))}</strong><br><span class="notice">${escapeHTML(time || 'Time TBA')}</span></div>
              <div>${action}</div>
            </div>`;
          }).join('') : '<p>No held/booked dates are listed yet. Submit a booking request to confirm availability.</p>';
        });
      })
      .catch(() => { availabilityTargets.forEach(t => t.innerHTML = '<p>Availability preview is being updated. Submit a booking request to confirm dates.</p>'); });
  }

  // Booking form validation and copyable email request.
  function clearCustomValidity(form){ $$('input, select, textarea', form).forEach(field => field.setCustomValidity('')); }
  function validateUrlFields(form){
    $$('input[type="url"]', form).forEach(field => {
      const value = String(field.value || '').trim(); field.setCustomValidity('');
      if (value && !/^https?:\/\/[^\s]+\.[^\s]+/i.test(value)) field.setCustomValidity('Please enter a full URL starting with https://');
    });
  }
  function validateBookingForm(form){
    clearCustomValidity(form); validateUrlFields(form); form.classList.add('was-validated');
    if (!form.checkValidity()) { const firstInvalid = $(':invalid', form); if (firstInvalid) firstInvalid.focus({ preventScroll:false }); form.reportValidity(); return false; }
    return true;
  }
  function buildBookingEmail(form){
    const data = new FormData(form);
    const artist = String(data.get('artistName') || 'Band Booking Request').trim();
    const subject = `Ray Leo’s Booking Request - ${artist}`;
    const order = ['selectedDate','selectedTime','selectedStatus','requestType','artistName','contactName','email','phone','hometown','genre','members','setLength','website','instagram','facebook','musicLinks','liveVideo','epk','admat','promoPhotos','stagePlot','inputList','preferredDates','routing','supportNeeds','expectedDraw','agePolicy','previousShows','dealExpectations','loadIn','merch','lodging','techNotes','notes'];
    const labels = { selectedDate:'Selected Date', selectedTime:'Selected Time Block', selectedStatus:'Availability Status', requestType:'Request Type', artistName:'Artist/Band', contactName:'Contact', email:'Email', phone:'Phone', hometown:'Hometown / Market', genre:'Genre / Style', members:'Members', setLength:'Set Length', website:'Website', instagram:'Instagram', facebook:'Facebook', musicLinks:'Music Links', liveVideo:'Live Video', epk:'EPK Link', admat:'Ad Mat / Poster Assets', promoPhotos:'Promo Photos', stagePlot:'Stage Plot', inputList:'Input List', preferredDates:'Preferred Dates', routing:'Routing Context', supportNeeds:'Support / Bill Needs', expectedDraw:'Expected Draw', agePolicy:'All-Ages OK?', previousShows:'Previous Regional Shows', dealExpectations:'Compensation Expectations', loadIn:'Load-in Needs', merch:'Merch Needs', lodging:'Lodging Needs', techNotes:'Tech Notes', notes:'Additional Notes' };
    const lines = ['New booking request submitted from Ray Leo’s at Lamasco website test form.','',`Send to: ${BOOKING_EMAIL}`,'','NOTE: This static GitHub Pages form generates a copyable request. It is not submitted until emailed.',''];
    order.forEach(key => { const val = String(data.get(key) || '').trim(); if (val) lines.push(`${labels[key] || key}: ${val}`); });
    const body = lines.join('\n');
    const mailto = `mailto:${BOOKING_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    return { subject, body, mailto };
  }
  async function copyText(text, button, successText='Copied'){
    const original = button ? button.textContent : '';
    try {
      if (navigator.clipboard && window.isSecureContext) await navigator.clipboard.writeText(text);
      else { const temp = document.createElement('textarea'); temp.value = text; temp.setAttribute('readonly',''); temp.style.position='fixed'; temp.style.left='-9999px'; document.body.appendChild(temp); temp.select(); document.execCommand('copy'); temp.remove(); }
      if (button) { button.textContent = successText; setTimeout(() => { button.textContent = original; }, 1800); }
    } catch { if (button) button.textContent = 'Copy failed'; }
  }
  const form = $('[data-booking-form]');
  if (form) {
    const output = $('[data-booking-output]', form);
    const summary = $('[data-booking-summary]', form);
    const copyBtn = $('[data-copy-booking]', form);
    const openEmail = $('[data-open-email]', form);
    const alert = $('[data-form-alert]', form);
    let latest = null;
    function setFieldValue(name, value){
      const field = form.elements[name];
      if (!field) return;
      field.value = value || '';
      field.dispatchEvent(new Event('input', { bubbles:true }));
    }
    function revealBookingFormArea(){
      const section = form.closest('#booking-form');
      [section, ...$$('.reveal', section || form), form].filter(Boolean).forEach(el => el.classList.add('is-visible'));
    }
    function scrollToBookingForm(){
      requestAnimationFrame(() => {
        form.scrollIntoView({ behavior:'smooth', block:'start' });
      });
    }
    function applySelectedDate(detail = {}, options = {}){
      revealBookingFormArea();
      const date = detail.date || '';
      const time = detail.time || '';
      const status = detail.status || '';
      const type = detail.type || inquiryTypeForStatus(status);
      const dateLabel = date ? formatDate(date) : '';
      setFieldValue('selectedDate', dateLabel);
      setFieldValue('selectedTime', time);
      setFieldValue('selectedStatus', status);
      setFieldValue('requestType', type);
      const preferred = form.elements.preferredDates;
      if (preferred) {
        const generated = [dateLabel, time, status].filter(Boolean).join(' · ');
        if (!preferred.value.trim() || preferred.dataset.autofilled === 'true') {
          preferred.value = generated;
          preferred.dataset.autofilled = 'true';
        }
      }
      const support = form.elements.supportNeeds;
      if (support && !support.value.trim() && normalizeClass(status) === 'needs-support') support.value = 'Interested in opening/support slot.';
      const panel = $('[data-selected-date-panel]', form);
      const title = $('[data-selected-date-title]', form);
      const meta = $('[data-selected-date-meta]', form);
      if (panel) panel.hidden = !dateLabel;
      if (title) title.textContent = dateLabel ? `You’re inquiring about ${dateLabel}` : 'Date selected';
      if (meta) meta.textContent = [time, status, type].filter(Boolean).join(' · ');
      if (alert) alert.hidden = true;
      if (options.scroll !== false) scrollToBookingForm();
    }
    function clearSelectedDate(){
      ['selectedDate','selectedTime','selectedStatus','requestType'].forEach(name => setFieldValue(name, ''));
      const preferred = form.elements.preferredDates;
      if (preferred && preferred.dataset.autofilled === 'true') { preferred.value = ''; delete preferred.dataset.autofilled; }
      const panel = $('[data-selected-date-panel]', form);
      if (panel) panel.hidden = true;
    }
    const params = new URLSearchParams(window.location.search);
    if (params.has('date') || params.has('status')) {
      applySelectedDate({ date: params.get('date') || '', time: params.get('time') || '', status: params.get('status') || '', type: params.get('type') || '' }, { scroll:false });
    }
    $('[data-clear-selected-date]', form)?.addEventListener('click', clearSelectedDate);
    document.addEventListener('click', event => {
      const trigger = event.target.closest('[data-inquire-date]');
      if (!trigger) return;
      event.preventDefault();
      applySelectedDate({
        date: trigger.getAttribute('data-inquire-date') || '',
        time: trigger.getAttribute('data-inquire-time') || '',
        status: trigger.getAttribute('data-inquire-status') || '',
        type: trigger.getAttribute('data-inquire-type') || ''
      });
      history.replaceState(null, '', `${base}/booking/#booking-form`);
    });
    form.addEventListener('input', event => { if (event.target.matches('input, select, textarea')) event.target.setCustomValidity(''); if (alert) alert.hidden = true; });
    form.addEventListener('submit', event => {
      event.preventDefault();
      if (!validateBookingForm(form)) { if (alert) { alert.textContent = 'Please fix the highlighted fields. Required fields and URLs must be valid.'; alert.hidden = false; } return; }
      latest = buildBookingEmail(form);
      if (summary) summary.value = latest.body;
      if (openEmail) openEmail.href = latest.mailto;
      if (output) output.hidden = false;
      if (alert) alert.hidden = true;
      output?.scrollIntoView({ behavior:'smooth', block:'nearest' });
    });
    copyBtn?.addEventListener('click', () => { const text = summary?.value || latest?.body || ''; if (text) copyText(text, copyBtn, 'Request copied'); });
  }
})();
