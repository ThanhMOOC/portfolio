import ImageModel from '../models/imageModel.js';

class ImageController {
  static async loadImages(folder, containerId) {
    try {
      const images = await ImageModel.fetchImages(folder);
      this.displayImages(images, containerId);
    } catch (error) {
      console.error('Error loading images:', error);
      this.handleError(containerId);
    }
  }

  static displayImages(images, containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;

    container.innerHTML = images.map(image => `
      <div class="image-item">
        <img src="${image.url}" alt="${image.display_name || 'Image'}" />
        ${image.display_name ? `<p>${image.display_name}</p>` : ''}
      </div>
    `).join('');
  }

  static handleError(containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;

    container.innerHTML = '<p class="error">Failed to load images. Please try again later.</p>';
  }
}

export default ImageController; 