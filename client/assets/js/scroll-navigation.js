/**
 * Scroll Navigation Module
 * Handles smooth scrolling navigation and active section highlighting
 * Uses IntersectionObserver for scroll-based navigation detection
 */

class ScrollNavigation {
  constructor() {
    this.navLinks = document.querySelectorAll('.main-navigation nav a');
    this.sections = document.querySelectorAll('.page-section');
    this.observer = null;
    this.isScrolling = false;
    this.activeSection = null;
    
    this.init();
  }

  init() {
    // Setup smooth scroll behavior
    this.setupSmoothScroll();
    
    // Setup IntersectionObserver for active section detection
    this.setupIntersectionObserver();
    
    // Handle initial active state
    this.setInitialActiveState();
    
    // Handle browser back/forward buttons
    this.handleHistoryNavigation();
    
    // Setup keyboard navigation for accessibility
    this.setupKeyboardNavigation();
  }

  /**
   * Setup smooth scroll behavior for navigation links
   */
  setupSmoothScroll() {
    this.navLinks.forEach(link => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        
        const targetId = link.getAttribute('href').substring(1);
        const targetSection = document.getElementById(targetId);
        
        if (targetSection) {
          this.isScrolling = true;
          
          // Update URL without reload
          history.pushState({ section: targetId }, '', `#${targetId}`);
          
          // Scroll to section
          const nav = document.querySelector('.main-navigation');
          const navHeight = nav ? nav.offsetHeight : 60;
          const targetPosition = targetSection.offsetTop - navHeight;
          
          window.scrollTo({
            top: targetPosition,
            behavior: 'smooth'
          });
          
          // Update active state immediately
          this.setActiveLink(link);
          
          // Reset scrolling flag after animation
          setTimeout(() => {
            this.isScrolling = false;
          }, 1000);
        }
      });
    });
  }

  /**
   * Setup IntersectionObserver to detect which section is currently visible
   */
  setupIntersectionObserver() {
    const nav = document.querySelector('.main-navigation');
    if (!nav) {
      // Retry after DOM is ready
      setTimeout(() => this.setupIntersectionObserver(), 100);
      return;
    }
    
    const navHeight = nav.offsetHeight || 60; // Fallback to 60px
    const options = {
      root: null,
      rootMargin: `-${navHeight}px 0px -50% 0px`,
      threshold: 0.3
    };

    this.observer = new IntersectionObserver((entries) => {
      // Only update active state if not programmatically scrolling
      if (this.isScrolling) return;

      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const sectionId = entry.target.id;
          this.setActiveSection(sectionId);
        }
      });
    }, options);

    // Observe all sections
    this.sections.forEach(section => {
      this.observer.observe(section);
    });
  }

  /**
   * Set the active section and update navigation
   */
  setActiveSection(sectionId) {
    if (this.activeSection === sectionId) return;
    
    this.activeSection = sectionId;
    
    // Update URL without scrolling
    if (history.replaceState) {
      history.replaceState({ section: sectionId }, '', `#${sectionId}`);
    }
    
    // Find and update active link
    const activeLink = document.querySelector(`.main-navigation nav a[data-section="${sectionId}"]`);
    if (activeLink) {
      this.setActiveLink(activeLink);
    }
  }

  /**
   * Set active link and remove active from others
   */
  setActiveLink(activeLink) {
    // Remove active class from all links
    this.navLinks.forEach(link => {
      link.classList.remove('active');
      link.setAttribute('aria-current', 'false');
    });
    
    // Add active class to current link
    activeLink.classList.add('active');
    activeLink.setAttribute('aria-current', 'page');
  }

  /**
   * Set initial active state based on URL hash or first section
   */
  setInitialActiveState() {
    // Wait for page to be fully loaded
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => {
        this.setInitialActiveState();
      });
      return;
    }

    const hash = window.location.hash.substring(1);
    
    if (hash) {
      const targetSection = document.getElementById(hash);
      if (targetSection) {
        // Scroll to section after a short delay to ensure page is loaded
        setTimeout(() => {
          const nav = document.querySelector('.main-navigation');
          const navHeight = nav ? nav.offsetHeight : 60;
          const targetPosition = targetSection.offsetTop - navHeight;
          window.scrollTo({
            top: targetPosition,
            behavior: 'smooth'
          });
          this.setActiveSection(hash);
        }, 300);
        return;
      }
    }
    
    // Default to first section
    if (this.sections.length > 0) {
      this.setActiveSection(this.sections[0].id);
    }
  }

  /**
   * Handle browser back/forward button navigation
   */
  handleHistoryNavigation() {
    window.addEventListener('popstate', (e) => {
      const hash = window.location.hash.substring(1);
      if (hash) {
        const targetSection = document.getElementById(hash);
        if (targetSection) {
          this.isScrolling = true;
          const nav = document.querySelector('.main-navigation');
          const navHeight = nav ? nav.offsetHeight : 60;
          const targetPosition = targetSection.offsetTop - navHeight;
          
          window.scrollTo({
            top: targetPosition,
            behavior: 'smooth'
          });
          
          this.setActiveSection(hash);
          
          setTimeout(() => {
            this.isScrolling = false;
          }, 1000);
        }
      } else {
        // No hash - scroll to top and set first section as active
        window.scrollTo({ top: 0, behavior: 'smooth' });
        if (this.sections.length > 0) {
          this.setActiveSection(this.sections[0].id);
        }
      }
    });
  }

  /**
   * Handle keyboard navigation (accessibility)
   */
  setupKeyboardNavigation() {
    document.addEventListener('keydown', (e) => {
      // Arrow keys for navigation
      if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
        e.preventDefault();
        
        const currentIndex = Array.from(this.sections).findIndex(
          section => section.id === this.activeSection
        );
        
        let nextIndex;
        if (e.key === 'ArrowDown') {
          nextIndex = Math.min(currentIndex + 1, this.sections.length - 1);
        } else {
          nextIndex = Math.max(currentIndex - 1, 0);
        }
        
        const nextSection = this.sections[nextIndex];
        if (nextSection) {
          const nav = document.querySelector('.main-navigation');
          const navHeight = nav ? nav.offsetHeight : 60;
          const targetPosition = nextSection.offsetTop - navHeight;
          
          window.scrollTo({
            top: targetPosition,
            behavior: 'smooth'
          });
          
          this.setActiveSection(nextSection.id);
        }
      }
    });
  }
}

// Initialize scroll navigation when DOM is ready
let scrollNavigation;

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    scrollNavigation = new ScrollNavigation();
  });
} else {
  scrollNavigation = new ScrollNavigation();
}

// Export for module usage
export default ScrollNavigation;

