// load-images.js
// Module gộp các hàm dùng để fetch và gán hình ảnh Cloudinary cho từng trang HTML

/**
 * Fetch danh sách hình ảnh từ endpoint server.
 * @returns {Promise<Array>} Danh sách object { url, public_id }
 */
export async function fetchImages() {
  const response = await fetch('/image-url/portfolio');
  return await response.json();
}

/**
 * Tìm một hình trong danh sách theo tên (không kèm đuôi).
 * @param {Array} images - Danh sách đối tượng hình ảnh
 * @param {string} name - Tên để tìm (không có đuôi)
 * @returns {?Object} Đối tượng hình nếu tìm thấy
 */
export function findImage(images, name) {
  const id = name.toLowerCase();
  return images.find(img => {
    const publicId = img.public_id?.toLowerCase() || '';
    // Use .includes() to match even if folders are involved
    return publicId.includes(id) || publicId.includes(`${id}.jpg`);
  });
}

/**
 * Transform a Cloudinary URL to add blur, gamma, and shadow effects
 * @param {string} url - Original Cloudinary URL
 * @param {number} blurAmount - Blur intensity (default: 4000)
 * @param {number} gammaAmount - Gamma correction value (default: 200, range: 0-200)
 * @returns {string} Transformed URL with blur, gamma, and shadow
 */
export function addBlurToCloudinaryUrl(url, blurAmount = 4000, gammaAmount = 200) {
  if (!url || !url.includes('cloudinary.com')) {
    return url;
  }
  
  // Extract the public_id from the URL
  // Format: https://res.cloudinary.com/{cloud_name}/image/upload/{transformations}/{public_id}
  const uploadIndex = url.indexOf('/upload/');
  if (uploadIndex === -1) return url;
  
  const beforeUpload = url.substring(0, uploadIndex + 8); // Include '/upload/'
  const afterUpload = url.substring(uploadIndex + 8);
  
  // Extract public_id (everything after the last transformation segment)
  // If there are transformations, they're separated by '/'
  const parts = afterUpload.split('/');
  const publicId = parts[parts.length - 1];
  
  // Build new URL with blur, gamma, and shadow transformations
  // Use e_blur for blur effect, e_gamma for gamma correction, e_shadow for shadow effect, c_fill for fill crop, w_1920/h_1080 for size, g_auto for gravity
  // Combine with existing transformations if any (like f_auto,q_auto)
  const existingTransforms = parts.length > 1 ? parts.slice(0, -1).join('/') : '';
  const blurTransform = `e_blur:${blurAmount}/e_gamma:${gammaAmount}/e_shadow/c_fill,w_1920,h_1080,g_auto`;
  
  if (existingTransforms) {
    // Prepend blur, gamma, and shadow to existing transformations
    return `${beforeUpload}${blurTransform}/${existingTransforms}/${publicId}`;
  } else {
    // No existing transformations, just add blur, gamma, and shadow
    return `${beforeUpload}${blurTransform}/${publicId}`;
  }
}

// ----- Các hàm load hình ảnh theo trang -----

export async function loadVagabondImages() {
  try {
    const images = await fetchImages();
    const side = findImage(images, 'vagabond-1');
    // Background image removed - using unified vintage theme
    if (side) {
      const imgEl = document.getElementById('vagabond-side-img');
      if (imgEl) imgEl.src = side.url;
    }
  } catch (err) {
    console.error('Failed to load vagabond images:', err);
  }
}

export async function loadImTuaImages() {
  try {
    const images = await fetchImages();
    const img1 = findImage(images, 'im-tua-1');
    const img2 = findImage(images, 'im-tua-2');
    if (img1) document.getElementById('im-tua-img-1').src = img1.url;
    if (img2) document.getElementById('im-tua-img-2').src = img2.url;
  } catch (err) {
    console.error('Failed to load im-tua images:', err);
  }
}

export async function loadCollaborateImages() {
  try {
    const images = await fetchImages();
    const img1 = findImage(images, 'collaborate-1');
    const img2 = findImage(images, 'collaborate-2');
    if (img1) document.getElementById('collab-center-img').src = img1.url;
    // Note: collaborate-2 is now used as full-page background, not collab-right
  } catch (err) {
    console.error('Failed to load collaborate images:', err);
  }
}

/**
 * Load collaborate-2.jpg as full-page background from Cloudinary
 */
export async function loadFullPageBackground() {
  try {
    const images = await fetchImages();
    const bgImage = findImage(images, 'collaborate-2');
    
    if (bgImage) {
      // Apply blur transformation for subtle effect
      const blurredUrl = addBlurToCloudinaryUrl(bgImage.url);
      
      // Apply to body element as background image
      document.body.style.backgroundImage = `url('${blurredUrl}')`;
      document.body.style.backgroundSize = 'cover';
      document.body.style.backgroundPosition = 'center';
      document.body.style.backgroundRepeat = 'no-repeat';
      document.body.style.backgroundAttachment = 'fixed';
      
      console.log('Background image loaded:', blurredUrl);
    } else {
      console.warn('collaborate-2 image not found in Cloudinary');
    }
  } catch (err) {
    console.error('Failed to load full-page background:', err);
  }
}

export async function loadEssenceImages() {
  try {
    const images = await fetchImages();
    const img1 = findImage(images, 'essence-1');
    const img2 = findImage(images, 'essence-2');
    if (img1) document.getElementById('essence-img-1').src = img1.url;
    if (img2) document.getElementById('essence-img-2').src = img2.url;
  } catch (err) {
    console.error('Failed to load essence package images:', err);
  }
}

export async function loadSoulImages() {
  try {
    const images = await fetchImages();
    const img1 = findImage(images, 'soul-1');
    const img2 = findImage(images, 'soul-2');
    if (img1) document.getElementById('soul-img-1').src = img1.url;
    if (img2) document.getElementById('soul-img-2').src = img2.url;
  } catch (err) {
    console.error('Failed to load soul package images:', err);
  }
}

export async function loadSignatureImage() {
  try {
    const images = await fetchImages();
    const img = findImage(images, 'signature-1');
    if (img) document.getElementById('signature-img').src = img.url;
  } catch (err) {
    console.error('Failed to load signature package image:', err);
  }
}

export async function loadTuaErreBackground() {
  // Background image removed - using unified vintage theme
  // This function kept for compatibility but no longer sets background
}

// Load all images for single-page layout
export async function loadAllImages() {
  try {
    await Promise.all([
      loadImTuaImages(),
      loadTuaErreBackground(),
      loadVagabondImages(),
      loadEssenceImages(),
      loadSoulImages(),
      loadSignatureImage(),
      loadCollaborateImages(),
      loadFullPageBackground()
    ]);
  } catch (err) {
    console.error('Failed to load some images:', err);
  }
}

class ImageLoader {
  constructor() {
    this.cache = new Map();
    this.observer = null;
    this.loadingElements = new Set();
    this.init();
  }

  init() {
    this.setupIntersectionObserver();
    this.loadImages();
  }

  setupIntersectionObserver() {
    const options = {
      root: null,
      rootMargin: '50px',
      threshold: 0.1
    };

    this.observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          this.loadImageForElement(entry.target);
          this.observer.unobserve(entry.target);
        }
      });
    }, options);
  }

  async loadImages() {
    try {
      const response = await fetch('/image-url/portfolio');

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      const imageList = Array.isArray(data) ? data : data.urls;

      if (!Array.isArray(imageList)) {
        throw new Error('Invalid response format');
      }

      this.cache.set('portfolio', imageList);
      this.assignImagesToElements(imageList);


    } catch (error) {
      console.error('Failed to load images:', error);
      this.handleImageLoadError();
    }
  }

  assignImagesToElements(imageUrls) {
    const imageElements = document.querySelectorAll('[data-image-section]');

    imageElements.forEach((element, index) => {
      if (index < imageUrls.length) {
        element.dataset.imageSrc = imageUrls[index];
        element.classList.add('image-loading');

        // Add loading placeholder
        this.addLoadingPlaceholder(element);

        // Use intersection observer for lazy loading
        this.observer.observe(element);
      }
    });
  }

  async loadImageForElement(element) {
    const imageSrc = element.dataset.imageSrc;
    if (!imageSrc || this.loadingElements.has(element)) return;

    this.loadingElements.add(element);

    try {
      const img = await this.preloadImage(imageSrc);
      this.displayImage(element, img);
    } catch (error) {
      console.error('Failed to load image:', error);
      this.displayImageError(element);
    } finally {
      this.loadingElements.delete(element);
    }
  }

  preloadImage(src) {
    return new Promise((resolve, reject) => {
      const img = new Image();

      img.onload = () => resolve(img);
      img.onerror = () => reject(new Error(`Failed to load image: ${src}`));

      // Add timeout for slow connections
      const timeout = setTimeout(() => {
        reject(new Error('Image load timeout'));
      }, 10000);

      img.onload = () => {
        clearTimeout(timeout);
        resolve(img);
      };

      img.src = src;
    });
  }

  displayImage(element, img) {
    // Remove loading placeholder
    this.removeLoadingPlaceholder(element);

    // Create image element or update existing one
    let imageEl = element.querySelector('img');
    if (!imageEl) {
      imageEl = document.createElement('img');
      element.appendChild(imageEl);
    }

    imageEl.src = img.src;
    imageEl.alt = element.dataset.imageAlt || 'Portfolio image';
    imageEl.loading = 'lazy';

    // Add smooth fade-in animation
    imageEl.style.opacity = '0';
    imageEl.style.transition = 'opacity 0.3s ease-in-out';

    // Trigger fade-in
    requestAnimationFrame(() => {
      imageEl.style.opacity = '1';
      element.classList.remove('image-loading');
      element.classList.add('image-loaded');
    });
  }

  addLoadingPlaceholder(element) {
    const placeholder = document.createElement('div');
    placeholder.className = 'image-placeholder';
    placeholder.innerHTML = `
        <div class="loading-spinner"></div>
        <span class="loading-text">Loading...</span>
      `;
    element.appendChild(placeholder);
  }

  removeLoadingPlaceholder(element) {
    const placeholder = element.querySelector('.image-placeholder');
    if (placeholder) {
      placeholder.remove();
    }
  }

  displayImageError(element) {
    this.removeLoadingPlaceholder(element);

    const errorEl = document.createElement('div');
    errorEl.className = 'image-error';
    errorEl.innerHTML = `
        <span class="error-icon">⚠️</span>
        <span class="error-text">Failed to load image</span>
        <button class="retry-btn" onclick="imageLoader.retryImage(this)">Retry</button>
      `;

    element.appendChild(errorEl);
    element.classList.remove('image-loading');
    element.classList.add('image-error');
  }

  handleImageLoadError() {
    // Show global error message
    this.showNotification('Failed to load portfolio images. Please check your connection.', 'error');
  }

  retryImage(button) {
    const element = button.closest('[data-image-section]');
    if (element) {
      // Remove error state
      element.classList.remove('image-error');
      const errorEl = element.querySelector('.image-error');
      if (errorEl) errorEl.remove();

      // Retry loading
      this.loadImageForElement(element);
    }
  }

  showNotification(message, type = 'info') {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <span class="notification-message">${message}</span>
        <button class="notification-close" onclick="this.parentElement.remove()">×</button>
      `;

    // Add to page
    document.body.appendChild(notification);

    // Auto-remove after 5 seconds
    setTimeout(() => {
      if (notification.parentElement) {
        notification.remove();
      }
    }, 5000);
  }

  // Public method to refresh images
  async refreshImages() {
    this.cache.clear();
    await this.loadImages();
  }
}

// Initialize when DOM is ready
let imageLoader;

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    imageLoader = new ImageLoader();
  });
} else {
  imageLoader = new ImageLoader();
}

// Export for module usage
export default ImageLoader;