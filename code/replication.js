// Database replication demo: replication lag and "read your own writes".
// Run:  node code/replication.js
//
// 1 primary (takes writes) + 2 replicas (serve reads).
// Replicas copy changes asynchronously with ~200 ms lag.

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const LAG_MS = 200;

class Cluster {
  constructor() {
    this.primary = { bio: 'Hello!' };
    this.replicas = [{ bio: 'Hello!' }, { bio: 'Hello!' }];
    this.lastWriteAt = {}; // user -> time of last write
    this.rr = 0;
  }
  write(user, bio) {
    this.primary.bio = bio;
    this.lastWriteAt[user] = Date.now();
    // async replication: replicas catch up later
    for (const r of this.replicas) setTimeout(() => (r.bio = bio), LAG_MS);
  }
  readFromReplica() {
    return this.replicas[this.rr++ % this.replicas.length].bio;
  }
  // Fix: if this user wrote recently, read from the primary
  readYourWrites(user) {
    const recent = Date.now() - (this.lastWriteAt[user] || 0) < 1000;
    return recent ? this.primary.bio : this.readFromReplica();
  }
}

(async () => {
  console.log(`Async replication, lag ≈ ${LAG_MS} ms\n`);

  let db = new Cluster();
  console.log('1) Always read from a replica');
  db.write('jatin', 'Learning system design 🚀');
  console.log(`  right after saving   → "${db.readFromReplica()}"   ❌ stale (looks like the save failed!)`);
  await sleep(LAG_MS + 50);
  console.log(`  ${LAG_MS + 50} ms later        → "${db.readFromReplica()}"   ✅ replica caught up\n`);

  db = new Cluster();
  console.log('2) Read-your-writes (own recent writes go to the primary)');
  db.write('jatin', 'Learning system design 🚀');
  console.log(`  jatin, right after   → "${db.readYourWrites('jatin')}"   ✅`);
  console.log(`  a friend, right after → "${db.readYourWrites('priya')}"   (stale for a moment, that's OK)`);
})();
