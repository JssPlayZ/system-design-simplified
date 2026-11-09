// API Gateway demo: one front door for many microservices.
// Run:  node code/api-gateway.js
// (simulated latencies so it runs instantly)

const MOBILE_RTT = 150;   // phone ↔ cloud round trip (ms)
const INTERNAL_RTT = 10;  // gateway ↔ service inside the data center (ms)

// ---- Backend microservices ----
const services = {
  users:   (req) => ({ name: 'Jatin', city: 'Noida' }),
  orders:  (req) => ([{ id: 42, item: 'Paneer Biryani' }]),
  offers:  (req) => (['50% off up to ₹100']),
};

// ---- The gateway ----
const VALID_TOKENS = new Set(['token-jatin']);
const hits = {};
const LIMIT = 5; // requests per user (per minute, simplified)

function gateway(req) {
  // 1. Authentication (done ONCE here, not in every service)
  if (!VALID_TOKENS.has(req.token)) return { status: 401, body: 'Unauthorized' };

  // 2. Rate limiting (Day 07)
  hits[req.token] = (hits[req.token] || 0) + 1;
  if (hits[req.token] > LIMIT) return { status: 429, body: 'Too Many Requests' };

  // 3. Aggregation: one client call → many services in parallel
  if (req.path === '/home') {
    return {
      status: 200,
      body: { user: services.users(req), orders: services.orders(req), offers: services.offers(req) },
      latency: MOBILE_RTT + INTERNAL_RTT, // services called in parallel inside the DC
    };
  }

  // 4. Routing: /users/... → users service, /orders/... → orders service
  const name = req.path.split('/')[1];
  if (!services[name]) return { status: 404, body: 'Not Found' };
  return { status: 200, body: services[name](req), latency: MOBILE_RTT + INTERNAL_RTT };
}

console.log('1) Routing, auth and rate limiting at the gateway\n');
const show = (label, req) => {
  const r = gateway(req);
  console.log(`  ${label.padEnd(34)} → ${r.status} ${typeof r.body === 'string' ? r.body : JSON.stringify(r.body)}`);
};
show('GET /users  (no token)', { path: '/users', token: null });
show('GET /users  (valid token)', { path: '/users', token: 'token-jatin' });
show('GET /orders (valid token)', { path: '/orders', token: 'token-jatin' });
show('GET /payments (no such service)', { path: '/payments', token: 'token-jatin' });
show('GET /offers (valid token)', { path: '/offers', token: 'token-jatin' });
show('GET /users  (5th request, limit 5)', { path: '/users', token: 'token-jatin' });
show('GET /users  (6th request)', { path: '/users', token: 'token-jatin' });

console.log('\n2) Loading the home screen on a phone (needs user + orders + offers)\n');
const direct = 3 * MOBILE_RTT; // app calls 3 services one after another over mobile network
hits['token-jatin'] = 0;
const viaGateway = gateway({ path: '/home', token: 'token-jatin' }).latency;
console.log(`  App calls 3 services directly : 3 × ${MOBILE_RTT} ms = ${direct} ms`);
console.log(`  App calls gateway /home once  : ${MOBILE_RTT} + ${INTERNAL_RTT} ms = ${viaGateway} ms  ✅ ${(direct / viaGateway).toFixed(1)}× faster`);
