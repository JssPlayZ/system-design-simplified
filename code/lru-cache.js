// LRU cache demo: a tiny cache in front of a slow database.
// Run:  node code/lru-cache.js

class LRUCache {
  constructor(capacity) {
    this.capacity = capacity;
    this.map = new Map(); // Map remembers insertion order: oldest first
  }
  get(key) {
    if (!this.map.has(key)) return undefined;
    const value = this.map.get(key);
    this.map.delete(key);        // move to the "most recent" end
    this.map.set(key, value);
    return value;
  }
  set(key, value) {
    if (this.map.has(key)) this.map.delete(key);
    else if (this.map.size === this.capacity) {
      const oldest = this.map.keys().next().value; // least recently used
      this.map.delete(oldest);
      console.log(`    evicted ${oldest}`);
    }
    this.map.set(key, value);
  }
  order() { return [...this.map.keys()].join(' → '); }
}

const DB_MS = 50, CACHE_MS = 1;
const cache = new LRUCache(3);
let hits = 0, misses = 0, totalMs = 0;

function getProduct(id) {
  const cached = cache.get(id);
  if (cached) { hits++; totalMs += CACHE_MS; console.log(`  ${id}: HIT   (${CACHE_MS} ms)   cache: ${cache.order()}`); return; }
  misses++; totalMs += DB_MS;
  console.log(`  ${id}: MISS  (${DB_MS} ms)  fetched from DB`);
  cache.set(id, { id });
  console.log(`              cache: ${cache.order()}`);
}

console.log('Cache capacity = 3 (oldest → newest)\n');
['iphone', 'tv', 'shoes', 'iphone', 'laptop', 'tv', 'iphone', 'shoes'].forEach(getProduct);
console.log(`\nHits ${hits}, misses ${misses}, total ${totalMs} ms`);
console.log(`Without a cache: ${8 * DB_MS} ms`);
