const menuButton = document.querySelector('.menu-toggle');
const menu = document.querySelector('.site-menu');
const menuLinks = document.querySelectorAll('.site-menu a');

function closeMenu() {
  menuButton.setAttribute('aria-expanded', 'false');
  menu.classList.remove('open');
  document.body.classList.remove('menu-open');
}

menuButton.addEventListener('click', () => {
  const isOpen = menuButton.getAttribute('aria-expanded') === 'true';
  menuButton.setAttribute('aria-expanded', String(!isOpen));
  menu.classList.toggle('open', !isOpen);
  document.body.classList.toggle('menu-open', !isOpen);
});
menuLinks.forEach((link) => link.addEventListener('click', closeMenu));

const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add('in-view');
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.12 });
document.querySelectorAll('.reveal').forEach((element) => revealObserver.observe(element));

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

document.querySelectorAll('.carousel-button').forEach((button) => {
  button.addEventListener('click', () => {
    const current = Number(productIndex.textContent) - 1;
    const next = button.dataset.direction === 'next'
      ? Math.min(current + 1, cards.length - 1)
      : Math.max(current - 1, 0);
    cards[next].scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'start' });
  });
});
track.addEventListener('scroll', () => window.requestAnimationFrame(syncProductIndex), { passive: true });

// Product image catalogue — each gallery renders exactly the images present in its `photos` array.
const productGalleries = {
  gloriossa: {
    seeds: {
      name: 'Gloriossa Superba Seeds',
      photos: [
        { src: 'assets/gloriossa-superba-seeds.jpg', alt: 'Gloriossa Superba flowering plants', caption: 'Gloriossa Superba Seeds' },
        { src: 'assets/gloriossa-superba-seeds-field.jpg', alt: 'Gloriossa Superba flowers in the growing field', caption: 'Gloriossa Superba Seeds — field view' },
      ],
    },
    tuber: {
      name: 'Gloriossa Superba Tuber',
      photos: [{ src: 'assets/gloriossa-superba-tuber-enhanced.png', alt: 'Gloriossa Superba tubers prepared for trade', caption: 'Gloriossa Superba Tuber' }],
    },
  },
  coconut: {
    'with-husk': {
      name: 'Coconut with Husk',
      photos: [{ src: 'assets/coconut-with-husk.jpg', alt: 'Fresh coconuts with husk at the farm', caption: 'Coconut with Husk' }],
    },
    desiccated: { name: 'Desiccated Coconut', photos: [] },
    copra: { name: 'Coconut Copra', photos: [] },
    oil: { name: 'Fresh Coconut Oil', photos: [] },
  },
};

function updateGalleryStatus(family) {
  const scroll = document.querySelector(`[data-gallery-scroll="${family}"]`);
  const count = document.querySelector(`[data-gallery-count="${family}"]`);
  const caption = document.querySelector(`[data-gallery-caption="${family}"]`);
  const activeButton = document.querySelector(`[data-gallery-family="${family}"].active`);
  const data = productGalleries[family][activeButton.dataset.subproduct];
  if (!data.photos.length) return;
  const index = Math.min(Math.max(Math.round(scroll.scrollLeft / scroll.clientWidth), 0), data.photos.length - 1);
  count.textContent = `${String(index + 1).padStart(2, '0')} / ${String(data.photos.length).padStart(2, '0')}`;
  caption.textContent = data.photos[index].caption;
}

function showGalleryImage(family, product) {
  const data = productGalleries[family][product];
  const scroll = document.querySelector(`[data-gallery-scroll="${family}"]`);
  const emptyState = document.querySelector(`[data-gallery-empty="${family}"]`);
  const count = document.querySelector(`[data-gallery-count="${family}"]`);
  const caption = document.querySelector(`[data-gallery-caption="${family}"]`);
  const panel = document.querySelector(`[data-gallery-panel="${family}"]`);
  const prevButton = document.querySelector(`[data-gallery-prev="${family}"]`);
  const nextButton = document.querySelector(`[data-gallery-next="${family}"]`);
  const selectedSubproduct = document.querySelector(`[data-gallery-family="${family}"][data-subproduct="${product}"]`);
  const summary = selectedSubproduct.querySelector('[data-gallery-summary]');

  panel.querySelector('.gallery-stage').setAttribute('aria-label', `${data.name} photo gallery`);
  summary.textContent = `${summary.dataset.gallerySummary} · ${data.photos.length ? `${data.photos.length} photo${data.photos.length === 1 ? '' : 's'}` : 'images coming soon'}`;

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
      scroll.append(img);
    });
    updateGalleryStatus(family);
  } else {
    count.textContent = 'PHOTO READY';
    caption.textContent = data.name;
  }
}

document.querySelectorAll('.subproduct').forEach((button) => {
  button.addEventListener('click', () => {
    const { galleryFamily: family, subproduct: product } = button.dataset;
    document.querySelectorAll(`[data-gallery-family="${family}"]`).forEach((item) => {
      const isSelected = item === button;
      item.classList.toggle('active', isSelected);
      item.setAttribute('aria-pressed', String(isSelected));
    });
    showGalleryImage(family, product);
  });
});

Object.entries(productGalleries).forEach(([family, subproducts]) => {
  const scroll = document.querySelector(`[data-gallery-scroll="${family}"]`);
  const prevButton = document.querySelector(`[data-gallery-prev="${family}"]`);
  const nextButton = document.querySelector(`[data-gallery-next="${family}"]`);
  scroll.addEventListener('scroll', () => window.requestAnimationFrame(() => updateGalleryStatus(family)), { passive: true });
  prevButton.addEventListener('click', () => scroll.scrollBy({ left: -scroll.clientWidth, behavior: 'smooth' }));
  nextButton.addEventListener('click', () => scroll.scrollBy({ left: scroll.clientWidth, behavior: 'smooth' }));
  showGalleryImage(family, Object.keys(subproducts)[0]);
});

document.getElementById('year').textContent = new Date().getFullYear();

const form = document.getElementById('contact-form');
const formStatus = document.getElementById('form-status');
form.addEventListener('submit', async (event) => {
  // Netlify captures this form automatically after deployment. Locally, it opens an email draft instead.
  if (window.location.hostname === 'localhost' || window.location.protocol === 'file:') {
    event.preventDefault();
    const values = new FormData(form);
    const body = [
      `Name: ${values.get('name')}`,
      `Contact: ${values.get('phone')}`,
      `Company: ${values.get('company') || '—'}`,
      `Location: ${values.get('location') || '—'}`,
      '',
      `Message: ${values.get('message')}`,
    ].join('\n');
    window.location.href = `mailto:YOUR-BUSINESS-EMAIL@example.com?subject=${encodeURIComponent('New Visithra Agro enquiry')}&body=${encodeURIComponent(body)}`;
    formStatus.textContent = 'Your email app should open with the enquiry ready to send.';
  }
});
