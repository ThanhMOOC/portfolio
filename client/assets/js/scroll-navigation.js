/**
 * Scroll Navigation Module
 * Handles smooth scrolling navigation and active section highlighting
 * Uses IntersectionObserver for scroll-based navigation detection
 */

// Load GSAP dynamically from CDN
let gsap = null;

const loadGSAP = async () => {
  if (!gsap) {
    const response = await import('https://cdn.jsdelivr.net/npm/gsap@3.12.2/+esm');
    gsap = response.default;
  }
  return gsap;
};

class ScrollNavigation {
  constructor() {
    this.navLinks = document.querySelectorAll('.main-navigation nav a');
    this.navEl = document.querySelector('.main-navigation nav');
    this.sections = document.querySelectorAll('.page-section');
    this.observer = null;
    this.isScrolling = false;
    this.activeSection = null;
    this.intersectionState = new Map();
    this.activeLinkEl = null;
    this.activeIndicatorEl = null;
    this.pillSquishTimeouts = [];
    this.pillPhaseTimeouts = [];

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

    // Keep the active indicator aligned on resize
    this.setupResizeHandling();    
    // Setup macOS Dock-like bounce effect on hover
    this.setupDockBounceEffect();    
  }

  setupActiveIndicator() {
    if (!this.navEl) return;

    // Avoid duplicating the indicator if init is called again.
    const existing = this.navEl.querySelector('.nav-active-indicator');
    if (existing) {
      this.activeIndicatorEl = existing;
      return;
    }

    const indicator = document.createElement('div');
    indicator.className = 'nav-active-indicator';

    // Insert as first child so links remain above it (via z-index).
    this.navEl.insertBefore(indicator, this.navEl.firstChild);
    this.activeIndicatorEl = indicator;
  }

  clearPillTimeouts() {
    if (this.pillSquishTimeouts.length) {
      this.pillSquishTimeouts.forEach(id => window.clearTimeout(id));
      this.pillSquishTimeouts = [];
    }
    if (this.pillPhaseTimeouts.length) {
      this.pillPhaseTimeouts.forEach(id => window.clearTimeout(id));
      this.pillPhaseTimeouts = [];
    }
  }

  setupResizeHandling() {
    const handle = () => {
      // No-op for cumulative highlighting (per-link styling)
    };

    window.addEventListener('resize', handle);

    const nav = document.querySelector('.main-navigation nav');
    if (nav && 'ResizeObserver' in window) {
      const ro = new ResizeObserver(handle);
      ro.observe(nav);
    }
  }

  /**
   * Setup macOS Dock-like spring bounce effect on hover using GSAP
   * Creates smooth spring animation with elastic easing
   */
  async setupDockBounceEffect() {
    // Load GSAP first
    await loadGSAP();
    
    this.navLinks.forEach(link => {
      link.addEventListener('mouseenter', () => {
        // Kill any ongoing animation to avoid conflicts
        gsap.killTweensOf(link);
        
        // Reset to starting position
        gsap.set(link, { y: 0 });
        
        // Create spring animation with GSAP
        gsap.to(link, {
          y: -6,           // Jump up 6px
          duration: 0.4,   // Quick jump
          ease: "power2.out"
        });
        
        // Spring back down
        gsap.to(link, {
          y: 0,           // Back to original position
          duration: 0.6,  // Slow fall with spring effect
          delay: 0.4,     // Start after jump ends
          ease: "elastic.out(1, 0.5)"  // Spring/elastic easing
        });
      });
    });
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
      rootMargin: `-${navHeight}px 0px -25% 0px`,
      threshold: [0, 0.05, 0.1, 0.2, 0.3]
    };

    this.observer = new IntersectionObserver((entries) => {
      // Only update active state if not programmatically scrolling
      if (this.isScrolling) return;

      // Persist last-known intersection info so we can pick the best section
      // even when multiple sections are visible at once.
      entries.forEach((entry) => {
        const sectionId = entry.target.id;
        this.intersectionState.set(sectionId, {
          isIntersecting: entry.isIntersecting,
          intersectionRatio: entry.intersectionRatio,
          top: entry.boundingClientRect.top
        });
      });

      const visible = Array.from(this.intersectionState.entries())
        .map(([sectionId, state]) => ({ sectionId, ...state }))
        .filter((state) => state.isIntersecting);

      if (visible.length === 0) return;

      // Prefer the section closest to the top of the viewport.
      // This stays reliable even if previous sections are collapsed (small height).
      visible.sort((a, b) => {
        const aDist = Math.abs(a.top);
        const bDist = Math.abs(b.top);
        if (aDist !== bDist) return aDist - bDist;
        return (b.intersectionRatio || 0) - (a.intersectionRatio || 0);
      });

      this.setActiveSection(visible[0].sectionId);
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
    this.previousActiveLinkEl = this.activeLinkEl;

    // Remove active class from all links
    this.navLinks.forEach(link => {
      link.classList.remove('active');
      link.classList.remove('reached');
      link.setAttribute('aria-current', 'false');
    });
    
    // Add active class to current link
    activeLink.classList.add('active');
    activeLink.setAttribute('aria-current', 'page');

    // Progress highlight: keep items up to the current section highlighted.
    // When scrolling back, items after the current one lose the highlight.
    const links = Array.from(this.navLinks);
    const activeIndex = links.indexOf(activeLink);
    if (activeIndex !== -1) {
      for (let i = 0; i <= activeIndex; i++) {
        links[i].classList.add('reached');
      }
    } else {
      activeLink.classList.add('reached');
    }

    this.activeLinkEl = activeLink;
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

