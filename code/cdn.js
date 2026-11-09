// CDN demo: 10,000 users across India load the same product image.
// Origin server is in the US. Edge servers are in Indian cities.
// Run:  node code/cdn.js

const ORIGIN_RTT = 250; // India ↔ US origin (ms)
const EDGE_RTT = 15;    // user ↔ nearest edge in their city (ms)
const CITIES = ['Mumbai', 'Delhi', 'Chennai', 'Kolkata', 'Bengaluru'];
const REQUESTS = 10000;

// Users spread across cities
const requests = Array.from({ length: REQUESTS }, (_, i) => CITIES[i % CITIES.length]);

// Without CDN: every request crosses the ocean to the origin
let noCdnTime = 0, noCdnOriginHits = 0;
for (const city of requests) { noCdnTime += ORIGIN_RTT; noCdnOriginHits++; }

// With CDN: each city's edge fetches from origin ONCE, then serves from cache
const edgeCache = {};
let cdnTime = 0, cdnOriginHits = 0, hits = 0;
for (const city of requests) {
  if (edgeCache[city]) { cdnTime += EDGE_RTT; hits++; }
  else {
    cdnTime += EDGE_RTT + ORIGIN_RTT; // miss: edge goes to origin, then caches it
    edgeCache[city] = true;
    cdnOriginHits++;
  }
}

const avg = (t) => (t / REQUESTS).toFixed(1);
console.log(`${REQUESTS.toLocaleString('en-IN')} requests for one image from ${CITIES.length} Indian cities\n`);
console.log(`                 avg load time   requests reaching origin`);
console.log(`  Without CDN    ${avg(noCdnTime).padStart(8)} ms      ${noCdnOriginHits.toLocaleString('en-IN')}`);
console.log(`  With CDN       ${avg(cdnTime).padStart(8)} ms      ${cdnOriginHits}   (one miss per city edge)`);
console.log(`\n  Cache hit ratio: ${((hits / REQUESTS) * 100).toFixed(2)}%`);
console.log(`  Origin load reduced by ${(100 - (cdnOriginHits / noCdnOriginHits) * 100).toFixed(2)}%`);
