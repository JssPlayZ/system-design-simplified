// Circuit breaker demo: the payment service is down for the first 10 seconds.
// Run:  node code/circuit-breaker.js
// (uses a simulated clock so it runs instantly)

const TIMEOUT_MS = 3000;   // a call to a dead service hangs this long
const OUTAGE_UNTIL = 10000; // payment service is down until t = 10 s
let clock = 0;             // simulated time in ms
let callsToService = 0;

function callPayment() {
  callsToService++;
  if (clock < OUTAGE_UNTIL) { clock += TIMEOUT_MS; throw new Error('timeout'); }
  clock += 50;
  return 'paid ✅';
}

class CircuitBreaker {
  constructor({ failureThreshold = 3, cooldownMs = 5000 } = {}) {
    this.state = 'CLOSED';
    this.failures = 0;
    this.threshold = failureThreshold;
    this.cooldownMs = cooldownMs;
    this.openedAt = 0;
  }
  call(fn) {
    if (this.state === 'OPEN') {
      if (clock - this.openedAt < this.cooldownMs) throw new Error('fail fast (circuit open)');
      this.state = 'HALF_OPEN'; // cooldown over: let ONE trial request through
    }
    try {
      const result = fn();
      this.state = 'CLOSED';    // trial worked, back to normal
      this.failures = 0;
      return result;
    } catch (err) {
      this.failures++;
      if (this.state === 'HALF_OPEN' || this.failures >= this.threshold) {
        this.state = 'OPEN';
        this.openedAt = clock;
      }
      throw err;
    }
  }
}

function run(name, useBreaker) {
  const breaker = new CircuitBreaker();
  callsToService = 0;
  let waited = 0;
  console.log(`=== ${name} ===`);
  for (let i = 0; i < 14; i++) {
    clock = i * 1000; // a new user taps "Pay" every second
    const start = clock;
    let result;
    try { result = useBreaker ? breaker.call(callPayment) : callPayment(); }
    catch (e) { result = `❌ ${e.message}`; }
    const took = clock - start;
    waited += took;
    const state = useBreaker ? `  [${breaker.state}]` : '';
    console.log(`  t=${String(i).padStart(2)}s  ${result.padEnd(28)} user waited ${String(took).padStart(4)} ms${state}`);
  }
  console.log(`  → users waited ${(waited / 1000).toFixed(1)} s in total, payment service hit ${callsToService} times\n`);
}

run('Without circuit breaker', false);
run('With circuit breaker (3 failures → OPEN for 5 s)', true);
