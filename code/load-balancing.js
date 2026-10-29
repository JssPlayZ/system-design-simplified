// Load balancing demo: Round Robin vs Least Connections.
// Run:  node code/load-balancing.js
//
// 3 servers. A new request arrives every 10 ms.
// Most requests are quick (20 ms), but every 3rd one is a heavy report (600 ms).

const SERVERS = 3, REQUESTS = 300, GAP_MS = 10;
const duration = (i) => (i % 3 === 0 ? 600 : 20);

function simulate(name, pick) {
  const open = Array.from({ length: SERVERS }, () => []); // finish times of open requests
  const peak = Array(SERVERS).fill(0);
  let rr = 0;

  for (let i = 0; i < REQUESTS; i++) {
    const now = i * GAP_MS;
    for (let s = 0; s < SERVERS; s++) open[s] = open[s].filter((t) => t > now);
    const s = pick(open, () => rr++ % SERVERS);
    open[s].push(now + duration(i));
    peak[s] = Math.max(peak[s], open[s].length);
  }
  console.log(`${name.padEnd(18)} peak open connections per server: ${peak.map((p, s) => `S${s}=${p}`).join('  ')}`);
}

const roundRobin = (open, next) => next();
const leastConnections = (open) =>
  open.reduce((best, list, s) => (list.length < open[best].length ? s : best), 0);

simulate('Round Robin', roundRobin);
simulate('Least Connections', leastConnections);
