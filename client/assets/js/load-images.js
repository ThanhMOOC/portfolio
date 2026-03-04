const getApiBase = () => (window.location.port && window.location.port !== '8000') ? 'http://127.0.0.1:8000' : '';

function getNonCropBackgroundUrl(url) {
  if (!url || !url.includes('cloudinary') || !url.includes('/upload/')) return url;

  const vw = Math.max(window.innerWidth || 1920, 1);
  const vh = Math.max(window.innerHeight || 1080, 1);
  const transform = `c_fit,w_${vw},h_${vh},f_auto,q_auto,dpr_auto`;
  return url.replace('/upload/', `/upload/${transform}/`);
}

function getThumbUrl(url) {
  if (!url || !url.includes('cloudinary') || !url.includes('/upload/')) return url;
  return url.replace('/upload/', '/upload/w_800,c_limit,f_auto,q_auto,dpr_auto/');
}

function shuffleArray(list) {
  const arr = [...list];
  for (let i = arr.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

class TabbedGallery {
  constructor() {
    this.tabs = Array.from(document.querySelectorAll('.gallery-tab'));
    this.panels = Array.from(document.querySelectorAll('.gallery-panel'));
    this.activeTab = 'all';

    if (!this.tabs.length || !this.panels.length) return;

    this.bindEvents();
  }

  bindEvents() {
    this.tabs.forEach((tab) => {
      tab.addEventListener('click', () => {
        const nextTab = tab.dataset.tab;
        if (!nextTab || nextTab === this.activeTab) return;

        const currentIndex = this.tabs.findIndex((x) => x.dataset.tab === this.activeTab);
        const nextIndex = this.tabs.findIndex((x) => x.dataset.tab === nextTab);
        const direction = nextIndex > currentIndex ? 'left' : 'right';

        this.switchTo(nextTab, direction);
      });
    });
  }

  switchTo(nextTab, direction) {
    const activeTabEl = this.tabs.find((t) => t.dataset.tab === this.activeTab);
    const nextTabEl = this.tabs.find((t) => t.dataset.tab === nextTab);
    const activePanel = this.panels.find((p) => p.dataset.panel === this.activeTab);
    const nextPanel = this.panels.find((p) => p.dataset.panel === nextTab);

    if (!activeTabEl || !nextTabEl || !activePanel || !nextPanel) return;

    activeTabEl.classList.remove('is-active');
    activeTabEl.setAttribute('aria-selected', 'false');

    nextTabEl.classList.add('is-active');
    nextTabEl.setAttribute('aria-selected', 'true');

    activePanel.classList.remove('is-active', 'slide-in-left', 'slide-in-right');
    activePanel.classList.add(direction === 'left' ? 'slide-out-left' : 'slide-out-right');

    nextPanel.classList.remove('slide-out-left', 'slide-out-right', 'slide-in-left', 'slide-in-right');
    nextPanel.style.display = 'block';
    nextPanel.removeAttribute('aria-hidden');
    nextPanel.classList.add('is-active', direction === 'left' ? 'slide-in-left' : 'slide-in-right');

    const cleanup = () => {
      this.panels.forEach((panel) => {
        if (panel.dataset.panel !== nextTab) {
          panel.classList.remove('is-active', 'slide-out-left', 'slide-out-right', 'slide-in-left', 'slide-in-right');
          panel.style.display = 'none';
          panel.setAttribute('aria-hidden', 'true');
        }
      });

      nextPanel.classList.remove('slide-in-left', 'slide-in-right');
      this.activeTab = nextTab;
      nextPanel.scrollTop = 0;
    };

    window.setTimeout(cleanup, 320);
  }
}

function createCard(image) {
  const card = document.createElement('a');
  card.className = 'gallery-card';
  card.href = image.url;
  card.target = '_blank';
  card.rel = 'noopener noreferrer';
  card.title = image.display_name || image.public_id || 'Open image';

  const img = document.createElement('img');
  img.className = 'gallery-card__img';
  img.src = getThumbUrl(image.url);
  img.alt = image.display_name || 'Portfolio image';
  img.loading = 'lazy';
  img.decoding = 'async';

  card.appendChild(img);
  return card;
}

function renderGrid(gridId, images) {
  const grid = document.getElementById(gridId);
  if (!grid) return;

  grid.innerHTML = '';

  if (!images.length) {
    const empty = document.createElement('p');
    empty.className = 'gallery-empty';
    empty.textContent = 'No images available yet.';
    grid.appendChild(empty);
    return;
  }

  const fragment = document.createDocumentFragment();
  images.forEach((image) => fragment.appendChild(createCard(image)));
  grid.appendChild(fragment);
}

function categoryFromFolder(folder) {
  const key = String(folder || '').toLowerCase();
  if (key.includes('portrait')) return 'portrait';
  if (key.includes('wabi') || key.includes('sabi')) return 'wabi-sabi';
  if (key.includes('street')) return 'street-photo';
  return null;
}

async function loadAllImages() {
  const categorized = {
    portrait: [],
    'wabi-sabi': [],
    'street-photo': []
  };

  try {
    const res = await fetch(`${getApiBase()}/image-url/portfolio`);
    const tree = await res.json();

    Object.entries(tree || {}).forEach(([folder, images]) => {
      const category = categoryFromFolder(folder);
      if (!category || !Array.isArray(images)) return;
      categorized[category].push(...images);
    });
  } catch (error) {
    console.error('Failed loading portfolio tree', error);
  }

  if (!categorized['wabi-sabi'].length || !categorized.portrait.length || !categorized['street-photo'].length) {
    const fallbackConfigs = [
      { category: 'portrait', folder: 'portrait' },
      { category: 'wabi-sabi', folder: 'wabi-sabi' },
      { category: 'street-photo', folder: 'street' }
    ];

    for (const cfg of fallbackConfigs) {
      if (categorized[cfg.category].length) continue;
      try {
        const res = await fetch(`${getApiBase()}/image-url/${cfg.folder}`);
        const images = await res.json();
        if (Array.isArray(images)) categorized[cfg.category] = images;
      } catch (error) {
        console.error(`Failed loading ${cfg.category}`, error);
      }
    }
  }

  const all = shuffleArray([
    ...categorized.portrait,
    ...categorized['wabi-sabi'],
    ...categorized['street-photo']
  ]);

  renderGrid('gallery-grid-all', all);
  renderGrid('gallery-grid-portrait', categorized.portrait);
  renderGrid('gallery-grid-wabi-sabi', categorized['wabi-sabi']);
  renderGrid('gallery-grid-street-photo', categorized['street-photo']);

  new TabbedGallery();
}

async function loadFullPageBackground() {
  try {
    const res = await fetch(`${getApiBase()}/image-url/background`);
    const data = await res.json();
    if (data.url) {
      const optimizedBgUrl = getNonCropBackgroundUrl(data.url);
      Object.assign(document.body.style, {
        backgroundImage: `url(${optimizedBgUrl})`,
        backgroundSize: 'cover',
        backgroundAttachment: 'fixed',
        backgroundRepeat: 'no-repeat',
        backgroundPosition: 'center center',
        backgroundColor: '#b8b4ae'
      });
    }
  } catch (error) {
    console.error('Failed loading background image', error);
  }
}

export { loadAllImages, loadFullPageBackground };