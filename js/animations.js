/* =========================================================
   EliteEstates — animations.js
   GSAP ScrollTrigger animations for all pages
   ========================================================= */

document.addEventListener('DOMContentLoaded', () => {
  if (typeof gsap === 'undefined') return;

  // Register ScrollTrigger plugin
  if (typeof ScrollTrigger !== 'undefined') {
    gsap.registerPlugin(ScrollTrigger);
  }

  initSectionReveal();
  initFeatureCards();
  initPropertyCards();
  initStatsBanner();
  initProcessSteps();
  initTimelineItems();
  initPartnerLogos();
  initHeroParallax();
  initGoldLines();
  initServiceCards();
});

/* ---------------------------------------------------------
   GENERIC SECTION REVEAL
   (targets elements with .gsap-hidden classes)
   --------------------------------------------------------- */
function initSectionReveal() {
  gsap.utils.toArray('.gsap-hidden').forEach(el => {
    gsap.fromTo(el,
      { opacity: 0, y: 40 },
      {
        opacity: 1, y: 0,
        duration: 0.8,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: el,
          start: 'top 88%',
          toggleActions: 'play none none none',
        }
      }
    );
  });

  gsap.utils.toArray('.gsap-hidden-left').forEach(el => {
    gsap.fromTo(el,
      { opacity: 0, x: -50 },
      {
        opacity: 1, x: 0,
        duration: 0.85,
        ease: 'power3.out',
        scrollTrigger: { trigger: el, start: 'top 88%' }
      }
    );
  });

  gsap.utils.toArray('.gsap-hidden-right').forEach(el => {
    gsap.fromTo(el,
      { opacity: 0, x: 50 },
      {
        opacity: 1, x: 0,
        duration: 0.85,
        ease: 'power3.out',
        scrollTrigger: { trigger: el, start: 'top 88%' }
      }
    );
  });

  gsap.utils.toArray('.gsap-scale-in').forEach(el => {
    gsap.fromTo(el,
      { opacity: 0, scale: 0.88 },
      {
        opacity: 1, scale: 1,
        duration: 0.7,
        ease: 'back.out(1.7)',
        scrollTrigger: { trigger: el, start: 'top 88%' }
      }
    );
  });
}

/* ---------------------------------------------------------
   FEATURE CARDS — staggered reveal
   --------------------------------------------------------- */
function initFeatureCards() {
  const grids = document.querySelectorAll('.why-us__grid, .values-grid, .awards-grid');
  grids.forEach(grid => {
    gsap.fromTo(grid.children,
      { opacity: 0, y: 50 },
      {
        opacity: 1, y: 0,
        stagger: 0.12,
        duration: 0.75,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: grid,
          start: 'top 85%',
        }
      }
    );
  });
}

/* ---------------------------------------------------------
   PROPERTY CARDS — staggered cascade
   --------------------------------------------------------- */
function initPropertyCards() {
  const grids = document.querySelectorAll('.listings-grid, .agents-strip__grid, .blog-strip__grid');
  grids.forEach(grid => {
    gsap.fromTo(grid.querySelectorAll('.property-card, .agent-card, .blog-card'),
      { opacity: 0, y: 40 },
      {
        opacity: 1, y: 0,
        stagger: 0.10,
        duration: 0.7,
        ease: 'power2.out',
        scrollTrigger: {
          trigger: grid,
          start: 'top 88%',
        }
      }
    );
  });
}

/* ---------------------------------------------------------
   STATS BANNER — counter + scale in
   --------------------------------------------------------- */
function initStatsBanner() {
  const statsGrid = document.querySelector('.stats-grid, .trust-bar__items');
  if (!statsGrid) return;

  gsap.fromTo(statsGrid.children,
    { opacity: 0, scale: 0.8 },
    {
      opacity: 1, scale: 1,
      stagger: 0.15,
      duration: 0.6,
      ease: 'back.out(1.5)',
      scrollTrigger: {
        trigger: statsGrid,
        start: 'top 82%',
      }
    }
  );
}

/* ---------------------------------------------------------
   PROCESS STEPS — slide up with connector draw
   --------------------------------------------------------- */
function initProcessSteps() {
  const steps = document.querySelectorAll('.process-step');
  if (!steps.length) return;

  gsap.fromTo(steps,
    { opacity: 0, y: 60 },
    {
      opacity: 1, y: 0,
      stagger: 0.2,
      duration: 0.8,
      ease: 'power3.out',
      scrollTrigger: {
        trigger: '.process-grid',
        start: 'top 82%',
      }
    }
  );

  // Bounce the step number circles
  gsap.fromTo('.process-step__number',
    { scale: 0, rotation: -15 },
    {
      scale: 1, rotation: 0,
      stagger: 0.2,
      duration: 0.6,
      ease: 'back.out(2)',
      scrollTrigger: {
        trigger: '.process-grid',
        start: 'top 82%',
      },
      delay: 0.3
    }
  );
}

/* ---------------------------------------------------------
   TIMELINE ITEMS — alternating slide-in
   --------------------------------------------------------- */
function initTimelineItems() {
  gsap.utils.toArray('.timeline__item').forEach((item, i) => {
    gsap.fromTo(item,
      { opacity: 0, x: i % 2 === 0 ? -40 : 40 },
      {
        opacity: 1, x: 0,
        duration: 0.75,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: item,
          start: 'top 86%',
        }
      }
    );
  });

  // Timeline dot scale
  gsap.utils.toArray('.timeline__dot').forEach(dot => {
    gsap.fromTo(dot,
      { scale: 0 },
      {
        scale: 1,
        duration: 0.5,
        ease: 'back.out(2)',
        scrollTrigger: {
          trigger: dot,
          start: 'top 88%',
        }
      }
    );
  });
}

/* ---------------------------------------------------------
   PARTNER LOGOS — fade in on scroll, then marquee
   --------------------------------------------------------- */
function initPartnerLogos() {
  const section = document.querySelector('.partners-section');
  if (!section) return;
  gsap.fromTo(section,
    { opacity: 0 },
    {
      opacity: 1,
      duration: 1,
      scrollTrigger: {
        trigger: section,
        start: 'top 90%',
      }
    }
  );
}

/* ---------------------------------------------------------
   HERO PARALLAX on scroll
   --------------------------------------------------------- */
function initHeroParallax() {
  const heroBg = document.querySelector('.page-hero__bg');
  if (!heroBg) return;

  ScrollTrigger.create({
    trigger: '.page-hero',
    start: 'top top',
    end: 'bottom top',
    scrub: 1,
    onUpdate: (self) => {
      heroBg.style.transform = `translateY(${self.progress * 30}%)`;
    }
  });
}

/* ---------------------------------------------------------
   GOLD LINES — scale in on reveal
   --------------------------------------------------------- */
function initGoldLines() {
  gsap.utils.toArray('.gold-line').forEach(line => {
    gsap.to(line, {
      scaleX: 1,
      duration: 0.9,
      ease: 'power3.out',
      scrollTrigger: {
        trigger: line,
        start: 'top 90%',
      }
    });
    line.style.transformOrigin = 'left center';
  });
}

/* ---------------------------------------------------------
   SERVICE CARDS
   --------------------------------------------------------- */
function initServiceCards() {
  const grid = document.querySelector('.services-grid');
  if (!grid) return;

  gsap.fromTo(grid.children,
    { opacity: 0, y: 50, scale: 0.95 },
    {
      opacity: 1, y: 0, scale: 1,
      stagger: 0.1,
      duration: 0.7,
      ease: 'power3.out',
      scrollTrigger: {
        trigger: grid,
        start: 'top 85%',
      }
    }
  );
}

/* ---------------------------------------------------------
   CATEGORY CARDS — stagger reveal
   --------------------------------------------------------- */
document.addEventListener('DOMContentLoaded', () => {
  if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') return;

  const catGrid = document.querySelector('.categories-grid');
  if (catGrid) {
    gsap.fromTo(catGrid.children,
      { opacity: 0, scale: 0.88, y: 30 },
      {
        opacity: 1, scale: 1, y: 0,
        stagger: 0.08,
        duration: 0.65,
        ease: 'back.out(1.4)',
        scrollTrigger: {
          trigger: catGrid,
          start: 'top 85%',
        }
      }
    );
  }

  // About story split
  const storyLeft  = document.querySelector('.about-story__image-wrap');
  const storyRight = document.querySelector('.about-story__content');
  if (storyLeft && storyRight) {
    gsap.fromTo(storyLeft,
      { opacity: 0, x: -60 },
      { opacity: 1, x: 0, duration: 1, ease: 'power3.out',
        scrollTrigger: { trigger: storyLeft, start: 'top 80%' } }
    );
    gsap.fromTo(storyRight,
      { opacity: 0, x: 60 },
      { opacity: 1, x: 0, duration: 1, ease: 'power3.out',
        scrollTrigger: { trigger: storyRight, start: 'top 80%' } }
    );
  }

  // Blog featured
  const featured = document.querySelector('.blog-featured');
  if (featured) {
    gsap.fromTo(featured,
      { opacity: 0, y: 40 },
      { opacity: 1, y: 0, duration: 0.9, ease: 'power3.out',
        scrollTrigger: { trigger: featured, start: 'top 85%' } }
    );
  }
});
