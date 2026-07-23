(function initRoadGraph(){
  const g = ROAD_GRAPH_DATA;
  const n = g.nodes.length;
  // OSM tunnel edges: keep connectivity but strongly penalize in routing
  const pairs = (typeof __TUNNEL_EDGE_PAIRS !== 'undefined' && __TUNNEL_EDGE_PAIRS) ? __TUNNEL_EDGE_PAIRS : [];
  const tp = new Set(pairs.map(([a,b])=>a<b?a+","+b:b+","+a));
  const tn = new Set();
  const adj = Array.from({length:n}, () => []);
  for (const e of g.edges){
    const [a,b,d] = e;
    const key = a<b?a+","+b:b+","+a;
    const cost = tp.has(key) ? d*40 : d;
    adj[a].push([b,cost]); adj[b].push([a,cost]);
    if (tp.has(key)){ tn.add(a); tn.add(b); }
  }
  window._roadAdj = adj;
  window._roadNodes = g.nodes;
  window._tunnelPairs = tp;
  window._tunnelNodes = tn;

  // Synthetic Vorfeld service spines: OSM graph disconnects T1/T2 apron from T3 airside
  // Without these, A* takes landside outer rings (public roads east of fence).
  (function injectApronBridges(){
    const nodes = window._roadNodes;
    const adj = window._roadAdj;
    if (!nodes || !adj || window._apronBridgesDone) return;
    window._apronBridgesDone = true;
    // kind: nsBridge=T2↔T3 only; t3Local; northSvc=V↔J; hbs=T1 E–W Hauptbetriebsstraße
        const spines = [
      // T2↔T3 N–S only — stay on outer apron, not terminal building face
      {kind:'nsBridge', pts:[[50.0472,8.5910],[50.0455,8.5915],[50.0438,8.5912],[50.0420,8.5902],[50.0402,8.5888],[50.0384,8.5870],[50.0366,8.5850],[50.0350,8.5830]]},
      {kind:'nsBridge', pts:[[50.0472,8.5828],[50.0455,8.5830],[50.0438,8.5828],[50.0420,8.5822],[50.0402,8.5812],[50.0384,8.5802],[50.0366,8.5795],[50.0350,8.5790]]},
      {kind:'nsBridge', pts:[[50.0470,8.5748],[50.0452,8.5740],[50.0434,8.5745],[50.0416,8.5760],[50.0398,8.5775],[50.0380,8.5785],[50.0362,8.5790],[50.0348,8.5792]]},
      {kind:'t3Local', pts:[[50.0308,8.5885],[50.0302,8.5840],[50.0296,8.5795],[50.0292,8.5755],[50.0290,8.5710],[50.0295,8.5685],[50.0305,8.5665],[50.0315,8.5650]]},
      {kind:'t3Local', pts:[[50.0294,8.5788],[50.0298,8.5760],[50.0303,8.5730],[50.0309,8.5705],[50.0316,8.5680],[50.0325,8.5655]]},
      {kind:'northSvc', pts:[[50.0405,8.5545],[50.0405,8.5570],[50.0404,8.5600],[50.0400,8.5630],[50.0390,8.5655],[50.0378,8.5675],[50.0360,8.5688],[50.0340,8.5693],[50.0320,8.5695],[50.03155,8.5696]]},
      // MAIN apron E–W HBS (south of A–E) — ALWAYS prefer this for T1/V hops
      {kind:'hbs', pts:[[50.04640,8.5635],[50.04645,8.5660],[50.04650,8.5685],[50.04655,8.5710],[50.04660,8.5735],[50.04665,8.5760],[50.04670,8.5785],[50.04675,8.5810],[50.04680,8.5835],[50.04685,8.5860],[50.04690,8.5885],[50.04695,8.5910],[50.04700,8.5930]]},
      {kind:'hbs', pts:[[50.04550,8.5640],[50.04555,8.5670],[50.04560,8.5700],[50.04565,8.5730],[50.04570,8.5760],[50.04575,8.5790],[50.04580,8.5820],[50.04585,8.5850],[50.04590,8.5880],[50.04595,8.5910]]},
      // Cam-side service just south of stands (~50.0473) — still apron, not building
      {kind:'hbs', pts:[[50.04715,8.5645],[50.04720,8.5675],[50.04725,8.5705],[50.04730,8.5735],[50.04735,8.5765],[50.04740,8.5795],[50.04745,8.5825],[50.04750,8.5855],[50.04755,8.5885],[50.04760,8.5915]]},
      // Vorfeld Ost: climb N to V-stands ONLY from south HBS (no E–W under terminal)
      {kind:'vfOst', pts:[[50.04690,8.58855],[50.04740,8.58855],[50.04790,8.58855],[50.04840,8.58855],[50.04890,8.58856],[50.04925,8.58857]]},
      {kind:'vfOst', pts:[[50.04690,8.59050],[50.04750,8.59050],[50.04810,8.59055],[50.04870,8.59060],[50.04925,8.59065]]},
      {kind:'vfOst', pts:[[50.04690,8.59190],[50.04750,8.59200],[50.04810,8.59210],[50.04870,8.59220],[50.04925,8.59250]]},
      {kind:'vfOst', pts:[[50.04690,8.58640],[50.04740,8.58625],[50.04790,8.58600],[50.04840,8.58580],[50.04885,8.58560]]},
      {kind:'vfOst', pts:[[50.04685,8.58340],[50.04735,8.58310],[50.04780,8.58260],[50.04820,8.58220]]},
      {kind:'vfOst', pts:[[50.04680,8.58090],[50.04730,8.58090],[50.04780,8.58085],[50.04815,8.58085]]},
      // Cargo West GSE service (north of F stands) — never taxi/rollfeld green
      {kind:'cargoW', pts:[[50.04240,8.56400],[50.04230,8.56050],[50.04220,8.55700],[50.04205,8.55350],[50.04185,8.55000],[50.04155,8.54700],[50.04120,8.54550],[50.04070,8.54560],[50.04025,8.54575]]},
      {kind:'cargoW', pts:[[50.04160,8.56350],[50.04150,8.55980],[50.04140,8.55620],[50.04125,8.55250],[50.04100,8.54900],[50.04065,8.54650],[50.04025,8.54585]]},
      {kind:'cargoW', pts:[[50.04320,8.56250],[50.04300,8.55880],[50.04275,8.55520],[50.04245,8.55150],[50.04200,8.54800],[50.04150,8.54520],[50.04100,8.54350],[50.04050,8.54320],[50.04020,8.54420],[50.04015,8.54550]]},
      // Drop from HBS down the west building lane into cargo svc (stay N of rollfeld)
      {kind:'cargoW', pts:[[50.04640,8.56350],[50.04550,8.56290],[50.04460,8.56230],[50.04370,8.56180],[50.04290,8.56190],[50.04240,8.56280],[50.04220,8.56380]]},
      // Southern edge of cargo stand truck lane (still GSE, not L/N)
      {kind:'cargoW', pts:[[50.04085,8.56100],[50.04080,8.55720],[50.04070,8.55340],[50.04055,8.54960],[50.04035,8.54700],[50.04018,8.54585]]}
    ];
    const N0 = nodes.length;
    const inBand = (la,ln)=> la>=50.027 && la<=50.054 && ln>=8.555 && ln<=8.5975;
    const nearestBand = (lat,lng)=>{
      let best=-1, bd=1e18;
      const cos=Math.cos(lat*Math.PI/180);
      for (let i=0;i<N0;i++){
        const la=nodes[i][0], ln=nodes[i][1];
        if (!inBand(la,ln)) continue;
        const dy=(la-lat)*111320, dx=(ln-lng)*111320*cos;
        const d=dy*dy+dx*dx;
        if (d<bd){ bd=d; best=i; }
      }
      return best>=0 ? [best, Math.sqrt(bd)] : null;
    };
    const link = (a,b,dist)=>{
      if (a===b) return;
      const w = Math.max(8, dist);
      adj[a].push([b,w]); adj[b].push([a,w]);
    };
    const densify = (pts, stepM)=>{
      if (!pts || pts.length<2) return pts||[];
      const out=[pts[0].slice()];
      for (let i=0;i<pts.length-1;i++){
        const a=pts[i], b=pts[i+1];
        const d = haversineBridge(a,b);
        const n = Math.max(1, Math.ceil(d / (stepM||42)));
        for (let k=1;k<=n;k++){
          const t=k/n;
          out.push([a[0]+(b[0]-a[0])*t, a[1]+(b[1]-a[1])*t]);
        }
      }
      return out;
    };
    window._northSvcNodes = window._northSvcNodes || new Set();
    window._nsBridgeNodes = window._nsBridgeNodes || new Set();
    window._hbsNodes = window._hbsNodes || new Set();
    window._vfOstNodes = window._vfOstNodes || new Set();
    window._cargoWNodes = window._cargoWNodes || new Set();
    window._synthNodes = window._synthNodes || new Set();
    for (let si=0; si<spines.length; si++){
      const kind = spines[si].kind;
      const spine = densify(spines[si].pts, (kind==='hbs'||kind==='vfOst') ? 32 : 42);
      const chain=[];
      for (const pt of spine){
        const lat=pt[0], lng=pt[1];
        const nid=nodes.length;
        nodes.push([lat,lng]);
        adj.push([]);
        chain.push(nid);
        window._synthNodes.add(nid);
        if (kind==='northSvc') window._northSvcNodes.add(nid);
        if (kind==='nsBridge' || kind==='t3Local') window._nsBridgeNodes.add(nid);
        if (kind==='hbs') window._hbsNodes.add(nid);
        if (kind==='vfOst') window._vfOstNodes.add(nid);
        if (kind==='cargoW') window._cargoWNodes.add(nid);
        const snap=nearestBand(lat,lng);
        if (snap && snap[1] < (kind==='hbs'||kind==='vfOst'||kind==='cargoW'?110:130)){
          const sc = snap[1] * (kind==='northSvc' ? 1.25 : kind==='hbs' ? 0.95 : kind==='vfOst' ? 0.90 : kind==='cargoW' ? 0.86 : 1.05);
          link(nid, snap[0], Math.max(6, sc));
        }
      }
      for (let i=0;i<chain.length-1;i++){
        const a=chain[i], b=chain[i+1];
        let d = haversineBridge(nodes[a], nodes[b]);
        if (kind==='northSvc') d *= 1.12;
        if (kind==='hbs') d *= 0.88;
        if (kind==='vfOst') d *= 0.86;
        if (kind==='cargoW') d *= 0.82;
        link(a,b, d);
      }
    }
    // Explicit central-Vorfeld → T3 stand-apron bridges (avoid forcing the big southern loop for T2→T3)
    (function injectT3Bridges(){
      const nodes = window._roadNodes;
      const adj = window._roadAdj;
      const link = (a,b)=>{
        if (a===b) return;
        const la=nodes[a][0], lo=nodes[a][1], lb=nodes[b][0], ln=nodes[b][1];
        const R=6371000;
        const dLat=(lb-la)*Math.PI/180, dLng=(ln-lo)*Math.PI/180;
        const s1=Math.sin(dLat/2), s2=Math.sin(dLng/2);
        const h=s1*s1+Math.cos(la*Math.PI/180)*Math.cos(lb*Math.PI/180)*s2*s2;
        const d=2*R*Math.atan2(Math.sqrt(h), Math.sqrt(1-h));
        const w = Math.max(10, d);
        adj[a].push([b,w]); adj[b].push([a,w]);
      };
      // Find mid-corridor synthetic bottom node (lat/lng approx 50.0352, 8.5800)
      let mid = -1;
      for (let i=15520;i<nodes.length && mid<0;i++){
        const [la,ln]=nodes[i];
        if (Math.abs(la-50.0352)<0.0005 && Math.abs(ln-8.5800)<0.0005) mid=i;
      }
      // Top of the real G5 stand chain (lat ~50.0343, lng ~8.5843)
      let g5top = -1;
      for (let i=0;i<nodes.length;i++){
        const [la,ln]=nodes[i];
        if (Math.abs(la-50.034275)<0.0005 && Math.abs(ln-8.584305)<0.0005){ g5top=i; break; }
      }
      if (mid>=0 && g5top>=0) link(mid, g5top);
    })();

    function haversineBridge(a,b){
      const R=6371000;
      const dLat=(b[0]-a[0])*Math.PI/180, dLng=(b[1]-a[1])*Math.PI/180;
      const s1=Math.sin(dLat/2), s2=Math.sin(dLng/2);
      const h=s1*s1+Math.cos(a[0]*Math.PI/180)*Math.cos(b[0]*Math.PI/180)*s2*s2;
      return 2*R*Math.atan2(Math.sqrt(h), Math.sqrt(1-h));
    }
  })();

  // Deep terminal corridors (between piers / building side) — used by apron-prefer A*
  window._isDeepTerminal = function(lat, lng){
    // —— T3: ONLY pier/building spines — keep open stand apron + N→S corridor free ——
    // J pier building spine (diagonal SE–NW labels); open apron is south (~lat lower)
    if (lng >= 8.5700 && lng <= 8.5785 && lat >= 50.0299 && lat <= 50.0324){
      // exclude southern stand fringe ( aircraft side )
      const t = (lng - 8.5700) / (8.5785 - 8.5700); // 0@W .. 1@E
      const spineLat = 50.03195 - t * 0.00185; // ~J14 west → J1 east
      if (Math.abs(lat - spineLat) < 0.00055) return true;
    }
    // H pier building core (north of stands H)
    if (lng >= 8.5778 && lng <= 8.5812 && lat >= 50.0332 && lat <= 50.0350) return true;
    // G pier building core (north of stands G) — not G stand apron face ~50.0325
    if (lng >= 8.5838 && lng <= 8.5895 && lat >= 50.0336 && lat <= 50.0362) return true;
    // T3 headhouse / connector cut-through (not south open apron corridor)
    if (lng >= 8.5795 && lng <= 8.5875 && lat >= 50.0348 && lat <= 50.0360) return true;

    if (lng < 8.561 || lng > 8.593 || lat < 50.0445 || lat > 50.0525) return false;
    // T1 B/C pier + inter-pier corridors (building-side cyan cut-through)
    // Open apron south of ~50.04755 stays free (user yellow path band)
    if (lng >= 8.571 && lng <= 8.5855) return lat >= 50.04755;
    // A pier cores / Abfertigung cut-through (not outer A20–A40 apron face)
    if (lng >= 8.561 && lng < 8.571) return lat >= 50.04715;
    // T2 D/E: only hard building footprint — keep open apron approaches usable
    if (lng > 8.5855 && lng <= 8.593) {
      return lat >= 50.0502 && lat <= 50.0522 && lng >= 8.587 && lng <= 8.5915;
    }
    return false;
  };

  // Aircraft movement / taxiway (Rollfeld) — GSE must stay on gray service roads
  window._isRollfeld = function(lat, lng){
    // Carve GSE service belts out of aircraft area (match synthetic cargoW/HBS/NS spines)
    // Cargo F truck / service belt (north and among stands + stand face)
    if (lng >= 8.532 && lng <= 8.552 && lat >= 50.0390 && lat <= 50.0438) return false;
    // Cargo E–W service corridors (truck lanes N of open taxi, multiple belts)
    if (lng >= 8.548 && lng <= 8.565 && lat >= 50.0400 && lat <= 50.0445) return false;
    // West drop HBS → cargo service (building-side lane, not open taxi)
    if (lng >= 8.560 && lng <= 8.565 && lat >= 50.0418 && lat <= 50.0466) return false;
    // Thin NS GSE bridges T2↔T3 (synthetic + real service)
    if (lat >= 50.0335 && lat <= 50.0475){
      if (Math.abs(lng - 8.5910) < 0.0016) return false;
      if (Math.abs(lng - 8.5828) < 0.0014) return false;
      if (Math.abs(lng - 8.5750) < 0.0015) return false;
    }
    // HBS fringe (main + south HBS belts)
    if (lat >= 50.0452 && lat <= 50.0479 && lng >= 8.552 && lng <= 8.595) return false;
    // L/N/M taxi field south of HBS between Cargo East ↔ Vorfeld Ost
    if (lng >= 8.550 && lng <= 8.593 && lat >= 50.0340 && lat <= 50.04510) return true;
    // Grass/taxi cut just east of cargo stands (screenshot cyan off-road)
    if (lng >= 8.546 && lng < 8.550 && lat >= 50.0365 && lat <= 50.0398) return true;
    // Deep runway-side taxi south of cargo/T1
    if (lng >= 8.540 && lng <= 8.595 && lat >= 50.0280 && lat < 50.0340) return true;
    return false;
  };

  // Public outer roads (Autobahn / city ring) — avoid for Vorfeld navigation
  window._isOuterPublic = function(lat, lng){
    if (lat > 50.0536) return true;
    if (lat < 50.0175) return true;
    if (lng < 8.510) return true;
    if (lng > 8.603) return true;
    // NW motorway / Cargo City outer
    if (lat > 50.0518 && lng < 8.542) return true;
    // East of T2 apron toward Autobahn
    if (lng > 8.597 && lat > 50.042) return true;
    // North face public access spine above T1/T2 structures
    if (lat > 50.0524 && lng > 8.555 && lng < 8.595) return true;
    return false;
  };
  // Abfertigung / pier-face service roads — only when start/dest near that stand
    window._isAbfertigungRoad = function(lat, lng){
    if (window._isDeepTerminal(lat, lng)) return true;
    // T3 stand face fringe (last meters only)
    // J aircraft-side stand band just south/along pier
    if (lng >= 8.570 && lng <= 8.5785 && lat >= 50.0296 && lat <= 50.0316) return true;
    // H stand face
    if (lng >= 8.5775 && lng <= 8.5815 && lat >= 50.0324 && lat <= 50.0336) return true;
    // G stand face
    if (lng >= 8.5830 && lng <= 8.5905 && lat >= 50.0318 && lat <= 50.0335) return true;
    return false;
  };
  // Preferred open Vorfeld / outer service ring (yellow-line style)
    window._isApronPreferred = function(lat, lng){
    if (window._isOuterPublic(lat, lng)) return false;
    if (window._isDeepTerminal(lat, lng)) return false;
    if (window._isRollfeld && window._isRollfeld(lat, lng)) return false;
    // MAIN T1/T2 apron E–W HBS south of A–E piers (keep north of building face)
    if (lng > 8.552 && lng < 8.596 && lat > 50.0428 && lat < 50.04695) return true;
    // Vorfeld Ost service lanes (south of terminal fence, N of HBS)
    if (lng >= 8.579 && lng <= 8.5945 && lat >= 50.04695 && lat <= 50.0506) return true;
    // T2↔T3 freies Vorfeld (exclude pier depths via deep check above)
    if (lng > 8.560 && lng < 8.595 && lat >= 50.0338 && lat <= 50.0465) return true;
    // Cargo F GSE pads + truck lanes (not taxi)
    if (lng > 8.532 && lng <= 8.552 && lat >= 50.0388 && lat <= 50.0438) return true;
    // West apron / A-pier south face / V stands (north belt only)
    if (lng > 8.518 && lng < 8.562 && lat > 50.0435 && lat < 50.0485) return true;
    // Cargo E–W service corridor (north of rollfeld)
    if (lng > 8.550 && lng < 8.565 && lat >= 50.0415 && lat <= 50.0445) return true;
    // T3 OPEN apron south of G/H/J piers (service / taxi move)
    if (lng > 8.555 && lng < 8.595 && lat >= 50.0270 && lat < 50.0315) return true;
    // T3 SE service spur toward G gates from open apron
    if (lng >= 8.582 && lng <= 8.594 && lat >= 50.0305 && lat < 50.0335) return true;
    return false;
  };
})();

function haversine(a, b) {
  const R = 6371000;
  const dLat = (b[0] - a[0]) * Math.PI / 180;
  const dLng = (b[1] - a[1]) * Math.PI / 180;
  const sinDlat = Math.sin(dLat/2), sinDlng = Math.sin(dLng/2);
  const h = sinDlat*sinDlat + Math.cos(a[0]*Math.PI/180)*Math.cos(b[0]*Math.PI/180)*sinDlng*sinDlng;
  return 2 * R * Math.atan2(Math.sqrt(h), Math.sqrt(1-h));
}

function nearestRoadNode(lat, lng, preferMain, avoidTunnel=false){
  const nodes = window._roadNodes;
  const adj = window._roadAdj;
  const tunnelNodes = window._tunnelNodes || new Set();
  const isDeep = window._isDeepTerminal || (()=>false);
  let best=0, bd=Infinity, bestAny=0, bdAny=Infinity;
  const cos = Math.cos(lat*Math.PI/180);
  for (let i=0;i<nodes.length;i++){
    const nlat = nodes[i][0], nlng = nodes[i][1];
    const dy=(nlat-lat)*111320;
    const dx=(nlng-lng)*111320*cos;
    let d = Math.sqrt(dy*dy+dx*dx);
    if (preferMain && adj && adj[i] && adj[i].length){
      // Pushback-/Driveway-Stubs hoch gewichten → normale Betriebswege bevorzugen
      let minRatio = 99;
      for (let k=0;k<adj[i].length;k++){
        const j = adj[i][k][0], w = adj[i][k][1];
        const gd = roadDistM(i,j) || 0.1;
        const r = w / gd;
        if (r < minRatio) minRatio = r;
      }
      if (minRatio > 4.0) d += 80;       // typ. pushback driveway
      else if (minRatio > 2.2) d += 45;
      else if (minRatio > 1.5) d += 18;
    }
    if (d < bdAny){ bdAny=d; bestAny=i; }
    if (avoidTunnel){
      if (tunnelNodes.has(i)) d += 900; // never seed on tunnel mouths for T1/T2
      const isOuter = window._isOuterPublic || (()=>false);
      const isAbf = window._isAbfertigungRoad || (()=>false);
      const isApr = window._isApronPreferred || (()=>false);
      if (isOuter(nlat, nlng)) d += 420;
      // A–E / ops: prefer apron-side approach (south of T1 gates / freies Vorfeld)
      if (isDeep(nlat, nlng)) d += 160;
      // Abfertigung stubs only cheap when we're already next to this stand
      if (isAbf(nlat, nlng) && Math.sqrt(dy*dy+dx*dx) > 160) d += 120;
      // Prefer open apron band (gray service roads)
      if (isApr(nlat, nlng)) d -= 35;
      // Prefer slightly south of gate building coords (apron in front of aircraft)
      if (dy > 12) d += 90 + dy*1.2;          // north of stand → building side
      else if (dy < -8 && dy > -140) d -= 22; // mild bonus: apron just south of target
    }
    if (d < bd){ bd=d; best=i; }
  }
  // Fallback: if no apron/surface node is reasonably close, return the true nearest
  if (avoidTunnel && bd > 420 && bdAny < bd*0.45) return bestAny;
  return best;
}

function roadDistM(i,j){
  const a=window._roadNodes[i], b=window._roadNodes[j];
  return haversine(a,b);
}

function astarRoad(startIdx, endIdx, opts){
  if (startIdx===endIdx) return {path:[startIdx], dist:0};
  opts = opts || {};
  const apronPrefer = !!opts.apronPrefer;
  const banTunnel = !!opts.banTunnel;
  const tunnelPairs = window._tunnelPairs || new Set();
  const destLL = opts.destLL || window._roadNodes[endIdx];
  const isDeep = window._isDeepTerminal || (()=>false);
  const adj=window._roadAdj;
  const N=window._roadNodes.length;
  const gScore=new Float64Array(N); gScore.fill(1e18);
  const came=new Int32Array(N); came.fill(-1);
  const closed=new Uint8Array(N);
  const heap=[];
  const push=(f,i)=>{ heap.push([f,i]); let c=heap.length-1; while(c>0){ const p=(c-1)>>1; if(heap[p][0]<=heap[c][0]) break; const t=heap[p]; heap[p]=heap[c]; heap[c]=t; c=p; } };
  const pop=()=>{ const top=heap[0]; const last=heap.pop(); if(heap.length){ heap[0]=last; let c=0; for(;;){ let l=c*2+1,r=l+1,s=c; if(l<heap.length&&heap[l][0]<heap[s][0]) s=l; if(r<heap.length&&heap[r][0]<heap[s][0]) s=r; if(s===c) break; const t=heap[c]; heap[c]=heap[s]; heap[s]=t; c=s; } } return top; };

  gScore[startIdx]=0;
  push(roadDistM(startIdx,endIdx), startIdx);
  while(heap.length){
    const [f,u]=pop();
    if (closed[u]) continue;
    if (u===endIdx){
      const path=[u]; let cur=u;
      while(came[cur]!==-1){ cur=came[cur]; path.push(cur); }
      path.reverse();
      return {path, dist:gScore[u]};
    }
    closed[u]=1;
    const gu=gScore[u];
    const nbrs=adj[u];
    for (let k=0;k<nbrs.length;k++){
      const v=nbrs[k][0];
      let w=nbrs[k][1];
      if (closed[v]) continue;
      // Hard ban OSM tunnels except when destination is T3 (G/H/J)
      if (banTunnel){
        const tk = u<v ? u+","+v : v+","+u;
        if (tunnelPairs.has(tk)) continue;
      }
      if (apronPrefer){
        const na=window._roadNodes[u], nb=window._roadNodes[v];
        const mlat=(na[0]+nb[0])*0.5, mlng=(na[1]+nb[1])*0.5;
        const isOuter = window._isOuterPublic || (()=>false);
        const isAbf = window._isAbfertigungRoad || (()=>false);
        const isApr = window._isApronPreferred || (()=>false);
        const startLL = opts.startLL || null;
        const geom = roadDistM(u,v);
        // Long hops = open-apron / taxiway diagonals (green grass on map) — stay on gray roads
        if (geom > 95){
          const over = geom / 95;
          w = w * Math.pow(over, 1.45) + (geom - 95) * 1.1;
        }
        if (geom > 170) w = w * 2.4 + 90;

        const isRoll = window._isRollfeld || (()=>false);
        // GSE ban taxi/rollfeld edges UNLESS edge belongs to service spines (HBS/cargo/NS/T3)
        if (isRoll(mlat, mlng) || isRoll(na[0], na[1]) || isRoll(nb[0], nb[1])){
          const syn = window._synthNodes;
          const onSpine = (syn && (syn.has(u) || syn.has(v)))
            || (window._cargoWNodes && (window._cargoWNodes.has(u) || window._cargoWNodes.has(v)))
            || (window._hbsNodes && (window._hbsNodes.has(u) || window._hbsNodes.has(v)))
            || (window._vfOstNodes && (window._vfOstNodes.has(u) || window._vfOstNodes.has(v)))
            || (window._nsBridgeNodes && (window._nsBridgeNodes.has(u) || window._nsBridgeNodes.has(v)))
            || (window._northSvcNodes && (window._northSvcNodes.has(u) || window._northSvcNodes.has(v)));
          if (!onSpine) continue;
          // spine crossing rollfeld band: still pull back a bit (prefer true service)
          w = w * 1.15 + 8;
        }

        // Local T1/T2 apron hop (B20 etc.): stay north on HBS, no south loop across Rollfeld
        const t1Local = !!(startLL && destLL
          && startLL[0] > 50.0435 && destLL[0] > 50.0435
          && startLL[0] < 50.0525 && destLL[0] < 50.0525
          && Math.min(startLL[1], destLL[1]) > 8.560
          && Math.max(startLL[1], destLL[1]) < 8.596);
        if (t1Local && mlat < 50.0420){
          w = w * 6.5 + 180;
        }

        // Leave the airport fence (public outer roads) — strong detour
        if (isOuter(mlat, mlng)){
          w = w*50 + 250;
        } else if (isDeep(mlat, mlng)){
          const nearD = haversine([mlat,mlng], destLL);
          const nearS = startLL ? haversine([mlat,mlng], startLL) : 1e9;
          // Cheap only as local stand approach / short exit from current pier GPS
          const nearEnd = Math.min(nearD, nearS);
          if (nearEnd > 140) w = w*85 + 160;
          else if (nearEnd > 70) w = w*10 + 35;
          else w = w*1.55 + 5;
          // Dest apron/V stands must not crawl pier interiors end-to-end
          if (destLL && destLL[0] < 50.0505 && destLL[1] > 8.578 && nearD > 220 && nearS > 90){
            w = w * 1.35 + 40;
          }
        } else if (isAbf(mlat, mlng)){
          const nearD = haversine([mlat,mlng], destLL);
          const nearS = startLL ? haversine([mlat,mlng], startLL) : 1e9;
          if (nearD <= 200 || nearS <= 160){
            w = w*1.05 + 1; // stand face allowed near ends
          } else {
            w = w*18 + 50;
          }
        } else if (isApr(mlat, mlng)){
          w *= 0.78;
          // Prefer painted E–W HBS south of T1 piers (cars)
          if (mlat >= 50.0452 && mlat <= 50.0474 && mlng >= 8.562 && mlng <= 8.593){
            w *= 0.48;
          }
          // T2↔T3 main N–S only when trip actually spans N↔S
          const needNS = !!(startLL && Math.abs(startLL[0] - destLL[0]) > 0.0075);
          if (mlng >= 8.578 && mlng <= 8.593 && mlat >= 50.0338 && mlat <= 50.0490){
            w *= needNS ? 0.52 : 1.15;
          }
          const hbs = window._hbsNodes;
          if (hbs && (hbs.has(u) || hbs.has(v))){
            w *= t1Local ? 0.55 : 0.85;
          }
          const vf = window._vfOstNodes;
          if (vf && (vf.has(u) || vf.has(v))){
            // Prefer for V-stand / Ost apron trips; mild elsewhere (still better than landside)
            const destV = !!(destLL && destLL[1] >= 8.579 && destLL[1] <= 8.595 && destLL[0] >= 50.0468 && destLL[0] <= 50.051);
            const startV = !!(startLL && startLL[1] >= 8.579 && startLL[1] <= 8.595 && startLL[0] >= 50.0468 && startLL[0] <= 50.051);
            w *= (destV || startV || t1Local) ? 0.52 : 0.90;
          }
          const cw = window._cargoWNodes;
          if (cw && (cw.has(u) || cw.has(v))){
            const destC = !!(destLL && destLL[1] <= 8.555 && destLL[0] <= 50.0435);
            const startC = !!(startLL && startLL[1] <= 8.555 && startLL[0] <= 50.0435);
            const nearCargo = !!(destLL && destLL[1] >= 8.532 && destLL[1] <= 8.560 && destLL[0] >= 50.036 && destLL[0] <= 50.044);
            const startNearC = !!(startLL && startLL[1] >= 8.532 && startLL[1] <= 8.565 && startLL[0] >= 50.038 && startLL[0] <= 50.046);
            w *= (destC || startC || nearCargo || startNearC) ? 0.42 : 0.88;
          }
          const nsb = window._nsBridgeNodes;
          if (nsb && (nsb.has(u) || nsb.has(v))){
            if (!needNS || t1Local) w = w * 8.0 + 200; // do not ride NS spine for B20-class hops
            else w *= 0.70;
          }
          const ns = window._northSvcNodes;
          if (ns && (ns.has(u) || ns.has(v))){
            const nearV = (ll)=> ll && ll[1] >= 8.552 && ll[1] <= 8.562 && ll[0] >= 50.038 && ll[0] <= 50.044;
            const nearJ = (ll)=> ll && ll[1] >= 8.567 && ll[1] <= 8.580 && ll[0] >= 50.0295 && ll[0] <= 50.0335;
            const localVJ = (nearV(startLL) && nearJ(destLL)) || (nearJ(startLL) && nearV(destLL));
            if (!localVJ) w = w * 6.5 + 120;
            else w *= 0.70;
          }
          if (mlat < 50.0316 && mlng >= 8.555 && mlng <= 8.595){
            const startN = startLL && startLL[0] > 50.040;
            const destT3 = destLL[0] < 50.037 && destLL[1] > 8.568;
            if (startN && destT3) w = w * 2.4 + 80;
            else w *= 0.82;
          }
        }
      }
      const ng=gu+w;
      if (ng < gScore[v]){
        came[v]=u; gScore[v]=ng;
        push(ng+roadDistM(v,endIdx), v);
      }
    }
  }
  return null;
}

/** Densify path so Leaflet redraw on zoom stays smooth (no broken corners). */
function densifyLatLngs(latlngs, stepM){
  if (!latlngs || latlngs.length < 2) return latlngs || [];
  const out = [latlngs[0]];
  for (let i=1;i<latlngs.length;i++){
    const a = latlngs[i-1], b = latlngs[i];
    const d = haversine(a,b);
    const n = Math.max(1, Math.ceil(d / (stepM || 22)));
    for (let k=1;k<=n;k++){
      const t = k/n;
      out.push([a[0] + (b[0]-a[0])*t, a[1] + (b[1]-a[1])*t]);
    }
  }
  return out;
}

function isTerminalASecondPier(id){
  // A26–A40: prefer Hauptbetriebsstraße instead of Pushback-/Stand-Einfahrten
  if (!id || id[0] !== 'A') return false;
  const n = parseInt(id.replace(/\D/g,''), 10);
  return n >= 26 && n <= 40;
}

function isOpsDestination(destMeta){
  if (!destMeta) return false;
  const cat = destMeta.cat || '';
  if (cat === 'terminal' || cat === 'vorfeld-n' || cat === 'vorfeld-s' || cat === 'cargo' || cat === 'ga') return true;
  const id = destMeta.id || '';
  // A–E piers, T3 G/H, V stands, cargo codes
  return /^[ABCDEGHJV]|^(V|CARGO|GAT)/i.test(id);
}
/** T3 piers G/H/J — only destinations allowed to use underground tunnels / NS spines when no pure-apron path exists. */
function isT3Destination(destMeta, toLatLng){
  if (destMeta){
    const id = destMeta.id || '';
    if (/^[GHJ]/i.test(id)) return true;
    const la = +destMeta.lat, ln = +destMeta.lng;
    if (isFinite(la) && isFinite(ln) && la < 50.0375 && ln > 8.568 && ln < 8.595) return true;
  }
  // geometric fallback when destMeta missing/incomplete (map-click / bare coords)
  if (toLatLng && toLatLng.length >= 2){
    const la = +toLatLng[0], ln = +toLatLng[1];
    if (isFinite(la) && isFinite(ln) && la < 50.0375 && ln > 8.565 && ln < 8.596) return true;
  }
  return false;
}
/** Project GPS/stand onto nearest graph EDGE centerline so cyan line stays on roads. */
function projectOntoRoad(lat, lng, preferMain, avoidTunnel, preferSouthExit){
  const nodes = window._roadNodes;
  const adj = window._roadAdj;
  const tunnelPairs = window._tunnelPairs || new Set();
  if (!nodes || !adj) {
    const i = nearestRoadNode(lat, lng, preferMain, avoidTunnel);
    return { point:[lat,lng], entry:i, exit:i, t:0, dist:0, a:i, b:i };
  }
  const seed = nearestRoadNode(lat, lng, preferMain, avoidTunnel);
  const cand = new Set([seed]);
  // Expand ~3 hops + geometric neighborhood so stand GPS snaps to the gray centerline, not a stub node
  const cos = Math.cos(lat*Math.PI/180);
  const nearList = [];
  for (let i=0;i<nodes.length;i++){
    const dy=(nodes[i][0]-lat)*111320, dx=(nodes[i][1]-lng)*111320*cos;
    const d=dy*dy+dx*dx;
    if (d < 320*320) nearList.push([d,i]);
  }
  nearList.sort((a,b)=>a[0]-b[0]);
  for (let k=0;k<Math.min(80, nearList.length);k++) cand.add(nearList[k][1]);
  const q=[seed];
  for (let depth=0; depth<3; depth++){
    const nq=[];
    for (const u of q){
      const nbrs=adj[u]||[];
      for (let k=0;k<nbrs.length;k++){
        const v=nbrs[k][0];
        if (!cand.has(v)){ cand.add(v); nq.push(v); }
      }
    }
    q.length=0; Array.prototype.push.apply(q, nq);
  }
  let best = { dist:Infinity, point:[lat,lng], a:seed, b:seed, t:0 };
  const seen = new Set();
  for (const u of cand){
    const nbrs = adj[u]||[];
    for (let k=0;k<nbrs.length;k++){
      const v = nbrs[k][0];
      const key = u<v ? u+','+v : v+','+u;
      if (seen.has(key)) continue;
      seen.add(key);
      // Never snap onto tunnel edges for surface apron routing
      if (avoidTunnel && tunnelPairs.has(key)) continue;
      const A=nodes[u], B=nodes[v];
      const abx=(B[1]-A[1])*111320*cos, aby=(B[0]-A[0])*111320;
      const apx=(lng-A[1])*111320*cos, apy=(lat-A[0])*111320;
      const ab2 = abx*abx+aby*aby;
      let t = ab2>1e-6 ? (apx*abx+apy*aby)/ab2 : 0;
      if (t<0) t=0; else if (t>1) t=1;
      const plat = A[0] + (B[0]-A[0])*t;
      const plng = A[1] + (B[1]-A[1])*t;
      const dy=(plat-lat)*111320, dx=(plng-lng)*111320*cos;
      let d = Math.sqrt(dy*dy+dx*dx);
      // Prefer surface/apron edges when ops-routing
      if (avoidTunnel){
        const isOuter=window._isOuterPublic||(()=>false);
        const isDeep=window._isDeepTerminal||(()=>false);
        const isApr=window._isApronPreferred||(()=>false);
        const isAbf=window._isAbfertigungRoad||(()=>false);
        const mlat=(A[0]+B[0])*0.5, mlng=(A[1]+B[1])*0.5;
        if (isOuter(mlat,mlng)) d += 320;
        const isRoll = window._isRollfeld || (()=>false);
        if (isRoll(mlat,mlng) || isRoll(A[0],A[1]) || isRoll(B[0],B[1])) d += 520;
        if (isDeep(mlat,mlng)){
          if (d < 70) d += 5;
          else if (d < 160) d += 45;
          else d += 175;
        }
        if (isApr(mlat,mlng)) d -= 35;
        // Prefer synthetic HBS / Vorfeld Ost / Cargo road scaffolds
        const hbsN = window._hbsNodes, vfN = window._vfOstNodes, cwN = window._cargoWNodes;
        if (hbsN && (hbsN.has(u)||hbsN.has(v))) d -= 18;
        if (vfN && (vfN.has(u)||vfN.has(v))) d -= 22;
        if (cwN && (cwN.has(u)||cwN.has(v))) d -= 26;
        // Prefer true driveable short segments (centerlines) over long grass hops
        const glen = Math.sqrt(ab2);
        if (glen > 90) d += (glen-90)*0.35;
        if (glen > 160) d += (glen-160)*0.8;
        // Penalize far abfertigung stubs except when standing at the gate
        if (isAbf(mlat,mlng) && d > 70) d += 55;
        // Prefer edges with more connectivity (main spine vs stub)
        const deg = (adj[u]?adj[u].length:0)+(adj[v]?adj[v].length:0);
        if (deg >= 6) d -= 8;
        else if (deg <= 2) d += 10;
        // Only when explicitly leaving pier toward apron — bias snap south to HBS
        if (preferSouthExit && (isDeep(mlat,mlng) || isAbf(mlat,mlng))){
          if (plat < lat - 0.00005) d -= 18;
          if (plat > lat + 0.00010) d += 30;
        }
      }
      if (d < best.dist){
        best = { dist:d, point:[plat,plng], a:u, b:v, t };
      }
    }
  }
  const da = haversine(best.point, nodes[best.a]);
  const db = haversine(best.point, nodes[best.b]);
  const entry = da <= db ? best.a : best.b;
  const exit = entry === best.a ? best.b : best.a;
  return { point: best.point, entry, exit: best.a !== best.b ? exit : entry, t: best.t, dist: best.dist, a:best.a, b:best.b };
}

function computeRoute(fromLatLng, toLatLng, destMeta){
  // Always apron/Betriebswege; hard-ban tunnels except T3 (G/H/J)
  const preferTo = true;
  const ops = isOpsDestination(destMeta);
  const t3 = isT3Destination(destMeta, toLatLng);
  // Long N→S hop that ends on T3 apron also needs NS service spines
  const needNS = t3 || (fromLatLng && toLatLng && fromLatLng[0] > 50.040 && toLatLng[0] < 50.0375
    && Math.min(fromLatLng[1], toLatLng[1]) > 8.560 && Math.max(fromLatLng[1], toLatLng[1]) < 8.600);
  const banTunnel = !t3; // user: never tunnels on apron except T3 mandatory
  const avoidTunnel = true; // snap always prefers surface centerlines
  const destCat = (destMeta && destMeta.cat) || '';
  const destVorfeld = destCat.startsWith('vorfeld') || /^V\d/i.test((destMeta&&destMeta.id)||'');
  const hopM = haversine(fromLatLng, toLatLng);
  const destFarApron = destVorfeld || hopM > 480 || (ops && toLatLng[1] > 8.578 && hopM > 320);
  const isDeepf = window._isDeepTerminal || (()=>false);
  const isAprf = window._isApronPreferred || (()=>false);
  let fromSnap = projectOntoRoad(fromLatLng[0], fromLatLng[1], true, avoidTunnel, !!destFarApron);
  let toSnap = projectOntoRoad(toLatLng[0], toLatLng[1], preferTo, avoidTunnel, false);
  // If GPS is sitting on taxi/rollfeld, snap north onto GSE service (HBS/cargo)
  const isRollf = window._isRollfeld || (()=>false);
  if (isRollf(fromSnap.point[0], fromSnap.point[1]) || isRollf(fromLatLng[0], fromLatLng[1])){
    const altN = projectOntoRoad(Math.min(fromLatLng[0] + 0.0016, 50.0438), fromLatLng[1], true, true, false);
    if (altN && !isRollf(altN.point[0], altN.point[1]) && altN.dist < 380){
      fromSnap = Object.assign({}, altN, { _leaveRoll:true, _gps:fromLatLng });
    } else {
      const altN2 = projectOntoRoad(50.0422, fromLatLng[1], true, true, false);
      if (altN2 && !isRollf(altN2.point[0], altN2.point[1])) fromSnap = Object.assign({}, altN2, { _leaveRoll:true, _gps:fromLatLng });
    }
  }
  if (isRollf(toSnap.point[0], toSnap.point[1])){
    const altT = projectOntoRoad(Math.min(toLatLng[0] + 0.0012, 50.0435), toLatLng[1], true, true, false);
    if (altT && !isRollf(altT.point[0], altT.point[1]) && altT.dist < 300) toSnap = altT;
  }
  // Vorfeld stands: approach on apron face (south of stand), not building/tunnel north
  if (destVorfeld || (ops && toLatLng[1] > 8.578 && toLatLng[0] < 50.051 && hopM > 200)){
    const alt = projectOntoRoad(toLatLng[0] - 0.00055, toLatLng[1], true, true, false);
    if (alt && alt.dist < 220){
      const midLat = (window._roadNodes[alt.a][0]+window._roadNodes[alt.b][0])*0.5;
      const midLng = (window._roadNodes[alt.a][1]+window._roadNodes[alt.b][1])*0.5;
      const curMidLat = (window._roadNodes[toSnap.a][0]+window._roadNodes[toSnap.b][0])*0.5;
      const better = (!isDeepf(midLat,midLng) && (isAprf(midLat,midLng) || midLat < curMidLat - 0.0002))
        || (isDeepf(curMidLat, (window._roadNodes[toSnap.a][1]+window._roadNodes[toSnap.b][1])*0.5) && !isDeepf(midLat,midLng));
      if (better && haversine(alt.point, toLatLng) < haversine(toSnap.point, toLatLng) + 90){
        toSnap = alt;
      }
    }
  }
  // Leaving a pier GPS toward far apron/V: exit south onto HBS (not short same-pier hops)
  if (ops && destFarApron && isDeepf(fromSnap.point[0], fromSnap.point[1])){
    const altS = projectOntoRoad(fromLatLng[0] - 0.00110, fromLatLng[1], true, true, true);
    if (altS && altS.dist < 260 && !isDeepf(altS.point[0], altS.point[1])){
      fromSnap = Object.assign({}, altS, { _leaveDeep:true, _gps:fromLatLng });
    }
  }
  // Multi-source A*: both ends of snapped edges → path stays on road geometry
  const starts = [fromSnap.a, fromSnap.b].filter((v,i,a)=>a.indexOf(v)===i);
  const ends = [toSnap.a, toSnap.b].filter((v,i,a)=>a.indexOf(v)===i);
  const optsBase = {
    apronPrefer: true,
    banTunnel,
    destLL: toLatLng,
    startLL: fromLatLng
  };
  let bestRes = null, bestS = starts[0], bestT = ends[0], bestExtra = Infinity;
  function runPairs(opts){
    let br=null, bs=starts[0], bt=ends[0], be=Infinity;
    for (const s of starts){
      for (const t of ends){
        const res = astarRoad(s, t, opts);
        if (!res) continue;
        const extra = haversine(fromSnap.point, window._roadNodes[s]) + haversine(toSnap.point, window._roadNodes[t]);
        // Prefer geometric-shortest among apron-legal paths (roadDist already weighted)
        const score = res.dist + extra * 1.05;
        if (score < be){ be=score; br=res; bs=s; bt=t; }
      }
    }
    return {br, bs, bt, be};
  }
  let pack = runPairs(optsBase);
  // T3 /NS corridor: if apronPrefer blocks NS spines, retry allowing tunnels then full graph
  if (!pack.br && (t3 || needNS)){
    pack = runPairs(Object.assign({}, optsBase, { banTunnel:false }));
  }
  if (!pack.br && (t3 || needNS)){
    pack = runPairs(Object.assign({}, optsBase, { banTunnel:false, apronPrefer:false }));
  }
  // Last chance: any N↔S trip spanning the disconnected T2/T3 gap
  if (!pack.br && fromLatLng && toLatLng && Math.abs(fromLatLng[0]-toLatLng[0]) > 0.010){
    pack = runPairs(Object.assign({}, optsBase, { banTunnel:false, apronPrefer:false }));
  }
  bestRes = pack.br; bestS = pack.bs; bestT = pack.bt; bestExtra = pack.be;
  if (!bestRes){
    return {
      latlngs: densifyLatLngs([fromSnap.point, toSnap.point], 40),
      dist: haversine(fromSnap.point, toSnap.point),
      viaRoads:false,
      startSnap: fromSnap.point,
      endSnap: toSnap.point,
      _snapKey: fromSnap.a+','+fromSnap.b
    };
  }
  // Polyline ONLY on road centerlines (no GPS/building chord beside the road)
  const raw = [];
  if (fromSnap._leaveDeep && fromSnap._gps){
    // Anchor on closest surface edge at GPS then hold onto apron leave snap
    const local = projectOntoRoad(fromSnap._gps[0], fromSnap._gps[1], false, true, false);
    if (local && local.dist < 80 && !isDeepf(local.point[0], local.point[1])){
      raw.push(local.point);
    } else if (local && local.dist < 55){
      // still pier road under GPS — accept short first meters, A*staging is already apron
      raw.push(local.point);
    }
  }
  raw.push(fromSnap.point);
  for (const i of bestRes.path) raw.push(window._roadNodes[i]);
  raw.push(toSnap.point);
  // Tiny last-meter stub into stand coordinates only if far from road
  if (haversine(toSnap.point, toLatLng) > 14) raw.push(toLatLng);

  // Drop near-duplicate consecutive vertices
  const clean=[raw[0]];
  for (let i=1;i<raw.length;i++){
    if (haversine(clean[clean.length-1], raw[i]) > 0.35) clean.push(raw[i]);
  }

  let geo = 0;
  geo += haversine(fromSnap.point, window._roadNodes[bestS]);
  geo += haversine(toSnap.point, window._roadNodes[bestT]);
  for (let i=0;i<bestRes.path.length-1;i++) geo += roadDistM(bestRes.path[i], bestRes.path[i+1]);
  // Path may not start at bestS if multi-source chose equal start — clamp
  if (bestRes.path.length){
    geo = haversine(fromSnap.point, window._roadNodes[bestRes.path[0]]);
    for (let i=0;i<bestRes.path.length-1;i++) geo += roadDistM(bestRes.path[i], bestRes.path[i+1]);
    geo += haversine(window._roadNodes[bestRes.path[bestRes.path.length-1]], toSnap.point);
    if (haversine(toSnap.point, toLatLng) > 14) geo += haversine(toSnap.point, toLatLng);
  }

  // Edge keys on route for dynamic reroute when vehicle joins another road
  const edgeSet = new Set();
  edgeSet.add(fromSnap.a+','+fromSnap.b);
  edgeSet.add(fromSnap.b+','+fromSnap.a);
  edgeSet.add(toSnap.a+','+toSnap.b);
  edgeSet.add(toSnap.b+','+toSnap.a);
  for (let i=0;i<bestRes.path.length-1;i++){
    const a=bestRes.path[i], b=bestRes.path[i+1];
    edgeSet.add(a+','+b); edgeSet.add(b+','+a);
  }

  return {
    latlngs: densifyLatLngs(clean, 14),
    dist: geo,
    viaRoads:true,
    roadDist:bestRes.dist,
    startSnap: fromSnap.point,
    endSnap: toSnap.point,
    _snapKey: fromSnap.a+','+fromSnap.b,
    _edgeSet: edgeSet,
    pathNodes: bestRes.path.slice()
  };
}


const POSITIONS = [
  {id:"V106", lat:50.049065, lng:8.592678, cat:"vorfeld-n", desc:"Vorfeld Ost · Stand"},
  {id:"V107", lat:50.050091, lng:8.592097, cat:"vorfeld-n", desc:"Vorfeld Ost · Stand"},
  {id:"V108", lat:50.048912, lng:8.592017, cat:"vorfeld-n", desc:"Vorfeld Ost · Stand"},
  {id:"V109", lat:50.049932, lng:8.591425, cat:"vorfeld-n", desc:"Vorfeld Ost · Stand"},
  {id:"V110", lat:50.048732, lng:8.591255, cat:"vorfeld-n", desc:"Vorfeld Ost · Stand"},
  {id:"V111", lat:50.049749, lng:8.590668, cat:"vorfeld-n", desc:"Vorfeld Ost · Stand"},
  {id:"V112", lat:50.048574, lng:8.590584, cat:"vorfeld-n", desc:"Vorfeld Ost · Stand"},
  {id:"V113", lat:50.049425, lng:8.589332, cat:"vorfeld-n", desc:"Vorfeld Ost · Stand"},
  {id:"V114", lat:50.048409, lng:8.589906, cat:"vorfeld-n", desc:"Vorfeld Ost · Stand"},
  {id:"V115", lat:50.049246, lng:8.588577, cat:"vorfeld-n", desc:"Vorfeld Ost · Stand"},
  {id:"V116", lat:50.048225, lng:8.589162, cat:"vorfeld-n", desc:"Vorfeld Ost · Stand"},
  {id:"V117", lat:50.049085, lng:8.587912, cat:"vorfeld-n", desc:"Vorfeld Ost · Stand"},
  {id:"V118", lat:50.048066, lng:8.588501, cat:"vorfeld-n", desc:"Vorfeld Ost · Stand"},
  {id:"V119", lat:50.048529, lng:8.585707, cat:"vorfeld-n", desc:"Vorfeld Ost · Stand"},
  {id:"V120", lat:50.04847, lng:8.58556, cat:"vorfeld-n", desc:"Vorfeld Ost · Stand"},
  {id:"V121", lat:50.048354, lng:8.584915, cat:"vorfeld-n", desc:"Vorfeld Ost · Stand"},
  {id:"V122", lat:50.048234, lng:8.584546, cat:"vorfeld-n", desc:"Vorfeld Ost · Stand"},
  {id:"V123", lat:50.048178, lng:8.584121, cat:"vorfeld-n", desc:"Vorfeld Ost · Stand"},
  {id:"V124", lat:50.047981, lng:8.583526, cat:"vorfeld-n", desc:"Vorfeld Ost · Stand"},
  {id:"V125", lat:50.047969, lng:8.583346, cat:"vorfeld-n", desc:"Vorfeld Ost · Stand"},
  {id:"V126", lat:50.047757, lng:8.58232, cat:"vorfeld-n", desc:"Vorfeld Ost · Stand"},
  {id:"V127", lat:50.047646, lng:8.582126, cat:"vorfeld-n", desc:"Vorfeld Ost · Stand"},
  {id:"V128", lat:50.047626, lng:8.581641, cat:"vorfeld-n", desc:"Vorfeld Ost · Stand"},
  {id:"V129", lat:50.047401, lng:8.58109, cat:"vorfeld-n", desc:"Vorfeld Ost · Stand"},
  {id:"V130", lat:50.047378, lng:8.580922, cat:"vorfeld-n", desc:"Vorfeld Ost · Stand"},
  {id:"V134", lat:50.044022, lng:8.570258, cat:"vorfeld-n", desc:"Vorfeld Nord · Stand"},
  {id:"V135", lat:50.043959, lng:8.569949, cat:"vorfeld-n", desc:"Vorfeld Nord · Stand"},
  {id:"V136", lat:50.043878, lng:8.569655, cat:"vorfeld-n", desc:"Vorfeld Nord · Stand"},
  {id:"V143", lat:50.045322, lng:8.562288, cat:"vorfeld-n", desc:"Vorfeld Nord · Stand"},
  {id:"V144", lat:50.045526, lng:8.563113, cat:"vorfeld-n", desc:"Vorfeld Nord · Stand"},
  {id:"V93", lat:50.049735, lng:8.600062, cat:"vorfeld-n", desc:"Vorfeld Ost · Stand"},
  {id:"V94", lat:50.049495, lng:8.598968, cat:"vorfeld-n", desc:"Vorfeld Ost · Stand"},
  {id:"V95", lat:50.04925, lng:8.598041, cat:"vorfeld-n", desc:"Vorfeld Ost · Stand"},
  {id:"V96", lat:50.049089, lng:8.596998, cat:"vorfeld-n", desc:"Vorfeld Ost · Stand"},
  {id:"V97", lat:50.04886, lng:8.596018, cat:"vorfeld-n", desc:"Vorfeld Ost · Stand"},
  {id:"V155", lat:50.041296, lng:8.558886, cat:"vorfeld-s", desc:"Vorfeld Süd · Stand"},
  {id:"V156", lat:50.041192, lng:8.558456, cat:"vorfeld-s", desc:"Vorfeld Süd · Stand"},
  {id:"V157", lat:50.041142, lng:8.55825, cat:"vorfeld-s", desc:"Vorfeld Süd · Stand"},
  {id:"V158", lat:50.04097, lng:8.557522, cat:"vorfeld-s", desc:"Vorfeld Süd · Stand"},
  {id:"V159", lat:50.040939, lng:8.557392, cat:"vorfeld-s", desc:"Vorfeld Süd · Stand"},
  {id:"V160", lat:50.040799, lng:8.556801, cat:"vorfeld-s", desc:"Vorfeld Süd · Stand"},
  {id:"V161", lat:50.040707, lng:8.556412, cat:"vorfeld-s", desc:"Vorfeld Süd · Stand"},
  {id:"V162", lat:50.040649, lng:8.556168, cat:"vorfeld-s", desc:"Vorfeld Süd · Stand"},
  {id:"V163", lat:50.040473, lng:8.555424, cat:"vorfeld-s", desc:"Vorfeld Süd · Stand"},
  {id:"V170", lat:50.037964, lng:8.544909, cat:"vorfeld-s", desc:"Vorfeld West · Stand"},
  {id:"V171", lat:50.037231, lng:8.542163, cat:"vorfeld-s", desc:"Vorfeld West · Stand"},
  {id:"V171A", lat:50.037254, lng:8.542274, cat:"vorfeld-s", desc:"Vorfeld West · Stand"},
  {id:"V171B", lat:50.037144, lng:8.541821, cat:"vorfeld-s", desc:"Vorfeld West · Stand"},
  {id:"V172", lat:50.037029, lng:8.541368, cat:"vorfeld-s", desc:"Vorfeld West · Stand"},
  {id:"V173", lat:50.036834, lng:8.540553, cat:"vorfeld-s", desc:"Vorfeld West · Stand"},
  {id:"V173A", lat:50.036918, lng:8.540905, cat:"vorfeld-s", desc:"Vorfeld West · Stand"},
  {id:"V173B", lat:50.036808, lng:8.540443, cat:"vorfeld-s", desc:"Vorfeld West · Stand"},
  {id:"V174", lat:50.036563, lng:8.539434, cat:"vorfeld-s", desc:"Vorfeld West · Stand"},
  {id:"V175", lat:50.03639, lng:8.538664, cat:"vorfeld-s", desc:"Vorfeld West · Stand"},
  {id:"V176", lat:50.036201, lng:8.537902, cat:"vorfeld-s", desc:"Vorfeld West · Stand"},
  {id:"V177", lat:50.036043, lng:8.537239, cat:"vorfeld-s", desc:"Vorfeld West · Stand"},
  {id:"V178", lat:50.035881, lng:8.536572, cat:"vorfeld-s", desc:"Vorfeld West · Stand"},
  {id:"V262", lat:50.037669, lng:8.527570, cat:"vorfeld-s", desc:"Vorfeld West · Stand"},
  {id:"V264", lat:50.037384, lng:8.526330, cat:"vorfeld-s", desc:"Vorfeld West · Stand"},
  {id:"V266", lat:50.037133, lng:8.525389, cat:"vorfeld-s", desc:"Vorfeld West · Stand"},
  {id:"V267", lat:50.036990, lng:8.524798, cat:"vorfeld-s", desc:"Vorfeld West · Stand"},
  {id:"V268", lat:50.036894, lng:8.524186, cat:"vorfeld-s", desc:"Vorfeld West · Stand"},
  {id:"V269", lat:50.036745, lng:8.523604, cat:"vorfeld-s", desc:"Vorfeld West · Stand"},
  {id:"V270", lat:50.036606, lng:8.523012, cat:"vorfeld-s", desc:"Vorfeld West · Stand"},
  {id:"V322", lat:50.027381, lng:8.570127, cat:"vorfeld-s", desc:"Vorfeld Süd · Stand"},
  {id:"V324", lat:50.028097, lng:8.569714, cat:"vorfeld-s", desc:"Vorfeld Süd · Stand"},
  {id:"V326", lat:50.028814, lng:8.569302, cat:"vorfeld-s", desc:"Vorfeld Süd · Stand"},
  {id:"V328", lat:50.029568, lng:8.569048, cat:"vorfeld-s", desc:"Vorfeld Süd · Stand"},
  {id:"F211", lat:50.039559, lng:8.543412, cat:"cargo", desc:"Cargo · Stand"},
  {id:"F212", lat:50.040175, lng:8.542979, cat:"cargo", desc:"Cargo · Stand"},
  {id:"F213", lat:50.040133, lng:8.545750, cat:"cargo", desc:"Cargo · Stand"},
  {id:"F214", lat:50.040758, lng:8.545396, cat:"cargo", desc:"Cargo · Stand"},
  {id:"F215", lat:50.040508, lng:8.547402, cat:"cargo", desc:"Cargo · Stand"},
  {id:"F216", lat:50.041117, lng:8.546959, cat:"cargo", desc:"Cargo · Stand"},
  {id:"F221", lat:50.038916, lng:8.541701, cat:"cargo", desc:"Cargo · Stand"},
  {id:"F221A", lat:50.038835, lng:8.541773, cat:"cargo", desc:"Cargo · Stand"},
  {id:"F223", lat:50.039180, lng:8.541582, cat:"cargo", desc:"Cargo · Stand"},
  {id:"F224", lat:50.039474, lng:8.541362, cat:"cargo", desc:"Cargo · Stand"},
  {id:"F225", lat:50.039525, lng:8.541398, cat:"cargo", desc:"Cargo · Stand"},
  {id:"F231", lat:50.038481, lng:8.534781, cat:"cargo", desc:"Cargo West · Stand"},
  {id:"F232", lat:50.037636, lng:8.533758, cat:"cargo", desc:"Cargo West · Stand"},
  {id:"F232A", lat:50.037499, lng:8.533992, cat:"cargo", desc:"Cargo West · Stand"},
  {id:"F233", lat:50.037315, lng:8.532388, cat:"cargo", desc:"Cargo West · Stand"},
  {id:"F233A", lat:50.037174, lng:8.532614, cat:"cargo", desc:"Cargo West · Stand"},
  {id:"F234", lat:50.037002, lng:8.531048, cat:"cargo", desc:"Cargo West · Stand"},
  {id:"F235", lat:50.036708, lng:8.529845, cat:"cargo", desc:"Cargo West · Stand"},
  {id:"K10", lat:50.027549, lng:8.573182, cat:"cargo", desc:"Cargo · Stand"},
  {id:"K2", lat:50.028286, lng:8.577328, cat:"cargo", desc:"Cargo · Stand"},
  {id:"K4", lat:50.028279, lng:8.576471, cat:"cargo", desc:"Cargo · Stand"},
  {id:"K6", lat:50.028085, lng:8.575447, cat:"cargo", desc:"Cargo · Stand"},
  {id:"K8", lat:50.027835, lng:8.574367, cat:"cargo", desc:"Cargo · Stand"},
  {id:"V164", lat:50.039456, lng:8.551167, cat:"cargo", desc:"Vorfeld West · Stand"},
  {id:"V166", lat:50.038894, lng:8.548814, cat:"cargo", desc:"Vorfeld West · Stand"},
  {id:"V167", lat:50.038669, lng:8.547874, cat:"cargo", desc:"Vorfeld West · Stand"},
  {id:"V168", lat:50.038443, lng:8.54693, cat:"cargo", desc:"Vorfeld West · Stand"},
  {id:"V169", lat:50.038186, lng:8.545845, cat:"cargo", desc:"Vorfeld West · Stand"},
  {id:"W1", lat:50.044001, lng:8.548873, cat:"cargo", desc:"Cargo · Stand"},
  {id:"W1A", lat:50.044168, lng:8.549385, cat:"cargo", desc:"Cargo · Stand"},
  {id:"W2", lat:50.044266, lng:8.549996, cat:"cargo", desc:"Cargo · Stand"},
  {id:"W3", lat:50.044528, lng:8.550963, cat:"cargo", desc:"Cargo · Stand"},
  {id:"W4", lat:50.044675, lng:8.551628, cat:"cargo", desc:"Cargo · Stand"},
  {id:"W5", lat:50.044518, lng:8.552342, cat:"cargo", desc:"Cargo · Stand"},
  {id:"W6", lat:50.044122, lng:8.552387, cat:"cargo", desc:"Cargo · Stand"},
  {id:"W7", lat:50.043674, lng:8.551775, cat:"cargo", desc:"Cargo · Stand"},
  {id:"W753", lat:50.025633, lng:8.544819, cat:"cargo", desc:"Cargo · Stand"},
  {id:"W753B", lat:50.025891, lng:8.544784, cat:"cargo", desc:"Cargo · Stand"},
  {id:"W755", lat:50.026271, lng:8.547222, cat:"cargo", desc:"Cargo · Stand"},
  {id:"W755A", lat:50.026238, lng:8.547273, cat:"cargo", desc:"Cargo · Stand"},
  {id:"W8", lat:50.043436, lng:8.550771, cat:"cargo", desc:"Cargo · Stand"},
  {id:"W9", lat:50.043147, lng:8.549678, cat:"cargo", desc:"Cargo · Stand"},
  {id:"V701", lat:50.021751, lng:8.531232, cat:"ga", desc:"GAT Pushback · Stand"},
  {id:"V702", lat:50.022364, lng:8.530872, cat:"ga", desc:"GAT Pushback · Stand"},
  {id:"V704", lat:50.022481, lng:8.531409, cat:"ga", desc:"GAT Pushback · Stand"},
  {id:"V706", lat:50.022607, lng:8.531939, cat:"ga", desc:"GAT Pushback · Stand"},
  {id:"V708", lat:50.022737, lng:8.53247, cat:"ga", desc:"GAT Pushback · Stand"},
  {id:"V711", lat:50.022004, lng:8.532381, cat:"ga", desc:"GAT Pushback · Stand"},
  {id:"V712", lat:50.022824, lng:8.532937, cat:"ga", desc:"GAT Pushback · Stand"},
  {id:"V713", lat:50.022106, lng:8.532773, cat:"ga", desc:"GAT Pushback · Stand"},
  {id:"V714", lat:50.022913, lng:8.533316, cat:"ga", desc:"GAT Pushback · Stand"},
  {id:"V715", lat:50.022205, lng:8.533154, cat:"ga", desc:"GAT Pushback · Stand"},
  {id:"V716", lat:50.023004, lng:8.533687, cat:"ga", desc:"GAT Pushback · Stand"},
  {id:"V717", lat:50.022308, lng:8.533524, cat:"ga", desc:"GAT Pushback · Stand"},
  {id:"V718", lat:50.023092, lng:8.53406, cat:"ga", desc:"GAT Pushback · Stand"},
  {id:"V719", lat:50.02237, lng:8.533946, cat:"ga", desc:"GAT Pushback · Stand"},
  {id:"V721", lat:50.022472, lng:8.534323, cat:"ga", desc:"GAT Pushback · Stand"},
  {id:"A1", lat:50.049453, lng:8.570745, cat:"terminal", desc:"T1 Gate A · Gate (Gebäude)"},
  {id:"A11", lat:50.048797, lng:8.569462, cat:"terminal", desc:"T1 Gate A · Gate (Gebäude)"},
  {id:"A13", lat:50.048305, lng:8.569113, cat:"terminal", desc:"T1 Gate A · Gate (Gebäude)"},
  {id:"A14", lat:50.048029, lng:8.568092, cat:"terminal", desc:"T1 Gate A · Gate (Gebäude)"},
  {id:"A15", lat:50.047822, lng:8.56877, cat:"terminal", desc:"T1 Gate A · Gate (Gebäude)"},
  {id:"A16", lat:50.047536, lng:8.56774, cat:"terminal", desc:"T1 Gate A · Gate (Gebäude)"},
  {id:"A17", lat:50.047322, lng:8.568426, cat:"terminal", desc:"T1 Gate A · Gate (Gebäude)"},
  {id:"A18", lat:50.04705, lng:8.567375, cat:"terminal", desc:"T1 Gate A · Gate (Gebäude)"},
  {id:"A19", lat:50.046836, lng:8.568074, cat:"terminal", desc:"T1 Gate A · Gate (Gebäude)"},
  {id:"A2", lat:50.049393, lng:8.570483, cat:"terminal", desc:"T1 Gate A · Gate (Gebäude)"},
  {id:"A20", lat:50.046555, lng:8.567023, cat:"terminal", desc:"T1 Gate A · Gate (Gebäude)"},
  {id:"A21", lat:50.046345, lng:8.567729, cat:"terminal", desc:"T1 Gate A · Gate (Gebäude)"},
  {id:"A22", lat:50.045977, lng:8.566613, cat:"terminal", desc:"T1 Gate A · Gate (Gebäude)"},
  {id:"A23", lat:50.045925, lng:8.567376, cat:"terminal", desc:"T1 Gate A · Gate (Gebäude)"},
  {id:"A24", lat:50.045512, lng:8.566285, cat:"terminal", desc:"T1 Gate A · Gate (Gebäude)"},
  {id:"A25", lat:50.045333, lng:8.566991, cat:"terminal", desc:"T1 Gate A · Gate (Gebäude)"},
  {id:"A26", lat:50.044649, lng:8.565604, cat:"terminal", desc:"T1 Gate A · Gate (Gebäude)"},
  {id:"A28", lat:50.044525, lng:8.565075, cat:"terminal", desc:"T1 Gate A · Gate (Gebäude)"},
  {id:"A3", lat:50.04932, lng:8.570193, cat:"terminal", desc:"T1 Gate A · Gate (Gebäude)"},
  {id:"A30", lat:50.044399, lng:8.564555, cat:"terminal", desc:"T1 Gate A · Gate (Gebäude)"},
  {id:"A32", lat:50.044274, lng:8.564013, cat:"terminal", desc:"T1 Gate A · Gate (Gebäude)"},
  {id:"A34", lat:50.04415, lng:8.563477, cat:"terminal", desc:"T1 Gate A · Gate (Gebäude)"},
  {id:"A36", lat:50.04402, lng:8.562959, cat:"terminal", desc:"T1 Gate A · Gate (Gebäude)"},
  {id:"A38", lat:50.043892, lng:8.562434, cat:"terminal", desc:"T1 Gate A · Gate (Gebäude)"},
  {id:"A4", lat:50.049244, lng:8.569909, cat:"terminal", desc:"T1 Gate A · Gate (Gebäude)"},
  {id:"A40", lat:50.043772, lng:8.561925, cat:"terminal", desc:"T1 Gate A · Gate (Gebäude)"},
  {id:"A45B", lat:50.047206, lng:8.563751, cat:"terminal", desc:"T1 Gate A · Stand"},
  {id:"A5", lat:50.049172, lng:8.569635, cat:"terminal", desc:"T1 Gate A · Gate (Gebäude)"},
  {id:"A50", lat:50.048139, lng:8.5652, cat:"terminal", desc:"T1 Gate A · Gate (Gebäude)"},
  {id:"A52", lat:50.047918, lng:8.564245, cat:"terminal", desc:"T1 Gate A · Gate (Gebäude)"},
  {id:"A54", lat:50.047643, lng:8.563135, cat:"terminal", desc:"T1 Gate A · Gate (Gebäude)"},
  {id:"A54A", lat:50.047352, lng:8.564288, cat:"terminal", desc:"T1 Gate A · Stand"},
  {id:"A56", lat:50.047643, lng:8.563135, cat:"terminal", desc:"T1 Gate A · Gate (Gebäude)"},
  {id:"A58", lat:50.047386, lng:8.561993, cat:"terminal", desc:"T1 Gate A · Gate (Gebäude)"},
  {id:"A58A", lat:50.047087, lng:8.563145, cat:"terminal", desc:"T1 Gate A · Stand"},
  {id:"A58B", lat:50.046916, lng:8.562612, cat:"terminal", desc:"T1 Gate A · Stand"},
  {id:"A60", lat:50.047386, lng:8.561993, cat:"terminal", desc:"T1 Gate A · Gate (Gebäude)"},
  {id:"A62", lat:50.047133, lng:8.560871, cat:"terminal", desc:"T1 Gate A · Gate (Gebäude)"},
  {id:"A62A", lat:50.046811, lng:8.561996, cat:"terminal", desc:"T1 Gate A · Stand"},
  {id:"A62B", lat:50.046646, lng:8.561472, cat:"terminal", desc:"T1 Gate A · Stand"},
  {id:"A64", lat:50.047133, lng:8.560871, cat:"terminal", desc:"T1 Gate A · Gate (Gebäude)"},
  {id:"A66", lat:50.046854, lng:8.559744, cat:"terminal", desc:"T1 Gate A · Gate (Gebäude)"},
  {id:"A66B", lat:50.046378, lng:8.560322, cat:"terminal", desc:"T1 Gate A · Stand"},
  {id:"A68", lat:50.046854, lng:8.559744, cat:"terminal", desc:"T1 Gate A · Gate (Gebäude)"},
  {id:"A68A", lat:50.046539, lng:8.560847, cat:"terminal", desc:"T1 Gate A · Stand"},
  {id:"A69", lat:50.046638, lng:8.558887, cat:"terminal", desc:"T1 Gate A · Gate (Gebäude)"},
  {id:"B1", lat:50.048803, lng:8.573588, cat:"terminal", desc:"T1 Gate B · Gate (Gebäude)"},
  {id:"B10", lat:50.048909, lng:8.572054, cat:"terminal", desc:"T1 Gate B · Gate (Gebäude)"},
  {id:"B11", lat:50.048771, lng:8.572087, cat:"terminal", desc:"T1 Gate B · Gate (Gebäude)"},
  {id:"B12", lat:50.048623, lng:8.572164, cat:"terminal", desc:"T1 Gate B · Gate (Gebäude)"},
  {id:"B13", lat:50.048447, lng:8.572271, cat:"terminal", desc:"T1 Gate B · Gate (Gebäude)"},
  {id:"B14", lat:50.049524, lng:8.573826, cat:"terminal", desc:"T1 Gate B · Gate (Gebäude)"},
  {id:"B15", lat:50.049329, lng:8.573939, cat:"terminal", desc:"T1 Gate B · Gate (Gebäude)"},
  {id:"B16", lat:50.049132, lng:8.574052, cat:"terminal", desc:"T1 Gate B · Gate (Gebäude)"},
  {id:"B19", lat:50.048289, lng:8.572363, cat:"terminal", desc:"T1 Gate B · Gate (Gebäude)"},
  {id:"B20", lat:50.048212, lng:8.572309, cat:"terminal", desc:"T1 Gate B · Gate (Gebäude)"},
  {id:"B22", lat:50.047542, lng:8.571778, cat:"terminal", desc:"T1 Gate B · Gate (Gebäude)"},
  {id:"B23", lat:50.046938, lng:8.572223, cat:"terminal", desc:"T1 Gate B · Gate (Gebäude)"},
  {id:"B24", lat:50.046992, lng:8.571427, cat:"terminal", desc:"T1 Gate B · Gate (Gebäude)"},
  {id:"B25", lat:50.046704, lng:8.570971, cat:"terminal", desc:"T1 Gate B · Gate (Gebäude)"},
  {id:"B26", lat:50.046329, lng:8.571038, cat:"terminal", desc:"T1 Gate B · Gate (Gebäude)"},
  {id:"B27", lat:50.046191, lng:8.571556, cat:"terminal", desc:"T1 Gate B · Gate (Gebäude)"},
  {id:"B28", lat:50.046387, lng:8.572001, cat:"terminal", desc:"T1 Gate B · Gate (Gebäude)"},
  {id:"B30", lat:50.047644, lng:8.573312, cat:"terminal", desc:"T1 Gate B · Gate (Gebäude)"},
  {id:"B32", lat:50.047762, lng:8.573822, cat:"terminal", desc:"T1 Gate B · Gate (Gebäude)"},
  {id:"B41", lat:50.048564, lng:8.574367, cat:"terminal", desc:"T1 Gate B · Gate (Gebäude)"},
  {id:"B42", lat:50.047843, lng:8.574781, cat:"terminal", desc:"T1 Gate B · Gate (Gebäude)"},
  {id:"B43", lat:50.048204, lng:8.575399, cat:"terminal", desc:"T1 Gate B · Gate (Gebäude)"},
  {id:"B44", lat:50.047987, lng:8.576373, cat:"terminal", desc:"T1 Gate B · Gate (Gebäude)"},
  {id:"B45", lat:50.047686, lng:8.5767, cat:"terminal", desc:"T1 Gate B · Gate (Gebäude)"},
  {id:"B46", lat:50.047384, lng:8.57646, cat:"terminal", desc:"T1 Gate B · Gate (Gebäude)"},
  {id:"B47", lat:50.047328, lng:8.575905, cat:"terminal", desc:"T1 Gate B · Gate (Gebäude)"},
  {id:"B48", lat:50.047556, lng:8.575686, cat:"terminal", desc:"T1 Gate B · Gate (Gebäude)"},
  {id:"B58", lat:50.048441, lng:8.573796, cat:"terminal", desc:"T1 Gate B · Gate (Gebäude)"},
  {id:"B59", lat:50.048382, lng:8.574004, cat:"terminal", desc:"T1 Gate B · Gate (Gebäude)"},
  {id:"B60", lat:50.049524, lng:8.573826, cat:"terminal", desc:"T1 Gate B · Gate (Gebäude)"},
  {id:"B61", lat:50.049329, lng:8.573939, cat:"terminal", desc:"T1 Gate B · Gate (Gebäude)"},
  {id:"B62", lat:50.049132, lng:8.574052, cat:"terminal", desc:"T1 Gate B · Gate (Gebäude)"},
  {id:"C11", lat:50.049491, lng:8.578524, cat:"terminal", desc:"T1 Gate C · Gate (Gebäude)"},
  {id:"C13", lat:50.049153, lng:8.579516, cat:"terminal", desc:"T1 Gate C · Gate (Gebäude)"},
  {id:"C14", lat:50.049279, lng:8.580248, cat:"terminal", desc:"T1 Gate C · Gate (Gebäude)"},
  {id:"C15", lat:50.049504, lng:8.581211, cat:"terminal", desc:"T1 Gate C · Gate (Gebäude)"},
  {id:"C15A", lat:50.049504, lng:8.581211, cat:"terminal", desc:"T1 Gate C · Gate (Gebäude)"},
  {id:"C15B", lat:50.049504, lng:8.581211, cat:"terminal", desc:"T1 Gate C · Gate (Gebäude)"},
  {id:"C16", lat:50.049782, lng:8.582351, cat:"terminal", desc:"T1 Gate C · Gate (Gebäude)"},
  {id:"C16A", lat:50.049782, lng:8.582351, cat:"terminal", desc:"T1 Gate C · Gate (Gebäude)"},
  {id:"C16B", lat:50.049782, lng:8.582351, cat:"terminal", desc:"T1 Gate C · Gate (Gebäude)"},
  {id:"C2", lat:50.050366, lng:8.574275, cat:"terminal", desc:"T1 Gate C · Gate (Gebäude)"},
  {id:"C4", lat:50.050395, lng:8.574967, cat:"terminal", desc:"T1 Gate C · Gate (Gebäude)"},
  {id:"C5", lat:50.050207, lng:8.57575, cat:"terminal", desc:"T1 Gate C · Gate (Gebäude)"},
  {id:"C6", lat:50.050004, lng:8.576523, cat:"terminal", desc:"T1 Gate C · Gate (Gebäude)"},
  {id:"C8", lat:50.049727, lng:8.577618, cat:"terminal", desc:"T1 Gate C · Gate (Gebäude)"},
  {id:"D1", lat:50.050466, lng:8.587571, cat:"terminal", desc:"T2 Gate D · Stand"},
  {id:"D1A", lat:50.050421, lng:8.58778, cat:"terminal", desc:"T2 Gate D · Stand"},
  {id:"D4", lat:50.050209, lng:8.586512, cat:"terminal", desc:"T2 Gate D · Stand"},
  {id:"D4B", lat:50.05005, lng:8.586306, cat:"terminal", desc:"T2 Gate D · Stand"},
  {id:"D5", lat:50.049968, lng:8.585458, cat:"terminal", desc:"T2 Gate D · Stand"},
  {id:"D5A", lat:50.049965, lng:8.585709, cat:"terminal", desc:"T2 Gate D · Stand"},
  {id:"D8", lat:50.04971, lng:8.58441, cat:"terminal", desc:"T2 Gate D · Stand"},
  {id:"D8A", lat:50.049662, lng:8.584634, cat:"terminal", desc:"T2 Gate D · Stand"},
  {id:"E2", lat:50.050713, lng:8.588594, cat:"terminal", desc:"T2 Gate E · Stand"},
  {id:"E2A", lat:50.050776, lng:8.588892, cat:"terminal", desc:"T2 Gate E · Stand"},
  {id:"E5", lat:50.051005, lng:8.589845, cat:"terminal", desc:"T2 Gate E · Stand"},
  {id:"E5A", lat:50.051066, lng:8.590143, cat:"terminal", desc:"T2 Gate E · Stand"},
  {id:"E5B", lat:50.050812, lng:8.589653, cat:"terminal", desc:"T2 Gate E · Stand"},
  {id:"E6", lat:50.051266, lng:8.590902, cat:"terminal", desc:"T2 Gate E · Stand"},
  {id:"E6A", lat:50.051211, lng:8.591099, cat:"terminal", desc:"T2 Gate E · Stand"},
  {id:"E9", lat:50.051539, lng:8.591979, cat:"terminal", desc:"T2 Gate E · Stand"},
  {id:"E9A", lat:50.051407, lng:8.592187, cat:"terminal", desc:"T2 Gate E · Stand"},
  {id:"G1", lat:50.031775, lng:8.582906, cat:"terminal", desc:"T3 Gate G · Stand"},
  {id:"G10", lat:50.034108, lng:8.587498, cat:"terminal", desc:"T3 Gate G · Stand"},
  {id:"G11", lat:50.034693, lng:8.584834, cat:"terminal", desc:"T3 Gate G · Stand"},
  {id:"G12", lat:50.034729, lng:8.587935, cat:"terminal", desc:"T3 Gate G · Stand"},
  {id:"G13", lat:50.035414, lng:8.585388, cat:"terminal", desc:"T3 Gate G · Stand"},
  {id:"G14", lat:50.03534, lng:8.588379, cat:"terminal", desc:"T3 Gate G · Stand"},
  {id:"G15", lat:50.03607, lng:8.585749, cat:"terminal", desc:"T3 Gate G · Stand"},
  {id:"G16", lat:50.036406, lng:8.588077, cat:"terminal", desc:"T3 Gate G · Stand"},
  {id:"G16A", lat:50.036121, lng:8.585331, cat:"terminal", desc:"T3 Gate G · Stand"},
  {id:"G2", lat:50.031449, lng:8.585597, cat:"terminal", desc:"T3 Gate G · Stand"},
  {id:"G3", lat:50.03215, lng:8.583099, cat:"terminal", desc:"T3 Gate G · Stand"},
  {id:"G4", lat:50.032065, lng:8.586044, cat:"terminal", desc:"T3 Gate G · Stand"},
  {id:"G5", lat:50.032524, lng:8.583282, cat:"terminal", desc:"T3 Gate G · Stand"},
  {id:"G6", lat:50.03268, lng:8.586474, cat:"terminal", desc:"T3 Gate G · Stand"},
  {id:"G7", lat:50.033056, lng:8.583669, cat:"terminal", desc:"T3 Gate G · Stand"},
  {id:"G8", lat:50.033291, lng:8.586927, cat:"terminal", desc:"T3 Gate G · Stand"},
  {id:"G9", lat:50.033783, lng:8.584213, cat:"terminal", desc:"T3 Gate G · Stand"},
  {id:"H1", lat:50.031726, lng:8.579697, cat:"terminal", desc:"T3 Gate H · Gate (Gebäude)"},
  {id:"H11", lat:50.033737, lng:8.577587, cat:"terminal", desc:"T3 Gate H · Stand"},
  {id:"H12", lat:50.033986, lng:8.579692, cat:"terminal", desc:"T3 Gate H · Gate (Gebäude)"},
  {id:"H13", lat:50.03451, lng:8.578121, cat:"terminal", desc:"T3 Gate H · Gate (Gebäude)"},
  {id:"H14", lat:50.034775, lng:8.58018, cat:"terminal", desc:"T3 Gate H · Stand"},
  {id:"H2", lat:50.031566, lng:8.581038, cat:"terminal", desc:"T3 Gate H · Gate (Gebäude)"},
  {id:"H3", lat:50.032254, lng:8.579397, cat:"terminal", desc:"T3 Gate H · Gate (Gebäude)"},
  {id:"H4", lat:50.031965, lng:8.580832, cat:"terminal", desc:"T3 Gate H · Gate (Gebäude)"},
  {id:"H5", lat:50.032831, lng:8.57908, cat:"terminal", desc:"T3 Gate H · Gate (Gebäude)"},
  {id:"H6", lat:50.032561, lng:8.580478, cat:"terminal", desc:"T3 Gate H · Gate (Gebäude)"},
  {id:"H7", lat:50.032978, lng:8.578024, cat:"terminal", desc:"T3 Gate H · Stand"},
  {id:"H8", lat:50.033255, lng:8.5801, cat:"terminal", desc:"T3 Gate H · Gate (Gebäude)"},
  {id:"H9", lat:50.033749, lng:8.578533, cat:"terminal", desc:"T3 Gate H · Gate (Gebäude)"},
  {id:"J1", lat:50.029966, lng:8.577374, cat:"terminal", desc:"T3 Gate J · Gate (Gebäude)"},
  {id:"J10", lat:50.031545, lng:8.573193, cat:"terminal", desc:"T3 Gate J · Gate (Gebäude)"},
  {id:"J11", lat:50.031575, lng:8.571902, cat:"terminal", desc:"T3 Gate J · Gate (Gebäude)"},
  {id:"J12", lat:50.031861, lng:8.57212, cat:"terminal", desc:"T3 Gate J · Gate (Gebäude)"},
  {id:"J13", lat:50.031757, lng:8.571332, cat:"terminal", desc:"T3 Gate J · Gate (Gebäude)"},
  {id:"J14", lat:50.031923, lng:8.571421, cat:"terminal", desc:"T3 Gate J · Gate (Gebäude)"},
  {id:"J17", lat:50.031547, lng:8.569598, cat:"terminal", desc:"T3 Gate J · Stand"},
  {id:"J2", lat:50.030199, lng:8.577742, cat:"terminal", desc:"T3 Gate J · Gate (Gebäude)"},
  {id:"J3", lat:50.030192, lng:8.576609, cat:"terminal", desc:"T3 Gate J · Gate (Gebäude)"},
  {id:"J4", lat:50.030469, lng:8.576825, cat:"terminal", desc:"T3 Gate J · Gate (Gebäude)"},
  {id:"J5", lat:50.030501, lng:8.575574, cat:"terminal", desc:"T3 Gate J · Gate (Gebäude)"},
  {id:"J6", lat:50.03084, lng:8.575596, cat:"terminal", desc:"T3 Gate J · Gate (Gebäude)"},
  {id:"J7", lat:50.030904, lng:8.574207, cat:"terminal", desc:"T3 Gate J · Gate (Gebäude)"},
  {id:"J8", lat:50.031185, lng:8.574413, cat:"terminal", desc:"T3 Gate J · Gate (Gebäude)"},
  {id:"J9", lat:50.031261, lng:8.572992, cat:"terminal", desc:"T3 Gate J · Gate (Gebäude)"},
  {id:"Z50", lat:50.048057, lng:8.565235, cat:"terminal", desc:"T1 Gate Z · Gate (Gebäude)"},
  {id:"Z52", lat:50.047833, lng:8.564296, cat:"terminal", desc:"T1 Gate Z · Gate (Gebäude)"},
  {id:"Z54", lat:50.047554, lng:8.563181, cat:"terminal", desc:"T1 Gate Z · Gate (Gebäude)"},
  {id:"Z56", lat:50.047554, lng:8.563181, cat:"terminal", desc:"T1 Gate Z · Gate (Gebäude)"},
  {id:"Z58", lat:50.047295, lng:8.562043, cat:"terminal", desc:"T1 Gate Z · Gate (Gebäude)"},
  {id:"Z60", lat:50.047295, lng:8.562043, cat:"terminal", desc:"T1 Gate Z · Gate (Gebäude)"},
  {id:"Z66", lat:50.046758, lng:8.559774, cat:"terminal", desc:"T1 Gate Z · Gate (Gebäude)"},
  {id:"Z68", lat:50.046758, lng:8.559774, cat:"terminal", desc:"T1 Gate Z · Gate (Gebäude)"},
  {id:"Z69", lat:50.046558, lng:8.558953, cat:"terminal", desc:"T1 Gate Z · Gate (Gebäude)"},
  {id:"APRON-E", lat:50.0485, lng:8.59, cat:"landmark", desc:"Apron East"},
  {id:"APRON-W", lat:50.0472, lng:8.555, cat:"landmark", desc:"Apron West"},
  {id:"BF-KS", lat:50.0527, lng:8.5702, cat:"landmark", desc:"Fernbahnhof"},
  {id:"CARGO-N", lat:50.0478, lng:8.5955, cat:"landmark", desc:"Cargo Nord Bereich"},
  {id:"CARGO-S", lat:50.041, lng:8.557, cat:"landmark", desc:"Cargo Süd Bereich"},
  {id:"GAT", lat:50.0224, lng:8.5328, cat:"landmark", desc:"General Aviation Terminal"},
  {id:"T1", lat:50.0479, lng:8.5703, cat:"landmark", desc:"Terminal 1"},
  {id:"T2", lat:50.051, lng:8.5878, cat:"landmark", desc:"Terminal 2"},
  {id:"T3", lat:50.0348, lng:8.5805, cat:"landmark", desc:"Terminal 3"},
  {id:"TOWER", lat:50.04685, lng:8.56295, cat:"landmark", desc:"Frankfurt Tower"}
];

const CAT_ICONS = {
  "vorfeld-n": { icon:"🟦", label:"Vorfeld Nord", color:"#00b4d8" },
  "vorfeld-s": { icon:"🟩", label:"Vorfeld Süd",  color:"#2ecc71" },
  "cargo":     { icon:"🟧", label:"Cargo",        color:"#f39c12" },
  "ga":        { icon:"🟪", label:"General Aviation", color:"#9b59b6" },
  "terminal":  { icon:"🟥", label:"Terminal Gates", color:"#e63946" },
  "landmark":  { icon:"⬜", label:"Referenzpunkte", color:"#95a5a6" },
};
const CAT_ORDER = ["vorfeld-n","vorfeld-s","cargo","ga","terminal","landmark"];


// ===== STATE & I18N =====
const I18N = {
  de: {
    app_title: "Vorfeld Navigator",
    airport: "Frankfurt Airport · EDDF",
    gps_ready: "GPS: Bereit",
    gps_search: "GPS: Suche…",
    gps_live: "GPS: Live",
    gps_demo: "GPS: Demo",
    gps_weak: "GPS: Schwach",
    gps_off: "GPS: Aus",
    gps_denied: "GPS-Zugriff verweigert — Settings → Site → Location erlauben, dann GPS-Symbol tippen",
    gps_insecure: "GPS braucht HTTPS (GitHub Pages). Datei:/ geht nicht.",
    gps_retry: "GPS erneut versuchen…",
    gps_tap: "Tippen → GPS erlauben / neu starten",
    gps_waiting_fix: "Warte auf Gerätesignal…",
    search_title: "Ziel suchen",
    search_sub: "Position wählen · z.B. V106, B27, J17",
    search_placeholder: "Position, Gate oder Stand…",
    no_target: "Kein Ziel gewählt",
    no_matches: "Keine Treffer",
    route_mode_none: "Kein Ziel",
    route_via_roads: "Über Vorfeld-Servicewege",
    route_direct: "Direkte Linie",
    dest: "Ziel",
    via: "Via",
    dist: "Distanz",
    speed: "Geschw.",
    eta: "ETA",
    menu: "Menü",
    settings: "Einstellungen",
    language: "Sprache",
    vehicle: "Fahrzeugtyp",
    veh_pushback: "Pushback (Schlepper)",
    veh_followme: "Follow-me",
    veh_baggage: "Gepäck",
    veh_catering: "Catering",
    veh_fuel: "Tankwagen",
    veh_other: "Sonstiges",
    base_layer: "Kartenstil",
    voice: "Sprachansagen",
    heading_up: "Blickrichtung folgen",
    nav_zoom: "Navigations-Zoom",
    nav_zoom_wide: "Übersicht",
    nav_zoom_close: "Nah",
    north_up: "Norden oben",
    nfz: "Sperrzonen (NFZ)",
    emergency: "Notrufpunkte",
    traffic_sim: "Flotten-Simulation",
    zones: "Schengen / Non-Schengen Zonen",
    buildings: "Gebäude & Codes (ASO, BSO…)",
    manual_pos: "Position manuell setzen",
    set_pos: "Setzen",
    lat: "Breite",
    lng: "Länge",
    speed_log: "Geschwindigkeits-Log",
    metar: "EDDF METAR",
    tour: "Multi-Stop Tour",
    tour_hint: "Wähle das Ziel, dann +Via hinzufügen.",
    reset_tour: "Tour löschen",
    report: "Missionsbericht",
    print_report: "Drucken / PDF",
    close: "Schließen",
    theme_toggle: "Hell/Dunkel",
    favorites: "Favoriten",
    history: "Verlauf",
    clear_history: "Verlauf löschen",
    arrived: "Ziel erreicht",
    arrival: "Ankunft",
    distance: "Distanz",
    duration: "Dauer",
    avg_speed: "Ø Geschw.",
    max_speed: "Max. Geschw.",
    warning_speed: "Achtung, Geschwindigkeit überschritten",
    route_to: "Navigation zu",
    via_selected: " Via-Punkt gewählt",
    follow: "Position folgen",
    map_free: "Karte frei — ziehen & zoomen",
    demo_active: "Demo aktiv",
    demo_off: "Demo beendet",
    demo: "Demo",
    demo_on: "Demo gestartet",
    demo_stop: "Demo aus",
    toast_welcome: "Willkommen! Ziel wählen — die Karte folgt Ihrem Standort. Navigationssystem entwickelt von Nasuh Özkaya.",
    live: "LIVE",
    offline: "Offline-Modus",
    online: "Online",
    minutes: "Min",
    less_than_min: "<1 min",
    select: "Wählen",
    no_gps: "Kein GPS — Browser/ Gerät unterstützt es nicht. Demo oder manuell.",
    map_click_hint: "Tippe auf die Karte, um die Position zu setzen",
    no_data: "Keine Daten",
    select_dest_first: "Zuerst ein Ziel wählen",
    via_mode: "Via-Modus: nächsten Stopp wählen",
    base_osm: "OSM",
    base_sat: "Satellit",
    base_dark: "Dunkel",
    close: "Schließen"
  },
  en: {
    app_title: "Apron Navigator",
    airport: "Frankfurt Airport · EDDF",
    gps_ready: "GPS: Ready",
    gps_search: "GPS: Searching…",
    gps_live: "GPS: Live",
    gps_demo: "GPS: Demo",
    gps_weak: "GPS: Weak",
    gps_off: "GPS: Off",
    gps_denied: "GPS denied — Settings → Site → allow Location, then tap GPS pill",
    gps_insecure: "GPS needs HTTPS (GitHub Pages). file:// will not work.",
    gps_retry: "Retrying GPS…",
    gps_tap: "Tap to allow / restart GPS",
    gps_waiting_fix: "Waiting for device fix…",
    search_title: "Find destination",
    search_sub: "Select position · e.g. V106, B27, J17",
    search_placeholder: "Position, gate or stand…",
    no_target: "No destination selected",
    no_matches: "No matches",
    route_mode_none: "No destination",
    route_via_roads: "Via apron service roads",
    route_direct: "Direct line",
    dest: "Dest",
    via: "Via",
    dist: "Distance",
    speed: "Speed",
    eta: "ETA",
    menu: "Menu",
    settings: "Settings",
    language: "Language",
    vehicle: "Vehicle type",
    veh_pushback: "Pushback tug",
    veh_followme: "Follow-me",
    veh_baggage: "Baggage",
    veh_catering: "Catering",
    veh_fuel: "Fuel truck",
    veh_other: "Other",
    base_layer: "Map style",
    voice: "Voice prompts",
    heading_up: "Heading up",
    nav_zoom: "Navigation zoom",
    nav_zoom_wide: "Overview",
    nav_zoom_close: "Close",
    north_up: "North up",
    nfz: "No-fly zones (NFZ)",
    emergency: "Emergency points",
    traffic_sim: "Fleet simulation",
    zones: "Schengen / Non-Schengen zones",
    buildings: "Buildings & codes (ASO, BSO…)",
    manual_pos: "Set position manually",
    set_pos: "Set",
    lat: "Latitude",
    lng: "Longitude",
    speed_log: "Speed log",
    metar: "EDDF METAR",
    tour: "Multi-stop tour",
    tour_hint: "Select destination, then +Via to add stops.",
    reset_tour: "Clear tour",
    report: "Mission report",
    print_report: "Print / PDF",
    close: "Close",
    theme_toggle: "Light/Dark",
    favorites: "Favorites",
    history: "History",
    clear_history: "Clear history",
    arrived: "You have arrived",
    arrival: "Arrival",
    distance: "Distance",
    duration: "Duration",
    avg_speed: "Avg speed",
    max_speed: "Max speed",
    warning_speed: "Warning, speed limit exceeded",
    route_to: "Navigating to",
    via_selected: " via point selected",
    follow: "Follow position",
    map_free: "Map free — pan & zoom",
    demo_active: "Demo active",
    demo_off: "Demo ended",
    demo: "Demo",
    demo_on: "Demo started",
    demo_stop: "Stop demo",
    toast_welcome: "Welcome! Select a destination — the map follows your position. Navigation system developed by Nasuh Özkaya.",
    live: "LIVE",
    offline: "Offline mode",
    online: "Online",
    minutes: "min",
    less_than_min: "<1 min",
    select: "Select",
    no_gps: "No GPS — not supported. Use Demo or set manually.",
    map_click_hint: "Tap the map to set your position",
    no_data: "No data",
    select_dest_first: "Select a destination first",
    via_mode: "Via mode: pick next stop",
    base_osm: "OSM",
    base_sat: "Satellite",
    base_dark: "Dark",
    close: "Close"
  }
};

let _lang = localStorage.getItem('fra_lang') || 'de';
let _voice = localStorage.getItem('fra_voice') !== 'false';
let _headingUp = false; // north-up only
let _navZoom = Math.min(19, Math.max(16, parseInt(localStorage.getItem('fra_nav_zoom') || '19', 10) || 19));
let _vehicle = localStorage.getItem('fra_vehicle') || 'pushback';
let _theme = localStorage.getItem('fra_theme') || 'dark';
let _favorites = JSON.parse(localStorage.getItem('fra_favs') || '[]');
let _history = JSON.parse(localStorage.getItem('fra_history') || '[]');
let _viaPoints = [];
let _speedLog = [];
let _telemetry = [];
let _ann = { lastText:'', lastTime:0 };
let _arrived = false;
let _pendingAction = 'destination'; // destination | add-via
let _fleet = [];
let _fleetTimer = null;
let _manualPosition = null;
let _mapRotation = 0;
let _manualMapRot = 0; // free rotation degrees (CW positive on screen = map CSS rotate)
let _rotGesture = null;
let _offline = !navigator.onLine;

function t(k, opts={}) {
  let s = (I18N[_lang] && I18N[_lang][k]) || I18N.de[k] || k;
  if (opts && typeof opts === 'object') {
    Object.keys(opts).forEach(key => { s = s.split('{'+key+'}').join(opts[key]); });
  }
  return s;
}
function setLang(l){
  _lang = l || 'de';
  document.documentElement.lang = _lang;
  localStorage.setItem('fra_lang', _lang);
  updateAllTexts();
  fillVehicleSelect();
  populateBaseChips();
  renderPositionList();
  syncFavHistory();
  renderTour();
  if (document.getElementById('lang-select')) document.getElementById('lang-select').value = _lang;
}

function updateAllTexts(){
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const k = el.getAttribute('data-i18n'); if (!k) return;
    const v = t(k);
    if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') el.placeholder = v;
    else el.textContent = v;
  });
  document.querySelectorAll('[data-i18n-title]').forEach(el => {
    const k = el.getAttribute('data-i18n-title'); if(k){ el.title = t(k); }
  });

  try{ updateDemoButton(); }catch(e){}
}
function fmtnum(n,d){return (n==null||isNaN(n))?'—':n.toFixed(d)}
function speak(text, priority=false){
  if (!_voice || !window.speechSynthesis) return;
  try{
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    const voices = window.speechSynthesis.getVoices();
    if (_lang === 'de'){
      const v = voices.find(x=>x.lang.startsWith('de'));
      if(v){ u.voice = v; u.lang = v.lang; }
      else u.lang = 'de-DE';
    } else {
      const v = voices.find(x=>x.lang.startsWith('en'));
      if(v){ u.voice=v; u.lang=v.lang; }
      else u.lang='en-US';
    }
    u.rate = 1.0; u.pitch = 1.0;
    window.speechSynthesis.speak(u);
  }catch(e){ console.warn('TTS',e); }
}
function announceOnce(text, force=false){
  const now = Date.now();
  if (!force && _ann.lastText === text && now - _ann.lastTime < 8000) return;
  _ann.lastText = text; _ann.lastTime = now; speak(text, force);
}

const VEHICLES = {
  pushback: { limit:25, color:'#00c2e0', icon:'🚜' },
  followme: { limit:50, color:'#f1c40f', icon:'🚗' },
  baggage:  { limit:30, color:'#e67e22', icon:'🧳' },
  catering: { limit:30, color:'#9b59b6', icon:'🍽' },
  fuel:     { limit:25, color:'#e74c3c', icon:'⛽' },
  other:    { limit:30, color:'#2ecc71', icon:'🚐' }
};

const EMERGENCY_POINTS = [
  {id:'FW-N', lat:50.0485, lng:8.5850, type:'fire', label:'Feuerwehr Nord'},
  {id:'FW-S', lat:50.0385, lng:8.5280, type:'fire', label:'Feuerwehr Süd'},
  {id:'FW-C', lat:50.0460, lng:8.5580, type:'fire', label:'Feuerwehr Zentral'},
  {id:'SAR-1', lat:50.0510, lng:8.5950, type:'medical', label:'Rettungspunkt Cargo'},
  {id:'SAR-2', lat:50.0300, lng:8.5750, type:'medical', label:'Rettungspunkt T3'},
  {id:'Assembly-A', lat:50.0470, lng:8.5700, type:'assembly', label:'Sammelpunkt T1'},
  {id:'Assembly-C', lat:50.0520, lng:8.5870, type:'assembly', label:'Sammelpunkt T2'},
  {id:'Assembly-E', lat:50.0340, lng:8.5800, type:'assembly', label:'Sammelpunkt T3'}
];

const NFZ_POLYGONS = [
  // active runway strips approximated (vehicles must not cross without clearance)
  {label:'07L/25R', coords:[[50.0480,8.5160],[50.0470,8.5160],[50.0360,8.5820],[50.0370,8.5820]]},
  {label:'07C/25C', coords:[[50.0500,8.5150],[50.0490,8.5150],[50.0380,8.5910],[50.0390,8.5910]]},
  {label:'07R/25L', coords:[[50.0520,8.5140],[50.0510,8.5140],[50.0400,8.6000],[50.0410,8.6000]]},
  {label:'Startbahn-West / Taxiway Y', coords:[[50.0500,8.5000],[50.0360,8.5000],[50.0360,8.5100],[50.0500,8.5100]]}
];

function vehicleSpec(){ return VEHICLES[_vehicle] || VEHICLES.pushback; }
function vehicleLimit(){ return vehicleSpec().limit; }
function getVehiclesForSelect(){
  return [
    ['veh_pushback','pushback'],
    ['veh_followme','followme'],
    ['veh_baggage','baggage'],
    ['veh_catering','catering'],
    ['veh_fuel','fuel'],
    ['veh_other','other']
  ];
}
function fillVehicleSelect(){
  const sel = document.getElementById('vehicle-select'); if(!sel) return;
  sel.innerHTML = getVehiclesForSelect().map(([k,v])=>`<option value="${v}">${t(k)}</option>`).join('');
  sel.value = _vehicle;
}
function populateBaseChips(){
  const c = document.getElementById('base-layer-chips'); if(!c) return;
  const items = [
    {k:'base_osm', v:'osm'},
    {k:'base_sat', v:'sat'},
    {k:'base_dark', v:'dark'}
  ];
  c.innerHTML = items.map(it=>`<button type="button" class="layer-chip${activeBase()==it.v?' active':''}" data-base="${it.v}">${t(it.k)}</button>`).join('');
  c.querySelectorAll('.layer-chip').forEach(b=>b.onclick=()=>setBaseLayer(b.dataset.base));
}

let map, routeLayer, labelsLayer, nfzLayer, emergencyLayer, fleetLayer, zoneLayer, buildingLabelLayer;
let currentPosition = null;
let gpsMarker = null, gpsAccuracyCircle = null, destinationMarker = null;
let gpsWatchId = null, gpsActive = false, demoMode = false, demoTimer = null;
let _gpsRetryTimer = null, _gpsFallbackTimer = null, _gpsPermState = 'unknown', _gpsUserGestureBound = false, _gpsLastFixAt = 0, _gpsStarting = false;
let selectedTarget = null, lastRoute = null, _lastRerouteAt = 0;
let followMode = false, userPanning = false, recenterTimer = null, navActive = false, _userMovedMap = false, _gpsFirstCenterDone = false, _lastGoodAcc = null;
let tileOSM, tileSat, tileDark;
let activeBaseLayer = 'osm';
const NAV_ZOOM = 17;
const RECENTER_MS = 4200;

function initMap(){
  map = L.map('map', {
    center:[50.040,8.560], zoom:13, zoomControl:false, minZoom:10, maxZoom:19,
    preferCanvas:false, fadeAnimation:true, zoomAnimation:true,
    worldCopyJump:false, maxBoundsViscosity:0
  });
  // no hard maxBounds — map is free to pan/zoom anywhere

  tileOSM = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',{attribution:'&copy; OpenStreetMap · Navigationssystem entwickelt von Nasuh Özkaya',maxZoom:19});
  tileSat = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',{attribution:'&copy; Esri · Navigationssystem entwickelt von Nasuh Özkaya',maxZoom:18});
  tileDark = L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',{attribution:'&copy; CartoDB · Navigationssystem entwickelt von Nasuh Özkaya',maxZoom:19});
  tileOSM.addTo(map);

  map.createPane('routePane'); map.getPane('routePane').style.zIndex=450; map.getPane('routePane').style.pointerEvents='none';
  map.createPane('nfzPane'); map.getPane('nfzPane').style.zIndex=440;
  map.createPane('emergencyPane'); map.getPane('emergencyPane').style.zIndex=650;
  map.createPane('fleetPane'); map.getPane('fleetPane').style.zIndex=500;

  routeLayer = L.layerGroup().addTo(map);
  labelsLayer = L.layerGroup().addTo(map);
  nfzLayer = L.layerGroup();
  emergencyLayer = L.layerGroup();
  fleetLayer = L.layerGroup();
  zoneLayer = L.layerGroup();
  buildingLabelLayer = L.layerGroup();

  addPositionMarkers();
  addEmergencyMarkers();
  addNFZPolygons();
  initFleetVehicles();

  map.on('zoomend',()=>{ updateLabelVisibility(); if(lastRoute && lastRoute.latlngs) drawRouteLayers(lastRoute,false); });
  map.on('dragstart', onUserPanMap);
  map.on('zoomstart', onUserPanMap);
  map.on('click', onMapClick);
}

function setBaseLayer(name){
  activeBaseLayer = name || 'osm';
  [tileOSM,tileSat,tileDark].forEach(t=>{if(map.hasLayer(t)) map.removeLayer(t);});
  if(activeBaseLayer==='sat') tileSat.addTo(map);
  else if(activeBaseLayer==='dark') tileDark.addTo(map);
  else tileOSM.addTo(map);
  localStorage.setItem('fra_base', activeBaseLayer);
  document.querySelectorAll('.map-type').forEach(b=>b.classList.toggle('active', b.dataset.map===activeBaseLayer));
  populateBaseChips();
  if(map) map.invalidateSize();
}
function activeBase(){ return activeBaseLayer; }


// (routing live-init is IIFE near ROAD_GRAPH_DATA; no second override block)

// ===== MARKERS =====
function createIcon(color, isGPS, heading){
  if(isGPS){
    const rot = heading != null ? heading : 0;
    const spec = vehicleSpec();
    return L.divIcon({
      className:'',
      html:`<div style="transform:rotate(${rot}deg);color:${spec.color}"><div class="gps-arrow" style="border-bottom-color:${spec.color}"></div></div>`,
      iconSize:[20,24], iconAnchor:[10,16]
    });
  }
  return L.divIcon({
    className:'',
    html:`<div style="width:11px;height:11px;background:${color};border:2px solid #fff;border-radius:50%;box-shadow:0 0 8px ${color}"></div>`,
    iconSize:[13,13], iconAnchor:[6,6]
  });
}
function addPositionMarkers(){
  POSITIONS.forEach(pos=>{
    const ci = CAT_ICONS[pos.cat] || CAT_ICONS.landmark;
    const w = Math.max(30, pos.id.length*7+8);
    const mk = L.marker([pos.lat,pos.lng],{
      icon: L.divIcon({
        className:'pos-label',
        html:`<div class="pos-label-inner" style="border-color:${ci.color}88;min-width:${w}px">${pos.id}</div>`,
        iconSize:[w,18], iconAnchor:[w/2,9]
      }),
      interactive:true, keyboard:false
    }).bindPopup(`<strong>${pos.id}</strong><br>${pos.desc}<br><button onclick="selectTarget('${pos.id.replace(/'/g,"\\'")}')" style="margin-top:5px;padding:5px 10px;background:var(--accent,#00c2e0);color:#000;border:0;border-radius:6px;cursor:pointer;font-size:.6rem">${t('select')}</button>`)
      .on('click',()=>selectTarget(pos.id));
    mk.addTo(labelsLayer); pos._marker = mk;
  });
  updateLabelVisibility();
}
function updateLabelVisibility(){
  const z = map.getZoom(), show = z>=14;
  labelsLayer.eachLayer(l=>{ const el = l.getElement && l.getElement(); if(el) el.style.display = show?'':'none'; });
}
function posById(id){ return POSITIONS.find(p=>p.id===id); }

function showRouteOverview(){
  // Full route 2D north-up fit (Otto) — leave chase-cam for explicit follow FAB / nav start
  followMode = false;
  _userMovedMap = true;
  updateFollowFab();
  // Visual north-up for overview only — keep user's heading-up preference for later chase
  _manualMapRot = 0;
  const mc = document.getElementById('map-container');
  if(mc){
    mc.style.setProperty('--map-rot','0deg');
    mc.style.setProperty('--map-rot-scale','1');
    mc.classList.remove('rotated-map');
  }
  _mapRotation = 0;
  const route = lastRoute;
  const pts = [];
  if(currentPosition) pts.push([currentPosition.lat, currentPosition.lng]);
  if(route && route.latlngs && route.latlngs.length){
    route.latlngs.forEach(ll=>pts.push(ll));
  } else if(selectedTarget){
    pts.push([selectedTarget.lat, selectedTarget.lng]);
  }
  if(pts.length < 2){
    if(selectedTarget) map.setView([selectedTarget.lat, selectedTarget.lng], Math.max(16, _navZoom||16), {animate:true});
    return;
  }
  try{
    const b = L.latLngBounds(pts);
    map.fitBounds(b.pad(0.18), {animate:true, maxZoom:17, padding:[48,48]});
  }catch(e){
    try{ map.fitBounds(pts, {animate:true, maxZoom:17, padding:[48,48]}); }catch(_){}
  }
}

function selectTarget(id){
  const p = posById(id); if(!p) return;
  if (_pendingAction === 'add-via' && selectedTarget && selectedTarget.id !== id) {
    addViaPoint(id); return;
  }
  selectedTarget = p;
  recordHistory(id);
  _pendingAction='destination';
  if(destinationMarker){map.removeLayer(destinationMarker); destinationMarker=null;}
  const ci = CAT_ICONS[p.cat] || CAT_ICONS.landmark;
  destinationMarker = L.marker([p.lat,p.lng],{
    icon:L.divIcon({
      html:`<div style="width:24px;height:24px;background:${ci.color};border:3px solid #fff;border-radius:50%;box-shadow:0 0 18px ${ci.color}"></div>`,
      className:'', iconSize:[28,28], iconAnchor:[14,14]
    }),
    zIndexOffset:900
  }).bindPopup(`<strong>${t('dest')}: ${p.id}</strong><br>${p.desc}`).addTo(map);
  document.getElementById('hud-target-id').textContent = p.id;
  document.getElementById('hud-target-desc').textContent = p.desc;
  document.getElementById('hud-target').classList.add('on');
  document.getElementById('search-sub').textContent = t('dest') + ': ' + p.id;
  setSearchOpen(false); navActive=true; _arrived=false;
  updateFavStar();
  renderTour();
  if(currentPosition){
    drawRoute();
    try{ if(activeBaseLayer === 'sat') setBaseLayer('osm'); }catch(e){}
    // Otto-style: after Ziel select show full-route 2D north-up overview (not chase-cam on stand)
    showRouteOverview();
  }
  else{
    document.getElementById('hud-dist').textContent='—';
    document.getElementById('hud-route-mode').textContent = t('route_mode_none');
    map.setView([p.lat,p.lng], Math.max(17, _navZoom));
  }
  showToast(`${t('route_to')} <strong>${p.id}</strong>`);
  if(_voice) announceOnce(`${t('route_to')} ${p.id}`, true);
}
function clearRoute(){
  selectedTarget=null; _viaPoints=[]; lastRoute=null; navActive=false; _arrived=false;
  if(recenterTimer){clearTimeout(recenterTimer); recenterTimer=null;}
  updateFollowFab();
  if(destinationMarker){map.removeLayer(destinationMarker); destinationMarker=null;}
  routeLayer.clearLayers();
  document.getElementById('hud-target').classList.remove('on');
  document.getElementById('hud-target-id').textContent='—';
  document.getElementById('hud-target-desc').textContent=t('no_target');
  ['hud-dist','hud-speed','hud-bearing','hud-eta'].forEach(id=>document.getElementById(id).textContent='—');
  document.getElementById('hud-route-mode').textContent=t('route_mode_none');
  document.getElementById('hud-via').innerHTML='';
  document.getElementById('search-sub').textContent=t('search_sub');
  document.querySelectorAll('.position-item.selected').forEach(el=>el.classList.remove('selected'));
  updateFavStar(); renderTour();
}
function addViaPoint(id){
  const p=posById(id); if(!p || _viaPoints.find(v=>v.id===id)) return;
  _viaPoints.push(p); renderTour(); drawRoute(); showToast(p.id + ' ' + t('via_selected'));
}

function drawRouteLayers(route, updateFit){
  routeLayer.clearLayers();
  if(!route || !route.latlngs || route.latlngs.length < 2) return;
  L.polyline(route.latlngs,{
    color:'#00c2e0', weight:11, opacity:.20, lineJoin:'round', lineCap:'round',
    smoothFactor:0, noClip:true, pane:'routePane', interactive:false
  }).addTo(routeLayer);
  L.polyline(route.latlngs,{
    color:'#00c2e0', weight:5, opacity:.95, lineJoin:'round', lineCap:'round',
    smoothFactor:0, noClip:true, pane:'routePane', interactive:false
  }).addTo(routeLayer);
  L.polyline(route.latlngs,{
    color:'#ffffff', weight:1.5, opacity:.35, dashArray:'6 10',
    lineJoin:'round', lineCap:'round', smoothFactor:0, noClip:true, pane:'routePane', interactive:false
  }).addTo(routeLayer);
  const mid = route.latlngs[Math.floor(route.latlngs.length/2)];
  L.marker(mid,{
    interactive:false, keyboard:false,
    icon:L.divIcon({className:'', html:`<div class="route-chip">${formatDistance(route.dist)}</div>`, iconAnchor:[40,12]})
  }).addTo(routeLayer);
}
function compileRoute(){
  if(!currentPosition || !selectedTarget) return null;
  let pts = [];
  const stops = _viaPoints.concat([selectedTarget]);
  let from = [currentPosition.lat, currentPosition.lng];
  let totalDist = 0;
  let totalGeo = 0;
  const legs = [];
  for(const stop of stops){
    const leg = computeRoute(from, [stop.lat, stop.lng], stop);
    legs.push({to:stop, dist:leg.dist, viaRoads:leg.viaRoads});
    pts = pts.concat(leg.latlngs);
    totalDist += leg.dist; totalGeo += leg.roadDist || leg.dist;
    from = [stop.lat, stop.lng];
  }
  const dedup = [];
  pts.forEach((pt,i)=>{ if(i===0 || Math.abs(pt[0]-pts[i-1][0])>1e-9 || Math.abs(pt[1]-pts[i-1][1])>1e-9) dedup.push(pt); });
  return {latlngs:dedup, dist:totalDist, viaRoads:true, roadDist:totalGeo, legs};
}
function drawRoute(){
  if(!currentPosition || !selectedTarget) return;
  const route = compileRoute();
  lastRoute = route;
  drawRouteLayers(route, false);
  document.getElementById('hud-dist').textContent = formatDistance(route.dist);
  const mode = route.viaRoads ? t('route_via_roads') : t('route_direct');
  document.getElementById('hud-route-mode').textContent = mode;
  renderTour();
  updateHudMotion();
}
function formatDistance(m){
  if(m==null||isNaN(m)) return '—';
  if(m<1000) return Math.round(m)+' m';
  return (m/1000).toFixed(2)+' km';
}
function getBearing(a,b){
  const dLng=(b[1]-a[1])*Math.PI/180;
  const y=Math.sin(dLng)*Math.cos(b[0]*Math.PI/180);
  const x=Math.cos(a[0]*Math.PI/180)*Math.sin(b[0]*Math.PI/180)-Math.sin(a[0]*Math.PI/180)*Math.cos(b[0]*Math.PI/180)*Math.cos(dLng);
  return (Math.atan2(y,x)*180/Math.PI+360)%360;
}
function distanceToSegment(p, a, b){
  const R=6371000;
  function toCart(ll){ const la=ll[0]*Math.PI/180, lo=ll[1]*Math.PI/180; return {x:Math.cos(la)*Math.cos(lo), y:Math.cos(la)*Math.sin(lo), z:Math.sin(la)}; }
  const P=toCart(p), A=toCart(a), B=toCart(b);
  const AB={x:B.x-A.x,y:B.y-A.y,z:B.z-A.z};
  const AP={x:P.x-A.x,y:P.y-A.y,z:P.z-A.z};
  const ab2=AB.x*AB.x+AB.y*AB.y+AB.z*AB.z;
  const t=ab2===0?0:Math.max(0,Math.min(1,(AP.x*AB.x+AP.y*AB.y+AP.z*AB.z)/ab2));
  const closest={x:A.x+AB.x*t, y:A.y+AB.y*t, z:A.z+AB.z*t};
  const la=Math.asin(Math.max(-1,Math.min(1,closest.z/Math.sqrt(closest.x*closest.x+closest.y*closest.y+closest.z*closest.z))))*180/Math.PI;
  const lo=Math.atan2(closest.y,closest.x)*180/Math.PI;
  return {pt:[la,lo], t:t};
}
function projectOnRoute(cur, route){
  if(!route || !route.latlngs || route.latlngs.length<2) return {index:0, distOnRoute:0, totalDist:route?route.dist:0};
  const pts = route.latlngs;
  let best={dist:Infinity, t:0, idx:0};
  for(let i=0;i<pts.length-1;i++){
    const proj = distanceToSegment(cur, pts[i], pts[i+1]);
    const d = haversine(cur, proj.pt);
    if(d<best.dist){ best={dist:d, t:proj.t, idx:i}; }
  }
  let distOn = 0;
  try{ for(let i=best.idx;i<pts.length-1;i++) distOn += haversine(pts[i], pts[i+1]); }catch(e){}
  return {index:best.idx, distOnRoute:Math.max(0,distOn - (1-best.t)*haversine(pts[best.idx], pts[best.idx+1])), totalDist:route.dist};
}
function remainingAlongRoute(){
  if(!currentPosition || !selectedTarget) return null;
  if(!lastRoute || !lastRoute.latlngs || lastRoute.latlngs.length<2){
    return haversine([currentPosition.lat,currentPosition.lng],[selectedTarget.lat,selectedTarget.lng]);
  }
  const proj = projectOnRoute([currentPosition.lat,currentPosition.lng], lastRoute);
  return Math.max(0, proj.distOnRoute);
}
function nextBearingAlongRoute(){
  if(!currentPosition || !selectedTarget) return null;
  const cur=[currentPosition.lat, currentPosition.lng];
  if(lastRoute && lastRoute.latlngs && lastRoute.latlngs.length>1){
    const pts = lastRoute.latlngs;
    const proj = projectOnRoute(cur, lastRoute);
    const look = pts[Math.min(pts.length-1, proj.index+Math.max(2, Math.floor(pts.length*0.03)))];
    return getBearing(cur, look);
  }
  return getBearing(cur, [selectedTarget.lat, selectedTarget.lng]);
}

function updateGPSStatus(state){
  const dot = document.getElementById('gps-dot');
  const txt = document.getElementById('gps-status');
  const pill = document.getElementById('gps-pill');
  if(!dot || !txt) return;
  dot.classList.remove('on','live','demo','weak');
  if(pill) pill.classList.toggle('denied', state==='off' && _gpsPermState==='denied');
  if(state==='live'){ dot.classList.add('on','live'); txt.textContent=t('gps_live'); }
  else if(state==='demo'){ dot.classList.add('on','demo'); txt.textContent=t('gps_demo'); }
  else if(state==='warte'){ txt.textContent=t('gps_search'); }
  else if(state==='weak'){ dot.classList.add('on','weak'); txt.textContent=t('gps_weak'); }
  else { txt.textContent=t('gps_off'); }
  if(pill){
    if(state==='off') pill.title = t('gps_tap');
    else if(state==='warte') pill.title = t('gps_waiting_fix');
    else pill.title = 'GPS';
  }
}

function speedKmh(){
  if(!currentPosition || currentPosition.speed==null || isNaN(currentPosition.speed)) return null;
  if(currentPosition.speed<0) return null;
  return currentPosition.speed * 3.6;
}
function updateCoordsDisplay(){
  const el = document.getElementById('live-coords'); if(!el) return;
  if(!currentPosition){
    el.innerHTML = `<span class="muted">● ${t('gps_search')}</span>`;
    return;
  }
  const s = speedKmh();
  const acc = currentPosition.accuracy;
  let htmlx = `<span class="live">● ${demoMode ? t('gps_demo') : t('live')}</span> ${currentPosition.lat.toFixed(5)}°, ${currentPosition.lng.toFixed(5)}°`;
  if(acc!=null && isFinite(acc)) htmlx += ` · ±${acc<100?acc.toFixed(0):Math.round(acc)} m`;
  if(s!=null) htmlx += ` · ${s<10?s.toFixed(1):Math.round(s)} km/h`;
  if(currentPosition.heading!=null && isFinite(currentPosition.heading)) htmlx += ` · ${Math.round(currentPosition.heading)}°`;
  if(_manualPosition && typeof _manualPosition === 'object') htmlx += ' <span style="color:var(--warn)">(M)</span>';
  if(demoMode) htmlx += ' <span style="color:var(--warn)">(Demo)</span>';
  el.innerHTML = htmlx;
}

function updateHudMotion(){
  const sp = speedKmh();
  const el = document.getElementById('hud-speed');
  const veh = vehicleSpec();
  if(sp==null){ if(el){el.textContent='—'; el.className='val';} }
  else {
    const txt = sp<10 ? sp.toFixed(1) : Math.round(sp);
    if(el){ el.textContent=txt; el.className='val ' + (sp > veh.limit ? 'danger' : sp > veh.limit*0.85 ? 'warn' : 'ok'); }
    const now = Date.now();
    if(_speedLog.length===0 || now - _speedLog[_speedLog.length-1].t > 2000){
      _speedLog.push({t:now, v:sp});
      if(_speedLog.length>500) _speedLog.shift();
    }
    if(sp > veh.limit + 3){
      const now=Date.now();
      if(now - (_ann.speedWarnAt||0) > 10000){
        _ann.speedWarnAt=now;
        announceOnce(t('warning_speed') + `: ${Math.round(sp)} km/h`);
        showToast(`${t('warning_speed')}: ${Math.round(sp)} km/h`, 'warn');
      }
    }
  }
  if(selectedTarget && currentPosition){
    const remaining = remainingAlongRoute();
    const elDist = document.getElementById('hud-dist');
    if(elDist) elDist.textContent = formatDistance(remaining);
    const elEta = document.getElementById('hud-eta');
    if(elEta){
      const s2 = sp || 0;
      if(s2>1.5 && remaining!=null){
        const mins = Math.round(((remaining/1000)/s2)*60);
        elEta.textContent = mins<1 ? t('less_than_min') : `~${mins} ${t('minutes')}`;
      } else elEta.textContent='—';
    }
    announceRouteProgress(remaining, sp);
  }
  updateSpeedStats();
}
function announceRouteProgress(rem, sp){
  if(!selectedTarget || rem==null) return;
  // Euclidean backup for arrival (GPS jump / off-polyline)
  let destD = null;
  try{ destD = haversine([currentPosition.lat,currentPosition.lng],[selectedTarget.lat,selectedTarget.lng]); }catch(e){}
  const near = (rem < 28) || (destD != null && destD < 22);
  if(near && !_arrived){
    if(Date.now() - (_ann.arrivedAt||0) > 6000){
      _ann.arrivedAt=Date.now(); _arrived=true;
      announceOnce(t('arrived'), true);
      showToast(t('arrived'), 'ok');
      // Close route after brief moment so user sees the toast
      setTimeout(()=>{ if(_arrived) clearRoute(); }, 2200);
    }
    return;
  }
  if(!_voice) return;
  const thresholds=[1000,500,200,100,50,30];
  const now=Date.now();
  if(now - (_ann.remTime||0) < 10000) return;
  for(const th of thresholds){
    if(rem<=th && rem>th-45){
      const txt=`${Math.round(rem/10)*10} m`;
      if(_ann.lastRem !== txt){
        _ann.lastRem=txt; _ann.remTime=now;
        announceOnce(`${t('dist')}: ${txt}`, false);
      }
      break;
    }
  }
}

function clearLivePosition(){
  currentPosition = null;
  gpsActive = false;
  _lastGoodAcc = null;
  if(gpsMarker){ try{ map.removeLayer(gpsMarker); }catch(e){} gpsMarker=null; }
  if(gpsAccuracyCircle){ try{ map.removeLayer(gpsAccuracyCircle); }catch(e){} gpsAccuracyCircle=null; }
  updateCoordsDisplay();
  updateHudMotion();
  updateFollowFab();
}

function updateGPSMarker(){
  if(!currentPosition){
    if(gpsMarker){ try{ map.removeLayer(gpsMarker); }catch(e){} gpsMarker=null; }
    if(gpsAccuracyCircle){ try{ map.removeLayer(gpsAccuracyCircle); }catch(e){} gpsAccuracyCircle=null; }
    return;
  }
  if(gpsMarker) map.removeLayer(gpsMarker);
  if(gpsAccuracyCircle) map.removeLayer(gpsAccuracyCircle);
  const spec = vehicleSpec();
  gpsAccuracyCircle = L.circle([currentPosition.lat,currentPosition.lng],{
    radius: currentPosition.accuracy||10, color:spec.color, weight:1, fillColor:spec.color, fillOpacity:.08
  }).addTo(map);
  gpsMarker = L.marker([currentPosition.lat,currentPosition.lng],{
    icon:createIcon(spec.color,true,currentPosition.heading), zIndexOffset:1000
  }).bindPopup(`<strong>${demoMode?t('gps_demo'):t('live')}</strong><br><small>±${(currentPosition.accuracy||0).toFixed(0)} m · ${(speedKmh()||0).toFixed(0)} km/h</small>`).addTo(map);
}
function setCurrentPosition(lat,lng,opts={}){
  // accept object form: setCurrentPosition({lat,lng,...})
  if(lat && typeof lat==='object' && lat.lat!=null){
    opts = Object.assign({}, lng||{}, lat);
    lng = opts.lng; lat = opts.lat;
  }
  lat = +lat; lng = +lng;
  if(!isFinite(lat) || !isFinite(lng)) return;
  currentPosition = {
    lat, lng,
    accuracy: opts.accuracy!=null? +opts.accuracy : 8,
    heading: opts.heading!=null? +opts.heading : null,
    speed: opts.speed!=null? +opts.speed : null,
    timestamp: Date.now()
  };
  gpsActive=true;
  updateGPSMarker(); updateCoordsDisplay(); updateHudMotion(); updateFollowFab();
  if(selectedTarget) maybeRerouteOnMove();
  if(followMode) followCamera(false);
}
/** Recalculate when driver leaves cyan path or joins a different road. */
function maybeRerouteOnMove(){
  if(!currentPosition || !selectedTarget) return;
  const now = Date.now();
  const cur = [currentPosition.lat, currentPosition.lng];
  let off = 0;
  if(lastRoute && lastRoute.latlngs && lastRoute.latlngs.length>1){
    try{ off = projectOnRoute(cur, lastRoute).dist; }catch(e){ off = 999; }
  } else {
    off = 999;
  }
  let snapChanged = false;
  let sn = null;
  try{
    sn = projectOntoRoad(cur[0], cur[1], true, true);
    if(sn && sn.dist < 45){
      const k1 = sn.a+','+sn.b;
      const k2 = sn.b+','+sn.a;
      if(lastRoute && lastRoute._edgeSet){
        // Vehicle is on a road edge that is not part of the active route → recompute from here
        if(!lastRoute._edgeSet.has(k1) && !lastRoute._edgeSet.has(k2)) snapChanged = true;
      } else if(lastRoute && lastRoute._snapKey && lastRoute._snapKey !== k1 && lastRoute._snapKey !== k2){
        snapChanged = true;
      }
    }
  }catch(e){}
  // Force when off path, on a different road, or no route yet
  const force = off > 22 || snapChanged || !lastRoute;
  const period = snapChanged ? 700 : (off > 12 ? 900 : 2200);
  if(!force && now - (_lastRerouteAt||0) < period) return;
  // Still locked on same route edge and close enough → skip
  if(!force && lastRoute && sn && off < 16){
    const k1 = sn.a+','+sn.b;
    if(lastRoute._edgeSet && (lastRoute._edgeSet.has(k1) || lastRoute._edgeSet.has(sn.b+','+sn.a))) return;
    if(lastRoute._snapKey === k1 || lastRoute._snapKey === sn.b+','+sn.a) return;
  }
  _lastRerouteAt = now;
  drawRoute();
  if(lastRoute && sn){
    lastRoute._snapKey = sn.a+','+sn.b;
  }
}
function startDemo(reason){
  demoMode = true;
  updateGPSStatus('demo');
  stopGpsWatchers(false);
  const base = currentPosition || { lat:50.0405, lng:8.5620 };
  let hdg = (currentPosition && currentPosition.heading!=null && isFinite(currentPosition.heading)) ? currentPosition.heading : 80;
  let lat = base.lat, lng = base.lng;
  if(demoTimer) clearInterval(demoTimer);
  setCurrentPosition(lat, lng, { accuracy:12, heading:hdg, speed: 25/3.6 });
  followMode = true; _userMovedMap = false; updateFollowFab(); followCamera(true);
  showToast(t('gps_demo') + (reason ? ' — '+reason : ''), 'warn');
  updateDemoButton();
  demoTimer = setInterval(()=>{
    if(!demoMode) return;
    const sp = 25/3.6;
    hdg = (hdg + (Math.sin(Date.now()/4000)*4)) % 360;
    const rad = hdg * Math.PI/180;
    const d = sp * 1.0;
    lat += (Math.cos(rad) * d) / 111320;
    lng += (Math.sin(rad) * d) / (111320 * Math.cos(lat*Math.PI/180));
    if(lat>50.055||lat<50.025||lng>8.60||lng<8.52){ hdg = (hdg+140)%360; }
    setCurrentPosition(lat, lng, { accuracy:10 + Math.random()*4, heading:hdg, speed:sp });
    updateGPSStatus('demo');
  }, 1000);
}

function stopDemo(){
  demoMode = false;
  if(demoTimer){ clearInterval(demoTimer); demoTimer=null; }
  updateDemoButton();
  // Demo-Marker und Demo-Geschwindigkeit komplett entfernen
  clearLivePosition();
  _gpsFirstCenterDone = false;
  if(navigator.geolocation) startGPS(true);
  else updateGPSStatus('off');
}
function toggleDemo(){
  if(demoMode){
    stopDemo();
    showToast(t('demo_off'), 'ok');
  } else {
    startDemo(t('demo_on'));
  }
}
function updateDemoButton(){
  const b=document.getElementById('btn-demo');
  if(b){
    b.classList.toggle('active', !!demoMode);
    b.classList.toggle('primary', !!demoMode);
    b.textContent = demoMode ? t('demo_stop') : t('demo');
    b.title = demoMode ? t('demo_stop') : t('demo');
  }
  const c=document.getElementById('check-demo');
  if(c) c.checked = !!demoMode;
}

function stopGpsWatchers(resetStatus){
  if(gpsWatchId!=null){
    try{ navigator.geolocation.clearWatch(gpsWatchId); }catch(e){}
    gpsWatchId=null;
  }
  if(_gpsRetryTimer){ clearTimeout(_gpsRetryTimer); _gpsRetryTimer=null; }
  if(_gpsFallbackTimer){ clearTimeout(_gpsFallbackTimer); _gpsFallbackTimer=null; }
  if(resetStatus && !demoMode) updateGPSStatus('warte');
}

function applyGeoPosition(pos){
  if(demoMode || !pos || !pos.coords) return;
  const c = pos.coords;
  const lat = c.latitude, lng = c.longitude;
  if(!isFinite(lat) || !isFinite(lng)) return;
  const acc = (c.accuracy != null && isFinite(c.accuracy)) ? c.accuracy : 9999;
  // Verwerfe extrem schlechte Fixes nur wenn schon ein guter da ist
  if(acc > 5000 && currentPosition && currentPosition.accuracy != null && currentPosition.accuracy < acc) return;
  if(currentPosition && _lastGoodAcc != null && acc > _lastGoodAcc * 4 && acc > 150){
    updateGPSStatus(_lastGoodAcc > 80 ? 'weak' : 'live');
    return;
  }
  if(acc <= 200 || _lastGoodAcc == null || acc <= _lastGoodAcc) _lastGoodAcc = acc;
  _manualPosition = false;
  _gpsLastFixAt = Date.now();
  let hdg = c.heading;
  if(hdg == null || !isFinite(hdg) || hdg < 0) hdg = null;
  let spd = c.speed;
  if(spd == null || !isFinite(spd) || spd < 0) spd = null;
  // Manche Android-Browser languages speed=0 stationary — behalte null statt 0-freeze im HUD nicht nötig: 0 ist ok
  currentPosition = {
    lat, lng,
    accuracy: acc,
    heading: hdg,
    speed: spd,
    timestamp: pos.timestamp || Date.now()
  };
  gpsActive = true;
  if(acc > 80) updateGPSStatus('weak');
  else updateGPSStatus('live');
  updateGPSMarker();
  updateCoordsDisplay();
  updateHudMotion();
  if(selectedTarget) drawRoute();
  if(!_userMovedMap && !_gpsFirstCenterDone && acc <= 250){
    _gpsFirstCenterDone = true;
    try{ map.setView([lat,lng], Math.max(map.getZoom(), preferredFollowZoom()), {animate:true}); }catch(e){}
  } else if(followMode){
    followCamera(false);
  }
}

function onGeoError(err, fromWatch){
  console.warn('GPS', err && err.message, err && err.code, fromWatch?'watch':'get');
  if(demoMode) return;
  const code = err && err.code;
  if(code === 1){
    // PERMISSION_DENIED
    _gpsPermState = 'denied';
    updateGPSStatus('off');
    // Nur einmal laut meckern
    if(!_gpsUserGestureBound || fromWatch){
      showToast(t('gps_denied'), 'warn');
    }
    return;
  }
  // TIMEOUT (3) / POSITION_UNAVAILABLE (2): weiter suchen, nicht auf Aus
  if(currentPosition && (Date.now() - (currentPosition.timestamp||0) < 60000)){
    updateGPSStatus('weak');
  } else {
    updateGPSStatus('warte');
  }
  // Watch-Fehler: nach Pause erneut starten (manche Brave/WebView droppen watch)
  if(fromWatch && code === 3){
    if(_gpsRetryTimer) clearTimeout(_gpsRetryTimer);
    _gpsRetryTimer = setTimeout(()=>{ if(!demoMode) startGPS(false); }, 4000);
  }
}

function bindGpsUserGesture(){
  if(_gpsUserGestureBound) return;
  _gpsUserGestureBound = true;
  const kick = ()=>{
    if(demoMode) return;
    if(gpsActive && currentPosition && (Date.now()-_gpsLastFixAt)<15000) return;
    if(_gpsPermState === 'denied'){
      // User tippt explizit — nochmal anfragen
      startGPS(true);
      return;
    }
    if(!gpsActive) startGPS(true);
  };
  // Erste Interaktion hebt Mobile-Browser-Sperre oft auf
  ['pointerdown','touchstart','click'].forEach(ev=>{
    document.addEventListener(ev, ()=>{
      if(!gpsActive && !demoMode && _gpsPermState !== 'granted'){
        // soft kick after gesture
        setTimeout(()=>{ if(!demoMode && !gpsActive) startGPS(false); }, 50);
      }
    }, {passive:true, once:false});
  });
  const pill = document.getElementById('gps-pill');
  if(pill){
    pill.addEventListener('click', (e)=>{
      e.preventDefault();
      e.stopPropagation();
      showToast(t('gps_retry'), 'ok');
      _gpsPermState = 'prompt'; // force re-try
      startGPS(true);
    });
    pill.addEventListener('keydown', (e)=>{
      if(e.key==='Enter' || e.key===' '){ e.preventDefault(); pill.click(); }
    });
  }
  document.addEventListener('visibilitychange', ()=>{
    if(document.visibilityState==='visible' && !demoMode){
      if(!gpsActive || (Date.now()-_gpsLastFixAt)>20000) startGPS(false);
    }
  });
  window.addEventListener('focus', ()=>{
    if(!demoMode && (!gpsActive || (Date.now()-_gpsLastFixAt)>20000)) startGPS(false);
  });
}

function watchGpsPermission(){
  if(!navigator.permissions || !navigator.permissions.query) return;
  try{
    navigator.permissions.query({name:'geolocation'}).then(p=>{
      _gpsPermState = p.state || 'unknown';
      if(p.state==='denied') updateGPSStatus('off');
      else if(p.state==='granted' && !demoMode && !gpsActive) startGPS(false);
      p.onchange = ()=>{
        _gpsPermState = p.state || 'unknown';
        if(p.state==='granted' && !demoMode){
          showToast(t('gps_retry'), 'ok');
          startGPS(true);
        } else if(p.state==='denied' && !demoMode){
          updateGPSStatus('off');
        }
      };
    }).catch(()=>{});
  }catch(e){}
}

function startGPS(force){
  if(demoMode) return;
  if(!navigator.geolocation){
    updateGPSStatus('off');
    showToast(t('no_gps'), 'warn');
    return;
  }
  // file:// und unsichere Origins blockieren Geolocation in modernen Browsern
  const host = (location.hostname||'').toLowerCase();
  const okHost = host==='localhost' || host==='127.0.0.1' || host.endsWith('.github.io') || location.protocol==='https:';
  if(!window.isSecureContext && !okHost){
    updateGPSStatus('off');
    showToast(t('gps_insecure'), 'warn');
    return;
  }
  if(_gpsStarting && !force) return;
  _gpsStarting = true;
  setTimeout(()=>{ _gpsStarting=false; }, 800);

  stopGpsWatchers(false);
  if(_gpsPermState==='denied' && !force){
    updateGPSStatus('off');
    return;
  }
  updateGPSStatus('warte');
  bindGpsUserGesture();
  watchGpsPermission();

  // High-accuracy primary; etwas maximumAge hilft kalten Starts auf dem Handy
  const highOpts = { enableHighAccuracy: true, maximumAge: 10000, timeout: 25000 };
  const lowOpts  = { enableHighAccuracy: false, maximumAge: 60000, timeout: 20000 };

  const onOk = pos => applyGeoPosition(pos);
  const onErrGet = err => {
    onGeoError(err, false);
    // Fallback: niedrige Genauigkeit (WLAN/Cell)
    if(err && err.code !== 1){
      try{
        navigator.geolocation.getCurrentPosition(onOk, e2=>onGeoError(e2,false), lowOpts);
      }catch(e){}
    }
  };
  const onErrWatch = err => onGeoError(err, true);

  try{
    navigator.geolocation.getCurrentPosition(onOk, onErrGet, highOpts);
  }catch(e){ console.warn(e); }

  try{
    gpsWatchId = navigator.geolocation.watchPosition(onOk, onErrWatch, highOpts);
  }catch(e){
    console.warn(e);
    updateGPSStatus('off');
  }

  // Wenn nach 12s noch kein Fix: Low-Accuracy-Watch + erneuter get
  if(_gpsFallbackTimer) clearTimeout(_gpsFallbackTimer);
  _gpsFallbackTimer = setTimeout(()=>{
    if(demoMode || gpsActive) return;
    updateGPSStatus('warte');
    try{ navigator.geolocation.getCurrentPosition(onOk, onErrGet, lowOpts); }catch(e){}
    // Zusätzlicher low-acc watch falls high nie feuert
    if(!gpsActive && gpsWatchId==null){
      try{ gpsWatchId = navigator.geolocation.watchPosition(onOk, onErrWatch, lowOpts); }catch(e){}
    }
  }, 12000);
}


function updateFollowFab(){
  const fab=document.getElementById('btn-follow-fab'); if(!fab) return;
  if(currentPosition){
    fab.classList.add('on');
    fab.style.display = 'grid';
    fab.classList.toggle('active', followMode);
    fab.title = followMode ? t('follow')+' ✓' : t('follow');
  } else {
    fab.classList.remove('on','active');
  }
}

function preferredFollowZoom(){
  // User-chosen nav zoom (16–19) — stay close; mild speed adapt
  let z = _navZoom;
  const sp = (typeof speedKmh === 'function') ? speedKmh() : null;
  if(navActive){
    // During guidance never drop below setting-1, floor 16
    if(sp != null && isFinite(sp)){
      if(sp > 50) z = Math.max(16, _navZoom - 1);
      else if(sp < 12) z = Math.min(19, Math.max(z, _navZoom));
    }
    if(selectedTarget && currentPosition){
      const d = haversine([currentPosition.lat, currentPosition.lng], [selectedTarget.lat, selectedTarget.lng]);
      if(d < 80) z = Math.min(19, Math.max(z, _navZoom + 1));
      else if(d < 200) z = Math.min(19, Math.max(z, _navZoom));
    }
    z = Math.max(16, z);
  } else {
    if(sp != null && isFinite(sp)){
      if(sp > 55) z = Math.max(16, z - 1);
    }
  }
  const mx = (map && map.getMaxZoom) ? map.getMaxZoom() : 19;
  return Math.min(mx, Math.max(16, z));
}
function setNavZoom(z, apply){
  _navZoom = Math.min(19, Math.max(16, parseInt(z, 10) || 18));
  localStorage.setItem('fra_nav_zoom', String(_navZoom));
  const el = document.getElementById('nav-zoom');
  const val = document.getElementById('nav-zoom-val');
  if(el && String(el.value) !== String(_navZoom)) el.value = String(_navZoom);
  if(val) val.textContent = String(_navZoom);
  if(apply !== false && followMode && currentPosition) followCamera(true);
}
function reliableNavHeading(){
  // Only use a heading that will not flip the map sideways while standing still
  if(!currentPosition) return null;
  const sp = (typeof speedKmh === 'function') ? (speedKmh() || 0) : 0;
  const gh = currentPosition.heading;
  if(gh != null && isFinite(gh) && (sp >= 2.5 || demoMode)) return gh;
  // Progress-derived heading only while actually moving
  if(sp >= 5 && navActive){
    const nb = (typeof nextBearingAlongRoute === 'function') ? nextBearingAlongRoute() : null;
    if(nb != null && isFinite(nb)) return nb;
  }
  return null;
}
function navLookAheadLL(){
  // Center slightly ahead of the arrow so it sits lower — “from behind” 2D chase cam
  const lat = currentPosition.lat, lng = currentPosition.lng;
  const hdg = (_headingUp) ? reliableNavHeading() : null;
  if(hdg == null || !isFinite(hdg)) return [lat, lng];
  const sp = (typeof speedKmh === 'function') ? speedKmh() : 0;
  const leadM = 28 + Math.min(55, (sp || 0) * 0.9) + (navActive ? 12 : 0);
  const rad = hdg * Math.PI / 180;
  const dLat = (Math.cos(rad) * leadM) / 111320;
  const dLng = (Math.sin(rad) * leadM) / (111320 * Math.cos(lat * Math.PI / 180));
  return [lat + dLat, lng + dLng];
}
function followCamera(instant){
  if(!currentPosition || !followMode) return;
  const z = preferredFollowZoom();
  const ll = navLookAheadLL();
  if(instant){ map.setView(ll, z, {animate:false}); }
  else {
    const cur = map.getZoom();
    if(Math.abs(cur - z) >= 0.35){
      map.setView(ll, z, {animate:true, duration:.4});
    } else {
      map.panTo(ll, {animate:true, duration:.3, easeLinearity:.2});
    }
  }
  applyMapRotation();
}
function rotScaleFor(deg){
  // Cover black corners: rotate then enlarge so the map still fills the viewport.
  // 1/cos under-fills; need |cos|+|sin| (square) and aspect-adjusted on phones.
  const a = Math.abs(((deg % 180) + 180) % 180);
  const r = (a > 90 ? 180 - a : a) * Math.PI / 180;
  const c = Math.abs(Math.cos(r));
  const s = Math.abs(Math.sin(r));
  const mc = document.getElementById('map-container');
  const w = (mc && mc.clientWidth) || window.innerWidth || 390;
  const h = (mc && mc.clientHeight) || window.innerHeight || 844;
  const ar = Math.max(0.35, Math.min(3, w / Math.max(1, h)));
  const scale = Math.max(c + s / ar, c + s * ar);
  return Math.min(2.65, Math.max(1, scale * 1.06));
}
function applyMapRotation(){
  // Always north-up bird's-eye: rotation disabled by product requirement.
  _manualMapRot = 0; _mapRotation = 0; _headingUp = false;
  const mc = document.getElementById('map-container'); if(!mc) return;
  mc.style.setProperty('--map-rot','0deg');
  mc.style.setProperty('--map-rot-scale','1');
  mc.classList.remove('rotated-map');
}
function setMapRotation(_deg){ applyMapRotation(); }
function nudgeMapRotation(_deltaDeg){ applyMapRotation(); }
function resetMapRotationNorth(){ applyMapRotation(); }
function bindMapZoomControls(){
  const zin = document.getElementById('btn-zoom-in');
  const zout = document.getElementById('btn-zoom-out');
  if(zin) zin.addEventListener('click', e=>{ e.stopPropagation(); if(map) map.zoomIn(); });
  if(zout) zout.addEventListener('click', e=>{ e.stopPropagation(); if(map) map.zoomOut(); });
}
function shakeAndRecenter(){
  const box=document.getElementById('map-container');
  if(box){ box.classList.remove('shake'); void box.offsetWidth; box.classList.add('shake'); setTimeout(()=>box.classList.remove('shake'),420); }
  followMode=true; _userMovedMap=false; updateFollowFab(); followCamera(true);
}

function onUserPanMap(){
  _userMovedMap = true;
  if(followMode){
    followMode = false;
    updateFollowFab();
  }
  if(recenterTimer){ clearTimeout(recenterTimer); recenterTimer = null; }
}

function centerOnUser(){
  if(!currentPosition){
    showToast(t('gps_weak'), 'warn');
    return;
  }
  if(followMode){
    followMode = false;
    updateFollowFab();
    showToast(t('map_free'));
    return;
  }
  followMode = true;
  _userMovedMap = false;
  if(recenterTimer){clearTimeout(recenterTimer);recenterTimer=null;}
  updateFollowFab();
  followCamera(true);
  showToast(t('follow'));
}


function setSearchOpen(open){
  const shell=document.getElementById('search-shell'); const toggle=document.getElementById('search-toggle');
  if(!shell) return;
  if(open){ shell.classList.add('open'); if(toggle) toggle.setAttribute('aria-expanded','true'); }
  else { shell.classList.remove('open'); if(toggle) toggle.setAttribute('aria-expanded','false'); }
}
function toggleSearch(){ const open=!document.getElementById('search-shell').classList.contains('open'); setSearchOpen(open); if(open) setTimeout(()=>document.getElementById('search-box').focus(),50); }
function renderPositionList(filter=''){
  const container=document.getElementById('position-list'); if(!container) return;
  const f=filter.toLowerCase().trim(); let grouped={};
  CAT_ORDER.forEach(cat=>grouped[cat]=[]);
  POSITIONS.forEach(pos=>{ if(!grouped[pos.cat]) grouped[pos.cat]=[]; if(!f||pos.id.toLowerCase().includes(f)||pos.desc.toLowerCase().includes(f)||(pos.cat||'').includes(f)) grouped[pos.cat].push(pos); });
  let html='';
  CAT_ORDER.forEach(cat=>{
    const items=grouped[cat]; if(!items||items.length===0) return;
    const ci=CAT_ICONS[cat];
    html+=`<div class="sec-label" style="color:${ci.color}">${ci.icon} ${ci.label} (${items.length})</div>`;
    items.forEach(pos=>{ html+=`<div class="position-item" data-pos-id="${pos.id}" onclick="selectTarget('${pos.id.replace(/'/g,"\\'")}')"><div><span class="pos-id">${pos.id}</span><span class="pos-desc">${pos.desc}</span></div><span class="cat-chip">${ci.label.split(' ')[0]}</span></div>`; });
  });
  if(!html) html=`<div style="padding:16px;text-align:center;color:var(--muted);font-size:.8rem">${t('no_matches')}</div>`;
  container.innerHTML=html;
}
function posById(id){ return POSITIONS.find(p=>p.id===id); }

// ===== FAVORITES & HISTORY =====
function syncFavHistory(){
  const el=document.getElementById('fav-history'); if(!el) return; el.innerHTML='';
  const addLabel=(text)=>{ const d=document.createElement('div'); d.className='sec-label'; d.style.width='100%'; d.textContent=text; el.appendChild(d); };
  if(_favorites.length){ addLabel(t('favorites')); }
  _favorites.forEach(id=>{
    const p=posById(id); if(!p) return; const b=document.createElement('button');
    b.textContent='★ '+p.id; b.className='fav'; b.title=p.desc; b.onclick=()=>selectTarget(id); el.appendChild(b);
  });
  if(_history.length){ addLabel(t('history')); }
  _history.slice().reverse().forEach(id=>{
    const p=posById(id); if(!p) return; const b=document.createElement('button'); b.textContent=p.id; b.title=p.desc; b.onclick=()=>selectTarget(id); el.appendChild(b);
  });
  if(_history.length){ const b=document.createElement('button'); b.textContent='🗑'; b.title=t('clear_history'); b.onclick=()=>{_history=[]; localStorage.removeItem('fra_history'); syncFavHistory();}; el.appendChild(b); }
}
function recordHistory(id){ if(!id) return; _history=_history.filter(x=>x!==id); _history.push(id); if(_history.length>20) _history.shift(); localStorage.setItem('fra_history', JSON.stringify(_history)); syncFavHistory(); }
function toggleFav(id){
  if(!id) id=selectedTarget&&selectedTarget.id; if(!id) return;
  if(_favorites.includes(id)) _favorites=_favorites.filter(x=>x!==id); else _favorites.push(id);
  localStorage.setItem('fra_favs', JSON.stringify(_favorites)); updateFavStar(); syncFavHistory();
}
function updateFavStar(){ const b=document.getElementById('btn-fav-target'); if(!b) return; const on=selectedTarget&&_favorites.includes(selectedTarget.id); b.classList.toggle('on', on); b.textContent = on?'★':'☆'; }

// ===== TOUR / VIA =====
function renderTour(){
  const el=document.getElementById('tour-stops'); if(!el) return; el.innerHTML='';
  const add=(txt)=>{ const r=document.createElement('div'); r.className='row'; r.textContent=txt; el.appendChild(r); };
  if(_viaPoints.length===0 && !selectedTarget){ add(t('tour_hint')); return; }
  _viaPoints.forEach((p,i)=>{
    const r=document.createElement('div'); r.className='row';
    r.innerHTML=`<span>${i+1}. ${t('via')}: ${p.id}</span><button type="button" class="btn icon" style="width:22px;height:22px" onclick="removeViaPoint('${p.id.replace(/'/g,"\\'")}')">✕</button>`;
    el.appendChild(r);
  });
  if(selectedTarget) add(`${t('dest')}: ${selectedTarget.id}`);
}
function removeViaPoint(id){ _viaPoints=_viaPoints.filter(p=>p.id!==id); renderTour(); if(selectedTarget) drawRoute(); }
function addViaFromSearch(id){ const p=posById(id); if(p && selectedTarget && selectedTarget.id!==id){ _viaPoints.push(p); renderTour(); drawRoute(); showToast(p.id+' '+t('via_selected')); } }

function onMapClick(e){
  if(_manualPosition === 'picking'){
    _manualPosition = {lat:e.latlng.lat, lng:e.latlng.lng};
    setCurrentPosition(e.latlng.lat, e.latlng.lng, {accuracy:10, heading:null, speed:null});
    showToast(t('manual_pos') + ` ${e.latlng.lat.toFixed(5)}, ${e.latlng.lng.toFixed(5)}`);
    document.body.classList.remove('picking-pos'); _offline=false;
    updateGPSStatus('live'); return;
  }
}
function setManualPositionMode(){
  _manualPosition='picking'; document.body.classList.add('picking-pos'); showToast(t('manual_pos') + ': '+t('map_click_hint'));
}
function handleManualSet(){
  const la=parseFloat(document.getElementById('manual-lat').value);
  const lo=parseFloat(document.getElementById('manual-lng').value);
  if(!isNaN(la)&&!isNaN(lo)){ _manualPosition={lat:la,lng:lo}; setCurrentPosition(la,lo,{accuracy:10}); showToast('Manual position set'); }
}

function showToast(msg, type){
  document.querySelectorAll('.toast').forEach(t=>t.remove());
  const toast=document.createElement('div'); toast.className='toast';
  if(type==='error') toast.style.borderLeftColor='var(--danger)';
  if(type==='warn') toast.style.borderLeftColor='var(--warn)';
  if(type==='ok') toast.style.borderLeftColor='var(--ok)';
  toast.innerHTML = msg || '';
  document.body.appendChild(toast);
  setTimeout(()=>{toast.style.opacity='0';toast.style.transition='opacity .3s';},2600);
  setTimeout(()=>toast.remove(),3000);
}

// ===== DRAWER / PANELS =====
function openDrawer(){ document.getElementById('drawer').classList.add('open'); document.getElementById('backdrop').classList.add('on'); }
function closeDrawer(){ document.getElementById('drawer').classList.remove('open'); closePanels(); }
function toggleDrawer(){ if(document.getElementById('drawer').classList.contains('open')) closeDrawer(); else openDrawer(); }
function openPanel(id){ document.querySelectorAll('.panel').forEach(p=>p.classList.remove('open')); document.getElementById(id).classList.add('open'); }
function closePanels(){ document.querySelectorAll('.panel.open, .modal.on').forEach(p=>p.classList.remove('open','on')); document.getElementById('backdrop').classList.remove('on'); }

// ===== LAYERS =====

// ===== Terminal/Gebäude zones (Schengen, Non-Schengen, ASO/AUEW/BNS/BSO …) =====
const TERMINAL_ZONES = [
  { id:'SCH_A', label:'Schengen A', kind:'schengen', color:'#22c55e',
    coords:[[50.0508,8.5665],[50.0508,8.5728],[50.0480,8.5735],[50.0476,8.5675]] },
  { id:'NSCH_A', label:'Non-Schengen A', kind:'nonschengen', color:'#f59e0b',
    coords:[[50.0506,8.5726],[50.0506,8.5770],[50.0479,8.5774],[50.0476,8.5734]] },
  { id:'SCH_B', label:'Schengen B', kind:'schengen', color:'#22c55e',
    coords:[[50.0509,8.5770],[50.0509,8.5818],[50.0484,8.5822],[50.0481,8.5774]] },
  { id:'NSCH_B', label:'Non-Schengen B', kind:'nonschengen', color:'#f59e0b',
    coords:[[50.0508,8.5816],[50.0508,8.5860],[50.0486,8.5864],[50.0483,8.5820]] },
  { id:'SCH_C', label:'Schengen C', kind:'schengen', color:'#22c55e',
    coords:[[50.0510,8.5858],[50.0510,8.5905],[50.0488,8.5910],[50.0485,8.5862]] },
  { id:'NSCH_C', label:'Non-Schengen C', kind:'nonschengen', color:'#f59e0b',
    coords:[[50.0506,8.5902],[50.0506,8.5940],[50.0489,8.5942],[50.0486,8.5906]] },
  { id:'T2_DE', label:'T2 D/E', kind:'building', color:'#38bdf8',
    coords:[[50.0520,8.5865],[50.0520,8.5925],[50.0498,8.5930],[50.0495,8.5868]] },
  { id:'T3_GHJ', label:'T3 G/H/J', kind:'building', color:'#a78bfa',
    coords:[[50.0345,8.5685],[50.0345,8.5910],[50.0290,8.5910],[50.0290,8.5685]] }
];
const BUILDING_CODES = [
  { id:'ASO', label:'ASO', desc:'Arrival Schengen Ost', lat:50.04985, lng:8.5742, kind:'code' },
  { id:'AUEW', label:'AUEW', desc:'Abflug Non-Schengen West (A)', lat:50.04970, lng:8.5698, kind:'code' },
  { id:'AUES', label:'AUES', desc:'Abflug Schengen (A)', lat:50.04955, lng:8.5718, kind:'code' },
  { id:'BNS', label:'BNS', desc:'B Non-Schengen', lat:50.04990, lng:8.5835, kind:'code' },
  { id:'BSO', label:'BSO', desc:'B Schengen Ost', lat:50.04980, lng:8.5798, kind:'code' },
  { id:'BNW', label:'BNW', desc:'B Non-Schengen West', lat:50.04975, lng:8.5778, kind:'code' },
  { id:'CSO', label:'CSO', desc:'C Schengen Ost', lat:50.04995, lng:8.5882, kind:'code' },
  { id:'CNS', label:'CNS', desc:'C Non-Schengen', lat:50.04990, lng:8.5915, kind:'code' },
  { id:'DSO', label:'DSO', desc:'D Schengen (T2)', lat:50.05120, lng:8.5880, kind:'code' },
  { id:'ENS', label:'ENS', desc:'E Non-Schengen (T2)', lat:50.05110, lng:8.5908, kind:'code' },
  { id:'GAT_A', label:'Gebäude A', desc:'Terminal 1 · Pier A', lat:50.04930, lng:8.5708, kind:'building' },
  { id:'GAT_B', label:'Gebäude B', desc:'Terminal 1 · Pier B', lat:50.04940, lng:8.5800, kind:'building' },
  { id:'GAT_C', label:'Gebäude C', desc:'Terminal 1 · Pier C', lat:50.04950, lng:8.5885, kind:'building' },
  { id:'GAT_DE', label:'Gebäude D/E', desc:'Terminal 2', lat:50.05100, lng:8.5895, kind:'building' },
  { id:'GAT_T3', label:'Gebäude T3', desc:'Terminal 3 · G/H/J', lat:50.03180, lng:8.5795, kind:'building' }
];

function addTerminalZones(){
  if (!zoneLayer) return;
  zoneLayer.clearLayers();
  TERMINAL_ZONES.forEach(z=>{
    const poly = L.polygon(z.coords, {
      color: z.color, weight: 1.5, opacity: 0.85,
      fillColor: z.color, fillOpacity: 0.12,
      interactive: true, className: 'zone-poly zone-'+z.kind
    }).bindPopup('<strong>'+z.label+'</strong><br><span style="opacity:.75">'+z.id+' · '+z.kind+'</span>');
    // center label
    let la=0, ln=0;
    z.coords.forEach(c=>{ la+=c[0]; ln+=c[1]; });
    la/=z.coords.length; ln/=z.coords.length;
    const lab = L.marker([la, ln], {
      interactive:false, zIndexOffset: 200,
      icon: L.divIcon({
        className: 'zone-label',
        html: '<div class="zone-chip kind-'+z.kind+'" style="border-color:'+z.color+'">'+z.label+'</div>',
        iconSize: [0,0], iconAnchor: [0,0]
      })
    });
    poly.addTo(zoneLayer);
    lab.addTo(zoneLayer);
  });
}
function addBuildingCodeLabels(){
  if (!buildingLabelLayer) return;
  buildingLabelLayer.clearLayers();
  BUILDING_CODES.forEach(b=>{
    const col = b.kind==='building' ? '#e2e8f0' : ( /NS|UEW|Non/i.test(b.label+b.desc) ? '#fbbf24' : '#4ade80');
    const m = L.marker([b.lat, b.lng], {
      zIndexOffset: 450,
      icon: L.divIcon({
        className: 'bldg-code-marker',
        html: '<div class="bldg-chip" style="--c:'+col+'" title="'+b.desc+'"><b>'+b.label+'</b><span>'+b.desc+'</span></div>',
        iconSize: [0,0], iconAnchor: [0,0]
      })
    }).bindPopup('<strong>'+b.label+'</strong><br>'+b.desc);
    m.addTo(buildingLabelLayer);
  });
}
function toggleZones(show){
  if (!map || !zoneLayer) return;
  if (show){ addTerminalZones(); zoneLayer.addTo(map); }
  else map.removeLayer(zoneLayer);
  try { localStorage.setItem('fra_zones', show ? '1':'0'); } catch(e){}
}
function toggleBuildingLabels(show){
  if (!map || !buildingLabelLayer) return;
  if (show){ addBuildingCodeLabels(); buildingLabelLayer.addTo(map); }
  else map.removeLayer(buildingLabelLayer);
  try { localStorage.setItem('fra_bldgs', show ? '1':'0'); } catch(e){}
}

function addNFZPolygons(){
  NFZ_POLYGONS.forEach(z=>{
    const poly=L.polygon(z.coords,{className:'nfz-poly', interactive:false}).bindPopup('<strong>NFZ</strong><br>'+z.label);
    z._layer = poly; // keep reference unsaved for toggle
    poly.addTo(nfzLayer);
  });
}
function addEmergencyMarkers(){
  const colors={fire:'#ff4d4d', medical:'#2ecc71', assembly:'#f1c40f'};
  EMERGENCY_POINTS.forEach(p=>{
    const m=L.marker([p.lat,p.lng],{icon:L.divIcon({className:'',html:`<div style="width:10px;height:10px;background:${colors[p.type]||'#888'};border:2px solid #fff;border-radius:50%;box-shadow:0 0 8px ${colors[p.type]||'#888'}"></div>`,iconSize:[12,12],iconAnchor:[6,6]}), zIndexOffset:600})
      .bindPopup(`<strong>${p.label}</strong><br>${p.type}`);
    m.addTo(emergencyLayer);
  });
}
function toggleNFZ(show){ if(show) nfzLayer.addTo(map); else map.removeLayer(nfzLayer); }
function toggleEmergency(show){ if(show) emergencyLayer.addTo(map); else map.removeLayer(emergencyLayer); }
function toggleFleet(show){ if(show){ startFleet(); fleetLayer.addTo(map); } else { stopFleet(); map.removeLayer(fleetLayer); } }

// ===== FLEET SIM =====
function initFleetVehicles(){
  const calls=['FOLLOW1','BAGG1','CATER2','FUEL3','SCHLEPP4','TOW5','OPS7','CARGO9'];
  calls.forEach((c,i)=>{
    const lat=50.035+i*0.003, lng=8.56+i*0.004;
    const mk=L.marker([lat,lng],{icon:L.divIcon({className:'fleet',html:`<div style="width:8px;height:8px;background:#f1c40f;border:1.5px solid #fff;border-radius:50%;box-shadow:0 0 6px #f1c40f"></div>`,iconSize:[10,10],iconAnchor:[5,5]})})
      .bindPopup(c).addTo(fleetLayer);
    _fleet.push({call:c, marker:mk, lat,lng,phase:i*0.7, speed:0.0002+i*0.00005});
  });
}
function startFleet(){
  if(_fleetTimer) return;
  _fleetTimer=setInterval(()=>{
    const t=Date.now()*0.0002;
    _fleet.forEach((v,i)=>{
      const a=v.phase+t*(0.5+i*0.1);
      v.lat = 50.035 + Math.sin(a)*0.006*(1+i%3);
      v.lng = 8.56 + Math.cos(a*0.7)*0.008*(1+i%2);
      v.marker.setLatLng([v.lat,v.lng]);
    });
  },1000);
}
function stopFleet(){ if(_fleetTimer){ clearInterval(_fleetTimer); _fleetTimer=null; } }

// ===== SPEED LOG =====
function updateSpeedStats(){
  const stats=document.getElementById('speed-stats'); if(!stats) return;
  const valid=_speedLog.filter(x=>x.v!=null && x.v>=0);
  if(!valid.length){ stats.innerHTML=`<div>${t('no_data')}</div>`; return; }
  const max=Math.max(...valid.map(x=>x.v)); const avg=valid.reduce((a,x)=>a+x.v,0)/valid.length;
  stats.innerHTML=`<div><strong>${t('max_speed')}:</strong> ${max.toFixed(1)} km/h · <strong>${t('avg_speed')}:</strong> ${avg.toFixed(1)} km/h</div>`;
  const list=document.getElementById('speed-list'); if(!list) return;
  const last=valid.slice(-20).reverse();
  list.innerHTML=last.map(r=>`<div class="row"><span>${new Date(r.t).toLocaleTimeString()}</span><span>${r.v.toFixed(1)} km/h</span></div>`).join('');
}

// ===== METAR =====
async function fetchMETAR(){
  const rawEl=document.getElementById('metar-raw'); const par=document.getElementById('metar-parsed');
  rawEl.textContent='…'; par.innerHTML='';
  try{
    const url='https://aviationweather.gov/api/data/metar?ids=EDDF&format=raw&hours=1';
    const res=await fetch(url,{cache:'no-store'}); const txt=await res.text();
    rawEl.textContent=txt || '—';
    parseMETAR(txt, par);
  } catch(e){
    try{
      const res=await fetch('https://tgftp.nws.noaa.gov/weather/current/EDDF/EDDF.txt',{cache:'no-store'});
      const txt=await res.text(); rawEl.textContent=txt; parseMETAR(txt,par);
    }catch(e2){ rawEl.textContent='METAR not available. '+(e2.message||''); }
  }
}
function parseMETAR(raw, el){
  const m=raw.match(/EDDF[\s\S]*?=/);
  if(!m){ el.innerHTML='<div>Could not parse METAR.</div>'; return; }
  const s=m[0];
  const wind=s.match(/(\d{3}|VRB)(\d{2,3})(?:G(\d{2,3}))?KT/) || null;
  const vis=s.match(/\s(\d{4}|\dSM|P6SM)\s/);
  const cloud=s.match(/(FEW|SCT|BKN|OVC)\d{3}/g);
  const temp=s.match(/(M?\d{2})\/(M?\d{2})/);
  const qnh=s.match(/Q(\d{4})/);
  function fC(v){ const neg=v.startsWith('M'); return (parseInt(v.replace('M',''))*(neg?-1:1)); }
  el.innerHTML = '<div>Wind: '+(wind?`${wind[1]}° ${wind[2]}kt`:'—')+'</div>'
    +'<div>Visibility: '+(vis?vis[1]:'—')+'</div>'
    +'<div>Clouds: '+(cloud?cloud.join(', '):'—')+'</div>'
    +'<div>Temp/Dew: '+(temp?`${fC(temp[1])}°C / ${fC(temp[2])}°C`:'—')+'</div>'
    +'<div>QNH: '+(qnh?qnh[1]+' hPa':'—')+'</div>';
}

// ===== REPORT / QR =====
function buildMissionURL(){
  const params = new URLSearchParams();
  if(selectedTarget) params.set('dest', selectedTarget.id);
  if(_viaPoints.length) params.set('via', _viaPoints.map(p=>p.id).join(','));
  params.set('vehicle', _vehicle); params.set('lang', _lang);
  const base = (location.origin && location.origin !== 'null') ? location.origin + location.pathname : 'https://fra-navigator.example';
  return base + '?' + params.toString();
}
function generateReport(){
  const content=document.getElementById('report-content');
  const qr=document.getElementById('report-qr');
  const url=buildMissionURL();
  const dist = lastRoute ? lastRoute.dist : null;
  const sp=speedKmh();
  const valid=_speedLog.filter(x=>x.v!=null);
  const max=valid.length?Math.max(...valid.map(x=>x.v)):null;
  const avg=valid.length?(valid.reduce((a,x)=>a+x.v,0)/valid.length):null;
  content.innerHTML = `
    <div><strong>${t('dest')}:</strong> ${selectedTarget ? selectedTarget.id : '—'} ${selectedTarget?selectedTarget.desc:''}</div>
    <div><strong>${t('via')}:</strong> ${_viaPoints.length ? _viaPoints.map(p=>p.id).join(', ') : '—'}</div>
    <div><strong>${t('distance')}:</strong> ${dist!=null ? formatDistance(dist) : '—'}</div>
    <div><strong>${t('max_speed')}:</strong> ${max!=null ? max.toFixed(1)+' km/h' : '—'}</div>
    <div><strong>${t('avg_speed')}:</strong> ${avg!=null ? avg.toFixed(1)+' km/h' : '—'}</div>
    <div><strong>URL:</strong> ${url}</div>
  `;
  qr.src = `https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(url)}`;
  qr.onload = ()=>{}; qr.onerror = ()=>{qr.style.display='none';};
  document.getElementById('report-modal').classList.add('on');
}

function registerSW(){
  if('serviceWorker' in navigator && location.protocol !== 'file:'){
    navigator.serviceWorker.register('sw.js').catch(err=>console.warn('SW',err));
  }
}
function bindEvents(){
  document.getElementById('search-toggle').addEventListener('click', toggleSearch);
  document.getElementById('btn-search-toggle').addEventListener('click', toggleSearch);
  const sb=document.getElementById('search-box');
  sb.addEventListener('input', e=>{ setSearchOpen(true); renderPositionList(e.target.value); });
  sb.addEventListener('keydown', e=>{ if(e.key==='Enter'){ const first=document.querySelector('.position-item'); if(first){ const id=first.dataset.posId; if(id) selectTarget(id); } } });
  document.getElementById('btn-center').addEventListener('click', centerOnUser);
  document.getElementById('btn-follow-fab').addEventListener('click', centerOnUser);
  document.getElementById('btn-clear-route').addEventListener('click', clearRoute);
  document.getElementById('btn-fav-target').addEventListener('click', ()=>toggleFav());
  document.getElementById('btn-add-via').addEventListener('click', ()=>{
    if(!selectedTarget){ showToast(t('select_dest_first'), 'warn'); return; }
    _pendingAction='add-via'; setSearchOpen(true); sb.focus();
    showToast(t('via_mode') , 'ok');
  });

  document.getElementById('btn-menu').addEventListener('click', toggleDrawer);
  document.getElementById('btn-close-drawer').addEventListener('click', closeDrawer);
  document.getElementById('btn-layers').addEventListener('click', ()=>{ openDrawer(); });
  document.getElementById('backdrop').addEventListener('click', closeDrawer);

  document.getElementById('lang-select').addEventListener('change', e=>setLang(e.target.value));
  document.getElementById('vehicle-select').addEventListener('change', e=>{ _vehicle=e.target.value; localStorage.setItem('fra_vehicle', _vehicle); updateGPSMarker(); updateHudMotion(); });
  document.getElementById('check-voice').addEventListener('change', e=>{ _voice=e.target.checked; localStorage.setItem('fra_voice', _voice? 'true':'false'); });
  // heading-up UI removed — north-up only
  const navZoomEl = document.getElementById('nav-zoom');
  if(navZoomEl){
    navZoomEl.value = String(_navZoom);
    const v = document.getElementById('nav-zoom-val'); if(v) v.textContent = String(_navZoom);
    navZoomEl.addEventListener('input', e=> setNavZoom(e.target.value, true));
    navZoomEl.addEventListener('change', e=> setNavZoom(e.target.value, true));
  }
  document.getElementById('check-nfz').addEventListener('change', e=>toggleNFZ(e.target.checked));
  document.getElementById('check-emergency').addEventListener('change', e=>toggleEmergency(e.target.checked));
  document.getElementById('check-fleet').addEventListener('change', e=>toggleFleet(e.target.checked));
  const zEl=document.getElementById('check-zones'); if(zEl) zEl.addEventListener('change', e=>toggleZones(e.target.checked));
  const bEl=document.getElementById('check-buildings'); if(bEl) bEl.addEventListener('change', e=>toggleBuildingLabels(e.target.checked));

  document.getElementById('btn-demo').addEventListener('click', toggleDemo);
  document.getElementById('check-demo').addEventListener('change', e=>{
    if(e.target.checked !== !!demoMode) toggleDemo();
  });

  document.getElementById('btn-manual-pos').addEventListener('click', ()=>{
    document.getElementById('manual-pos-inputs').classList.toggle('hidden');
  });
  document.getElementById('btn-set-manual').addEventListener('click', handleManualSet);
  document.getElementById('manual-lat').addEventListener('keydown', e=>{ if(e.key==='Enter') handleManualSet(); });
  document.getElementById('manual-lng').addEventListener('keydown', e=>{ if(e.key==='Enter') handleManualSet(); });

  document.getElementById('btn-speedlog').addEventListener('click', ()=>{ openPanel('speed-panel'); closeDrawer(); });
  document.querySelector('.close-speed').addEventListener('click', closePanels);
  document.getElementById('btn-metar').addEventListener('click', ()=>{ openPanel('metar-panel'); closeDrawer(); if(document.getElementById('metar-raw').textContent.trim()==='—') fetchMETAR(); });
  document.querySelector('.close-metar').addEventListener('click', closePanels);
  document.getElementById('btn-refresh-metar').addEventListener('click', fetchMETAR);
  document.getElementById('btn-tour').addEventListener('click', ()=>{ openPanel('tour-panel'); closeDrawer(); openPanel('tour-panel'); });
  document.querySelector('.close-tour').addEventListener('click', closePanels);
  document.getElementById('btn-clear-tour').addEventListener('click', ()=>{ _viaPoints=[]; renderTour(); if(selectedTarget) drawRoute(); });
  document.getElementById('btn-report').addEventListener('click', ()=>{ closeDrawer(); generateReport(); });
  document.querySelectorAll('.close-report').forEach(b=>b.addEventListener('click', ()=>document.getElementById('report-modal').classList.remove('on')));
  document.getElementById('btn-print-report').addEventListener('click', ()=>window.print());
  document.getElementById('btn-theme').addEventListener('click', toggleTheme);

  document.querySelectorAll('.map-type').forEach(b=>b.addEventListener('click', e=>setBaseLayer(e.target.dataset.map)));
  bindMapZoomControls();

  document.addEventListener('keydown', e=>{
    if((e.ctrlKey||e.metaKey)&&e.key==='f'){ e.preventDefault(); setSearchOpen(true); sb.focus(); }
    if(e.key==='Escape'){ closeDrawer(); closePanels(); setSearchOpen(false); sb.blur(); if(navActive){ followMode=true; updateFollowFab(); followCamera(true); } }
  });
  window.addEventListener('online', ()=>{ _offline=false; showToast(t('online')); });
  window.addEventListener('offline', ()=>{ _offline=true; showToast(t('offline'), 'warn'); });
  window.addEventListener('resize', ()=>map.invalidateSize());
  window.addEventListener('beforeunload', ()=>{ stopFleet(); });
}
function toggleTheme(){
  document.body.classList.toggle('light'); _theme = document.body.classList.contains('light') ? 'light' : 'dark';
  localStorage.setItem('fra_theme', _theme);
  const meta=document.querySelector('meta[name="theme-color"]'); if(meta) meta.setAttribute('content', _theme==='light' ? '#ffffff':'#0f1419');
  updateGPSMarker();
}
function applyTheme(){ if(_theme==='light') document.body.classList.add('light'); }
function applySettings(){
  document.getElementById('lang-select').value = _lang;
  fillVehicleSelect();
  document.getElementById('check-voice').checked = _voice;
  // heading-up UI removed — north-up only
  setNavZoom(_navZoom, false);
  document.getElementById('check-nfz').checked = false;
  document.getElementById('check-emergency').checked = true;
  document.getElementById('check-fleet').checked = false;
  const zEl2=document.getElementById('check-zones');
  const bEl2=document.getElementById('check-buildings');
  const zOn = (localStorage.getItem('fra_zones') === '1');
  const bOn = (localStorage.getItem('fra_bldgs') !== '0'); // default ON
  if(zEl2){ zEl2.checked = zOn; toggleZones(zOn); }
  if(bEl2){ bEl2.checked = bOn; toggleBuildingLabels(bOn); }
  if(activeBaseLayer) populateBaseChips();
  updateAllTexts();
}


function applyMissionParams(){
  try{
    const q = new URLSearchParams(location.search || '');
    const dest = q.get('dest');
    const via = q.get('via');
    const veh = q.get('vehicle');
    const lang = q.get('lang');
    if(lang && (lang==='de'||lang==='en')) setLang(lang);
    if(veh){ _vehicle=veh; localStorage.setItem('fra_vehicle', veh); fillVehicleSelect(); }
    if(via){ via.split(',').filter(Boolean).forEach(id=>{ const p=posById(id); if(p) _viaPoints.push(p); }); }
    if(dest){ setTimeout(()=>selectTarget(dest), 400); }
  }catch(e){}
}

function init(){
  applyTheme();
  demoMode = false;
  if(demoTimer){ clearInterval(demoTimer); demoTimer=null; }
  followMode = false;
  _userMovedMap = false;
  _gpsFirstCenterDone = false;
  _lastGoodAcc = null;
  initMap();
  registerSW();
  updateAllTexts();
  renderPositionList();
  syncFavHistory();
  bindEvents();
  applySettings();
  setBaseLayer(localStorage.getItem('fra_base') || activeBaseLayer || 'osm');
  toggleEmergency(true);
  updateDemoButton();
  bindGpsUserGesture();
  watchGpsPermission();
  startGPS(true);
  applyMissionParams();
  setTimeout(()=>{
    showToast(t('toast_welcome'));
  }, 900);
  setTimeout(()=>map.invalidateSize(), 200);
}

init();
