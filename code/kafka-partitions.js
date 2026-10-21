// Kafka partitions & ordering demo: the "old email overwrote new email" bug.
// Run:  node code/kafka-partitions.js

const PARTITIONS = 3;
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// Simple string hash (real Kafka uses murmur2; the idea is the same)
function hash(key) {
  let h = 0;
  for (const ch of key) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
  return h;
}

async function simulate(useKey) {
  const topic = Array.from({ length: PARTITIONS }, () => []); // 3 partitions
  const db = {};
  let roundRobin = 0;

  // Producer
  function send(key, value) {
    const p = key !== null ? hash(key) % PARTITIONS : roundRobin++ % PARTITIONS;
    topic[p].push({ offset: 100 + topic[p].length, key: key ?? 'user-42', value });
    return p;
  }

  const k = useKey ? 'user-42' : null;
  const p1 = send(k, 'chirkut@gmail.com');      // t = 0s
  const p2 = send(k, 'chirkut007@gmail.com');   // t = 2s
  console.log(`  chirkut@     -> partition ${p1}`);
  console.log(`  chirkut007@  -> partition ${p2}`);

  // Consumer group: one consumer per partition (X, Y, Z)
  const consumers = [
    { name: 'X', queryMs: 300 }, // stuck in a slow query
    { name: 'Y', queryMs: 10 },
    { name: 'Z', queryMs: 10 },
  ];

  await Promise.all(
    consumers.map(async (c, p) => {
      for (const msg of topic[p]) {          // reads its partition in offset order
        await sleep(c.queryMs);
        db[msg.key] = msg.value;              // save to DB
        console.log(`  consumer ${c.name} saved offset ${msg.offset}: ${msg.value}`);
      }
    })
  );

  const ok = db['user-42'] === 'chirkut007@gmail.com';
  console.log(`  DB final -> ${db['user-42']}  ${ok ? '✅ correct' : '❌ old email won'}\n`);
}

(async () => {
  console.log('1) No key (messages spread across partitions)');
  await simulate(false);
  console.log('2) Key = "user-42" (same key -> same partition)');
  await simulate(true);
})();
