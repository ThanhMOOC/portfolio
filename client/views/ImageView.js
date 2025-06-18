import ImageController from '../controllers/imageController.js';

class ImageView {
  constructor(containerId, folder) {
    this.containerId = containerId;
    this.folder = folder;
    this.init();
  }

  init() {
    this.createContainer();
    this.loadImages();
  }

  createContainer() {
    if (!document.getElementById(this.containerId)) {
      const container = document.createElement('div');
      container.id = this.containerId;
      container.className = 'image-gallery';
      document.body.appendChild(container);
    }
  }

  async loadImages() {
    await ImageController.loadImages(this.folder, this.containerId);
  }
}

export default ImageView; 