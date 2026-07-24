// road_graph.js — EDDF Apron Road Graph (Synthetic + OSM-inspired)
// Frankfurt Airport Ground Service Equipment (GSE) navigation graph
// Nodes: lat/lng coordinates | Edges: undirected road segments

// --- Helper: Haversine distance in meters ---
function haversine(lat1, lng1, lat2, lng2) {
  const R = 6371000;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = Math.sin(dLat/2)**2 + Math.cos(lat1*Math.PI/180) * Math.cos(lat2*Math.PI/180) * Math.sin(dLng/2)**2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
}

// --- Densify a polyline into nodes spaced ~30m apart ---
function densifyPolyline(points, maxSegM = 30) {
  const result = [points[0]];
  for (let i = 1; i < points.length; i++) {
    const [lat1, lng1] = points[i-1];
    const [lat2, lng2] = points[i];
    const dist = haversine(lat1, lng1, lat2, lng2);
    const segs = Math.max(1, Math.ceil(dist / maxSegM));
    for (let s = 1; s < segs; s++) {
      const t = s / segs;
      result.push([lat1 + (lat2-lat1)*t, lng1 + (lng2-lng1)*t]);
    }
    result.push(points[i]);
  }
  return result;
}

// ============================================================
// SYNTHETIC SPINES (GSE service roads — gray Betriebswege)
// ============================================================

// 1. HBS — Main East-West service road (north apron)
const hbsRaw = densifyPolyline([
  [50.0467, 8.5635], [50.0467, 8.5660], [50.0467, 8.5685], [50.0467, 8.5710],
  [50.0467, 8.5735], [50.0467, 8.5760], [50.0467, 8.5785], [50.0467, 8.5810],
  [50.0467, 8.5835], [50.0467, 8.5860], [50.0467, 8.5885], [50.0467, 8.5910],
  [50.0467, 8.5930]
], 35);

// 2. HBS South parallel (secondary service)
const hbsSouthRaw = densifyPolyline([
  [50.0462, 8.5635], [50.0462, 8.5660], [50.0462, 8.5685], [50.0462, 8.5710],
  [50.0462, 8.5735], [50.0462, 8.5760], [50.0462, 8.5785], [50.0462, 8.5810],
  [50.0462, 8.5835], [50.0462, 8.5860], [50.0462, 8.5885], [50.0462, 8.5910],
  [50.0462, 8.5930]
], 35);

// 3. Cargo West — E-W cargo truck lanes
const cargoWRaw = densifyPolyline([
  [50.0425, 8.5630], [50.0425, 8.5600], [50.0425, 8.5570], [50.0425, 8.5540],
  [50.0425, 8.5510], [50.0425, 8.5480], [50.0425, 8.5450]
], 35);

// 4. Cargo West Drop — thin corridor from HBS down to cargo
const cargoDropRaw = densifyPolyline([
  [50.0467, 8.5625], [50.0462, 8.5625], [50.0455, 8.5625],
  [50.0445, 8.5625], [50.0435, 8.5625], [50.0425, 8.5625]
], 30);

// 5. Vorfeld Ost approach — from HBS north to V stands
const vfOstRaw = densifyPolyline([
  [50.0467, 8.5860], [50.0470, 8.5860], [50.0475, 8.5860],
  [50.0480, 8.5860], [50.0485, 8.5860], [50.0490, 8.5860], [50.0493, 8.5860]
], 25);

const vfOst2Raw = densifyPolyline([
  [50.0467, 8.5885], [50.0470, 8.5885], [50.0475, 8.5885],
  [50.0480, 8.5885], [50.0485, 8.5885], [50.0490, 8.5885], [50.0493, 8.5885]
], 25);

const vfOst3Raw = densifyPolyline([
  [50.0467, 8.5905], [50.0470, 8.5905], [50.0475, 8.5905],
  [50.0480, 8.5905], [50.0485, 8.5905], [50.0490, 8.5905], [50.0493, 8.5905]
], 25);

// 6. NS Bridges — T2 to T3 north-south corridors
const nsBridge1Raw = densifyPolyline([
  [50.0467, 8.5910], [50.0460, 8.5910], [50.0450, 8.5905], [50.0440, 8.5900],
  [50.0430, 8.5895], [50.0420, 8.5890], [50.0410, 8.5885], [50.0400, 8.5880],
  [50.0390, 8.5875], [50.0380, 8.5870], [50.0370, 8.5865], [50.0360, 8.5860],
  [50.0350, 8.5855], [50.0340, 8.5850], [50.0330, 8.5845], [50.0320, 8.5840],
  [50.0310, 8.5835], [50.0300, 8.5830]
], 35);

const nsBridge2Raw = densifyPolyline([
  [50.0467, 8.5830], [50.0460, 8.5830], [50.0450, 8.5830], [50.0440, 8.5830],
  [50.0430, 8.5830], [50.0420, 8.5830], [50.0410, 8.5830], [50.0400, 8.5830],
  [50.0390, 8.5830], [50.0380, 8.5830], [50.0370, 8.5830], [50.0360, 8.5830],
  [50.0350, 8.5830], [50.0340, 8.5830], [50.0330, 8.5830], [50.0320, 8.5830],
  [50.0310, 8.5830], [50.0300, 8.5830]
], 35);

const nsBridge3Raw = densifyPolyline([
  [50.0467, 8.5750], [50.0460, 8.5750], [50.0450, 8.5750], [50.0440, 8.5750],
  [50.0430, 8.5750], [50.0420, 8.5750], [50.0410, 8.5750], [50.0400, 8.5750],
  [50.0390, 8.5750], [50.0380, 8.5750], [50.0370, 8.5750], [50.0360, 8.5750],
  [50.0350, 8.5750], [50.0340, 8.5750], [50.0330, 8.5750], [50.0320, 8.5750],
  [50.0310, 8.5750], [50.0300, 8.5750]
], 35);

// 7. T3 Local — G/H/J open apron loop
const t3LocalRaw = densifyPolyline([
  [50.0300, 8.5750], [50.0300, 8.5770], [50.0300, 8.5790], [50.0300, 8.5810],
  [50.0300, 8.5830], [50.0300, 8.5850], [50.0300, 8.5870], [50.0300, 8.5890],
  [50.0300, 8.5910], [50.0310, 8.5910], [50.0320, 8.5910], [50.0330, 8.5910],
  [50.0330, 8.5890], [50.0330, 8.5870], [50.0330, 8.5850], [50.0330, 8.5830],
  [50.0330, 8.5810], [50.0330, 8.5790], [50.0330, 8.5770], [50.0330, 8.5750],
  [50.0320, 8.5750], [50.0310, 8.5750], [50.0300, 8.5750]
], 30);

// 8. T3 East spine
const t3EastRaw = densifyPolyline([
  [50.0300, 8.5870], [50.0290, 8.5870], [50.0280, 8.5870]
], 25);

// 9. T3 West spine  
const t3WestRaw = densifyPolyline([
  [50.0300, 8.5790], [50.0290, 8.5790], [50.0280, 8.5790]
], 25);

// 10. Cargo F stands access (north-south within cargo area)
const cargoFNSRaw = densifyPolyline([
  [50.0425, 8.5450], [50.0420, 8.5450], [50.0415, 8.5450],
  [50.0410, 8.5450], [50.0405, 8.5450], [50.0400, 8.5450],
  [50.0395, 8.5450], [50.0390, 8.5450]
], 25);

// 11. Cargo F east-west secondary
const cargoFEWRaw = densifyPolyline([
  [50.0400, 8.5450], [50.0400, 8.5470], [50.0400, 8.5490], [50.0400, 8.5510], [50.0400, 8.5530]
], 25);

// 12. HBS to Terminal A/B/C pier access roads
const pierAccessRaw = densifyPolyline([
  [50.0467, 8.5690], [50.0472, 8.5690], [50.0477, 8.5690], [50.0482, 8.5690],
  [50.0467, 8.5720], [50.0472, 8.5720], [50.0477, 8.5720], [50.0482, 8.5720],
  [50.0467, 8.5810], [50.0472, 8.5810], [50.0477, 8.5810], [50.0482, 8.5810]
], 25);

// 13. Vorfeld Ost east-west connectors
const vfOstEWRaw = densifyPolyline([
  [50.0493, 8.5860], [50.0493, 8.5885], [50.0493, 8.5905], [50.0493, 8.5920]
], 20);

// 14. Additional HBS north connectors for T1 gates
const hbsNorthConnRaw = densifyPolyline([
  [50.0467, 8.5660], [50.0472, 8.5660], [50.0477, 8.5660],
  [50.0467, 8.5735], [50.0472, 8.5735], [50.0477, 8.5735],
  [50.0467, 8.5785], [50.0472, 8.5785], [50.0477, 8.5785]
], 25);

// 15. West cargo extension to F213 area
const cargoWestExtRaw = densifyPolyline([
  [50.0425, 8.5450], [50.0415, 8.5445], [50.0405, 8.5440], [50.0395, 8.5435]
], 25);

// Collect all spine polylines
const allSpines = [
  hbsRaw, hbsSouthRaw, cargoWRaw, cargoDropRaw,
  vfOstRaw, vfOst2Raw, vfOst3Raw,
  nsBridge1Raw, nsBridge2Raw, nsBridge3Raw,
  t3LocalRaw, t3EastRaw, t3WestRaw,
  cargoFNSRaw, cargoFEWRaw, pierAccessRaw, vfOstEWRaw,
  hbsNorthConnRaw, cargoWestExtRaw
];

// ============================================================
// BUILD GRAPH
// ============================================================

let nodes = [];
let edges = [];
const nodeMap = new Map(); // key -> index

function getNodeKey(lat, lng) {
  return lat.toFixed(6) + ',' + lng.toFixed(6);
}

function addNode(lat, lng) {
  const key = getNodeKey(lat, lng);
  if (nodeMap.has(key)) return nodeMap.get(key);
  const idx = nodes.length;
  nodes.push([lat, lng]);
  nodeMap.set(key, idx);
  return idx;
}

function addEdge(i, j) {
  if (i === j) return;
  // avoid duplicates
  const dist = haversine(nodes[i][0], nodes[i][1], nodes[j][0], nodes[j][1]);
  edges.push([i, j, Math.round(dist * 100) / 100]);
}

// Build from spines
for (const spine of allSpines) {
  let prevIdx = null;
  for (const [lat, lng] of spine) {
    const idx = addNode(lat, lng);
    if (prevIdx !== null) {
      addEdge(prevIdx, idx);
    }
    prevIdx = idx;
  }
}

// Cross-connect nearby nodes on same spine type (within 50m)
function connectNearby(maxDist = 50) {
  const added = new Set();
  for (let i = 0; i < nodes.length; i++) {
    for (let j = i + 1; j < nodes.length; j++) {
      const d = haversine(nodes[i][0], nodes[i][1], nodes[j][0], nodes[j][1]);
      if (d < maxDist && d > 5) {
        const key = Math.min(i,j) + '-' + Math.max(i,j);
        if (!added.has(key)) {
          addEdge(i, j);
          added.add(key);
        }
      }
    }
  }
}

// Connect HBS to HBS-South at regular intervals
function connectHBSParallels() {
  for (let i = 0; i < hbsRaw.length; i++) {
    const [lat1, lng1] = hbsRaw[i];
    // Find closest point on hbsSouth
    let bestJ = -1, bestD = Infinity;
    for (let j = 0; j < hbsSouthRaw.length; j++) {
      const d = haversine(lat1, lng1, hbsSouthRaw[j][0], hbsSouthRaw[j][1]);
      if (d < bestD) { bestD = d; bestJ = j; }
    }
    if (bestD < 80) {
      const idx1 = addNode(lat1, lng1);
      const idx2 = addNode(hbsSouthRaw[bestJ][0], hbsSouthRaw[bestJ][1]);
      addEdge(idx1, idx2);
    }
  }
}

connectHBSParallels();
connectNearby(45);

// ============================================================
// TUNNEL EDGES (hard-ban for T1/T2 routing)
// ============================================================
// Mark tunnel edges: any edge below ground level or in underpass
// For now, synthetic graph has no tunnels; mark empty
const __TUNNEL_EDGE_PAIRS = [];

// ============================================================
// ROLLFELD / TAXIWAY BAN REGIONS (for routing cost)
// ============================================================
const ROLLFELD_BBOX = {
  latMin: 50.034, latMax: 50.04615,
  lngMin: 8.548, lngMax: 8.593
};

const MIDTAXI_BBOX = {
  latMin: 50.0435, latMax: 50.0462,
  lngMin: 8.5655, lngMax: 8.590
};

// GSE carve-outs (these are safe, not rollfeld)
function isInCarveOut(lat, lng) {
  // HBS band
  if (lat >= 50.0460 && lat <= 50.0480 && lng >= 8.560 && lng <= 8.595) return true;
  // Cargo west
  if (lat >= 50.0390 && lat <= 50.0435 && lng >= 8.540 && lng <= 8.565) return true;
  // NS bridges
  if (lat >= 50.0280 && lat <= 50.0475) {
    if (Math.abs(lng - 8.591) < 0.003) return true;
    if (Math.abs(lng - 8.583) < 0.003) return true;
    if (Math.abs(lng - 8.575) < 0.003) return true;
  }
  // Vorfeld Ost approach
  if (lat >= 50.0465 && lat <= 50.0495 && lng >= 8.585 && lng <= 8.593) return true;
  // T3 local
  if (lat >= 50.0280 && lat <= 50.0340 && lng >= 8.574 && lng <= 8.592) return true;
  return false;
}

function isRollfeld(lat, lng) {
  if (isInCarveOut(lat, lng)) return false;
  if (lng >= ROLLFELD_BBOX.lngMin && lng <= ROLLFELD_BBOX.lngMax &&
      lat >= ROLLFELD_BBOX.latMin && lat < ROLLFELD_BBOX.latMax) return true;
  return false;
}

function isMidTaxi(lat, lng) {
  if (isInCarveOut(lat, lng)) return false;
  if (lng >= MIDTAXI_BBOX.lngMin && lng <= MIDTAXI_BBOX.lngMax &&
      lat >= MIDTAXI_BBOX.latMin && lat < MIDTAXI_BBOX.latMax) return true;
  return false;
}

// ============================================================
// EXPORT
// ============================================================
const ROAD_GRAPH_DATA = { nodes, edges };

// Node sets for routing logic
const hbsNodes = new Set();
const cargoWNodes = new Set();
const nsBridgeNodes = new Set();

for (let i = 0; i < nodes.length; i++) {
  const [lat, lng] = nodes[i];
  if (lat >= 50.0460 && lat <= 50.0480 && lng >= 8.560 && lng <= 8.595) hbsNodes.add(i);
  if (lat >= 50.0390 && lat <= 50.0435 && lng >= 8.540 && lng <= 8.565) cargoWNodes.add(i);
  if (lat >= 50.0280 && lat <= 50.0475) {
    if (Math.abs(lng - 8.591) < 0.004 || Math.abs(lng - 8.583) < 0.004 || Math.abs(lng - 8.575) < 0.004) {
      nsBridgeNodes.add(i);
    }
  }
}

// Make available globally
if (typeof window !== 'undefined') {
  window.ROAD_GRAPH_DATA = ROAD_GRAPH_DATA;
  window.__TUNNEL_EDGE_PAIRS = __TUNNEL_EDGE_PAIRS;
  window.isRollfeld = isRollfeld;
  window.isMidTaxi = isMidTaxi;
  window.hbsNodes = hbsNodes;
  window.cargoWNodes = cargoWNodes;
  window.nsBridgeNodes = nsBridgeNodes;
  window.haversine = haversine;
}
