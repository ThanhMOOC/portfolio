import { loadAllImages, loadFullPageBackground } from './load-images.js';
import { initContactForm } from './contact-form.js';

const init = () => {
  loadAllImages();
  loadFullPageBackground();
  initContactForm();
};

document.readyState === 'loading' ? document.addEventListener('DOMContentLoaded', init) : init();