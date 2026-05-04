
(function(){
  const SITE = window.RAYLEOS_CONFIG || {};
  const BOOKING_EMAIL = SITE.bookingEmail || "BOOKING_EMAIL";const base = "/RayLeos";
  const qs = (sel, root=document) => root.querySelector(sel);
  const qsa = (sel, root=document) => Array.from(root.querySelectorAll(sel));
  const toggle = qs('[data-menu-toggle]');
  const nav = qs('[data-primary-nav]');
  if (toggle && nav) {
    toggle.addEventListener('click', () => {
      const open = nav.classList.toggle('is-open');
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
  }
  qsa('[data-year]').forEach(el => el.textContent = new Date().getFullYear());

  const revealEls = qsa('.reveal');
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
    revealEls.forEach(el => io.observe(el));
  } else {
    revealEls.forEach(el => el.classList.add('is-visible'));
  }

  const driftEls = qsa('[data-drift]');
  let ticking = false;
  function updateDrift(){
    const vh = window.innerHeight || 1;
    driftEls.forEach(el => {
      const speed = Number(el.dataset.drift || 0.08);
      const rect = el.getBoundingClientRect();
      const progress = (rect.top + rect.height/2 - vh/2) / vh;
      el.style.transform = `translate3d(0, ${progress * speed * -80}px, 0)`;
    });
    ticking = false;
  }
  function requestDrift(){
    if (!ticking) { window.requestAnimationFrame(updateDrift); ticking = true; }
  }
  if (driftEls.length && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    window.addEventListener('scroll', requestDrift, { passive:true });
    window.addEventListener('resize', requestDrift);
    requestDrift();
  }

  function formatDate(dateString){
    const d = new Date(`${dateString}T12:00:00`);
    if (Number.isNaN(d.getTime())) return dateString || 'Date TBA';
    return d.toLocaleDateString(undefined, { weekday:'short', month:'short', day:'numeric' });
  }
  function eventCard(event){
    const img = event.image || `${base}/assets/img/placeholders/poster-placeholder.svg`;
    const tags = (event.tags || []).slice(0,3).map(t => `<span class="pill teal">${escapeHTML(t)}</span>`).join('');
    const url = event.ticketUrl || 'https://www.facebook.com/rayleosatlamasco';
    const label = event.ticketLabel || 'Details';
    return `<article class="poster-card reveal">
      <div class="poster-art"><img src="${escapeAttr(img)}" alt="${escapeAttr(event.title || 'Show poster placeholder')}" loading="lazy"></div>
      <div class="poster-body">
        <span class="eyebrow">${formatDate(event.date)}</span>
        <h3>${escapeHTML(event.title || 'Show TBA')}</h3>
        <div class="meta-line">
          <span class="pill gold">Doors ${escapeHTML(event.doors || 'TBA')}</span>
          <span class="pill red">Show ${escapeHTML(event.show || 'TBA')}</span>
          <span class="pill">${escapeHTML(event.price || 'TBA')}</span>
          <span class="pill">${escapeHTML(event.age || 'Check listing')}</span>
          ${tags}
        </div>
        <p>${escapeHTML(event.description || '')}</p>
        <p><small>${escapeHTML(event.doorNote || 'Some shows are ticketed online. Others are pay-at-the-door. Check each listing for details.')}</small></p>
        <a class="btn btn-secondary" href="${escapeAttr(url)}">${escapeHTML(label)}</a>
      </div>
    </article>`;
  }
  function escapeHTML(value){
    return String(value ?? '').replace(/[&<>'"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]));
  }
  function escapeAttr(value){ return escapeHTML(value); }

  const eventTargets = qsa('[data-events-list]');
  const previewTargets = qsa('[data-events-preview]');
  if (eventTargets.length || previewTargets.length) {
    fetch(`${base}/assets/data/events.json`, { cache:'no-cache' })
      .then(r => r.ok ? r.json() : Promise.reject(new Error('Events file not found')))
      .then(events => {
        const sorted = [...events].sort((a,b) => String(a.date).localeCompare(String(b.date)));
        eventTargets.forEach(target => {
          target.innerHTML = sorted.map(eventCard).join('') || '<p>No events listed yet. Check Facebook for the latest updates.</p>';
        });
        previewTargets.forEach(target => {
          const featured = sorted.filter(e => e.featured).slice(0,3);
          target.innerHTML = (featured.length ? featured : sorted.slice(0,3)).map(eventCard).join('') || '<p>No events listed yet. Check Facebook for the latest updates.</p>';
        });
        qsa('.reveal').forEach(el => el.classList.add('is-visible'));
      })
      .catch(() => {
        const message = '<p>Upcoming shows are being updated. Check Facebook or Eventbrite for the latest details.</p>';
        eventTargets.concat(previewTargets).forEach(t => t.innerHTML = message);
      });
  }

  function getPublicStatus(eventTitle = '') {
    const rawPrefix = String(eventTitle).split(/\s[-–—]\s/)[0].trim();
    const normalized = rawPrefix.toLowerCase();
    if (normalized.startsWith('soft hold')) return 'Hold';
    if (normalized.startsWith('hold')) return 'Hold';
    if (normalized.startsWith('booked')) return 'Booked';
    if (normalized.startsWith('confirmed')) return 'Booked';
    if (normalized.startsWith('show')) return 'Booked';
    if (normalized.startsWith('private')) return 'Unavailable';
    if (normalized.startsWith('blackout')) return 'Unavailable';
    if (normalized.startsWith('closed')) return 'Unavailable';
    return rawPrefix || 'Unavailable';
  }
  window.RayLeosBooking = { getPublicStatus };

  const availabilityTarget = qs('[data-availability-example]');
  if (availabilityTarget) {
    fetch(`${base}/assets/data/availability-example.json`, { cache:'no-cache' })
      .then(r => r.ok ? r.json() : Promise.reject(new Error('Availability example not found')))
      .then(items => {
        availabilityTarget.innerHTML = items.map(item => `<div class="availability-item">
          <div class="availability-status">${escapeHTML(getPublicStatus(item.title))}</div>
          <strong>${formatDate(item.date)}</strong>
        </div>`).join('');
      })
      .catch(() => { availabilityTarget.innerHTML = '<p>Availability preview unavailable.</p>'; });
  }

  const form = qs('[data-booking-form]');
  if (form) {
    form.addEventListener('submit', event => {
      event.preventDefault();
      const data = new FormData(form);
      const artist = data.get('artistName') || 'Band Booking Request';
      const subject = `Ray Leo’s Booking Request - ${artist}`;
      const order = ['artistName','contactName','email','phone','hometown','genre','members','website','instagram','facebook','musicLinks','liveVideo','epk','admat','promoPhotos','stagePlot','inputList','preferredDates','routing','supportNeeds','expectedDraw','previousShows','setLength','agePolicy','dealExpectations','loadIn','merch','lodging','techNotes','notes'];
      const labels = {
        artistName:'Artist/Band', contactName:'Contact', email:'Email', phone:'Phone', hometown:'Hometown', genre:'Genre', members:'Members', website:'Website', instagram:'Instagram', facebook:'Facebook', musicLinks:'Music Links', liveVideo:'Live Video', epk:'EPK Link', admat:'Ad Mat / Poster Assets', promoPhotos:'Promo Photos', stagePlot:'Stage Plot', inputList:'Input List', preferredDates:'Preferred Dates', routing:'Routing Context', supportNeeds:'Support / Bill Needs', expectedDraw:'Expected Draw', previousShows:'Previous Regional Shows', setLength:'Set Length', agePolicy:'All-Ages OK?', dealExpectations:'Door / Guarantee Expectations', loadIn:'Load-in Needs', merch:'Merch Needs', lodging:'Lodging Needs', techNotes:'Tech Notes', notes:'Additional Notes'
      };
      const lines = ['New booking request submitted from rayleos.com test site.',''];
      order.forEach(key => {
        const val = String(data.get(key) || '').trim();
        if (val) lines.push(`${labels[key] || key}: ${val}`);
      });
      window.location.href = `mailto:BOOKING_EMAIL?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(lines.join('\n'))}`;
    });
  }
})();
