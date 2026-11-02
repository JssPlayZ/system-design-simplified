// CAP theorem demo: two replicas (Mumbai, Delhi), the network link breaks.
// Run:  node code/cap-theorem.js

function makeCluster(mode) {
  const nodes = { mumbai: { seats: 1 }, delhi: { seats: 1 } };
  let linkUp = true;

  return {
    breakLink() { linkUp = false; },
    healLink() {
      linkUp = true;
      // AP: reconcile after the partition (here: lowest seat count wins)
      const merged = Math.min(nodes.mumbai.seats, nodes.delhi.seats);
      nodes.mumbai.seats = nodes.delhi.seats = merged;
    },
    book(node, user) {
      const other = node === 'mumbai' ? 'delhi' : 'mumbai';
      if (!linkUp && mode === 'CP') {
        return `${user} @ ${node}: ❌ "Try again later" (can't confirm with ${other})`;
      }
      if (nodes[node].seats <= 0) return `${user} @ ${node}: ❌ sold out`;
      nodes[node].seats--;
      if (linkUp) nodes[other].seats = nodes[node].seats; // replicate
      return `${user} @ ${node}: ✅ booked`;
    },
  };
}

for (const mode of ['CP', 'AP']) {
  const c = makeCluster(mode);
  console.log(`=== ${mode} system, 1 seat left, link between Mumbai & Delhi breaks ===`);
  c.breakLink();
  const r1 = c.book('mumbai', 'Rahul');
  const r2 = c.book('delhi', 'Priya');
  console.log('  ' + r1);
  console.log('  ' + r2);
  c.healLink();
  const booked = [r1, r2].filter((r) => r.includes('✅')).length;
  console.log(`  → after link heals: ${booked} booking(s) for 1 seat ${booked > 1 ? '⚠️  OVERBOOKED (needs fixing)' : ''}\n`);
}
