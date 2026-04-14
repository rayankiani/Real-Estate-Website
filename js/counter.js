/* =========================================================
   EliteEstates — counter.js
   CountUp.js stats animation triggered by scroll
   ========================================================= */

document.addEventListener('DOMContentLoaded', () => {
  initCounters();
});

function initCounters() {
  const counters = document.querySelectorAll('[data-count]');
  if (!counters.length) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const el       = entry.target;
      const target   = parseFloat(el.dataset.count);
      const suffix   = el.dataset.suffix || '';
      const prefix   = el.dataset.prefix || '';
      const decimals = el.dataset.decimals ? parseInt(el.dataset.decimals) : 0;
      const duration = el.dataset.duration ? parseInt(el.dataset.duration) : 2000;

      if (typeof CountUp !== 'undefined') {
        const cu = new CountUp(el, target, {
          startVal: 0,
          duration: duration / 1000,
          decimalPlaces: decimals,
          prefix,
          suffix,
          useEasing: true,
          useGrouping: true,
          separator: ',',
          decimal: '.',
        });
        if (!cu.error) cu.start();
      } else {
        // Fallback manual counter
        animateCount(el, target, decimals, prefix, suffix, duration);
      }

      observer.unobserve(el);
    });
  }, { threshold: 0.4 });

  counters.forEach(el => observer.observe(el));
}

/* ---------------------------------------------------------
   Manual CountUp fallback
   --------------------------------------------------------- */
function animateCount(el, target, decimals, prefix, suffix, duration) {
  const start     = 0;
  const startTime = performance.now();

  function frame(now) {
    const elapsed  = now - startTime;
    const progress = Math.min(elapsed / duration, 1);
    // Ease out cubic
    const eased    = 1 - Math.pow(1 - progress, 3);
    const current  = start + (target - start) * eased;

    el.textContent = prefix + current.toFixed(decimals) + suffix;

    if (progress < 1) requestAnimationFrame(frame);
    else el.textContent = prefix + target.toFixed(decimals) + suffix;
  }

  requestAnimationFrame(frame);
}

/* ---------------------------------------------------------
   Export for external use
   --------------------------------------------------------- */
window.EE = window.EE || {};
window.EE.refreshCounters = initCounters;
