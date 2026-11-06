// Message Queue vs Pub/Sub demo: an order is placed on a food delivery app.
// Run:  node code/queue-vs-pubsub.js

// ---- Message queue: many workers SHARE the work, each job done once ----
class Queue {
  constructor() { this.jobs = []; this.workers = []; this.next = 0; }
  addWorker(name) { this.workers.push({ name, done: [] }); }
  send(job) { this.jobs.push(job); }
  run() {
    // each job goes to exactly ONE worker (round robin here)
    for (const job of this.jobs) this.workers[this.next++ % this.workers.length].done.push(job);
  }
}

// ---- Pub/Sub: every subscriber gets EVERY message ----
class Topic {
  constructor() { this.subscribers = []; }
  subscribe(name, handler) { this.subscribers.push({ name, handler }); }
  publish(msg) { for (const s of this.subscribers) s.handler(msg); }
}

console.log('1) Message queue "send-invoice-pdf": 3 workers share 9 jobs\n');
const q = new Queue();
['worker-A', 'worker-B', 'worker-C'].forEach((w) => q.addWorker(w));
for (let i = 1; i <= 9; i++) q.send(`order-${i}`);
q.run();
for (const w of q.workers) console.log(`  ${w.name}: ${w.done.join(', ')}`);
const total = q.workers.reduce((s, w) => s + w.done.length, 0);
console.log(`  → ${total} jobs, each processed exactly once ✅\n`);

console.log('2) Pub/Sub topic "order-placed": 1 event, 3 different services react\n');
const t = new Topic();
t.subscribe('email-service', (m) => console.log(`  📧 email-service:     send "Order ${m.id} confirmed" to ${m.user}`));
t.subscribe('restaurant-service', (m) => console.log(`  🍳 restaurant-service: start cooking ${m.item}`));
t.subscribe('analytics-service', (m) => console.log(`  📊 analytics-service:  +₹${m.amount} to today's sales`));
t.publish({ id: 'order-42', user: 'jatin', item: 'Paneer Biryani', amount: 249 });
console.log(`  → 1 message, ${t.subscribers.length} subscribers, each got its own copy ✅`);

// Adding a new subscriber needs zero changes to the publisher:
t.subscribe('loyalty-service', (m) => console.log(`  ⭐ loyalty-service:    +${Math.floor(m.amount / 10)} points for ${m.user}`));
console.log('\n  New "loyalty-service" subscribes, publisher code unchanged:');
t.publish({ id: 'order-43', user: 'priya', item: 'Masala Dosa', amount: 120 });
