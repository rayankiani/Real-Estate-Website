/* =========================================================
   EliteEstates — properties.js
   Property listing filter, search, sort, view toggle,
   favorites, compare, pagination
   ========================================================= */

document.addEventListener('DOMContentLoaded', () => {
  initPropertyFilters();
  initViewToggle();
  initSortControl();
  initPropertiesSearch();
  initPagination();
  initFilterToggleBtn();
});

/* ---------------------------------------------------------
   DATA — Sample property objects
   --------------------------------------------------------- */
const PROPERTIES = [
  { id:'p1',  title:'Modern Luxury Villa',      type:'villa',      beds:5, baths:4, sqft:4200, price:2850000, location:'Beverly Hills, CA',   badge:'featured', img:'https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=800', amenities:['pool','gym','garden','parking'] },
  { id:'p2',  title:'Downtown Sky Penthouse',   type:'penthouse',  beds:4, baths:3, sqft:3400, price:4200000, location:'Manhattan, NY',         badge:'new',      img:'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800', amenities:['gym','parking','concierge'] },
  { id:'p3',  title:'Beachfront Estate',        type:'villa',      beds:6, baths:5, sqft:5800, price:7500000, location:'Miami Beach, FL',       badge:'hot',      img:'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?w=800', amenities:['pool','garden','parking','gym'] },
  { id:'p4',  title:'Contemporary Apartment',   type:'apartment',  beds:2, baths:2, sqft:1200, price: 850000, location:'Chicago, IL',           badge:'',         img:'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800', amenities:['parking','gym'] },
  { id:'p5',  title:'Garden Townhouse',         type:'townhouse',  beds:3, baths:3, sqft:2100, price:1350000, location:'Boston, MA',            badge:'new',      img:'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800', amenities:['garden','parking'] },
  { id:'p6',  title:'Commercial Office Space',  type:'commercial', beds:0, baths:4, sqft:8500, price:5200000, location:'Seattle, WA',           badge:'',         img:'https://images.unsplash.com/photo-1497366216548-37526070297c?w=800', amenities:['parking'] },
  { id:'p7',  title:'Hilltop Villa',            type:'villa',      beds:4, baths:3, sqft:3600, price:2200000, location:'Malibu, CA',            badge:'featured', img:'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800', amenities:['pool','garden','parking'] },
  { id:'p8',  title:'Urban Studio Loft',        type:'apartment',  beds:1, baths:1, sqft: 680, price: 495000, location:'Austin, TX',            badge:'',         img:'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800', amenities:['gym'] },
  { id:'p9',  title:'Colonial Estate',          type:'villa',      beds:5, baths:4, sqft:4800, price:3800000, location:'Greenwich, CT',         badge:'hot',      img:'https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=800', amenities:['pool','garden','parking','gym'] },
  { id:'p10', title:'High-Rise Condo',          type:'apartment',  beds:2, baths:2, sqft:1500, price:1100000, location:'San Francisco, CA',     badge:'new',      img:'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800', amenities:['parking','gym','concierge'] },
  { id:'p11', title:'Lakefront Property',       type:'villa',      beds:4, baths:3, sqft:3200, price:2600000, location:'Lake Tahoe, CA',        badge:'',         img:'https://images.unsplash.com/photo-1583608205776-bfd35f0d9f83?w=800', amenities:['pool','garden'] },
  { id:'p12', title:'Historic Brownstone',      type:'townhouse',  beds:3, baths:2, sqft:2400, price:1750000, location:'Brooklyn, NY',          badge:'featured', img:'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800', amenities:['garden','parking'] },
];

let filteredProperties = [...PROPERTIES];
let currentPage = 1;
const PAGE_SIZE = 9;

/* ---------------------------------------------------------
   RENDER CARDS
   --------------------------------------------------------- */
function renderProperties(list, page = 1) {
  const grid = document.getElementById('properties-grid');
  if (!grid) return;

  const start = (page - 1) * PAGE_SIZE;
  const slice = list.slice(start, start + PAGE_SIZE);

  if (slice.length === 0) {
    grid.innerHTML = `
      <div style="grid-column:1/-1;text-align:center;padding:4rem 0">
        <p style="font-size:1.1rem;color:var(--medium-gray)">
          No properties match your criteria. Try adjusting filters.
        </p>
      </div>`;
    return;
  }

  grid.innerHTML = slice.map(p => renderCard(p)).join('');
  updateCount(list.length, slice.length);
  renderPagination(list.length, page);

  // Re-init favorites state
  const favs = JSON.parse(localStorage.getItem('ee_favorites') || '[]');
  grid.querySelectorAll('.property-card__action-btn[data-fav]').forEach(btn => {
    if (favs.includes(btn.dataset.fav)) btn.classList.add('liked');
  });

  // AOS re-init if loaded
  if (window.AOS) window.AOS.refresh();
}

function renderCard(p) {
  const badgeHtml = p.badge
    ? `<span class="badge badge--${p.badge}">${p.badge.charAt(0).toUpperCase()+p.badge.slice(1)}</span>`
    : '';
  const typeLabel = { villa:'Villa', apartment:'Apartment', penthouse:'Penthouse', townhouse:'Townhouse', commercial:'Commercial' };

  return `
    <div class="property-card" data-aos="fade-up">
      <div class="property-card__image">
        <img class="property-card__img" src="${p.img}" alt="${p.title}" loading="lazy">
        <div class="property-card__badge">${badgeHtml}</div>
        <div class="property-card__actions">
          <button class="property-card__action-btn" data-fav="${p.id}" title="Save Property" aria-label="Save to favorites">
            <i class="fas fa-heart"></i>
          </button>
          <button class="property-card__action-btn" title="Quick View" aria-label="Quick view" onclick="openQuickView('${p.id}')">
            <i class="fas fa-eye"></i>
          </button>
        </div>
        <div class="property-card__dots">
          <span class="property-card__dot active"></span>
          <span class="property-card__dot"></span>
          <span class="property-card__dot"></span>
        </div>
        <div class="property-card__compare">
          <label class="compare-check">
            <input type="checkbox" class="compare-checkbox" data-id="${p.id}" data-title="${p.title}">
            Compare
          </label>
        </div>
      </div>
      <div class="property-card__body">
        <div class="property-card__type"><i class="fas fa-home"></i>${typeLabel[p.type] || p.type}</div>
        <h3 class="property-card__title"><a href="property-detail.html?id=${p.id}">${p.title}</a></h3>
        <p class="property-card__location"><i class="fas fa-map-marker-alt"></i>${p.location}</p>
        <div class="property-card__stats">
          ${p.beds > 0 ? `<div class="property-card__stat"><i class="fas fa-bed"></i>${p.beds} Beds</div>` : ''}
          <div class="property-card__stat"><i class="fas fa-bath"></i>${p.baths} Baths</div>
          <div class="property-card__stat"><i class="fas fa-vector-square"></i>${p.sqft.toLocaleString()} sqft</div>
        </div>
        <div class="property-card__footer">
          <div>
            <span class="property-card__price" data-usd-price="${p.price}">$${formatNum(p.price)}</span>
          </div>
          <a href="property-detail.html?id=${p.id}" class="btn btn--gold btn--sm">Details</a>
        </div>
      </div>
    </div>`;
}

function formatNum(n) {
  if (n >= 1e6) return (n/1e6).toFixed(1)+'M';
  if (n >= 1e3) return (n/1e3).toFixed(0)+'K';
  return n.toLocaleString();
}

function updateCount(total, shown) {
  const el = document.querySelector('.listings-count');
  if (el) el.innerHTML = `Showing <strong>${shown}</strong> of <strong>${total}</strong> properties`;
}

/* ---------------------------------------------------------
   FILTER SYSTEM
   --------------------------------------------------------- */
function initPropertyFilters() {
  const applyBtn = document.getElementById('apply-filters');
  const resetBtn = document.getElementById('reset-filters');
  if (!applyBtn && !resetBtn) return;

  if (applyBtn) applyBtn.addEventListener('click', applyFilters);
  if (resetBtn) resetBtn.addEventListener('click', resetFilters);

  // Live bed/bath toggle
  document.querySelectorAll('.btn-toggle').forEach(btn => {
    btn.addEventListener('click', () => {
      const group = btn.closest('.btn-toggle-group');
      group.querySelectorAll('.btn-toggle').forEach(b => b.classList.remove('active'));
      btn.classList.toggle('active', !btn.classList.contains('active') || true);
    });
  });

  // Price range slider live update
  document.querySelectorAll('.range-slider').forEach(slider => {
    slider.addEventListener('input', updateRangeDisplay);
  });

  // Initial render
  renderProperties(PROPERTIES);

  // Dual price sliders
  initDualRangeSlider();
}

function initDualRangeSlider() {
  const minSlider = document.getElementById('price-min');
  const maxSlider = document.getElementById('price-max');
  const minDisplay = document.getElementById('price-min-display');
  const maxDisplay = document.getElementById('price-max-display');
  const fill = document.querySelector('.dual-range-fill');
  if (!minSlider || !maxSlider) return;

  function updateFill() {
    const min = parseInt(minSlider.value);
    const max = parseInt(maxSlider.value);
    const range = parseInt(minSlider.max) - parseInt(minSlider.min);
    const leftPct  = ((min - parseInt(minSlider.min)) / range) * 100;
    const rightPct = ((max - parseInt(minSlider.min)) / range) * 100;
    if (fill) { fill.style.left = leftPct + '%'; fill.style.width = (rightPct - leftPct) + '%'; }
    if (minDisplay) minDisplay.textContent = '$' + formatNum(min);
    if (maxDisplay) maxDisplay.textContent = '$' + formatNum(max);
  }

  minSlider.addEventListener('input', () => {
    if (parseInt(minSlider.value) > parseInt(maxSlider.value) - 50000) {
      minSlider.value = parseInt(maxSlider.value) - 50000;
    }
    updateFill();
  });

  maxSlider.addEventListener('input', () => {
    if (parseInt(maxSlider.value) < parseInt(minSlider.value) + 50000) {
      maxSlider.value = parseInt(minSlider.value) + 50000;
    }
    updateFill();
  });

  updateFill();
}

function updateRangeDisplay(e) {
  const slider = e.target;
  const display = document.getElementById(slider.id + '-display');
  if (display) display.textContent = slider.value;
}

function applyFilters() {
  const types     = getCheckedValues('type-filter');
  const amenities = getCheckedValues('amenity-filter');
  const minPrice  = parseInt(document.getElementById('price-min')?.value || 0);
  const maxPrice  = parseInt(document.getElementById('price-max')?.value || 99999999);
  const activeBed = document.querySelector('.bed-toggle.active')?.dataset.val;
  const activeBath= document.querySelector('.bath-toggle.active')?.dataset.val;

  filteredProperties = PROPERTIES.filter(p => {
    if (types.length && !types.includes(p.type)) return false;
    if (p.price < minPrice || p.price > maxPrice) return false;
    if (activeBed && activeBed !== 'any' && p.beds < parseInt(activeBed)) return false;
    if (activeBath && activeBath !== 'any' && p.baths < parseInt(activeBath)) return false;
    if (amenities.length && !amenities.every(a => p.amenities.includes(a))) return false;
    return true;
  });

  currentPage = 1;
  renderProperties(filteredProperties, currentPage);

  if (window.showToast) showToast(`Found ${filteredProperties.length} properties`, 'info');

  // Close sidebar on mobile
  document.querySelector('.filter-sidebar')?.classList.remove('open');
}

function resetFilters() {
  document.querySelectorAll('.filter-sidebar input[type="checkbox"]').forEach(cb => cb.checked = false);
  document.querySelectorAll('.btn-toggle').forEach(btn => btn.classList.remove('active'));
  const minSlider = document.getElementById('price-min');
  const maxSlider = document.getElementById('price-max');
  if (minSlider) minSlider.value = minSlider.min;
  if (maxSlider) maxSlider.value = maxSlider.max;
  initDualRangeSlider();
  filteredProperties = [...PROPERTIES];
  currentPage = 1;
  renderProperties(filteredProperties, currentPage);
}

function getCheckedValues(name) {
  return [...document.querySelectorAll(`input[name="${name}"]:checked`)].map(cb => cb.value);
}

/* ---------------------------------------------------------
   VIEW TOGGLE (Grid / List / Map)
   --------------------------------------------------------- */
function initViewToggle() {
  const btns = document.querySelectorAll('.view-btn');
  const grid = document.getElementById('properties-grid');
  const mapContainer = document.querySelector('.map-view-container');
  if (!btns.length) return;

  btns.forEach(btn => {
    btn.addEventListener('click', () => {
      btns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const view = btn.dataset.view;
      if (!grid) return;

      if (view === 'map') {
        grid.style.display = 'none';
        if (mapContainer) mapContainer.classList.add('active');
        if (typeof initPropertiesMap === 'function') initPropertiesMap();
      } else {
        grid.style.display = '';
        if (mapContainer) mapContainer.classList.remove('active');
        if (view === 'list') {
          grid.classList.add('view-list');
          grid.querySelectorAll('.property-card').forEach(c => c.classList.add('property-card--list'));
        } else {
          grid.classList.remove('view-list');
          grid.querySelectorAll('.property-card').forEach(c => c.classList.remove('property-card--list'));
        }
      }
    });
  });
}

/* ---------------------------------------------------------
   SORT
   --------------------------------------------------------- */
function initSortControl() {
  const sel = document.getElementById('sort-select');
  if (!sel) return;
  sel.addEventListener('change', () => {
    const val = sel.value;
    filteredProperties = [...filteredProperties].sort((a, b) => {
      if (val === 'price-asc')  return a.price - b.price;
      if (val === 'price-desc') return b.price - a.price;
      if (val === 'sqft')       return b.sqft  - a.sqft;
      return 0; // default / popularity
    });
    currentPage = 1;
    renderProperties(filteredProperties, currentPage);
  });
}

/* ---------------------------------------------------------
   SEARCH (in listings)
   --------------------------------------------------------- */
function initPropertiesSearch() {
  const input = document.getElementById('properties-search');
  if (!input) return;

  let debounceTimer;
  input.addEventListener('input', () => {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => {
      const q = input.value.trim().toLowerCase();
      filteredProperties = PROPERTIES.filter(p =>
        p.title.toLowerCase().includes(q) ||
        p.location.toLowerCase().includes(q) ||
        p.type.toLowerCase().includes(q)
      );
      currentPage = 1;
      renderProperties(filteredProperties, currentPage);
    }, 300);
  });
}

/* ---------------------------------------------------------
   PAGINATION
   --------------------------------------------------------- */
function renderPagination(total, page) {
  const container = document.getElementById('pagination');
  if (!container) return;

  const totalPages = Math.ceil(total / PAGE_SIZE);
  if (totalPages <= 1) { container.innerHTML = ''; return; }

  let html = '';

  // Prev
  html += `<button class="pagination__btn" ${page === 1 ? 'disabled' : ''} onclick="goToPage(${page - 1})"><i class="fas fa-chevron-left"></i></button>`;

  // Page numbers
  for (let i = 1; i <= totalPages; i++) {
    if (i === 1 || i === totalPages || Math.abs(i - page) <= 1) {
      html += `<button class="pagination__btn ${i === page ? 'active' : ''}" onclick="goToPage(${i})">${i}</button>`;
    } else if (Math.abs(i - page) === 2) {
      html += `<span class="pagination__btn" style="pointer-events:none">…</span>`;
    }
  }

  // Next
  html += `<button class="pagination__btn" ${page === totalPages ? 'disabled' : ''} onclick="goToPage(${page + 1})"><i class="fas fa-chevron-right"></i></button>`;

  container.innerHTML = html;
}

function initPagination() {
  // Exposed globally for inline onclick
  window.goToPage = (page) => {
    currentPage = page;
    renderProperties(filteredProperties, currentPage);
    window.scrollTo({ top: document.getElementById('properties-grid')?.offsetTop - 120 || 0, behavior: 'smooth' });
  };
}

/* ---------------------------------------------------------
   QUICK VIEW MODAL
   --------------------------------------------------------- */
window.openQuickView = function(id) {
  const p = PROPERTIES.find(prop => prop.id === id);
  if (!p) return;

  let modal = document.getElementById('quick-view-modal');
  if (!modal) {
    modal = document.createElement('div');
    modal.id = 'quick-view-modal';
    modal.className = 'modal-backdrop';
    modal.innerHTML = `
      <div class="modal" style="max-width:700px">
        <button class="modal__close" data-modal-close aria-label="Close">×</button>
        <div id="quick-view-content"></div>
      </div>`;
    document.body.appendChild(modal);
    modal.addEventListener('click', e => { if (e.target === modal) modal.classList.remove('open'); });
    modal.querySelector('[data-modal-close]').addEventListener('click', () => modal.classList.remove('open'));
  }

  const typeLabel = { villa:'Villa', apartment:'Apartment', penthouse:'Penthouse', townhouse:'Townhouse', commercial:'Commercial' };
  document.getElementById('quick-view-content').innerHTML = `
    <img src="${p.img}" alt="${p.title}" style="width:100%;height:280px;object-fit:cover;border-radius:var(--radius-xl);margin-bottom:var(--space-6)">
    <div style="display:flex;justify-content:space-between;align-items:flex-start;gap:1rem;margin-bottom:1rem">
      <div>
        <p style="color:var(--accent);font-size:.75rem;font-weight:600;text-transform:uppercase;letter-spacing:.08em">${typeLabel[p.type]||p.type}</p>
        <h3 style="font-size:1.5rem;margin-bottom:.25rem">${p.title}</h3>
        <p style="color:var(--medium-gray);font-size:.875rem"><i class="fas fa-map-marker-alt" style="color:var(--accent)"></i> ${p.location}</p>
      </div>
      <div style="text-align:right">
        <div class="property-card__price">$${formatNum(p.price)}</div>
      </div>
    </div>
    <div class="property-card__stats" style="border-top:1px solid var(--border-color);border-bottom:1px solid var(--border-color);padding:1rem 0;margin-bottom:1.5rem">
      ${p.beds > 0 ? `<div class="property-card__stat"><i class="fas fa-bed"></i>${p.beds} Bedrooms</div>` : ''}
      <div class="property-card__stat"><i class="fas fa-bath"></i>${p.baths} Bathrooms</div>
      <div class="property-card__stat"><i class="fas fa-vector-square"></i>${p.sqft.toLocaleString()} sqft</div>
    </div>
    <div style="display:flex;gap:1rem">
      <a href="property-detail.html?id=${p.id}" class="btn btn--primary" style="flex:1;justify-content:center">View Full Details</a>
      <button class="btn btn--outline" onclick="document.getElementById('quick-view-modal').classList.remove('open')" style="flex:1">Close</button>
    </div>
  `;

  modal.classList.add('open');
};

/* ---------------------------------------------------------
   FILTER TOGGLE (mobile sidebar)
   --------------------------------------------------------- */
function initFilterToggleBtn() {
  const btn     = document.getElementById('filter-toggle');
  const sidebar = document.querySelector('.filter-sidebar');
  if (!btn || !sidebar) return;

  btn.addEventListener('click', () => {
    sidebar.classList.toggle('open');
    document.body.classList.toggle('no-scroll');
  });

  // Close btn inside sidebar
  const closeBtn = sidebar.querySelector('.filter-sidebar__close');
  if (closeBtn) {
    closeBtn.addEventListener('click', () => {
      sidebar.classList.remove('open');
      document.body.classList.remove('no-scroll');
    });
  }
}
