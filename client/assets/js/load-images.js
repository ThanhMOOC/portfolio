class Slideshow {
  constructor(sectionId, images) {
    this.sectionId = sectionId;
    this.images = images;
    this.currentIndex = 0;
    this.isMobile = window.innerWidth <= 768;

    this.elems = {
      container: document.querySelector(`[data-slideshow="${sectionId}"]`),
      img: document.getElementById(`${sectionId}-img`),
      prev: document.getElementById(`${sectionId}-prev`),
      next: document.getElementById(`${sectionId}-next`),
      popup: document.getElementById(`${sectionId}-popup`),
      popupImg: document.getElementById(`${sectionId}-popup-img`)
    };

    if (this.elems.img) this.init();
  }

  init() {
    this.showImage(0);
    this.elems.prev?.addEventListener('click', () => this.changeStep(-1));
    this.elems.next?.addEventListener('click', () => this.changeStep(1));
    this.elems.img?.addEventListener('click', () => this.togglePopup(true));
    document.getElementById(`${this.sectionId}-close`)?.addEventListener('click', () => this.togglePopup(false));
  }

  // Tối ưu hóa URL Cloudinary cho Mobile
  getOptimizedUrl(url) {
    if (!url.includes('cloudinary')) return url;
    const transform = this.isMobile ? 'w_600,c_limit,q_auto,f_auto' : 'w_1200,c_limit,q_auto,f_auto';
    return url.replace('/upload/', `/upload/${transform}/`);
  }

  async showImage(index) {
    this.elems.container?.classList.add('loading');

    this.currentIndex = (index + this.images.length) % this.images.length;
    const data = this.images[this.currentIndex];

    // Khung tự thay đổi class dựa trên orientation
    const orientation = data.width > data.height ? 'landscape' : 'portrait';
    this.elems.container?.classList.remove('frame--portrait', 'frame--landscape');
    this.elems.container?.classList.add(`frame--${orientation}`);

    const optimizedUrl = this.getOptimizedUrl(data.url);

    // Đợi hình tải xong mới tắt loading
    await this.preloadImage(optimizedUrl);

    this.elems.img.src = optimizedUrl;
    this.elems.container?.classList.remove('loading');
  }

  preloadImage(url) {
    return new Promise(resolve => {
      const img = new Image();
      img.onload = resolve;
      img.src = url;
    });
  }

  changeStep(step) {
    this.showImage(this.currentIndex + step);
  }

  togglePopup(show) {
    if (!this.elems.popup) return;
    this.elems.popup.style.display = show ? 'flex' : 'none';
    if (show) this.elems.popupImg.src = this.images[this.currentIndex].url;
  }
}

const getApiBase = () => (window.location.port && window.location.port !== '8000') ? 'http://127.0.0.1:8000' : '';

function getNonCropBackgroundUrl(url) {
  if (!url || !url.includes('cloudinary') || !url.includes('/upload/')) return url;

  const vw = Math.max(window.innerWidth || 1920, 1);
  const vh = Math.max(window.innerHeight || 1080, 1);

  // c_fit: giữ nguyên tỉ lệ, không crop.
  // f_auto,q_auto,dpr_auto: tối ưu chất lượng/dung lượng theo thiết bị.
  const transform = `c_fit,w_${vw},h_${vh},f_auto,q_auto,dpr_auto`;
  return url.replace('/upload/', `/upload/${transform}/`);
}

async function loadAllImages() {
  const configs = [
    { id: 'portrait', folder: 'portrait' },
    { id: 'street-photo', folder: 'street' }
  ];

  for (const cfg of configs) {
    try {
      const res = await fetch(`${getApiBase()}/image-url/${cfg.folder}`);
      const images = await res.json();
      if (images.length) new Slideshow(cfg.id, images);
    } catch (e) {
      console.error(`Failed ${cfg.id}`, e);
    }
  }
}

async function loadFullPageBackground() {
  try {
    const res = await fetch(`${getApiBase()}/image-url/background`);
    const data = await res.json();
    if (data.url) {
      const optimizedBgUrl = getNonCropBackgroundUrl(data.url);
      Object.assign(document.body.style, {
        backgroundImage: `url(${optimizedBgUrl})`,
        // contain: không cắt ảnh, chấp nhận có khoảng trống nếu khác tỉ lệ màn hình
        backgroundSize: 'contain',
        backgroundAttachment: 'fixed',
        backgroundRepeat: 'no-repeat',
        backgroundPosition: 'center center',
        backgroundColor: '#b8b4ae'
      });
    }
  } catch (e) { }
}

export { loadAllImages, loadFullPageBackground };