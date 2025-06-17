class PortfolioApp {
  constructor() {
    this.modules = new Map();
    this.isInitialized = false;
    this.init();
  }

  async init() {
    try {
      await this.loadModules();
      this.setupGlobalFeatures();
      this.bindGlobalEvents();
      this.isInitialized = true;
      
      console.log('Portfolio app initialized successfully');
      this.dispatchEvent('appReady');
    } catch (error) {
      console.error('Failed to initialize portfolio app:', error);
    }
  }

  async loadModules() {
    // Initialize core modules
    if (typeof ImageLoader !== 'undefined') {
      this.modules.set('imageLoader', new ImageLoader());
    }
    
    if (typeof BurgerMenu !== 'undefined') {
      this.modules.set('burgerMenu', new BurgerMenu());
    }
  }

  setupGlobalFeatures() {
    this.setupSmoothScrolling();
    this.setupPageTransitions();
    this.setupPerformanceOptimizations();
    this.setupErrorHandling();
  }

  setupSmoothScrolling() {
    // Add smooth scrolling for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
      anchor.addEventListener('click', (e) => {
        e.preventDefault();
        const target = document.querySelector(anchor.getAttribute('href'));
        
        if (target) {
          target.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
          });
        }
      });
    });
  }

  setupPageTransitions() {
    // Add fade-in animation for page content
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('fade-in');
          observer.unobserve(entry.target);
        }
      });
    }, {
      threshold: 0.1,
      rootMargin: '0px 0px -50px 0px'
    });

    // Observe elements with fade-in-on-scroll class
    document.querySelectorAll('.fade-in-on-scroll').forEach(el => {
      observer.observe(el);
    });
  }

  setupPerformanceOptimizations() {
    // Preload critical resources
    this.preloadCriticalImages();
    
    // Setup service worker if available
    if ('serviceWorker' in navigator) {
      this.registerServiceWorker();
    }
  }

  preloadCriticalImages() {
    const criticalImages = document.querySelectorAll('[data-preload="true"]');
    
    criticalImages.forEach(img => {
      const link = document.createElement('link');
      link.rel = 'preload';
      link.as = 'image';
      link.href = img.dataset.src || img.src;
      document.head.appendChild(link);
    });
  }

  async registerServiceWorker() {
    try {
      const registration = await navigator.serviceWorker.register('/sw.js');
      console.log('Service Worker registered:', registration);
    } catch (error) {
      console.log('Service Worker registration failed:', error);
    }
  }

  setupErrorHandling() {
    // Global error handler
    window.addEventListener('error', (e) => {
      console.error('Global error:', e.error);
      this.handleError(e.error);
    });

    // Unhandled promise rejection handler
    window.addEventListener('unhandledrejection', (e) => {
      console.error('Unhandled promise rejection:', e.reason);
      this.handleError(e.reason);
    });
  }

  handleError(error) {
    // Log error details
    const errorInfo = {
      message: error.message,
      stack: error.stack,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      url: window.location.href
    };

    console.error('Error details:', errorInfo);

    // Show user-friendly error message
    this.showErrorNotification('Something went wrong. Please refresh the page.');
  }

  showErrorNotification(message) {
    const notification = document.createElement('div');
    notification.className = 'error-notification';
    notification.innerHTML = `
      <div class="error-content">
        <span class="error-icon">⚠️</span>
        <span class="error-message">${message}</span>
        <button class="error-close" onclick="this.parentElement.parentElement.remove()">×</button>
      </div>
    `;

    document.body.appendChild(notification);

    // Auto-remove after 10 seconds
    setTimeout(() => {
      if (notification.parentElement) {
        notification.remove();
      }
    }, 10000);
  }

  bindGlobalEvents() {
    // Listen for custom events from modules
    document.addEventListener('menuOpen', () => {
      document.body.classList.add('navigation-open');
    });

    document.addEventListener('menuClose', () => {
      document.body.classList.remove('navigation-open');
    });

    // Handle page visibility changes
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        this.onPageHidden();
      } else {
        this.onPageVisible();
      }
    });
  }

  onPageHidden() {
    // Pause any animations or timers
    console.log('Page hidden - pausing activities');
  }

  onPageVisible() {
    // Resume activities
    console.log('Page visible - resuming activities');
  }

  dispatchEvent(eventName, detail = {}) {
    const event = new CustomEvent(eventName, { detail });
    document.dispatchEvent(event);
  }

  // Public API methods
  getModule(name) {
    return this.modules.get(name);
  }

  refreshImages() {
    const imageLoader = this.modules.get('imageLoader');
    if (imageLoader) {
      return imageLoader.refreshImages();
    }
  }

  toggleMenu() {
    const burgerMenu = this.modules.get('burgerMenu');
    if (burgerMenu) {
      burgerMenu.toggle();
    }
  }
}

// Initialize the app
let portfolioApp;

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    portfolioApp = new PortfolioApp();
  });
} else {
  portfolioApp = new PortfolioApp();
}

// Make app globally available
window.portfolioApp = portfolioApp;

// Export for module usage
export default PortfolioApp;