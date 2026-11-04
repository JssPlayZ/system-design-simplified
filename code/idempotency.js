// Idempotency demo: the user taps "Pay ₹500", the network times out, the app retries.
// Run:  node code/idempotency.js
const crypto = require('crypto');

function makePaymentServer() {
  const charges = [];
  const seen = new Map(); // idempotency key -> saved response

  function pay({ amount, idempotencyKey }) {
    if (idempotencyKey && seen.has(idempotencyKey)) {
      return { ...seen.get(idempotencyKey), replayed: true }; // same answer, no new charge
    }
    const charge = { id: `ch_${charges.length + 1}`, amount };
    charges.push(charge);
    const response = { status: 'success', chargeId: charge.id };
    if (idempotencyKey) seen.set(idempotencyKey, response);
    return response;
  }
  return { pay, charges };
}

// Client: the first response is "lost" (timeout), so it retries twice more
function client(server, useKey) {
  const key = useKey ? crypto.randomUUID() : undefined; // ONE key for all retries
  for (let attempt = 1; attempt <= 3; attempt++) {
    const res = server.pay({ amount: 500, idempotencyKey: key });
    const lost = attempt < 3;
    console.log(`  attempt ${attempt}: server → ${res.chargeId}${res.replayed ? ' (replayed)' : ''}${lost ? '   …response lost, retrying' : '   ✅ client got it'}`);
  }
  const total = server.charges.reduce((s, c) => s + c.amount, 0);
  console.log(`  customer charged: ₹${total}  ${server.charges.length > 1 ? '❌ charged ' + server.charges.length + ' times!' : '✅ charged once'}\n`);
}

console.log('1) No idempotency key');
client(makePaymentServer(), false);
console.log('2) With Idempotency-Key header');
client(makePaymentServer(), true);
