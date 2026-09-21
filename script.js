// ===== Site settings — edit these before launch =====
const CONFIG = {
  businessEmail: 'info@visithra-agro.in', // shown in the contact section and used as the enquiry recipient
  // Shown as call + WhatsApp contacts. `number` is used for both tel: and wa.me links —
  // wa.me needs the country code with no '+', spaces, or dashes, which is derived automatically.
  // `flag` picks the icon next to the region badge — see FLAG_ICONS below for the supported keys.
  phones: [
    { region: 'India', flag: 'in', number: '+91-9443311219' },
    { region: 'Germany', flag: 'de', number: '+49-15511371259' },
  ],
  // Shown as postal addresses — one row per entry, in the order given.
  addresses: [
    { region: 'India', address: 'Coimbatore, Tamil Nadu, India' },
    { region: 'Germany', address: 'Nuremberg, Germany' },
  ],
  // Free form-delivery service — see README.md "Sending enquiries by email" for setup steps.
  // Leave the placeholder below and the form will fall back to opening the visitor's email app instead.
  web3FormsKey: '302de0f9-3952-4527-a9cf-69b7faec6a60',
};

const menuButton = document.querySelector('.menu-toggle');
const menu = document.querySelector('.site-menu');
// The "Products" trigger no longer navigates anywhere on its own (it only reveals the
// submenu), so it's excluded here — only real destinations close the mobile menu.
const menuLinks = document.querySelectorAll('.site-menu > a, .nav-item .submenu a');

function closeMenu() {
  menuButton.setAttribute('aria-expanded', 'false');
  menu.classList.remove('open');
  document.body.classList.remove('menu-open');
}

menuButton.addEventListener('click', () => {
  const isOpen = menuButton.getAttribute('aria-expanded') === 'true';
  const willOpen = !isOpen;
  menuButton.setAttribute('aria-expanded', String(willOpen));
  menu.classList.toggle('open', willOpen);
  document.body.classList.toggle('menu-open', willOpen);
  // Every time the mobile menu is (re)opened, make sure the Products submenu — which on
  // mobile is always meant to be expanded — isn't still stuck force-closed from an earlier
  // selection (see closeProductsSubmenu below; mobile has no hover/mouseleave to reset it).
  if (willOpen) reopenProductsSubmenu();
});
menuLinks.forEach((link) => link.addEventListener('click', closeMenu));

// "Products" is a label for the dropdown now, not a link — clicking it does nothing until
// the visitor picks a specific family from the submenu.
const productsNavItem = document.querySelector('.nav-item.has-submenu');
const productsTrigger = productsNavItem.querySelector(':scope > a');
productsTrigger.addEventListener('click', (event) => event.preventDefault());

// Selecting a family visually force-closes the dropdown (it's otherwise purely
// hover/focus-driven, so it would stay open under the pointer after a click) until the
// visitor hovers/focuses "Products" again, so they can still come back for another product.
function closeProductsSubmenu() {
  productsNavItem.classList.add('submenu-closing');
}
function reopenProductsSubmenu() {
  productsNavItem.classList.remove('submenu-closing');
}
productsNavItem.addEventListener('mouseenter', reopenProductsSubmenu);
productsTrigger.addEventListener('focus', reopenProductsSubmenu);

const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add('in-view');
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.12 });
document.querySelectorAll('.reveal').forEach((element) => revealObserver.observe(element));

// Slim progress bar that fills as the visitor scrolls the single page.
const scrollProgressBar = document.getElementById('scroll-progress-bar');
function updateScrollProgress() {
  const scrollable = document.documentElement.scrollHeight - window.innerHeight;
  const progress = scrollable > 0 ? (window.scrollY / scrollable) * 100 : 0;
  scrollProgressBar.style.width = `${Math.min(100, Math.max(0, progress))}%`;
}
window.addEventListener('scroll', () => window.requestAnimationFrame(updateScrollProgress), { passive: true });
updateScrollProgress();

const track = document.getElementById('product-track');
const productIndex = document.getElementById('product-index');
const cards = [...track.querySelectorAll('.product-card')];

function syncProductIndex() {
  const closest = cards.reduce((best, card, index) => {
    const distance = Math.abs(card.getBoundingClientRect().left - track.getBoundingClientRect().left);
    return distance < best.distance ? { index, distance } : best;
  }, { index: 0, distance: Infinity });
  productIndex.textContent = String(closest.index + 1).padStart(2, '0');
}

// Scrolls only the outer family track to a card — not card.scrollIntoView(), which would
// also walk up and can end up scrolling the page's own vertical position too. That's mostly
// harmless on its own, but the header "Products" submenu handler also fires an explicit
// scroll to the top of #products at the same moment — two competing smooth-scroll
// animations both fighting over the vertical position land somewhere wrong. Mirrors
// scrollGalleryToSlide below, which avoids the same ancestor-walk for the inner galleries.
function scrollTrackToCard(card) {
  const delta = card.getBoundingClientRect().left - track.getBoundingClientRect().left;
  track.scrollTo({ left: track.scrollLeft + delta, behavior: 'smooth' });
}

document.querySelectorAll('.carousel-button').forEach((button) => {
  button.addEventListener('click', () => {
    stopAutoplay();
    const current = Number(productIndex.textContent) - 1;
    // Wraps around at either end instead of stopping dead at the first/last family.
    const next = button.dataset.direction === 'next'
      ? (current + 1) % cards.length
      : (current - 1 + cards.length) % cards.length;
    scrollTrackToCard(cards[next]);
  });
});
track.addEventListener('scroll', () => window.requestAnimationFrame(syncProductIndex), { passive: true });
track.addEventListener('pointerdown', stopAutoplay);
track.addEventListener('keydown', stopAutoplay);

// Header "Products" submenu — jump straight to a family's card in the carousel and kick
// off autoplay there. This is the one interaction that's meant to *start* autoplay rather
// than stop it, so it deliberately skips the global "any click stops autoplay" listener
// below (stopPropagation) instead of calling stopAutoplay().
document.querySelectorAll('[data-family-link]').forEach((link) => {
  link.addEventListener('click', (event) => {
    event.preventDefault();
    event.stopPropagation();
    closeProductsSubmenu();
    link.blur();
    const index = cards.findIndex((card) => card.dataset.family === link.dataset.familyLink);
    if (index === -1) return;

    autoplayFamilyIndex = index;
    autoplayStopped = false;
    startAutoplay();

    // Runs the horizontal track scroll (and the photo reset within it) only once the
    // vertical scroll to #products has actually finished, rather than firing all three
    // smooth-scroll animations at the same instant — even though each one's own target is
    // independently correct (scrollTrackToCard never touches the page scroll), three
    // simultaneous smooth-scroll/transition animations sharing the same fixed, blurred
    // header is exactly the kind of thing that can paint a torn/glitchy-looking frame on
    // some browsers while they're mid-flight. scrollend is the standard "a scroll finished"
    // event; the timeout is just a fallback for the few browsers that lack it.
    let settled = false;
    function goToFamily() {
      if (settled) return;
      settled = true;
      window.removeEventListener('scrollend', goToFamily);
      clearTimeout(fallbackTimer);
      scrollTrackToCard(cards[index]);
      const family = productFamilies[index];
      const scroll = document.querySelector(`[data-gallery-scroll="${family}"]`);
      const slides = scroll ? [...scroll.querySelectorAll('.gallery-slide')] : [];
      if (scroll && slides.length) scrollGalleryToSlide(scroll, slides[0]);
    }
    window.addEventListener('scrollend', goToFamily);
    const fallbackTimer = setTimeout(goToFamily, 700);
    document.getElementById('products').scrollIntoView({ behavior: 'smooth', block: 'start' });
  });
});

// Product image catalogue — one gallery per main product family (not per sub-product).
// Each gallery renders exactly the images present in its `photos` array, as a horizontal
// scroll. Sub-products are listed as plain text next to the family gallery; they no longer
// have their own images or links. More photos can be added the same way as new ones arrive.
const productGalleries = {
  gloriosa: {
    name: 'Gloriosa Superba',
    photos: [
      { src: 'assets/gloriosa-superba-field-landscape.jpg', alt: 'Wide landscape view of the Gloriosa Superba growing field with coconut palms in the background', caption: 'Gloriosa Superba — flowering field' },
      { src: 'assets/gloriosa-superba-flower-cluster-closeup-1.jpg', alt: 'Close-up cluster of vivid red and yellow Gloriosa Superba flowers', caption: 'Gloriosa Superba Seeds — flower cluster' },
      { src: 'assets/gloriosa-superba-flowers-ground-level.jpg', alt: 'Ground-level view of flowering Gloriosa Superba plants across the field', caption: 'Gloriosa Superba Seeds — flowering field' },
      { src: 'assets/gloriossa-superba-tuber-enhanced.png', alt: 'Gloriosa Superba tubers prepared for trade', caption: 'Gloriosa Superba Tuber' },
      { src: 'assets/gloriosa-superba-tuber-drying-shed-2.jpg', alt: 'Rows of freshly harvested Gloriosa Superba tubers drying at the storage shed', caption: 'Gloriosa Superba Tuber — harvested' },
    ],
  },
  coconut: {
    name: 'Coconut Products',
    photos: [
      { src: 'assets/coconut-with-husk.jpg', alt: 'Fresh coconuts with husk piled at the farm', caption: 'Coconut with Husk' },
      { src: 'assets/coconut-harvest-pile-wall-wide.jpg', alt: 'A large pile of freshly harvested coconuts with husk beside a stone wall', caption: 'Coconut with Husk — farm harvest' },
      { src: 'assets/coconut-harvest-sorting-workers.jpg', alt: 'Freshly harvested coconuts with husk being sorted at the farm', caption: 'Coconut with Husk — harvest day' },
    ],
  },
};

// Slides are sized to each photo's own aspect ratio (no fixed/cropped frame), so a slide's
// width varies photo to photo. Finding "the current slide" and scrolling to "the next slide"
// therefore work off each slide's actual position, the same way the outer product carousel does.
function closestGallerySlideIndex(scroll) {
  const slides = [...scroll.querySelectorAll('.gallery-slide')];
  if (!slides.length) return 0;
  const scrollLeft = scroll.getBoundingClientRect().left;
  return slides.reduce((best, slide, index) => {
    const distance = Math.abs(slide.getBoundingClientRect().left - scrollLeft);
    return distance < best.distance ? { index, distance } : best;
  }, { index: 0, distance: Infinity }).index;
}

// Scrolls only the inner gallery strip to a slide — not element.scrollIntoView(), which would
// also walk up and scroll the outer product carousel that this gallery is nested inside.
function scrollGalleryToSlide(scroll, slide) {
  if (!slide) return;
  const delta = slide.getBoundingClientRect().left - scroll.getBoundingClientRect().left;
  scroll.scrollTo({ left: scroll.scrollLeft + delta, behavior: 'smooth' });
}

function updateGalleryStatus(family) {
  const scroll = document.querySelector(`[data-gallery-scroll="${family}"]`);
  const count = document.querySelector(`[data-gallery-count="${family}"]`);
  const caption = document.querySelector(`[data-gallery-caption="${family}"]`);
  const { photos } = productGalleries[family];
  if (!photos.length) return;
  const index = closestGallerySlideIndex(scroll);
  count.textContent = `${String(index + 1).padStart(2, '0')} / ${String(photos.length).padStart(2, '0')}`;
  caption.textContent = photos[index].caption;
}

function renderGallery(family) {
  const data = productGalleries[family];
  const scroll = document.querySelector(`[data-gallery-scroll="${family}"]`);
  const emptyState = document.querySelector(`[data-gallery-empty="${family}"]`);
  const count = document.querySelector(`[data-gallery-count="${family}"]`);
  const caption = document.querySelector(`[data-gallery-caption="${family}"]`);
  const panel = document.querySelector(`[data-gallery-panel="${family}"]`);
  const prevButton = document.querySelector(`[data-gallery-prev="${family}"]`);
  const nextButton = document.querySelector(`[data-gallery-next="${family}"]`);

  panel.querySelector('.gallery-stage').setAttribute('aria-label', `${data.name} photo gallery`);

  scroll.innerHTML = '';
  scroll.scrollLeft = 0;
  const hasPhotos = data.photos.length > 0;
  scroll.hidden = !hasPhotos;
  emptyState.hidden = hasPhotos;
  prevButton.hidden = data.photos.length < 2;
  nextButton.hidden = data.photos.length < 2;

  if (hasPhotos) {
    data.photos.forEach((photo) => {
      const img = document.createElement('img');
      img.className = 'gallery-slide';
      img.src = photo.src;
      img.alt = photo.alt;
      img.loading = 'lazy';
      img.decoding = 'async';
      scroll.append(img);
    });
    updateGalleryStatus(family);
  } else {
    count.textContent = 'PHOTO READY';
    caption.textContent = data.name;
  }
}

Object.keys(productGalleries).forEach((family) => {
  const scroll = document.querySelector(`[data-gallery-scroll="${family}"]`);
  const prevButton = document.querySelector(`[data-gallery-prev="${family}"]`);
  const nextButton = document.querySelector(`[data-gallery-next="${family}"]`);
  scroll.addEventListener('scroll', () => window.requestAnimationFrame(() => updateGalleryStatus(family)), { passive: true });
  scroll.addEventListener('pointerdown', stopAutoplay);
  prevButton.addEventListener('click', () => {
    stopAutoplay();
    // Wraps around to the last photo instead of stopping dead at the first.
    const slides = [...scroll.querySelectorAll('.gallery-slide')];
    scrollGalleryToSlide(scroll, slides[(closestGallerySlideIndex(scroll) - 1 + slides.length) % slides.length]);
  });
  nextButton.addEventListener('click', () => {
    stopAutoplay();
    // Wraps around to the first photo instead of stopping dead at the last.
    const slides = [...scroll.querySelectorAll('.gallery-slide')];
    scrollGalleryToSlide(scroll, slides[(closestGallerySlideIndex(scroll) + 1) % slides.length]);
  });
  renderGallery(family);
});

// ===== Product section autoplay =====
// Once the Products section is visible, automatically step through the current family's
// photos one at a time; when a family's photos are exhausted, advance to the next family
// (looping back to the first after the last), and keep repeating. A click anywhere on the
// site stops it — but only for the current visit to the section: scrolling away and back
// (or picking a family from the header) gives autoplay a fresh start from wherever it left
// off, rather than disabling it for the rest of the page visit.
const AUTOPLAY_INTERVAL_MS = 2500;
const productFamilies = Object.keys(productGalleries);
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
let autoplayFamilyIndex = 0;
let autoplayTimer = null;
let autoplayStopped = prefersReducedMotion;

function stopAutoplay() {
  autoplayStopped = true;
  if (autoplayTimer) {
    clearInterval(autoplayTimer);
    autoplayTimer = null;
  }
}

function autoplayStep() {
  if (autoplayStopped) return;
  const family = productFamilies[autoplayFamilyIndex];
  const scroll = document.querySelector(`[data-gallery-scroll="${family}"]`);
  const slides = scroll ? [...scroll.querySelectorAll('.gallery-slide')] : [];
  const currentIndex = scroll ? closestGallerySlideIndex(scroll) : 0;

  if (slides.length > 1 && currentIndex < slides.length - 1) {
    scrollGalleryToSlide(scroll, slides[currentIndex + 1]);
    return;
  }

  autoplayFamilyIndex = (autoplayFamilyIndex + 1) % productFamilies.length;
  const nextFamily = productFamilies[autoplayFamilyIndex];
  scrollTrackToCard(cards[autoplayFamilyIndex]);
  const nextScroll = document.querySelector(`[data-gallery-scroll="${nextFamily}"]`);
  const nextSlides = nextScroll ? [...nextScroll.querySelectorAll('.gallery-slide')] : [];
  if (nextScroll && nextSlides.length) scrollGalleryToSlide(nextScroll, nextSlides[0]);
}

function startAutoplay() {
  if (prefersReducedMotion || autoplayStopped || autoplayTimer) return;
  autoplayTimer = setInterval(autoplayStep, AUTOPLAY_INTERVAL_MS);
}

function pauseAutoplay() {
  if (autoplayTimer) {
    clearInterval(autoplayTimer);
    autoplayTimer = null;
  }
}

const autoplayVisibilityObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      // A fresh arrival at the section always gets to try autoplay again, even if an
      // earlier visit was stopped by an interaction — only reduced-motion permanently
      // opts out (startAutoplay's own guard keeps this a no-op for those visitors).
      autoplayStopped = false;
      startAutoplay();
    } else {
      pauseAutoplay();
    }
  });
}, { threshold: 0.4 });

if (!prefersReducedMotion) autoplayVisibilityObserver.observe(document.getElementById('products'));

// Any click anywhere on the site — not just inside the carousel — stops autoplay for the
// current visit to the section (the family-link handler above deliberately opts out of
// this via stopPropagation, since choosing a family from the header is meant to start
// autoplay, not stop it).
document.addEventListener('click', stopAutoplay);

// ===== Header scrollspy — highlight the nav link for whichever section is in view =====
const navLinksBySection = {
  home: document.querySelector('.site-menu a[href="#home"]'),
  about: document.querySelector('.site-menu a[href="#about"]'),
  products: document.querySelector('.nav-item.has-submenu > a[href="#products"]'),
  contact: document.querySelector('.site-menu a[href="#contact"]'),
};
const sectionObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (!entry.isIntersecting) return;
    const activeLink = navLinksBySection[entry.target.id];
    if (!activeLink) return;
    Object.values(navLinksBySection).forEach((link) => link && link.classList.remove('active'));
    activeLink.classList.add('active');
  });
}, { rootMargin: '-45% 0px -50% 0px', threshold: 0 });
Object.keys(navLinksBySection).forEach((id) => {
  const section = document.getElementById(id);
  if (section) sectionObserver.observe(section);
});

document.getElementById('year').textContent = new Date().getFullYear();

// ===== Contact details — filled in from CONFIG above =====
const emailLink = document.getElementById('contact-email');
emailLink.textContent = CONFIG.businessEmail;
emailLink.href = `mailto:${CONFIG.businessEmail}`;

// Two small line icons (not brand logos) marking a number as reachable by call or by
// WhatsApp — kept monochrome/currentColor so they follow the site's own palette rather
// than importing WhatsApp's brand green, matching the site's existing icon-free, typographic
// style as closely as an icon can.
const ICON_CALL = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="M6.6 10.8c1.2 2.4 3.2 4.4 5.6 5.6l1.9-1.9c.3-.3.7-.4 1.1-.3 1.2.4 2.5.6 3.8.6.6 0 1 .4 1 1V19c0 .6-.4 1-1 1C10.9 20 4 13.1 4 4.6c0-.6.4-1 1-1h3.2c.6 0 1 .4 1 1 0 1.3.2 2.6.6 3.8.1.4 0 .8-.3 1.1L6.6 10.8Z"/></svg>';
const ICON_WHATSAPP = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="M12 3a9 9 0 0 0-7.8 13.5L3 21l4.7-1.2A9 9 0 1 0 12 3Z"/><path d="M8.6 9c.2-.5.4-.5.7-.5h.4c.2 0 .4 0 .5.4l.6 1.3c.1.2 0 .5-.1.6l-.4.5c-.2.2-.2.4 0 .6.5.9 1.3 1.7 2.2 2.2.2.2.4.2.6 0l.5-.4c.2-.2.4-.2.6-.1l1.3.6c.3.1.4.3.4.5v.4c0 .3-.1.5-.5.7-.8.3-1.7.2-2.8-.4-1.3-.6-2.5-1.9-3.2-3.2-.6-1.1-.7-2-.4-2.8Z" fill="currentColor" stroke="none"/></svg>';

// Small circular flag badges next to each region label. Drawn as a rectangular flag inside
// a 3:2 viewBox with preserveAspectRatio="...slice" so a plain CSS border-radius + overflow
// on the wrapping <span> crops it into a circle — no <clipPath>/id needed, so nothing breaks
// if a region is ever duplicated (e.g. a second India number).
const FLAG_ICONS = {
  in: '<svg viewBox="0 0 3 2" preserveAspectRatio="xMidYMid slice" aria-hidden="true" focusable="false"><rect width="3" height="2" fill="#fff"/><rect width="3" height=".667" fill="#FF9933"/><rect width="3" height=".667" y="1.333" fill="#138808"/><circle cx="1.5" cy="1" r=".22" fill="none" stroke="#0b2b84" stroke-width=".05"/><circle cx="1.5" cy="1" r=".06" fill="#0b2b84"/></svg>',
  de: '<svg viewBox="0 0 3 2" preserveAspectRatio="xMidYMid slice" aria-hidden="true" focusable="false"><rect width="3" height=".667" fill="#000"/><rect width="3" height=".667" y=".667" fill="#DD0000"/><rect width="3" height=".667" y="1.333" fill="#FFCE00"/></svg>',
};
const flagBadge = (flag) => (flag && FLAG_ICONS[flag] ? `<span class="flag-badge" aria-hidden="true">${FLAG_ICONS[flag]}</span>` : '');

const phoneList = document.getElementById('contact-phones');
CONFIG.phones.forEach(({ region, flag, number }) => {
  const telHref = `tel:${number.replace(/\s/g, '')}`;
  const waHref = `https://wa.me/${number.replace(/\D/g, '')}`;

  const row = document.createElement('div');
  row.className = 'phone-row';
  row.innerHTML = `
    <span class="region-badge">${flagBadge(flag)}${region}</span>
    <a class="phone-number" href="${telHref}">${number}</a>
    <span class="phone-actions">
      <a class="icon-btn" href="${telHref}" aria-label="Call ${region} number ${number}">${ICON_CALL}</a>
      <a class="icon-btn" href="${waHref}" target="_blank" rel="noopener" aria-label="WhatsApp ${region} number ${number}">${ICON_WHATSAPP}</a>
    </span>
  `;
  phoneList.appendChild(row);
});

const addressList = document.getElementById('contact-addresses');
CONFIG.addresses.forEach(({ region, address }) => {
  const row = document.createElement('div');
  row.className = 'addr-row';
  row.innerHTML = `
    <span class="region-badge">${region}</span>
    <address>${address}</address>
  `;
  addressList.appendChild(row);
});

// ===== Contact form =====
const form = document.getElementById('contact-form');
const formStatus = document.getElementById('form-status');
const submitButton = form.querySelector('button[type="submit"]');

function setFormStatus(message, state) {
  formStatus.textContent = message;
  formStatus.classList.remove('is-success', 'is-error');
  if (state) formStatus.classList.add(`is-${state}`);
}

// ===== Contact form validation — every field is required =====
const FIELD_ERROR_MESSAGES = {
  name: { valueMissing: 'Please enter your name.' },
  company: { valueMissing: 'Please enter your company name.' },
  email: { valueMissing: 'Please enter your email address.', typeMismatch: 'Enter a valid email address, e.g. you@company.com.' },
  phone: { valueMissing: 'Please enter a phone number.', patternMismatch: 'Enter a valid phone number (digits, spaces, +, - only).' },
  location: { valueMissing: 'Please enter your city, region, or country.' },
  message: { valueMissing: 'Please tell us what you need.' },
};

function fieldErrorMessage(field) {
  const { validity } = field;
  if (validity.valid) return '';
  const messages = FIELD_ERROR_MESSAGES[field.name] || {};
  if (validity.valueMissing) return messages.valueMissing || 'This field is required.';
  if (validity.typeMismatch) return messages.typeMismatch || 'Please enter a valid value.';
  if (validity.patternMismatch) return messages.patternMismatch || 'Please match the requested format.';
  return field.validationMessage || 'Please check this field.';
}

function validateField(field) {
  field.checkValidity();
  const errorEl = document.getElementById(`err-${field.name}`);
  const message = fieldErrorMessage(field);
  if (errorEl) errorEl.textContent = message;
  field.setAttribute('aria-invalid', String(!field.validity.valid));
  return field.validity.valid;
}

const textFields = [...form.querySelectorAll('input:not([type="checkbox"]), textarea')];
textFields.forEach((field) => {
  field.addEventListener('blur', () => validateField(field));
  field.addEventListener('input', () => {
    if (field.getAttribute('aria-invalid') === 'true') validateField(field);
  });
});

// Native `required` doesn't support "at least one of a group" for checkboxes,
// so the first checkbox carries a custom validity message for the whole group.
const productCheckboxes = [...document.querySelectorAll('.chip-select input[type="checkbox"]')];
const productsError = document.getElementById('err-products');

function validateProducts(showError) {
  const anyChecked = productCheckboxes.some((checkbox) => checkbox.checked);
  productCheckboxes[0].setCustomValidity(anyChecked ? '' : 'Select at least one product you are interested in.');
  if (showError) productsError.textContent = anyChecked ? '' : productCheckboxes[0].validationMessage;
  return anyChecked;
}

productCheckboxes.forEach((checkbox) => {
  checkbox.addEventListener('change', () => validateProducts(true));
});
validateProducts(false);

function validateForm() {
  let firstInvalid = null;
  textFields.forEach((field) => {
    const isValid = validateField(field);
    if (!isValid && !firstInvalid) firstInvalid = field;
  });
  const productsValid = validateProducts(true);
  if (!productsValid && !firstInvalid) firstInvalid = productCheckboxes[0];
  return firstInvalid;
}

function sendByMailto(values, products) {
  const body = [
    `Name: ${values.get('name')}`,
    `Company: ${values.get('company') || '—'}`,
    `Email: ${values.get('email')}`,
    `Phone: ${values.get('phone') || '—'}`,
    `Location: ${values.get('location') || '—'}`,
    `Product(s) of interest: ${products.length ? products.join(', ') : '—'}`,
    '',
    `Message: ${values.get('message')}`,
  ].join('\n');
  window.location.href = `mailto:${CONFIG.businessEmail}?subject=${encodeURIComponent('New Visithra Agro enquiry')}&body=${encodeURIComponent(body)}`;
  setFormStatus('Email sending isn’t configured yet, so your email app should open with the enquiry ready to send.', null);
}

form.addEventListener('submit', async (event) => {
  event.preventDefault();

  // Honeypot: real visitors never fill this hidden field in.
  if (form.elements.botcheck.checked) return;

  const firstInvalid = validateForm();
  if (firstInvalid) {
    firstInvalid.focus();
    setFormStatus('Please fill in the highlighted fields before sending.', 'error');
    return;
  }

  const values = new FormData(form);
  const products = values.getAll('products');
  const isConfigured = CONFIG.web3FormsKey && CONFIG.web3FormsKey !== 'YOUR-WEB3FORMS-ACCESS-KEY';

  if (!isConfigured) {
    sendByMailto(values, products);
    return;
  }

  submitButton.disabled = true;
  setFormStatus('Sending your enquiry…', null);

  // Web3Forms can hang on a stalled connection; without a timeout the button
  // would stay disabled and "Sending…" would show indefinitely with no way out.
  const submitTimeout = new AbortController();
  const timeoutId = setTimeout(() => submitTimeout.abort(), 15000);

  try {
    const response = await fetch('https://api.web3forms.com/submit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      signal: submitTimeout.signal,
      body: JSON.stringify({
        access_key: CONFIG.web3FormsKey,
        subject: 'New enquiry — Visithra Agro Traders',
        from_name: 'Visithra Agro Traders website',
        name: values.get('name'),
        email: values.get('email'),
        phone: values.get('phone') || 'Not provided',
        company: values.get('company') || 'Not provided',
        location: values.get('location') || 'Not provided',
        'Product(s) of interest': products.length ? products.join(', ') : 'Not specified',
        message: values.get('message'),
      }),
    });
    const result = await response.json();
    if (result.success) {
      setFormStatus('Thank you — your enquiry has been sent. We will be in touch soon.', 'success');
      form.reset();
      validateProducts(false);
    } else {
      throw new Error(result.message || 'Something went wrong.');
    }
  } catch (error) {
    const message = error.name === 'AbortError'
      ? `Sorry, sending your enquiry is taking too long. Please try again, or email us directly at ${CONFIG.businessEmail}.`
      : `Sorry, something went wrong sending your enquiry. Please email us directly at ${CONFIG.businessEmail}.`;
    setFormStatus(message, 'error');
  } finally {
    clearTimeout(timeoutId);
    submitButton.disabled = false;
  }
});
