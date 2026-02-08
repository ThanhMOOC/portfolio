import { loadAllImages, loadFullPageBackground } from './load-images.js';
import { initContactForm } from './contact-form.js';

const init = () => {
  // 1. Load các section thường (Portrait, Street Photo) và Background
  loadAllImages();
  loadFullPageBackground();

  // 2. Khởi chạy logic form Contact
  initContactForm();
};

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
