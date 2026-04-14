/* =========================================================
   EliteEstates — map.js
   Leaflet.js integration for properties map, property
   detail neighborhood map, and contact office map
   ========================================================= */

/* ---------------------------------------------------------
   PROPERTIES MAP (listings page)
   --------------------------------------------------------- */
window.initPropertiesMap = function () {
  const container = document.getElementById('properties-map');
  if (!container || typeof L === 'undefined') return;
  if (container._leafletMap) return; // already initialized

  const map = L.map('properties-map', {
    center: [34.0522, -118.2437], // Los Angeles
    zoom: 10,
    zoomControl: true,
    scrollWheelZoom: false,
  });

  container._leafletMap = map;

  // Custom tile layer (CartoDB Positron — clean & elegant)
  L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/">CARTO</a>',
    subdomains: 'abcd',
    maxZoom: 20,
  }).addTo(map);

  // Property locations
  const locations = [
    { id:'p1', title:'Modern Luxury Villa',     price:'$2.85M', lat:34.0736, lng:-118.4004, type:'villa',     img:'https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=400' },
    { id:'p3', title:'Beachfront Estate',        price:'$7.5M',  lat:25.7617, lng:-80.1918,  type:'villa',     img:'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?w=400' },
    { id:'p2', title:'Downtown Sky Penthouse',   price:'$4.2M',  lat:40.7580, lng:-73.9855,  type:'penthouse', img:'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=400' },
    { id:'p4', title:'Contemporary Apartment',   price:'$850K',  lat:41.8781, lng:-87.6298,  type:'apartment', img:'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=400' },
    { id:'p9', title:'Colonial Estate',          price:'$3.8M',  lat:41.0534, lng:-73.6288,  type:'villa',     img:'https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=400' },
    { id:'p7', title:'Hilltop Villa',            price:'$2.2M',  lat:34.0259, lng:-118.7798, type:'villa',     img:'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=400' },
  ];

  // Custom marker icon
  function createMarkerIcon(price) {
    return L.divIcon({
      html: `<div class="map-marker">${price}</div>`,
      className: '',
      iconAnchor: [40, 40],
    });
  }

  // Popup template
  function createPopup(loc) {
    return `
      <div class="map-popup">
        <img class="map-popup__img" src="${loc.img}" alt="${loc.title}" loading="lazy">
        <p class="map-popup__title">${loc.title}</p>
        <p class="map-popup__price">${loc.price}</p>
        <a href="property-detail.html?id=${loc.id}" class="btn btn--primary btn--sm" style="margin-top:.75rem;display:inline-flex">View Details</a>
      </div>`;
  }

  locations.forEach(loc => {
    const marker = L.marker([loc.lat, loc.lng], { icon: createMarkerIcon(loc.price) })
      .addTo(map)
      .bindPopup(createPopup(loc), {
        closeButton: true,
        maxWidth: 260,
        className: 'custom-popup',
      });

    marker.on('click', () => marker.openPopup());
  });

  // Fit bounds
  const group = new L.featureGroup(locations.map(loc =>
    L.marker([loc.lat, loc.lng])
  ));
  map.fitBounds(group.getBounds().pad(0.1));

  // Inject popup CSS
  if (!document.getElementById('leaflet-popup-style')) {
    const style = document.createElement('style');
    style.id = 'leaflet-popup-style';
    style.textContent = `
      .custom-popup .leaflet-popup-content-wrapper {
        border-radius: 16px;
        box-shadow: 0 8px 40px rgba(26,60,94,0.18);
        padding: 0;
        overflow: hidden;
      }
      .custom-popup .leaflet-popup-content { margin: 0; }
      .map-popup { padding: 12px; min-width: 220px; }
      .map-popup__img { width:100%; height:130px; object-fit:cover; border-radius:8px; margin-bottom:10px; }
      .map-popup__title { font-weight:600; color:#1A1A2E; font-size:.9rem; margin-bottom:4px; }
      .map-popup__price { font-size:1.1rem; font-weight:700; color:#1A3C5E; }
    `;
    document.head.appendChild(style);
  }
};

/* ---------------------------------------------------------
   PROPERTY DETAIL — Neighborhood Map
   --------------------------------------------------------- */
window.initNeighborhoodMap = function (lat, lng) {
  const container = document.getElementById('neighborhood-map');
  if (!container || typeof L === 'undefined') return;
  if (container._leafletMap) return;

  const map = L.map('neighborhood-map', {
    center: [lat, lng],
    zoom: 14,
    scrollWheelZoom: false,
  });
  container._leafletMap = map;

  L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
    attribution: '© OpenStreetMap contributors © CARTO',
    subdomains: 'abcd',
    maxZoom: 20,
  }).addTo(map);

  // Property marker
  const propIcon = L.divIcon({
    html: `<div style="background:var(--accent,#C8963E);color:#fff;padding:6px 12px;border-radius:6px;font-size:12px;font-weight:600;white-space:nowrap;box-shadow:0 4px 12px rgba(200,150,62,0.4)">🏠 This Property</div>`,
    className: '',
    iconAnchor: [60, 30],
  });
  L.marker([lat, lng], { icon: propIcon }).addTo(map);

  // POI markers
  const pois = [
    { emoji:'🏫', label:'School',     dlat: 0.006, dlng: 0.008 },
    { emoji:'🏥', label:'Hospital',   dlat:-0.009, dlng: 0.005 },
    { emoji:'🛒', label:'Shopping',   dlat: 0.005, dlng:-0.010 },
    { emoji:'🚌', label:'Bus Stop',   dlat:-0.004, dlng:-0.006 },
    { emoji:'🌳', label:'Park',       dlat: 0.008, dlng: 0.002 },
    { emoji:'☕', label:'Café',       dlat:-0.006, dlng: 0.009 },
  ];

  pois.forEach(poi => {
    const icon = L.divIcon({
      html: `<div style="background:white;border:2px solid #e8e4de;padding:4px 8px;border-radius:8px;font-size:11px;white-space:nowrap;box-shadow:0 2px 8px rgba(0,0,0,.12)">${poi.emoji} ${poi.label}</div>`,
      className: '',
      iconAnchor: [40, 16],
    });
    L.marker([lat + poi.dlat, lng + poi.dlng], { icon }).addTo(map);
  });

  // Circle radius
  L.circle([lat, lng], { color: '#C8963E', fillColor: '#C8963E', fillOpacity: 0.05, radius: 600, weight: 1.5 }).addTo(map);
};

/* ---------------------------------------------------------
   CONTACT MAP — Office location
   --------------------------------------------------------- */
window.initContactMap = function () {
  const container = document.getElementById('contact-map');
  if (!container || typeof L === 'undefined') return;
  if (container._leafletMap) return;

  const lat = 34.0736, lng = -118.4004; // Beverly Hills office

  const map = L.map('contact-map', {
    center: [lat, lng],
    zoom: 15,
    scrollWheelZoom: false,
    zoomControl: true,
  });
  container._leafletMap = map;

  L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
    attribution: '© OpenStreetMap contributors © CARTO',
    subdomains: 'abcd',
    maxZoom: 20,
  }).addTo(map);

  const officeIcon = L.divIcon({
    html: `
      <div style="position:relative">
        <div style="background:var(--primary,#1A3C5E);color:white;padding:8px 14px;border-radius:10px;font-size:13px;font-weight:600;white-space:nowrap;box-shadow:0 4px 20px rgba(26,60,94,0.35)">
          🏢 EliteEstates HQ
        </div>
        <div style="width:0;height:0;border-left:8px solid transparent;border-right:8px solid transparent;border-top:8px solid var(--primary,#1A3C5E);position:absolute;bottom:-7px;left:50%;transform:translateX(-50%)"></div>
      </div>`,
    className: '',
    iconAnchor: [70, 56],
  });

  const marker = L.marker([lat, lng], { icon: officeIcon }).addTo(map);
  marker.bindPopup(`
    <div style="padding:8px 4px;min-width:200px">
      <strong style="color:#1A3C5E;font-size:.95rem">EliteEstates Realty Group</strong><br>
      <span style="font-size:.8rem;color:#8A8A8A">450 Rodeo Drive, Suite 300<br>Beverly Hills, CA 90210</span><br>
      <a href="https://maps.google.com/?q=Beverly+Hills+CA" target="_blank" style="color:#C8963E;font-size:.8rem;margin-top:6px;display:inline-block">Get Directions ↗</a>
    </div>
  `).openPopup();

  // Pulse ring
  L.circle([lat, lng], { color: '#C8963E', fillColor: '#C8963E', fillOpacity: 0.06, radius: 200, weight: 1.5 }).addTo(map);
};

/* ---------------------------------------------------------
   AUTO-INIT on page load
   --------------------------------------------------------- */
document.addEventListener('DOMContentLoaded', () => {
  if (document.getElementById('contact-map'))      window.initContactMap();
  if (document.getElementById('neighborhood-map')) window.initNeighborhoodMap(34.0736, -118.4004);
});
