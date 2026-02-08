// Slideshow class để quản lý slideshow cho mỗi section
class Slideshow {
  constructor(sectionName, images) {
    this.sectionName = sectionName;
    this.images = images;
    this.currentIndex = 0;
    this.zoomLevel = 1;
    this.init();
  }

  init() {
    // Get elements
    this.imgElement = this.getById(`${this.sectionName}-img`);
    this.prevBtn = this.getById(`${this.sectionName}-prev`);
    this.nextBtn = this.getById(`${this.sectionName}-next`);
    this.slideshow = document.querySelector(`#${this.sectionName} .slideshow`);
    this.slideshowContainer = document.querySelector(`#${this.sectionName} .slideshow-container`);
    this.popup = this.getById(`${this.sectionName}-popup`);
    this.popupImg = this.getById(`${this.sectionName}-popup-img`);
    this.popupPrevBtn = this.getById(`${this.sectionName}-popup-prev`);
    this.popupNextBtn = this.getById(`${this.sectionName}-popup-next`);
    this.closeBtn = this.getById(`${this.sectionName}-close`);
    this.zoomInBtn = this.getById(`${this.sectionName}-zoom-in`);
    this.zoomOutBtn = this.getById(`${this.sectionName}-zoom-out`);

    if (!this.imgElement || this.images.length === 0) return;

    // Hiển thị ảnh đầu tiên
    this.showImage(0);

    // Event listeners cho navigation buttons
    this.bindClick(this.prevBtn, () => this.prevImage());
    this.bindClick(this.nextBtn, () => this.nextImage());

    // Event listeners cho popup navigation buttons
    this.bindClick(this.popupPrevBtn, () => this.prevImage(true));
    this.bindClick(this.popupNextBtn, () => this.nextImage(true));

    // Event listeners cho popup
    if (this.imgElement && this.popup && this.popupImg) {
      this.bindClick(this.imgElement, () => this.openPopup());
    }
    this.bindClick(this.closeBtn, () => this.closePopup());

    // Zoom controls
    this.bindClick(this.zoomInBtn, () => this.zoomIn());
    this.bindClick(this.zoomOutBtn, () => this.zoomOut());

    // Close popup khi click outside
    if (this.popup) {
      this.popup.addEventListener('click', (e) => {
        if (e.target === this.popup) {
          this.closePopup();
        }
      });
    }

    // Keyboard navigation
    document.addEventListener('keydown', (e) => {
      if (this.popup && this.popup.style.display === 'flex') {
        if (e.key === 'ArrowLeft') this.prevImage();
        if (e.key === 'ArrowRight') this.nextImage();
        if (e.key === 'Escape') this.closePopup();
        if (e.key === '+' || e.key === '=') this.zoomIn();
        if (e.key === '-') this.zoomOut();
      }
    });
  }

  getById(id) {
    return document.getElementById(id);
  }

  bindClick(element, handler) {
    if (element) {
      element.addEventListener('click', handler);
    }
  }

  getOrientation(width, height) {
    return width > height ? 'landscape' : 'portrait';
  }

  updateFrameClass(width, height) {
    if (!this.slideshow) return;
    
    const orientation = this.getOrientation(width, height);
    
    // Remove existing frame classes from slideshow, slideshowContainer, and popup
    this.slideshow.classList.remove('frame--landscape', 'frame--portrait');
    if (this.slideshowContainer) {
      this.slideshowContainer.classList.remove('frame--landscape', 'frame--portrait');
    }
    if (this.popup) {
      this.popup.classList.remove('frame--landscape', 'frame--portrait');
    }
    
    // Add new class to all three elements
    this.slideshow.classList.add(`frame--${orientation}`);
    if (this.slideshowContainer) {
      this.slideshowContainer.classList.add(`frame--${orientation}`);
    }
    if (this.popup) {
      this.popup.classList.add(`frame--${orientation}`);
    }
  }

  showImage(index) {
    if (index < 0) {
      this.currentIndex = this.images.length - 1;
    } else if (index >= this.images.length) {
      this.currentIndex = 0;
    } else {
      this.currentIndex = index;
    }

    if (this.imgElement && this.images[this.currentIndex]) {
      const image = this.images[this.currentIndex];
      this.imgElement.src = image.url;
      this.imgElement.alt = image.display_name || `${this.sectionName} image ${this.currentIndex + 1}`;
      // Update frame class based on image orientation
      if (image.width && image.height) {
        this.updateFrameClass(image.width, image.height);
      }
    }
  }

  nextImage(fromPopup = false) {
    this.showImage(this.currentIndex + 1);
    if (this.popup && this.popup.style.display === 'flex') {
      this.zoomLevel = 1;
      this.updatePopupImage();
    }
  }

  prevImage(fromPopup = false) {
    this.showImage(this.currentIndex - 1);
    if (this.popup && this.popup.style.display === 'flex') {
      this.zoomLevel = 1;
      this.updatePopupImage();
    }
  }

  openPopup() {
    if (this.popup && this.popupImg) {
      this.popup.style.display = 'flex';
      this.updatePopupImage();
      this.zoomLevel = 1;
    }
  }

  closePopup() {
    if (this.popup) {
      this.popup.style.display = 'none';
      this.zoomLevel = 1;
    }
  }

  updatePopupImage() {
    if (this.popupImg && this.images[this.currentIndex]) {
      this.popupImg.src = this.images[this.currentIndex].url;
      this.popupImg.style.transform = `scale(${this.zoomLevel})`;
    }
  }

  zoomIn() {
    this.zoomLevel = Math.min(this.zoomLevel + 0.2, 3);
    if (this.popupImg) {
      this.popupImg.style.transform = `scale(${this.zoomLevel})`;
    }
  }

  zoomOut() {
    this.zoomLevel = Math.max(this.zoomLevel - 0.2, 0.5);
    if (this.popupImg) {
      this.popupImg.style.transform = `scale(${this.zoomLevel})`;
    }
  }
}

const getApiBase = () => {
  if (window.location.origin === 'null') return 'http://127.0.0.1:8000';
  if (window.location.port && window.location.port !== '8000') return 'http://127.0.0.1:8000';
  return '';
};

async function fetchImages(folder) {
  const response = await fetch(`${getApiBase()}/image-url/${folder}`);
  if (!response.ok) {
    throw new Error(`Failed to fetch images from ${folder}`);
  }
  return response.json();
}

async function loadAllImages() {
  const sections = [
    { id: 'portrait', folder: 'portrait' },
    { id: 'wabi-sabi', folder: 'wabi-sabi' },
    { id: 'street-photo', folder: 'street' }
  ];

  for (const section of sections) {
    try {
      const images = await fetchImages(section.folder);
      
      if (images && images.length > 0) {
        if (section.id === 'wabi-sabi') {
          renderWabiSabiRow(images);
        } else {
          new Slideshow(section.id, images);
        }
      } else {
        console.warn(`No images found for section: ${section.id}`);
      }
    } catch (error) {
      console.error(`Error loading images for section ${section.id}:`, error);
    }
  }
}

async function loadFullPageBackground() {
  try {
    const response = await fetch(`${getApiBase()}/image-url/background`);
    if (!response.ok) {
      console.warn('Background image not found, using fallback color');
      return;
    }
    
    const backgroundImage = await response.json();
    
    if (backgroundImage.url) {
      document.body.style.backgroundImage = `url(${backgroundImage.url})`;
      document.body.style.backgroundSize = 'cover';
      document.body.style.backgroundPosition = 'center';
      document.body.style.backgroundAttachment = 'fixed';
      document.body.style.backgroundRepeat = 'no-repeat';
      console.log('Background image loaded:', backgroundImage.public_id, backgroundImage.url);
    }
  } catch (error) {
    console.warn('Background image loading failed, using fallback color:', error.message);
  }
}

export { loadAllImages, loadFullPageBackground };

function renderWabiSabiRow(images) {
  const row = document.getElementById('wabi-sabi-row');
  if (!row) return;

  row.innerHTML = '';

  images.forEach((image, index) => {
    const img = document.createElement('img');
    let thumbUrl = image.url;
    if (thumbUrl.includes('/upload/')) {
      thumbUrl = thumbUrl.replace('/upload/', '/upload/w_60,h_80,c_fill/');
    }
    img.src = thumbUrl;
    img.alt = image.display_name || `Wabi-sabi ${index + 1}`;
    img.className = 'wabi-sabi-thumb';
    row.appendChild(img);
  });
}