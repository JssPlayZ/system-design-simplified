// Rate limiting demo: Token Bucket (5 tokens, refills 1 token per second).
// Run:  node code/rate-limiter.js

class TokenBucket {
  constructor(capacity, refillPerSec) {
    this.capacity = capacity;
    this.tokens = capacity;
    this.refillPerSec = refillPerSec;
    this.last = 0; // seconds
  }
  allow(now) {
    const elapsed = now - this.last;
    this.tokens = Math.min(this.capacity, this.tokens + elapsed * this.refillPerSec);
    this.last = now;
    if (this.tokens >= 1) { this.tokens -= 1; return true; }
    return false;
  }
}

const bucket = new TokenBucket(5, 1);

// One user hammering the OTP endpoint: (time in seconds)
const requests = [0, 0, 0, 0, 0, 0, 0, 0, 1, 2, 2.5, 3, 10, 10, 10];

console.log('Bucket: 5 tokens, +1 token/sec\n');
for (const t of requests) {
  const ok = bucket.allow(t);
  console.log(`  t=${String(t).padStart(4)}s  ${ok ? '200 OK' : '429 Too Many Requests'}   tokens left: ${bucket.tokens.toFixed(1)}`);
}
