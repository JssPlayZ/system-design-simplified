# 🏗️ System Design, Simplified

One system design concept a day, explained simply with real-life analogies, diagrams, and a runnable example.

Each concept answers:
**What is it? → Analogy → How it works → Sizing / numbers → Trade-offs → Real-world use → Interview one-liner**

---

## 📚 Concepts

| # | Concept | Interview question it answers | Status |
|---|---------|-------------------------------|--------|
| 01 | [Bloom Filter](concepts/01-bloom-filter.md) | "10 crore users. Is this username taken?" | ✅ |
| 02 | [Connection Pooling](concepts/02-connection-pooling.md) | "What is connection pooling, and how big should the pool be?" | ✅ |
| 03 | [Kafka Partitions & Ordering](concepts/03-kafka-partitions-ordering.md) | "User changed email twice, DB saved the old one. Kafka was in between. Why?" | ✅ |
| 04 | [Consistent Hashing](concepts/04-consistent-hashing.md) | "Added a 5th cache server and 80% of keys moved. How do you fix it?" | ✅ |
| 05 | [Caching & LRU Eviction](concepts/05-lru-cache.md) | "Page takes 50 ms from the DB. How do you make it fast? What do you evict?" | ✅ |
| 06 | [Load Balancing](concepts/06-load-balancing.md) | "How do requests get split across 3 servers, and which strategy?" | ✅ |
| 07 | [Rate Limiting](concepts/07-rate-limiting.md) | "Someone is spamming the Send OTP API. How do you stop them?" | ✅ |
| 08 | [Database Sharding](concepts/08-database-sharding.md) | "50 crore rows, one DB can't keep up. How do you split it?" | ✅ |
| 09 | [CAP Theorem](concepts/09-cap-theorem.md) | "Mumbai–Delhi link breaks. Keep accepting writes, or stop?" | ✅ |
| 10 | [Database Replication](concepts/10-database-replication.md) | "User updated their bio, refreshed, saw the old one. Why?" | ✅ |
| 11 | [Idempotency](concepts/11-idempotency.md) | "Payment timed out, app retried. How do you charge only once?" | ✅ |
| 12 | [Message Queues vs Pub/Sub](concepts/12-message-queues-vs-pubsub.md) | "Order placed: email, restaurant, analytics, invoices. Queue or pub/sub?" | ✅ |
| 13 | [Circuit Breaker](concepts/13-circuit-breaker.md) | "Payment service is down and checkout is dying with it. How do you stop the cascade?" | ✅ |
| 14 | [API Gateway](concepts/14-api-gateway.md) | "20 microservices. Should the app call all of them directly?" | ✅ |
| 15 | [CDN](concepts/15-cdn.md) | "Servers in the US, images slow in India. Fix it without moving servers?" | ✅ |
| 16 | [Database Indexing](concepts/16-database-indexing.md) | "Login query on 10 lakh rows is slow. How do you speed it up?" | ✅ |
| 17 | WebSockets vs Polling | | ⏳ |
| 18 | Distributed Locks | | ⏳ |
| 19 | Saga Pattern | | ⏳ |

---

## 📁 Structure

```
concepts/   one markdown file per concept
code/       small runnable demos
```

## 🙌 Credits

Concepts are inspired by great explainers across the internet; each file links its source.
