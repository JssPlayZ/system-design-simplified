// Database sharding demo: where do today's 10,000 new orders go?
// Run:  node code/sharding.js
const crypto = require('crypto');

const SHARDS = 4;
const hash = (s) => crypto.createHash('md5').update(String(s)).digest().readUInt32BE(0);

// Today's new orders from random users (month 12 = this month)
const orders = Array.from({ length: 10000 }, (_, i) => ({
  orderId: i,
  userId: 1 + Math.floor(Math.random() * 50000),
  month: 12,
}));

// Strategy 1: Range sharding by month (Jan–Mar → shard 0, Apr–Jun → 1, ...)
const byRange = (o) => Math.floor((o.month - 1) / 3);

// Strategy 2: Hash sharding by user_id
const byHash = (o) => hash(o.userId) % SHARDS;

function show(name, shardOf) {
  const count = Array(SHARDS).fill(0);
  for (const o of orders) count[shardOf(o)]++;
  const row = count.map((c, s) => `S${s}=${((c / orders.length) * 100).toFixed(0).padStart(3)}%`).join('  ');
  console.log(`${name.padEnd(22)} ${row}`);
}

console.log(`Writes for ${orders.length.toLocaleString('en-IN')} new orders today, ${SHARDS} shards\n`);
show('Range by month', byRange);
show('Hash by user_id', byHash);

// Query cost with hash sharding
console.log('\nQueries with hash(user_id) sharding:');
console.log(`  "orders of user 42"        → 1 shard  (S${hash(42) % SHARDS})`);
console.log(`  "all orders above ₹10,000" → ${SHARDS} shards (ask all, merge results)`);
