import stateModel from '../../models/stateModel.js';

class ImageGallery {
  constructor(containerId) {
    this.containerId = containerId;
    this.init();
  }

  init() {
    this.createContainer();
    this.setupStateSubscription();
  }

  createContainer() {
    if (!document.getElementById(this.containerId)) {
      const container = document.createElement('div');
      container.id = this.containerId;
      container.className = 'image-gallery';
      document.body.appendChild(container);
    }
  }

  setupStateSubscription() {
    stateModel.subscribe(this.render.bind(this));
  }

  render(state) {
    const container = document.getElementById(this.containerId);
    if (!container) return;

    if (state.loading) {
      container.innerHTML = '<div class="loading">Loading...</div>';
      return;
    }

    if (state.error) {
      container.innerHTML = `<div class="error">${state.error}</div>`;
      return;
    }

    container.innerHTML = state.images.map(image => `
      <div class="image-item">
        <img src="${image.url}" alt="${image.display_name || 'Image'}" />
        ${image.display_name ? `<p>${image.display_name}</p>` : ''}
      </div>
    `).join('');
  }

  loadImages(folder) {
    stateModel.fetchImages(folder);
  }
}

export default ImageGallery; 