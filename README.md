# FRA Vorfeld Navigator

Frankfurt Airport (EDDF) Ground Support Equipment (GSE) Navigation PWA.

## Features

- **Road-centerline routing** — Routes follow gray service roads (Betriebswege / HBS), never cutting across green taxiways/rollfeld
- **200+ positions** — Gates A/B/C/D/E, T3 G/H/J, Cargo F, Vorfeld Ost V, Vorfeld West W, GA, Landmarks
- **A* routing engine** with cost penalties for:
  - Rollfeld/taxiway crossing (heavy penalty)
  - Midfield taxi ban zone
  - Cargo routes: prefer HBS west → cargo drop → cargo lanes
  - T3 routes: prefer NS bridges
  - T1/T2 local: stay on HBS north
- **Zone overlays** — Schengen/Non-Schengen/T3/Cargo zones (toggle in settings)
- **Building labels** — Terminal buildings, ASO, AUEW, BSO, BNS, etc. (toggle in settings)
- **Demo GPS mode** — Simulated vehicle movement along service roads
- **Live GPS** — Browser geolocation API
- **PWA** — Installable, works offline with Service Worker caching
- **i18n** — German (default) / English

## File Structure

```
/
  index.html          — Main HTML shell
  style.css           — Dark professional UI styles
  app.js              — UI, routing, positions, GPS, settings
  road_graph.js       — Road graph data + A* helpers
  sw.js               — Service Worker for offline PWA
  manifest.webmanifest — PWA manifest
  README.md           — This file
```

## Quick Start

1. Serve the folder with any static web server:
   ```bash
   # Python 3
   python -m http.server 8080

   # Node.js
   npx serve .

   # PHP
   php -S localhost:8080
   ```

2. Open `http://localhost:8080` in your browser

3. Click **DEMO** to start simulated GPS, then search for a gate (e.g. `F213`, `V115`, `G2`)

4. The cyan route will appear following service roads

## PWA Installation

- **Chrome/Edge**: Open the site → click the install icon in the address bar
- **Safari iOS**: Share → "Add to Home Screen"
- **Firefox**: Menu → "Install"

## Routing Rules

| Destination | Preferred Route | Banned |
|------------|-----------------|--------|
| Cargo F (e.g. F213) | HBS west → cargo drop (lng 8.561-8.564) → cargoW lanes | NS bridges |
| T3 G/H/J | NS bridges (lng ~8.575/8.583/8.591) → T3 local loop | Western cargo detour |
| T1/T2 local (A4→B20) | HBS north band | South rollfeld loop |
| Vorfeld Ost (V115) | HBS east → vfOst approach | — |

## Test Routes

| From | To | Expected |
|------|-----|----------|
| Hotspot [50.0458, 8.58] | F213 | viaRoads, midTaxi=0, HBS+cargo |
| DemoGPS [50.04098, 8.56446] | F213 | viaRoads, midTaxi=0, no green N/L cut |
| HBS [50.0464, 8.5715] | V115 | viaRoads, HBS/vfOst east |
| A4 | B20 | ~250-450m, maxJump≤20m, HBS |
| V115 | G2 | NS south ~2-4km, viaRoads |
| Hotspot | J1 | NS, midTaxi=0 |

## Extending

### Adding More Positions
Edit `POSITIONS` array in `app.js`:
```js
{ id: "A25", lat: 50.049100, lng: 8.580500, cat: "terminal", desc: "T1 Gate A25" }
```

### Updating Road Graph
The graph is synthetic. For production, replace with OSM Overpass data:
```bash
# Overpass query for EDDF service roads
[out:json];
way["highway"~"service|unclassified"](50.025,8.520,50.055,8.605);
out body;
>;
out skel qt;
```

### Cache Bumping
Edit `CACHE_NAME` in `sw.js` when releasing updates:
```js
const CACHE_NAME = 'fra-vorfeld-v2';
```

## Known Limitations

- Gate coordinates are approximate (building-face); routing targets are offset ~40m south toward apron
- Synthetic road graph — not 1:1 with actual OSM service roads
- No real-time traffic or NOTAM integration
- Leaflet tiles require internet (cached after first load)

## License

Proprietary — Frankfurt Airport Operations Development.
