// app.js – main UI, routing orchestration, GPS demo, zones/buildings
import { ROAD_GRAPH_DATA, __TUNNEL_EDGE_PAIRS } from './road_graph.js';
import { POSITIONS } from './positions.js'; // will be generated, fallback seed

// --- i18n ---
const i18n = {
  de: {
    searchPlaceholder: 'Position, Gate oder Stand suchen …',
    routeInfo: (dist) => `Route ${(dist/1000).toFixed(1)} km`,
    clear: 'Route löschen',
    gpsAus: 'Aus',
    gpsDemo: 'Demo',
    gpsLive: 'Live',
  },
  en: {
    searchPlaceholder: 'Search position, gate or stand …',
    routeInfo: (dist) => `Route ${(dist/1000).toFixed(1)} km`,
    clear: 'Clear route',
    gpsAus: 'Off',
    gpsDemo: 'Demo',
    gpsLive: 'Live',
  }
};
let lang = 'de';

// --- DOM refs ---
const mapEl = document.getElementById('map');
const searchInput = document.getElementById('search-input');
const searchResults = document.getElementById('search-results');
const infoPanel = document.getElementById('info-panel');
const routeInfo = document.getElementById('route-info');
const clearBtn = document.getElementById('btn-clear-route');
const gpsStatus = document.getElementById('gps-status');
const demoBtn = document.getElementById('btn-demo');
const settingsBtn = document.getElementById('btn-settings');
const centerBtn = document.getElementById('btn-center');
const settingsOverlay = document.getElementById('settings-overlay');
const closeSettings = document.getElementById('btn-close-settings');
const checkZones = document.getElementById('check-zones');
const checkBuildings = document.getElementById('check-buildings');
const langSelect = document.getElementById('lang-select');
const vehicleSelect = document.getElementById('vehicle-select');
const basemapSelect = document.getElementById('basemap-select');
const zoomIn = document.getElementById('zoom-in');
const zoomOut = document.getElementById('zoom-out');
const routeStatus = document.getElementById('route-status');

// --- Leaflet map (north‑up, no rotate) ---
const map = L.map(mapEl, {
  center: [50.042, 8.57],
  zoom: 14,
  zoomControl: false,
  attributionControl: true,
  touchZoom: true,
  doubleClickZoom: true,
  scrollWheelZoom: true,
  boxZoom: true,
  keyboard: true,
  // disable rotation
  dragging: true,
  zoomSnap: 0.5,
}).setView([50.042, 8.57], 14);

// Base tile layers
const osmLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: '© OpenStreetMap'
});
const satLayer = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
  attribution: '© Esri'
});
const darkLayer = L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
  attribution: '© CartoDB'
});
let currentBasemap = 'osm';
osmLayer.addTo(map);

// Overlay groups
const zoneGroup = L.layerGroup().addTo(map);
const buildingGroup = L.layerGroup().addTo(map);

// Route layer
let routeLayer = L.layerGroup().addTo(map);
let startMarker = null, endMarker = null;
let currentRoute = null;
let selectedTarget = null;

// --- Seed positions (will be replaced by full positions.js later) ---
// In production you'd import POSITIONS from positions.js.
// For now we define a small seed inside app.
const SEED_POSITIONS = [
  { id: "A4", lat: 50.049244, lng: 8.569909, cat: "terminal", desc: "T1 Gate A" },
  { id: "B20", lat: 50.048212, lng: 8.572309, cat: "terminal", desc: "T1 Gate B" },
  { id: "C15", lat: 50.049504, lng: 8.581211, cat: "terminal", desc: "T1 Gate C" },
  { id: "F213", lat: 50.040133, lng: 8.545750, cat: "cargo", desc: "Cargo · Stand" },
  { id: "V115", lat: 50.049246, lng: 8.588577, cat: "vorfeld-n", desc: "Vorfeld Ost · Stand" },
  { id: "G2", lat: 50.031449, lng: 8.585597, cat: "terminal", desc: "T3 Gate G" },
  { id: "H1", lat: 50.0325, lng: 8.5795, cat: "terminal", desc: "T3 Gate H (calibrate)" },
  { id: "J1", lat: 50.029966, lng: 8.577374, cat: "terminal", desc: "T3 Gate J" },
];
// Use if POSITIONS not available
const positions = (typeof POSITIONS !== 'undefined') ? POSITIONS : SEED_POSITIONS;

// --- Zones & Buildings (dummy polygons, will be refined) ---
function buildZonesAndBuildings() {
  // This is a placeholder – real zones from chart/OSM
  // For now we add some approximate rectangles as demonstration
  const zonePolygons = [
    // Schengen A/B/C (rough)
    { coords: [[50.048,8.567],[50.050,8.567],[50.050,8.573],[50.048,8.573]], label: 'Schengen A/B/C' },
    // Non-Schengen A/B/C
    { coords: [[50.048,8.573],[50.050,8.573],[50.050,8.578],[50.048,8.578]], label: 'Non-Schengen A/B/C' },
    // T3
    { coords: [[50.028,8.580],[50.034,8.580],[50.034,8.590],[50.028,8.590]], label: 'T3 G/H/J' },
  ];
  zonePolygons.forEach(p => {
    const poly = L.polygon(p.coords, { color: '#ffaa33', weight: 1, opacity: 0.6, fillOpacity: 0.15 });
    poly.bindTooltip(p.label, { permanent: false, direction: 'center' });
    zoneGroup.addLayer(poly);
  });

  // Building labels
  const bldgPoints = [
    { lat: 50.0490, lng: 8.570, label: 'A' },
    { lat: 50.0485, lng: 8.573, label: 'B' },
    { lat: 50.0490, lng: 8.581, label: 'C' },
    { lat: 50.0480, lng: 8.586, label: 'D/E' },
    { lat: 50.0315, lng: 8.585, label: 'T3' },
  ];
  bldgPoints.forEach(p => {
    const marker = L.marker([p.lat, p.lng], { icon: L.divIcon({ className: 'bldg-label', html: p.label, iconSize: [30,16] }) });
    buildingGroup.addLayer(marker);
  });
}
buildZonesAndBuildings();

// Visibility toggles
checkZones.addEventListener('change', () => {
  if (checkZones.checked) map.addLayer(zoneGroup);
  else map.removeLayer(zoneGroup);
});
checkBuildings.addEventListener('change', () => {
  if (checkBuildings.checked) map.addLayer(buildingGroup);
  else map.removeLayer(buildingGroup);
});
// Initially show both
map.addLayer(zoneGroup);
map.addLayer(buildingGroup);

// --- Search / autocomplete ---
function searchPositions(query) {
  const q = query.toLowerCase().trim();
  if (!q) return [];
  return positions.filter(p => 
    p.id.toLowerCase().includes(q) || 
    p.desc.toLowerCase().includes(q)
  );
}

searchInput.addEventListener('input', () => {
  const results = searchPositions(searchInput.value);
  searchResults.innerHTML = '';
  if (results.length === 0) {
    searchResults.classList.add('hidden');
    return;
  }
  results.forEach(p => {
    const div = document.createElement('div');
    div.className = 'result-item';
    div.innerHTML = `<strong>${p.id}</strong> <span class="desc">${p.desc}</span>`;
    div.addEventListener('click', () => selectTarget(p));
    searchResults.appendChild(div);
  });
  searchResults.classList.remove('hidden');
});
document.addEventListener('click', (e) => {
  if (!e.target.closest('#search-panel')) searchResults.classList.add('hidden');
});

// --- Select target & route ---
let currentStart = null; // [lat, lng]

function selectTarget(target) {
  selectedTarget = target;
  searchInput.value = `${target.id} – ${target.desc}`;
  searchResults.classList.add('hidden');
  // If we have a start (from demo or GPS), compute route
  if (currentStart) {
    computeAndDrawRoute(currentStart, [target.lat, target.lng], target);
  } else {
    // else just show target marker and center
    map.setView([target.lat, target.lng], 15);
    if (endMarker) map.removeLayer(endMarker);
    endMarker = L.marker([target.lat, target.lng], { icon: L.divIcon({ className: 'dest-marker', html: '📍', iconSize: [24,24] }) }).addTo(map);
  }
}

// --- Route computation (calls routing in road_graph) ---
async function computeAndDrawRoute(from, to, destMeta) {
  // Use the routing function from road_graph.js (exported)
  const result = await computeRoute(from, to, destMeta);
  if (!result) {
    routeStatus.textContent = 'Route nicht gefunden';
    routeStatus.classList.remove('hidden');
    return;
  }
  currentRoute = result;
  // Draw route
  routeLayer.clearLayers();
  const latlngs = result.latlngs.map(p => [p[0], p[1]]);
  const polyline = L.polyline(latlngs, { color: '#00c2e0', weight: 6, opacity: 0.9 });
  const outline = L.polyline(latlngs, { color: '#0a0a18', weight: 10, opacity: 0.3 });
  routeLayer.addLayer(outline);
  routeLayer.addLayer(polyline);

  // Start & end markers
  if (startMarker) map.removeLayer(startMarker);
  if (endMarker) map.removeLayer(endMarker);
  startMarker = L.marker(from, { icon: L.divIcon({ className: 'start-marker', html: '🟦', iconSize: [20,20] }) }).addTo(map);
  endMarker = L.marker(to, { icon: L.divIcon({ className: 'dest-marker', html: '📍', iconSize: [24,24] }) }).addTo(map);

  // Info
  const dist = result.dist || 0;
  routeInfo.textContent = i18n[lang].routeInfo(dist);
  infoPanel.classList.remove('hidden');

  // Fit bounds
  const bounds = L.latLngBounds(latlngs);
  map.fitBounds(bounds, { padding: [50,50] });

  routeStatus.classList.add('hidden');
}

clearBtn.addEventListener('click', () => {
  routeLayer.clearLayers();
  infoPanel.classList.add('hidden');
  if (startMarker) map.removeLayer(startMarker);
  if (endMarker) map.removeLayer(endMarker);
  currentRoute = null;
  selectedTarget = null;
  currentStart = null;
  searchInput.value = '';
});

// --- Demo mode ---
let demoInterval = null;
const DEMO_START = [50.04098, 8.56446]; // DemoGPS
const DEMO_TARGETS = ['F213', 'V115', 'G2', 'A4'];

function startDemo() {
  if (demoInterval) {
    clearInterval(demoInterval);
    demoInterval = null;
    demoBtn.textContent = '▶';
    gpsStatus.textContent = i18n[lang].gpsAus;
    return;
  }
  demoBtn.textContent = '⏹';
  gpsStatus.textContent = i18n[lang].gpsDemo;
  // Set current start to demo start
  currentStart = DEMO_START;
  // Pick a random target from DEMO_TARGETS
  const id = DEMO_TARGETS[Math.floor(Math.random() * DEMO_TARGETS.length)];
  const target = positions.find(p => p.id === id) || positions[0];
  selectTarget(target);
  // Simulate GPS movement every 5 secs (just for show)
  demoInterval = setInterval(() => {
    // Move start slightly along route? For simplicity just re-route.
    if (currentRoute && currentRoute.latlngs.length > 2) {
      const idx = Math.min(3, currentRoute.latlngs.length - 1);
      const newStart = currentRoute.latlngs[idx];
      currentStart = [newStart[0], newStart[1]];
      if (selectedTarget) {
        computeAndDrawRoute(currentStart, [selectedTarget.lat, selectedTarget.lng], selectedTarget);
      }
    }
  }, 5000);
}

demoBtn.addEventListener('click', startDemo);

// --- GPS / Location (stub) ---
// In production use navigator.geolocation
function startGPS() {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(pos => {
      const lat = pos.coords.latitude;
      const lng = pos.coords.longitude;
      currentStart = [lat, lng];
      gpsStatus.textContent = i18n[lang].gpsLive;
      map.setView([lat, lng], 16);
      if (selectedTarget) {
        computeAndDrawRoute(currentStart, [selectedTarget.lat, selectedTarget.lng], selectedTarget);
      }
    }, () => {
      gpsStatus.textContent = '⚠️';
    });
  } else {
    gpsStatus.textContent = '❌';
  }
}
// (Not yet wired to a button, but you can add)

// --- Settings ---
settingsBtn.addEventListener('click', () => settingsOverlay.classList.remove('hidden'));
closeSettings.addEventListener('click', () => settingsOverlay.classList.add('hidden'));

langSelect.addEventListener('change', (e) => {
  lang = e.target.value;
  // update UI texts
  searchInput.placeholder = i18n[lang].searchPlaceholder;
  gpsStatus.textContent = i18n[lang].gpsAus;
  if (currentRoute) {
    routeInfo.textContent = i18n[lang].routeInfo(currentRoute.dist || 0);
  }
  clearBtn.textContent = i18n[lang].clear;
});

basemapSelect.addEventListener('change', (e) => {
  const val = e.target.value;
  map.removeLayer(osmLayer);
  map.removeLayer(satLayer);
  map.removeLayer(darkLayer);
  if (val === 'osm') map.addLayer(osmLayer);
  else if (val === 'sat') map.addLayer(satLayer);
  else if (val === 'dark') map.addLayer(darkLayer);
  currentBasemap = val;
});

// --- Zoom controls ---
zoomIn.addEventListener('click', () => map.zoomIn());
zoomOut.addEventListener('click', () => map.zoomOut());

// --- Center button ---
centerBtn.addEventListener('click', () => {
  if (currentStart) map.setView(currentStart, 15);
  else map.setView([50.042, 8.57], 14);
});

// --- Route compute stub (will be replaced by real A*) ---
// This is a placeholder that uses the graph imported from road_graph.js
// In the final version, this will be a real A* search using ROAD_GRAPH_DATA.
window.computeRoute = async function(from, to, destMeta) {
  // For now, we simulate a route by finding a path using graph edges
  // We'll use the imported ROAD_GRAPH_DATA (which we will build)
  // For demonstration, we return a straight line (but we want to avoid that)
  // In production, you will implement A* here.
  // We'll just return a simple path through some nodes for testing.
  // Since we don't have a full A* yet, we return a dummy path:
  const latlngs = [
    from,
    [ (from[0]+to[0])/2, (from[1]+to[1])/2 ],
    to
  ];
  return {
    latlngs: latlngs,
    dist: 1000,
    viaRoads: true,
    startSnap: from,
    endSnap: to
  };
};

// --- Initial state ---
searchInput.placeholder = i18n[lang].searchPlaceholder;
gpsStatus.textContent = i18n[lang].gpsAus;

// If no POSITIONS imported, use seed
if (typeof POSITIONS === 'undefined') {
  console.warn('Using seed positions; please generate positions.js');
}

console.log('FRA Vorfeld Navigator ready'); 