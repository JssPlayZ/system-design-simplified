// Consistent hashing demo: what happens when you add a 5th cache server?
// Run:  node code/consistent-hashing.js
const crypto = require('crypto');

const hash = (s) => crypto.createHash('md5').update(s).digest().readUInt32BE(0);
const KEYS = Array.from({ length: 100000 }, (_, i) => `user-${i}`);

// 1) Simple modulo: server = hash(key) % N
const modulo = (key, n) => `server-${hash(key) % n}`;

// 2) Consistent hashing ring with virtual nodes
class Ring {
  constructor(servers, vnodes = 100) {
    this.points = [];
    for (const s of servers)
      for (let v = 0; v < vnodes; v++) this.points.push({ pos: hash(`${s}#${v}`), server: s });
    this.points.sort((a, b) => a.pos - b.pos);
  }
  get(key) {
    const h = hash(key);
    let lo = 0, hi = this.points.length; // first point clockwise from h
    while (lo < hi) {
      const mid = (lo + hi) >> 1;
      if (this.points[mid].pos < h) lo = mid + 1; else hi = mid;
    }
    return this.points[lo % this.points.length].server;
  }
}

const moved = (before, after) => KEYS.filter((k) => before(k) !== after(k)).length;
const pct = (n) => ((n / KEYS.length) * 100).toFixed(1) + '%';

const four = ['server-0', 'server-1', 'server-2', 'server-3'];
const five = [...four, 'server-4'];
const r4 = new Ring(four), r5 = new Ring(five);

console.log(`${KEYS.length.toLocaleString('en-IN')} keys, adding a 5th server\n`);
console.log(`Modulo (hash % N)       keys moved: ${pct(moved((k) => modulo(k, 4), (k) => modulo(k, 5)))}`);
console.log(`Consistent hash ring    keys moved: ${pct(moved((k) => r4.get(k), (k) => r5.get(k)))}  (ideal = 1/5 = 20%)`);

const load = {};
for (const k of KEYS) load[r5.get(k)] = (load[r5.get(k)] || 0) + 1;
console.log('\nLoad per server on the ring (100 virtual nodes each):');
for (const s of five) console.log(`  ${s}: ${pct(load[s])}`);
