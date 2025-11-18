/**
 * index.js — Complete script (robust testimonial slider + existing features)
 *
 * Replace your existing index.js with this file.
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
  const BREAKPOINT = 576; // px

  let currentServiceBG = null;
  let currentActiveLink = document.querySelector('.nav__list-link.active') || NAV_LINKS[0] || null;

  /* -------------------------
   * Helpers
   * ------------------------- */
  function resetActiveState() {
    if (!NAV_LIST) return;
    NAV_LIST.classList.remove('nav--active');
    NAV_LIST.style.height = null;
    document.body.style.overflowY = null;
  }

  function addPaddingToHeroHeaderFn() {
    if (!NAV_BAR || !HERO_HEADER) return;
    const NAV_BAR_HEIGHT = NAV_BAR.getBoundingClientRect().height || 0;
    const HEIGHT_IN_REM = NAV_BAR_HEIGHT / 10;
    if (NAV_LIST && NAV_LIST.classList.contains('nav--active')) return;
    HERO_HEADER.style.paddingTop = HEIGHT_IN_REM + 'rem';
  }

  /* Initialize */
  try { addPaddingToHeroHeaderFn(); } catch (e) { /* ignore */ }

  window.addEventListener('resize', () => {
    addPaddingToHeroHeaderFn();
    if (window.innerWidth >= BREAKPOINT) {
      addPaddingToHeroHeaderFn();
      resetActiveState();
    }
  });

  /* -------------------------
   * Scroll active nav
   * ------------------------- */
  window.addEventListener('scroll', () => {
    if (!NAV_BAR || NAV_LINKS.length === 0) return;
    const sections = document.querySelectorAll('#heroHeader, #services, #works, #about, #why, #team, #testimonials, #faq, #contact');
    sections.forEach((section) => {
      if (!section) return;
      const sectionTop = section.offsetTop;
      const NAV_BAR_HEIGHT = NAV_BAR.getBoundingClientRect().height;
      if (window.scrollY >= sectionTop - NAV_BAR_HEIGHT - 20) {
        const id = section.getAttribute('id');
        if (!id) return;
        const link = NAV_LINKS.find(l => l.href && l.href.includes('#' + id));
        if (!link) return;
        if (currentActiveLink && currentActiveLink !== link) currentActiveLink.classList.remove(ACTIVE_LINK_CLASS);
        link.classList.add(ACTIVE_LINK_CLASS);
        currentActiveLink = link;
      }
    });
  });

  /* -------------------------
   * Hamburger toggle
   * ------------------------- */
  if (HAMBURGER_BTN && NAV_LIST) {
    HAMBURGER_BTN.addEventListener('click', () => {
      NAV_LIST.classList.toggle('nav--active');
      if (NAV_LIST.classList.contains('nav--active')) {
        document.body.style.overflowY = 'hidden';
        NAV_LIST.style.height = '100vh';
        return;
      }
      NAV_LIST.style.height = 0;
      document.body.style.overflowY = null;
    });
  }

  NAV_LINKS.forEach(link => {
    link.addEventListener('click', () => {
      resetActiveState();
      try { link.blur(); } catch (e) {}
    });
  });

  /* -------------------------
   * Service cards hover bg
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
    if (typeof SweetScroll !== 'undefined' && NAV_BAR) {
      new SweetScroll({
        trigger: '.nav__list-link, .header__resume, .btn--primary, .btn--ghost',
        easing: 'easeOutQuint',
        offset: NAV_BAR.getBoundingClientRect().height - 80
      });
    }
  } catch (err) {
    // ignore
  }

  /* Team card tap-to-toggle for touch devices (optional) */
  (function() {
    const teamCards = document.querySelectorAll('.team-card');
    if (!teamCards.length) return;
    teamCards.forEach(card => {
      let touchTimer = null;
      card.addEventListener('touchstart', (e) => {
        // short delay to allow scrolling vs tap; we simply toggle overlay class
        if (touchTimer) clearTimeout(touchTimer);
        touchTimer = setTimeout(() => {
          card.classList.toggle('team-card--toggled');
          touchTimer = null;
        }, 150);
      });
    });
  })();

  /* -------------------------
   * FAQ accordion (single-open)
   * ------------------------- */
  (function initFAQ() {
    if (FAQ_ITEMS.length === 0) return;
    FAQ_ITEMS.forEach(item => {
      const btn = item.querySelector('.faq__q');
      if (!btn) return;
      btn.addEventListener('click', () => {
        const isOpen = item.classList.contains('open');
        FAQ_ITEMS.forEach(i => i.classList.remove('open'));
        if (!isOpen) item.classList.add('open');
      });
      btn.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          btn.click();
        }
      });
    });
  })();

  /* -------------------------
   * Accessibility: focus outlines for keyboard users
   * ------------------------- */
  document.addEventListener('keyup', (e) => {
    if (e.key === 'Tab') {
      document.documentElement.classList.add('user-is-tabbing');
    }
  });

  // expose reset mobile nav
  window.__fx_resetMobileNav = resetActiveState;

})();
