/* =========================================================
   EliteEstates — agents.js
   Agents page: filter, modal, contact form, review tabs
   ========================================================= */

document.addEventListener('DOMContentLoaded', () => {
  initAgentsFilter();
  initAgentModal();
  initAgentContactForms();
});

/* ---------------------------------------------------------
   AGENTS DATA
   --------------------------------------------------------- */
const AGENTS = [
  { id:'a1', name:'Alexandra Rhodes',   title:'Luxury Property Specialist', exp:12, listings:48, rating:4.9, reviews:127, img:'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400', spec:['luxury','residential'], langs:['English','Spanish'], phone:'+1 (310) 555-0101', email:'a.rhodes@eliteestates.com', bio:'Alexandra brings over 12 years of luxury real estate expertise to every transaction. Specializing in Beverly Hills and Bel Air properties, she has closed over $200M in total sales volume.' },
  { id:'a2', name:'Marcus Johnson',      title:'Commercial Real Estate Expert',exp:9,  listings:31, rating:4.8, reviews:89,  img:'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400', spec:['commercial'],           langs:['English','French'],  phone:'+1 (310) 555-0102', email:'m.johnson@eliteestates.com', bio:'Marcus is a commercial real estate veteran with expertise in office buildings, retail spaces, and industrial properties across Los Angeles County.' },
  { id:'a3', name:'Sofia Martinez',      title:'Residential Sales Director',   exp:8,  listings:62, rating:4.9, reviews:203, img:'https://images.unsplash.com/photo-1594744803329-e58b31de8bf5?w=400', spec:['residential','luxury'],  langs:['English','Spanish','Portuguese'], phone:'+1 (310) 555-0103', email:'s.martinez@eliteestates.com', bio:'Sofia is our top-performing residential agent, specializing in family homes and luxury condos throughout West Los Angeles.' },
  { id:'a4', name:'David Chen',          title:'Investment Property Advisor',   exp:15, listings:44, rating:4.7, reviews:156, img:'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400', spec:['investment','commercial'], langs:['English','Mandarin'], phone:'+1 (310) 555-0104', email:'d.chen@eliteestates.com', bio:'With 15 years of experience, David specializes in investment properties, multi-family units, and portfolio acquisitions for institutional clients.' },
  { id:'a5', name:'Isabella Thompson',   title:'New Developments Specialist',  exp:6,  listings:29, rating:4.8, reviews:74,  img:'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=400', spec:['residential'],           langs:['English'],           phone:'+1 (310) 555-0105', email:'i.thompson@eliteestates.com', bio:'Isabella focuses on newly constructed homes and off-plan developments, helping buyers secure the best pre-launch pricing.' },
  { id:'a6', name:'Robert Williams',     title:'Relocation Services Head',     exp:11, listings:37, rating:4.6, reviews:112, img:'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=400', spec:['relocation','residential'], langs:['English','German'],  phone:'+1 (310) 555-0106', email:'r.williams@eliteestates.com', bio:'Robert leads our relocation division, helping corporate clients and families seamlessly transition to Los Angeles from across the globe.' },
  { id:'a7', name:'Natalie Kim',         title:'Luxury Rentals Specialist',    exp:7,  listings:55, rating:4.9, reviews:98,  img:'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=400', spec:['rental','luxury'],       langs:['English','Korean'],  phone:'+1 (310) 555-0107', email:'n.kim@eliteestates.com', bio:'Natalie manages our luxury rental portfolio, representing some of the most prestigious rental properties in Beverly Hills and Malibu.' },
  { id:'a8', name:'James O\'Sullivan',   title:'Senior Property Consultant',   exp:20, listings:120,rating:5.0, reviews:342, img:'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=400', spec:['luxury','commercial','residential'], langs:['English','Irish'], phone:'+1 (310) 555-0108', email:'j.osullivan@eliteestates.com', bio:'James is our most experienced agent with 20 years in the industry. His comprehensive knowledge spans all property types and price ranges.' },
];

/* ---------------------------------------------------------
   FILTER
   --------------------------------------------------------- */
function initAgentsFilter() {
  const tags = document.querySelectorAll('.agents-filter-tag');
  if (!tags.length) return;

  renderAgents(AGENTS);

  tags.forEach(tag => {
    tag.addEventListener('click', () => {
      tags.forEach(t => t.classList.remove('active'));
      tag.classList.add('active');

      const spec = tag.dataset.spec;
      const filtered = spec === 'all'
        ? AGENTS
        : AGENTS.filter(a => a.spec.includes(spec));

      renderAgents(filtered);
    });
  });
}

function renderAgents(list) {
  const grid = document.getElementById('agents-grid');
  if (!grid) return;

  grid.innerHTML = list.map(a => `
    <div class="agent-card agent-card--extended" data-aos="fade-up">
      <div class="agent-card__image">
        <img class="agent-card__img" src="${a.img}" alt="${a.name}" loading="lazy">
        <div class="agent-card__overlay"></div>
        <div class="agent-card__social">
          <a href="tel:${a.phone}" title="Call ${a.name}" aria-label="Call"><i class="fas fa-phone"></i></a>
          <a href="mailto:${a.email}" title="Email ${a.name}" aria-label="Email"><i class="fas fa-envelope"></i></a>
          <a href="#" title="LinkedIn" aria-label="LinkedIn"><i class="fab fa-linkedin-in"></i></a>
        </div>
      </div>
      <div class="agent-card__body">
        <h3 class="agent-card__name">${a.name}</h3>
        <p class="agent-card__title">${a.title}</p>
        <div class="stars" aria-label="${a.rating} out of 5 stars">
          ${renderStars(a.rating)}
          <span style="color:var(--medium-gray);font-size:.8rem;margin-left:4px">(${a.reviews})</span>
        </div>
        <div class="agent-languages">
          ${a.langs.map(l => `<span class="agent-lang-badge">${l}</span>`).join('')}
        </div>
        <div class="agent-card__stats">
          <div class="agent-card__stat">
            <span class="agent-card__stat-val">${a.listings}</span>
            <span class="agent-card__stat-label">Listings</span>
          </div>
          <div class="agent-card__stat">
            <span class="agent-card__stat-val">${a.exp}+</span>
            <span class="agent-card__stat-label">Years</span>
          </div>
          <div class="agent-card__stat">
            <span class="agent-card__stat-val">${a.rating}</span>
            <span class="agent-card__stat-label">Rating</span>
          </div>
        </div>
        <div class="agent-card__actions">
          <button class="btn btn--primary btn--sm" onclick="openAgentModal('${a.id}')">View Profile</button>
          <a href="contact.html?agent=${a.id}" class="btn btn--outline btn--sm">Contact</a>
        </div>
      </div>
    </div>`).join('');

  if (window.AOS) window.AOS.refresh();
}

function renderStars(rating) {
  const full  = Math.floor(rating);
  const half  = rating % 1 >= 0.5 ? 1 : 0;
  const empty = 5 - full - half;
  return (
    '<i class="fas fa-star"></i>'.repeat(full) +
    (half ? '<i class="fas fa-star-half-alt"></i>' : '') +
    '<i class="far fa-star"></i>'.repeat(empty)
  );
}

/* ---------------------------------------------------------
   AGENT MODAL
   --------------------------------------------------------- */
function initAgentModal() {
  window.openAgentModal = function (id) {
    const a = AGENTS.find(ag => ag.id === id);
    if (!a) return;

    let modal = document.getElementById('agent-modal');
    if (!modal) {
      modal = document.createElement('div');
      modal.id = 'agent-modal';
      modal.className = 'modal-backdrop';
      modal.innerHTML = `
        <div class="modal agent-modal" style="max-width:760px;overflow-y:auto">
          <button class="modal__close" aria-label="Close modal">×</button>
          <div id="agent-modal-content"></div>
        </div>`;
      document.body.appendChild(modal);
      modal.querySelector('.modal__close').addEventListener('click', () => modal.classList.remove('open'));
      modal.addEventListener('click', e => { if (e.target === modal) modal.classList.remove('open'); });
    }

    document.getElementById('agent-modal-content').innerHTML = `
      <div class="agent-modal__hero">
        <img src="${a.img}" alt="${a.name}" class="agent-modal__img">
        <div>
          <h2 class="agent-modal__name">${a.name}</h2>
          <p class="agent-modal__title">${a.title}</p>
          <div class="agent-modal__rating-row">
            <div class="stars">${renderStars(a.rating)}</div>
            <span style="font-size:.875rem;color:var(--medium-gray)">${a.rating}/5 (${a.reviews} reviews)</span>
          </div>
          <div class="agent-modal__badges">
            <span class="agent-modal__badge"><i class="fas fa-clock"></i> ${a.exp}+ Years Experience</span>
            <span class="agent-modal__badge"><i class="fas fa-list"></i> ${a.listings} Listings</span>
          </div>
        </div>
      </div>

      <div class="agent-modal__stats-row">
        <div>
          <span class="agent-modal__stat-val">${a.listings}</span>
          <span class="agent-modal__stat-label">Active Listings</span>
        </div>
        <div>
          <span class="agent-modal__stat-val">${a.exp}+</span>
          <span class="agent-modal__stat-label">Years Experience</span>
        </div>
        <div>
          <span class="agent-modal__stat-val">${a.reviews}</span>
          <span class="agent-modal__stat-label">Client Reviews</span>
        </div>
      </div>

      <p class="agent-modal__bio">${a.bio}</p>

      <div style="margin-bottom:1.5rem">
        <p style="font-size:.75rem;font-weight:600;text-transform:uppercase;letter-spacing:.08em;color:var(--medium-gray);margin-bottom:.75rem">Languages</p>
        <div class="agent-languages">${a.langs.map(l => `<span class="agent-lang-badge">${l}</span>`).join('')}</div>
      </div>

      <div class="agent-modal__contact-grid">
        <a href="tel:${a.phone}" class="btn btn--primary" style="justify-content:center">
          <i class="fas fa-phone"></i> Call Agent
        </a>
        <a href="mailto:${a.email}" class="btn btn--outline" style="justify-content:center">
          <i class="fas fa-envelope"></i> Send Email
        </a>
        <a href="https://wa.me/${a.phone.replace(/\D/g,'')}" target="_blank" class="btn btn--outline" style="justify-content:center;border-color:#25D366;color:#25D366">
          <i class="fab fa-whatsapp"></i> WhatsApp
        </a>
        <a href="contact.html?agent=${a.id}" class="btn btn--gold" style="justify-content:center">
          <i class="fas fa-calendar"></i> Schedule Visit
        </a>
      </div>`;

    modal.classList.add('open');
  };
}

/* ---------------------------------------------------------
   CONTACT FORMS on agent cards
   --------------------------------------------------------- */
function initAgentContactForms() {
  document.addEventListener('submit', (e) => {
    if (!e.target.classList.contains('agent-contact-form')) return;
    e.preventDefault();
    const btn = e.target.querySelector('button[type="submit"]');
    if (btn) { btn.textContent = 'Sending…'; btn.disabled = true; }
    setTimeout(() => {
      if (btn) { btn.textContent = '✓ Sent!'; btn.style.background = '#27AE60'; }
      if (window.showToast) showToast('Message sent to agent!', 'success');
      e.target.reset();
      setTimeout(() => {
        if (btn) { btn.textContent = 'Send Message'; btn.disabled = false; btn.style.background = ''; }
      }, 3000);
    }, 1200);
  });
}
