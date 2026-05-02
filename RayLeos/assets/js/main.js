const navToggle = document.querySelector("[data-nav-toggle]");
const navMenu = document.querySelector("[data-nav-menu]");

if (navToggle && navMenu) {
  navToggle.addEventListener("click", () => {
    const isOpen = navMenu.classList.toggle("is-open");
    navToggle.setAttribute("aria-expanded", String(isOpen));
  });

  navMenu.addEventListener("click", (event) => {
    const target = event.target;
    if (target instanceof HTMLAnchorElement) {
      navMenu.classList.remove("is-open");
      navToggle.setAttribute("aria-expanded", "false");
    }
  });
}

const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

if (!prefersReducedMotion) {
  const revealItems = document.querySelectorAll("[data-reveal]");
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    },
    { rootMargin: "0px 0px -12% 0px", threshold: 0.12 }
  );

  revealItems.forEach((item) => observer.observe(item));

  const parallaxItems = [...document.querySelectorAll("[data-parallax]")];
  let ticking = false;

  const updateParallax = () => {
    const viewportHeight = window.innerHeight;

    parallaxItems.forEach((item) => {
      const speed = Number.parseFloat(item.getAttribute("data-parallax") || "0.08");
      const rect = item.getBoundingClientRect();
      const centerOffset = rect.top + rect.height / 2 - viewportHeight / 2;
      const movement = centerOffset * speed * -1;
      item.style.transform = `translate3d(0, ${movement.toFixed(2)}px, 0)`;
    });

    ticking = false;
  };

  const requestParallax = () => {
    if (!ticking) {
      window.requestAnimationFrame(updateParallax);
      ticking = true;
    }
  };

  window.addEventListener("scroll", requestParallax, { passive: true });
  window.addEventListener("resize", requestParallax);
  requestParallax();
} else {
  document.querySelectorAll("[data-reveal]").forEach((item) => item.classList.add("is-visible"));
}

const eventGrid = document.querySelector("[data-events-grid]");
const fallbackEvents = [
  {
    title: "Upcoming Ray Leo’s Show",
    date: "TBA",
    time: "Doors and music times vary by event",
    summary: "Check the Eventbrite organizer page for current ticketed shows.",
    image: "assets/img/placeholders/event-01.svg",
    ticketUrl: "https://www.eventbrite.com/o/ray-leos-at-lamasco-121162835137",
    tag: "Live Music"
  }
];

const escapeHtml = (value) =>
  String(value ?? "").replace(/[&<>'"]/g, (character) => {
    const entities = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      "'": "&#39;",
      '"': "&quot;"
    };
    return entities[character];
  });

const renderEvents = (events) => {
  if (!eventGrid) return;

  eventGrid.innerHTML = events
    .map(
      (event) => `
        <article class="event-card" data-reveal>
          <img src="${escapeHtml(event.image || "assets/img/placeholders/event-01.svg")}" alt="${escapeHtml(event.title)} event artwork placeholder" loading="lazy">
          <div class="event-card-body">
            <span class="event-tag">${escapeHtml(event.tag || "Event")}</span>
            <h3>${escapeHtml(event.title)}</h3>
            <div class="event-meta">
              <span>${escapeHtml(event.date)}</span>
              <span>${escapeHtml(event.time)}</span>
            </div>
            <p>${escapeHtml(event.summary)}</p>
            <a class="btn btn--ghost" href="${escapeHtml(event.ticketUrl || "#")}" target="_blank" rel="noopener">View details</a>
          </div>
        </article>
      `
    )
    .join("");

  if (!prefersReducedMotion) {
    const newCards = eventGrid.querySelectorAll("[data-reveal]");
    const cardObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            cardObserver.unobserve(entry.target);
          }
        });
      },
      { rootMargin: "0px 0px -12% 0px", threshold: 0.12 }
    );
    newCards.forEach((card) => cardObserver.observe(card));
  } else {
    eventGrid.querySelectorAll("[data-reveal]").forEach((card) => card.classList.add("is-visible"));
  }
};

if (eventGrid) {
  fetch("assets/data/events.json", { cache: "no-store" })
    .then((response) => {
      if (!response.ok) throw new Error("Events JSON not found");
      return response.json();
    })
    .then((events) => renderEvents(Array.isArray(events) && events.length ? events : fallbackEvents))
    .catch(() => renderEvents(fallbackEvents));
}

const bookingForm = document.querySelector("[data-booking-form]");
const formResult = document.querySelector("[data-form-result]");

if (bookingForm) {
  bookingForm.addEventListener("submit", (event) => {
    event.preventDefault();

    const formData = new FormData(bookingForm);
    const values = Object.fromEntries(formData.entries());
    const required = ["artistName", "contactName", "email", "epkUrl", "adMatsUrl"];
    const missing = required.filter((name) => !String(values[name] || "").trim());

    if (missing.length) {
      if (formResult) {
        formResult.textContent = "Please complete the required artist, contact, email, EPK, and ad mat fields.";
      }
      return;
    }

    const subject = encodeURIComponent(`Booking submission: ${values.artistName || "Artist"}`);
    const labels = {
      artistName: "Artist / Band Name",
      contactName: "Contact Name",
      email: "Email",
      phone: "Phone",
      hometown: "Hometown / Market",
      genre: "Genre / Style",
      website: "Website",
      socials: "Social Links",
      streaming: "Streaming / Music Links",
      liveVideo: "Live Video Link",
      epkUrl: "EPK Link",
      adMatsUrl: "Ad Mats / Promo Assets Link",
      stagePlot: "Stage Plot Link",
      inputList: "Input List Link",
      promoPhotos: "Promo Photos Link",
      preferredDates: "Preferred Dates / Routing",
      unavailableDates: "Unavailable Dates",
      localSupport: "Local Support / Opener Needs",
      expectedDraw: "Expected Draw",
      dealExpectation: "Deal / Guarantee Expectation",
      setLength: "Set Length",
      members: "Number of Members",
      lodging: "Lodging / Travel Needs",
      merch: "Merch Needs",
      previousVenues: "Previous Venues / Markets",
      ageRestrictions: "Age Restrictions",
      notes: "Additional Notes"
    };

    const body = encodeURIComponent(
      Object.entries(labels)
        .map(([key, label]) => `${label}: ${values[key] || ""}`)
        .join("\n")
    );

    window.location.href = `mailto:Booking@rayleos.com?subject=${subject}&body=${body}`;

    if (formResult) {
      formResult.textContent = "Opening your email client with the booking submission. For production, connect this form to a secure backend or form service.";
    }
  });
}
