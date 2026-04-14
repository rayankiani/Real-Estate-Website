/* =========================================================
   EliteEstates — main.js
   Global JS: loader, navbar, mobile menu, back-to-top,
   cookie consent, WhatsApp, scroll progress, AOS init,
   toast notifications, favorites, compare tray
   ========================================================= */

/* ---------------------------------------------------------
   DOM Ready
   --------------------------------------------------------- */
// Failsafe: bind mobile menu interactions even if initApp doesn't run
bindMobileMenu();

function initApp() {
  initLoader();
  initNavbar();
  initMobileMenu();
  initScrollProgress();
  initBackToTop();
  initCookieBanner();
  initToastSystem();
  initFavorites();
  initCompareTray();
  initCurrencyToggle();
  initSearchAutocomplete();
  if (window.AOS) {
    AOS.init({ duration: 700, easing: 'ease-out-cubic', once: true, offset: 80 });
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initApp);
} else {
  initApp();
}

// Safety fallback: ensure loader always hides on full page load
window.addEventListener('load', () => {
  const loader = document.getElementById('page-loader');
  if (loader) loader.classList.add('hidden');
});

/* ---------------------------------------------------------
   PAGE LOADER
   --------------------------------------------------------- */
function initLoader() {
  const loader    = document.getElementById('page-loader');
  const bar       = document.querySelector('.loader__bar');
  const logoEl    = document.querySelector('.loader__logo');
  if (!loader) return;
  let hidden = false;
  let scheduled = false;
  const startTime = Date.now();

  function hideLoader() {
    if (hidden) return;
    hidden = true;
    if (typeof gsap === 'undefined') {
      loader.classList.add('hidden');
    } else {
      gsap.to(loader, {
        opacity: 0,
        duration: 0.5,
        ease: 'power2.inOut',
        onComplete: () => loader.classList.add('hidden')
      });
    }
    triggerHeroAnimations();
  }

  function scheduleHide() {
    if (scheduled) return;
    scheduled = true;
    const elapsed = Date.now() - startTime;
    const remaining = Math.max(0, 6000 - elapsed);
    setTimeout(hideLoader, remaining);
  }

  // Ensure loader stays for at least 6 seconds
  scheduleHide();

  // Failsafe: if hero is still hidden after loader, show it
  setTimeout(() => {
    if (isHeroHidden()) showHeroImmediately();
  }, 6500);

  // If GSAP is unavailable, fall back to a simple timeout
  if (typeof gsap === 'undefined') {
    if (logoEl) logoEl.style.opacity = '1';
    if (bar) bar.style.animation = 'none';
    let progress = 0;
    const interval = setInterval(() => {
      progress += 20;
      if (bar) bar.style.width = Math.min(progress, 100) + '%';
      if (progress >= 100) {
        clearInterval(interval);
        // Loader will hide after the minimum delay
      }
    }, 120);
    return;
  }

  // Animate logo in
  if (logoEl) {
    gsap.set(logoEl, { opacity: 0, y: 20 });
  }
  if (bar) bar.style.animation = 'none';
  gsap.to(logoEl, { opacity: 1, y: 0, duration: 0.6, ease: 'power3.out', delay: 0.1 });

  // Progress bar fill
  let progress = 0;
  const interval = setInterval(() => {
    progress += Math.random() * 18 + 5;
    if (progress >= 100) {
      progress = 100;
      clearInterval(interval);
      // Loader will hide after the minimum delay
    }
    bar.style.width = progress + '%';
  }, 120);
}

function isHeroHidden() {
  const el = document.querySelector('.hero__headline');
  if (!el) return false;
  const opacity = window.getComputedStyle(el).opacity;
  return Number(opacity) === 0;
}

function triggerHeroAnimations() {
  if (typeof gsap === 'undefined') {
    showHeroImmediately();
    return;
  }
  const tl = gsap.timeline({ delay: 0.1 });
  const eyebrow  = document.querySelector('.hero__eyebrow');
  const headline = document.querySelector('.hero__headline');
  const subtitle = document.querySelector('.hero__subtitle');
  const ctas     = document.querySelector('.hero__ctas');
  const search   = document.querySelector('.hero__search-wrap');

  if (eyebrow)  tl.to(eyebrow,  { opacity: 1, y: 0, duration: 0.7, ease: 'power3.out' });
  if (headline) tl.to(headline, { opacity: 1, y: 0, duration: 0.8, ease: 'power3.out' }, '-=0.4');
  if (subtitle) tl.to(subtitle, { opacity: 1, y: 0, duration: 0.7, ease: 'power3.out' }, '-=0.5');
  if (ctas)     tl.to(ctas,     { opacity: 1, y: 0, duration: 0.6, ease: 'power3.out' }, '-=0.4');
  if (search)   tl.to(search,   { opacity: 1, y: 0, duration: 0.7, ease: 'power3.out' }, '-=0.3');
}

function showHeroImmediately() {
  const targets = document.querySelectorAll(
    '.hero__eyebrow, .hero__headline, .hero__subtitle, .hero__ctas, .hero__search-wrap'
  );
  targets.forEach(el => {
    el.style.opacity = '1';
    el.style.transform = 'none';
  });
}

/* ---------------------------------------------------------
   NAVBAR
   --------------------------------------------------------- */
function initNavbar() {
  const navbar = document.querySelector('.navbar');
  if (!navbar) return;

  const isHome = document.body.classList.contains('page-home');
  let lastScrollY = 0;
  let ticking = false;

  function updateNavbar() {
    const scrollY = window.scrollY;

    // Transparent at top on home, solid after scroll
    if (isHome) {
      if (scrollY > 80) {
        navbar.classList.remove('navbar--transparent');
        navbar.classList.add('navbar--solid');
      } else {
        navbar.classList.remove('navbar--solid');
        navbar.classList.add('navbar--transparent');
      }
    } else {
      navbar.classList.add('navbar--solid');
    }

    // Keep navbar visible; only change background on scroll
    navbar.style.transform = 'translateY(0)';

    lastScrollY = scrollY;
    ticking = false;
  }

  window.addEventListener('scroll', () => {
    if (!ticking) {
      requestAnimationFrame(updateNavbar);
      ticking = true;
    }
  }, { passive: true });

  // Initial state
  if (isHome) {
    navbar.classList.add('navbar--transparent');
  } else {
    navbar.classList.add('navbar--solid');
  }

  navbar.style.transition = 'background 0.4s ease, box-shadow 0.4s ease, transform 0.35s ease, height 0.35s ease';
}

/* ---------------------------------------------------------
   MOBILE MENU
   --------------------------------------------------------- */
function initMobileMenu() {
  if (document.documentElement.dataset.mobileMenuBound === '1') return;
  bindMobileMenu();
}

function bindMobileMenu() {
  if (document.documentElement.dataset.mobileMenuBound === '1') return;
  const hamburger  = document.querySelector('.navbar__hamburger');
  const mobileMenu = document.querySelector('.mobile-menu');
  const closeBtn   = document.querySelector('.mobile-menu__close');
  const body       = document.body;
  if (!hamburger || !mobileMenu) return;
  document.documentElement.dataset.mobileMenuBound = '1';

  function openMenu() {
    hamburger.classList.add('open');
    mobileMenu.classList.add('open');
    body.classList.add('no-scroll');
    mobileMenu.setAttribute('aria-hidden', 'false');
    // Stagger links
    if (typeof gsap !== 'undefined') {
      gsap.fromTo('.mobile-menu__link',
        { x: -30, opacity: 0 },
        { x: 0, opacity: 1, stagger: 0.07, duration: 0.45, ease: 'power3.out', delay: 0.1 }
      );
    }
  }

  function closeMenu() {
    hamburger.classList.remove('open');
    mobileMenu.classList.remove('open');
    body.classList.remove('no-scroll');
    mobileMenu.setAttribute('aria-hidden', 'true');
  }

  hamburger.addEventListener('click', () => {
    if (mobileMenu.classList.contains('open')) closeMenu();
    else openMenu();
  });

  if (closeBtn) closeBtn.addEventListener('click', closeMenu);

  // Close on backdrop click
  mobileMenu.addEventListener('click', (e) => {
    if (e.target === mobileMenu) closeMenu();
  });

  // Close when clicking a real link (skip submenu toggles)
  mobileMenu.addEventListener('click', (e) => {
    const link = e.target.closest('a');
    if (!link || !mobileMenu.contains(link)) return;
    if (link.classList.contains('mobile-menu__link') && link.dataset.sub) return;
    closeMenu();
  });

  // Submenu toggles
  document.querySelectorAll('.mobile-menu__link[data-sub]').forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const subId = link.dataset.sub;
      const sub   = document.getElementById(subId);
      if (sub) sub.classList.toggle('open');
      const icon = link.querySelector('.mobile-sub-arrow');
      if (icon) icon.style.transform = sub.classList.contains('open') ? 'rotate(180deg)' : '';
    });
  });

  // Close on Escape
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeMenu();
  });
}

/* ---------------------------------------------------------
   SCROLL PROGRESS BAR
   --------------------------------------------------------- */
function initScrollProgress() {
  const bar = document.getElementById('scroll-progress');
  if (!bar) return;
  window.addEventListener('scroll', () => {
    const scrollTop  = document.documentElement.scrollTop;
    const docHeight  = document.documentElement.scrollHeight - window.innerHeight;
    bar.style.width  = (docHeight > 0 ? (scrollTop / docHeight) * 100 : 0) + '%';
  }, { passive: true });
}

/* ---------------------------------------------------------
   BACK TO TOP
   --------------------------------------------------------- */
function initBackToTop() {
  const btn = document.getElementById('back-to-top');
  if (!btn) return;
  window.addEventListener('scroll', () => {
    btn.classList.toggle('visible', window.scrollY > 400);
  }, { passive: true });
  btn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}

/* ---------------------------------------------------------
   COOKIE BANNER
   --------------------------------------------------------- */
function initCookieBanner() {
  // Cookie banner is intentionally disabled site-wide.
  const banner = document.getElementById('cookie-banner');
  if (banner) banner.remove();
}

/* ---------------------------------------------------------
   TOAST NOTIFICATIONS
   --------------------------------------------------------- */
function initToastSystem() {
  window.showToast = function(message, type = 'info', duration = 3500) {
    let container = document.getElementById('toast-container');
    if (!container) {
      container = document.createElement('div');
      container.id = 'toast-container';
      document.body.appendChild(container);
    }

    const icons = { success: '✅', error: '❌', info: 'ℹ️', warning: '⚠️' };
    const toast = document.createElement('div');
    toast.className = `toast toast--${type}`;
    toast.innerHTML = `<span>${icons[type] || '📌'}</span><span>${message}</span>`;
    container.appendChild(toast);

    setTimeout(() => {
      if (typeof gsap === 'undefined') {
        toast.remove();
        return;
      }
      gsap.to(toast, {
        opacity: 0, x: 20, duration: 0.3,
        onComplete: () => toast.remove()
      });
    }, duration);
  };
}

/* ---------------------------------------------------------
   FAVORITES SYSTEM (localStorage)
   --------------------------------------------------------- */
function initFavorites() {
  let favorites = JSON.parse(localStorage.getItem('ee_favorites') || '[]');

  // Update heart buttons on page load
  updateHeartButtons();

  // Delegate click events on all heart buttons
  document.addEventListener('click', (e) => {
    const btn = e.target.closest('.property-card__action-btn[data-fav]');
    if (!btn) return;
    const id = btn.dataset.fav;
    if (favorites.includes(id)) {
      favorites = favorites.filter(f => f !== id);
      btn.classList.remove('liked');
      btn.title = 'Save Property';
      showToast('Removed from favorites', 'info');
    } else {
      favorites.push(id);
      btn.classList.add('liked');
      btn.title = 'Saved!';
      showToast('Added to favorites!', 'success');
      // Bounce animation (if GSAP available)
      if (typeof gsap !== 'undefined') {
        gsap.fromTo(btn, { scale: 1.4 }, { scale: 1, duration: 0.4, ease: 'elastic.out(1, 0.5)' });
      }
    }
    localStorage.setItem('ee_favorites', JSON.stringify(favorites));
    updateFavCount();
  });

  function updateHeartButtons() {
    document.querySelectorAll('.property-card__action-btn[data-fav]').forEach(btn => {
      if (favorites.includes(btn.dataset.fav)) btn.classList.add('liked');
    });
  }

  function updateFavCount() {
    const dot = document.querySelector('.navbar__action-btn[data-action="favorites"] .badge-dot');
    if (dot) dot.style.display = favorites.length > 0 ? 'block' : 'none';
  }

  updateFavCount();
}

/* ---------------------------------------------------------
   COMPARE TRAY
   --------------------------------------------------------- */
function initCompareTray() {
  const tray = document.getElementById('compare-tray');
  if (!tray) return;

  let compareList = [];

  document.addEventListener('change', (e) => {
    if (!e.target.classList.contains('compare-checkbox')) return;
    const id    = e.target.dataset.id;
    const title = e.target.dataset.title || 'Property';

    if (e.target.checked) {
      if (compareList.length >= 3) {
        e.target.checked = false;
        showToast('You can compare up to 3 properties.', 'warning');
        return;
      }
      compareList.push({ id, title });
    } else {
      compareList = compareList.filter(p => p.id !== id);
    }

    renderTray();
  });

  function renderTray() {
    const slots = tray.querySelectorAll('.compare-tray__slot');
    slots.forEach((slot, i) => {
      if (compareList[i]) {
        slot.classList.add('filled');
        slot.innerHTML = `
          <span>${compareList[i].title}</span>
          <button class="compare-remove" data-id="${compareList[i].id}" title="Remove">×</button>
        `;
      } else {
        slot.classList.remove('filled');
        slot.innerHTML = `<span>Add property ${i + 1}</span>`;
      }
    });

    if (compareList.length > 0) {
      tray.classList.add('visible');
    } else {
      tray.classList.remove('visible');
    }
  }

  tray.addEventListener('click', (e) => {
    const btn = e.target.closest('.compare-remove');
    if (!btn) return;
    const id = btn.dataset.id;
    compareList = compareList.filter(p => p.id !== id);
    // Uncheck matching checkbox
    const cb = document.querySelector(`.compare-checkbox[data-id="${id}"]`);
    if (cb) cb.checked = false;
    renderTray();
  });

  const compareBtn = document.getElementById('compare-now-btn');
  if (compareBtn) {
    compareBtn.addEventListener('click', () => {
      if (compareList.length < 2) {
        showToast('Select at least 2 properties to compare.', 'warning');
        return;
      }
      const ids = compareList.map(p => p.id).join(',');
      window.location.href = `compare.html?ids=${ids}`;
    });
  }
}

/* ---------------------------------------------------------
   CURRENCY TOGGLE
   --------------------------------------------------------- */
function initCurrencyToggle() {
  const toggleBtn = document.getElementById('currency-toggle');
  if (!toggleBtn) return;

  const PKR_RATE = 280; // 1 USD ≈ 280 PKR
  let currency = localStorage.getItem('ee_currency') || 'USD';

  toggleBtn.textContent = currency;

  toggleBtn.addEventListener('click', () => {
    currency = currency === 'USD' ? 'PKR' : 'USD';
    localStorage.setItem('ee_currency', currency);
    toggleBtn.textContent = currency;
    convertPrices();
  });

  function convertPrices() {
    document.querySelectorAll('[data-usd-price]').forEach(el => {
      const usd = parseFloat(el.dataset.usdPrice);
      if (currency === 'PKR') {
        el.textContent = 'PKR ' + formatNumber(Math.round(usd * PKR_RATE));
      } else {
        el.textContent = '$' + formatNumber(usd);
      }
    });
  }

  // Initial format prices
  convertPrices();
}

/* ---------------------------------------------------------
   SEARCH AUTOCOMPLETE
   --------------------------------------------------------- */
function initSearchAutocomplete() {
  const inputs = document.querySelectorAll('.search-field__input[data-autocomplete="location"]');
  if (!inputs.length) return;

  const suggestions = [
    'Beverly Hills, CA', 'Manhattan, NY', 'Miami Beach, FL',
    'Bel Air, CA', 'Pacific Palisades, CA', 'Malibu, CA',
    'The Hamptons, NY', 'Greenwich, CT', 'Aspen, CO',
    'Palm Beach, FL', 'Santa Barbara, CA', 'Scottsdale, AZ',
    'Chicago, IL', 'Boston, MA', 'Seattle, WA',
    'Denver, CO', 'Austin, TX', 'Nashville, TN'
  ];

  inputs.forEach(input => {
    let dropdown;

    input.addEventListener('input', () => {
      const val = input.value.trim().toLowerCase();
      clearDropdown();
      if (!val) return;

      const matches = suggestions.filter(s => s.toLowerCase().includes(val)).slice(0, 5);
      if (!matches.length) return;

      dropdown = document.createElement('ul');
      dropdown.className = 'autocomplete-dropdown';
      dropdown.style.cssText = `
        position:absolute; top:calc(100% + 4px); left:0; right:0;
        background:white; border-radius:12px;
        box-shadow:0 8px 30px rgba(26,60,94,0.15);
        border:1.5px solid #e8e4de; overflow:hidden;
        z-index:999; list-style:none; padding:4px 0;
      `;

      matches.forEach(match => {
        const li = document.createElement('li');
        li.style.cssText = `
          padding:10px 16px; cursor:pointer; font-size:0.875rem;
          color:#1A1A2E; transition:background 0.15s;
          display:flex; align-items:center; gap:8px;
        `;
        li.innerHTML = `<i style="color:#C8963E;font-size:.8rem" class="fas fa-map-marker-alt"></i>${match}`;
        li.addEventListener('mouseenter', () => li.style.background = '#F8F6F2');
        li.addEventListener('mouseleave', () => li.style.background = '');
        li.addEventListener('click', () => {
          input.value = match;
          clearDropdown();
          input.focus();
        });
        dropdown.appendChild(li);
      });

      input.parentElement.style.position = 'relative';
      input.parentElement.appendChild(dropdown);
    });

    input.addEventListener('blur', () => {
      setTimeout(clearDropdown, 200);
    });

    function clearDropdown() {
      if (dropdown) { dropdown.remove(); dropdown = null; }
    }
  });
}

/* ---------------------------------------------------------
   HERO SEARCH BAR TABS
   --------------------------------------------------------- */
document.addEventListener('DOMContentLoaded', () => {
  const tabs = document.querySelectorAll('.search-bar__tab');
  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      tabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
    });
  });

  // Accordion
  document.querySelectorAll('.accordion__trigger').forEach(trigger => {
    trigger.addEventListener('click', () => {
      const item = trigger.closest('.accordion__item');
      const isOpen = item.classList.contains('active');
      document.querySelectorAll('.accordion__item.active').forEach(i => i.classList.remove('active'));
      if (!isOpen) item.classList.add('active');
    });
  });

  // Tabs
  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const panel = document.getElementById(btn.dataset.tab);
      if (!panel) return;
      const wrapper = btn.closest('.tabs-wrapper') || document;
      wrapper.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
      wrapper.querySelectorAll('.tab-panel').forEach(p => p.classList.remove('active'));
      btn.classList.add('active');
      panel.classList.add('active');
    });
  });

  // Modal close buttons
  document.querySelectorAll('[data-modal-close]').forEach(btn => {
    btn.addEventListener('click', () => {
      const backdrop = btn.closest('.modal-backdrop');
      if (backdrop) backdrop.classList.remove('open');
    });
  });

  // Modal open buttons
  document.querySelectorAll('[data-modal]').forEach(btn => {
    btn.addEventListener('click', () => {
      const modal = document.getElementById(btn.dataset.modal);
      if (modal) modal.classList.add('open');
    });
  });

  // Close modal on backdrop click
  document.querySelectorAll('.modal-backdrop').forEach(backdrop => {
    backdrop.addEventListener('click', (e) => {
      if (e.target === backdrop) backdrop.classList.remove('open');
    });
  });
});

/* ---------------------------------------------------------
   HELPERS
   --------------------------------------------------------- */
function formatNumber(num) {
  if (num >= 1_000_000) return (num / 1_000_000).toFixed(1) + 'M';
  if (num >= 1_000)     return (num / 1_000).toFixed(0) + 'K';
  return num.toLocaleString();
}

function formatPrice(usd) {
  const currency = localStorage.getItem('ee_currency') || 'USD';
  const PKR_RATE = 280;
  if (currency === 'PKR') return 'PKR ' + formatNumber(Math.round(usd * PKR_RATE));
  return '$' + formatNumber(usd);
}

// Expose globals
window.EE = { formatPrice, formatNumber, showToast: () => {} };
