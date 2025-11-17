/**
 * index.js — Complete script for FX AT WORK portfolio
 *
 * Features:
 * - Responsive navbar (hamburger toggle)
 * - Active nav link tracking on scroll
 * - Smooth scrolling (SweetScroll)
 * - Service card hover background movement
 * - Testimonials slider (prev/next + autoplay + pause on hover)
 * - FAQ accordion (single-open behavior + keyboard support)
 * - Helpers: header padding so fixed nav doesn't cover content
 *
 * This file is self-contained and safe to replace your existing index.js with.
 */

(function () {
  'use strict';

  /* -------------------------
   * Core DOM references + config
   * ------------------------- */
  const NAV_BAR = document.getElementById('navBar');
  const NAV_LIST = document.getElementById('navList');
  const HERO_HEADER = document.getElementById('heroHeader');
  const HAMBURGER_BTN = document.getElementById('hamburgerBtn');
  const NAV_LINKS = Array.from(document.querySelectorAll('.nav__list-link'));
  const SERVICE_BOXES = Array.from(document.querySelectorAll('.service-card__box'));
  const TESTIMONIAL_TRACK = document.querySelector('.testimonials__track');
  const TESTIMONIAL_PREV = document.querySelector('.testimonials__nav--prev');
  const TESTIMONIAL_NEXT = document.querySelector('.testimonials__nav--next');
  const FAQ_ITEMS = Array.from(document.querySelectorAll('.faq__item'));

  const ACTIVE_LINK_CLASS = 'active';
  const BREAKPOINT = 576; // px - same as CSS media break for mobile/desktop behaviour

  /* Defensive defaults */
  let currentServiceBG = null;
  let currentActiveLink = document.querySelector('.nav__list-link.active') || NAV_LINKS[0] || null;

  /* -------------------------
   * Utility helpers
   * ------------------------- */
  function isElement(el) {
    return el instanceof Element;
  }

  function resetActiveState() {
    if (!NAV_LIST) return;
    NAV_LIST.classList.remove('nav--active');
    NAV_LIST.style.height = null;
    document.body.style.overflowY = null;
  }

  function addPaddingToHeroHeaderFn() {
    if (!NAV_BAR || !HERO_HEADER) return;
    const NAV_BAR_HEIGHT = NAV_BAR.getBoundingClientRect().height;
    const HEIGHT_IN_REM = NAV_BAR_HEIGHT / 10; // because html font-size set to 62.5% => 1rem === 10px
    // don't add padding if mobile nav is expanded
    if (NAV_LIST && NAV_LIST.classList.contains('nav--active')) return;
    HERO_HEADER.style.paddingTop = HEIGHT_IN_REM + 'rem';
  }

  /* -------------------------
   * Initialize layout adjustments
   * ------------------------- */
  try { addPaddingToHeroHeaderFn(); } catch (e) { /* ignore */ }

  window.addEventListener('resize', () => {
    addPaddingToHeroHeaderFn();

    // When the breakpoint is crossed to desktop ensure mobile nav is reset
    if (window.innerWidth >= BREAKPOINT) {
      addPaddingToHeroHeaderFn();
      resetActiveState();
    }
  });

  /* -------------------------
   * Scroll-based active nav link
   * ------------------------- */
  window.addEventListener('scroll', () => {
    if (!NAV_BAR || NAV_LINKS.length === 0) return;

    // Add the sections you want the nav to track.
    const sections = document.querySelectorAll('#heroHeader, #services, #works, #about, #why, #testimonials, #faq, #contact');

    sections.forEach((section) => {
      if (!section) return;
      const sectionTop = section.offsetTop;
      const NAV_BAR_HEIGHT = NAV_BAR.getBoundingClientRect().height;
      // small offset so activation happens slightly earlier
      if (window.scrollY >= sectionTop - NAV_BAR_HEIGHT - 20) {
        const id = section.getAttribute('id');
        if (!id) return;
        const link = NAV_LINKS.find(l => l.href && l.href.includes('#' + id));
        if (!link || !currentActiveLink) return;
        if (link === currentActiveLink) return;
        currentActiveLink.classList.remove(ACTIVE_LINK_CLASS);
        link.classList.add(ACTIVE_LINK_CLASS);
        currentActiveLink = link;
      }
    });
  });

  /* -------------------------
   * Hamburger / mobile nav toggle
   * ------------------------- */
  if (HAMBURGER_BTN && NAV_LIST) {
    HAMBURGER_BTN.addEventListener('click', () => {
      NAV_LIST.classList.toggle('nav--active');

      if (NAV_LIST.classList.contains('nav--active')) {
        // lock body scroll when nav expanded
        document.body.style.overflowY = 'hidden';
        NAV_LIST.style.height = '100vh';
        return;
      }

      NAV_LIST.style.height = 0;
      document.body.style.overflowY = null;
    });
  }

  // When any nav link is clicked from mobile, collapse the nav
  NAV_LINKS.forEach(link => {
    link.addEventListener('click', () => {
      resetActiveState();
      // small UX improvement: remove focus after click
      try { link.blur(); } catch (e) { /* ignore */ }
    });
  });

  /* -------------------------
   * Service cards — hover BG movement
   * ------------------------- */
  SERVICE_BOXES.forEach(service => {
    const bg = service.querySelector('.service-card__bg');

    const moveBG = (x, y) => {
      if (!bg) return;
      bg.style.left = x + 'px';
      bg.style.top = y + 'px';
    };

    service.addEventListener('mouseenter', (e) => {
      if (!bg) return;
      currentServiceBG = bg;
      moveBG(e.clientX, e.clientY);
    });

    service.addEventListener('mousemove', (e) => {
      if (!currentServiceBG) return;
      const LEFT = e.clientX - service.getBoundingClientRect().left;
      const TOP = e.clientY - service.getBoundingClientRect().top;
      moveBG(LEFT, TOP);
    });

    service.addEventListener('mouseleave', () => {
      if (!bg) return;
      const IMG_POS = service.querySelector('.service-card__illustration') || { offsetLeft: 0, offsetTop: 0 };
      const LEFT = (IMG_POS.offsetLeft || 0) + (bg.getBoundingClientRect().width || 0);
      const TOP = (IMG_POS.offsetTop || 0) + (bg.getBoundingClientRect().height || 0);
      moveBG(LEFT, TOP);
      currentServiceBG = null;
    });
  });

  /* -------------------------
   * Smooth scrolling (SweetScroll)
   * ------------------------- */
  try {
    // sweet-scroll is expected to be available via the included script in HTML
    // instantiate only if NAV_BAR exists to calculate offset
    if (typeof SweetScroll !== 'undefined' && NAV_BAR) {
      new SweetScroll({
        trigger: '.nav__list-link, .header__resume, .btn--primary, .btn--ghost, .header__resume',
        easing: 'easeOutQuint',
        offset: NAV_BAR.getBoundingClientRect().height - 80
      });
    }
  } catch (err) {
    // fail silently if the library is not present
    // console.warn('SweetScroll init failed', err);
  }

  /* -------------------------
   * Testimonials slider (prev/next + auto + pause on hover)
   * ------------------------- */
  (function initTestimonials() {
    const track = TESTIMONIAL_TRACK;
    if (!track) return;
    const slides = Array.from(track.children);
    if (slides.length === 0) return;

    let index = 0;
    let autoplayId = null;

    const update = () => {
      // set transform to slide the track
      track.style.transform = `translateX(-${index * 100}%)`;
    };

    const prev = () => {
      index = (index - 1 + slides.length) % slides.length;
      update();
    };

    const next = () => {
      index = (index + 1) % slides.length;
      update();
    };

    TESTIMONIAL_PREV?.addEventListener('click', prev);
    TESTIMONIAL_NEXT?.addEventListener('click', next);

    // autoplay
    const startAutoplay = () => {
      if (autoplayId) clearInterval(autoplayId);
      autoplayId = setInterval(() => {
        index = (index + 1) % slides.length;
        update();
      }, 6000);
    };

    const stopAutoplay = () => {
      if (autoplayId) {
        clearInterval(autoplayId);
        autoplayId = null;
      }
    };

    // pause on hover
    track.addEventListener('mouseenter', stopAutoplay);
    track.addEventListener('mouseleave', startAutoplay);

    // init
    update();
    startAutoplay();
  })();

  /* -------------------------
   * FAQ accordion (single open)
   * ------------------------- */
  (function initFAQ() {
    if (FAQ_ITEMS.length === 0) return;
    FAQ_ITEMS.forEach(item => {
      const btn = item.querySelector('.faq__q');
      if (!btn) return;
      btn.addEventListener('click', () => {
        const isOpen = item.classList.contains('open');
        // close all
        FAQ_ITEMS.forEach(i => i.classList.remove('open'));
        // toggle this one
        if (!isOpen) item.classList.add('open');
      });

      // keyboard accessibility
      btn.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          btn.click();
        }
      });
    });
  })();

  /* -------------------------
   * Small accessibility + safety helpers
   * ------------------------- */
  // Ensure focus outlines remain for keyboard users but don't get removed globally.
  document.addEventListener('keyup', (e) => {
    if (e.key === 'Tab') {
      document.documentElement.classList.add('user-is-tabbing');
    }
  });

  // Expose reset function for potential debugging (optional)
  window.__fx_resetMobileNav = resetActiveState;

})();
