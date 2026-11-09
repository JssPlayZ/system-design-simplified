// Database indexing demo: find one user among 10 lakh rows.
// Run:  node code/indexing.js

const N = 1_000_000;
const users = Array.from({ length: N }, (_, i) => ({
  id: i,
  email: `user${i}@gmail.com`,
  age: 18 + (i * 7919) % 50, // spread of ages 18–67
}));
const target = `user${N - 7}@gmail.com`; // near the end: worst-ish case

// 1) No index: full table scan, check every row
function fullScan(email) {
  let checks = 0;
  for (const u of users) { checks++; if (u.email === email) return { u, checks }; }
  return { u: null, checks };
}

// 2) B-tree-like index: sorted list of (email → row) + binary search
const sortedIndex = users.map((u) => [u.email, u.id]).sort((a, b) => (a[0] < b[0] ? -1 : 1));
function btreeLookup(email) {
  let lo = 0, hi = sortedIndex.length - 1, checks = 0;
  while (lo <= hi) {
    const mid = (lo + hi) >> 1; checks++;
    if (sortedIndex[mid][0] === email) return { u: users[sortedIndex[mid][1]], checks };
    if (sortedIndex[mid][0] < email) lo = mid + 1; else hi = mid - 1;
  }
  return { u: null, checks };
}

// 3) Hash index: email → row id
const hashIndex = new Map(users.map((u) => [u.email, u.id]));
function hashLookup(email) { return { u: users[hashIndex.get(email)], checks: 1 }; }

function time(fn) {
  const t = process.hrtime.bigint();
  const r = fn();
  return { ...r, ms: Number(process.hrtime.bigint() - t) / 1e6 };
}

console.log(`SELECT * FROM users WHERE email = '${target}'   (${N.toLocaleString('en-IN')} rows)\n`);
for (const [name, fn] of [['No index (full scan)', fullScan], ['B-tree index', btreeLookup], ['Hash index', hashLookup]]) {
  const r = time(() => fn(target));
  console.log(`  ${name.padEnd(22)} rows checked: ${r.checks.toLocaleString('en-IN').padStart(9)}   time: ${r.ms.toFixed(3)} ms`);
}

// Range query: only a sorted (B-tree) index helps
const ageIndex = users.map((u) => [u.age, u.id]).sort((a, b) => a[0] - b[0]);
const lowerBound = (arr, v) => { let lo = 0, hi = arr.length; while (lo < hi) { const m = (lo + hi) >> 1; arr[m][0] < v ? (lo = m + 1) : (hi = m); } return lo; };
const from = lowerBound(ageIndex, 25), to = lowerBound(ageIndex, 31);
console.log(`\nSELECT * FROM users WHERE age BETWEEN 25 AND 30`);
console.log(`  B-tree on age: jump to first 25 in ~${Math.ceil(Math.log2(N))} steps, then read ${(to - from).toLocaleString('en-IN')} rows in order ✅`);
console.log(`  Hash index:    can't do ranges (hash scatters 25, 26, 27…) ❌`);
