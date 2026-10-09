"""
Tiny Bloom filter demo: "Is this username taken?"
Run:  python code/bloom_filter.py
"""
import hashlib
import math


class BloomFilter:
    def __init__(self, n: int, p: float):
        # m = -n * ln(p) / (ln 2)^2   and   k = (m / n) * ln 2
        self.m = math.ceil(-n * math.log(p) / (math.log(2) ** 2))
        self.k = round((self.m / n) * math.log(2))
        self.bits = bytearray(math.ceil(self.m / 8))

    def _positions(self, item: str):
        # k positions from two hashes (double hashing trick)
        h = hashlib.sha256(item.encode()).digest()
        h1 = int.from_bytes(h[:8], "big")
        h2 = int.from_bytes(h[8:16], "big")
        return [(h1 + i * h2) % self.m for i in range(self.k)]

    def add(self, item: str):
        for pos in self._positions(item):
            self.bits[pos // 8] |= 1 << (pos % 8)

    def might_contain(self, item: str) -> bool:
        # any bit 0 -> definitely new; all bits 1 -> maybe taken
        return all(self.bits[pos // 8] & (1 << (pos % 8)) for pos in self._positions(item))


if __name__ == "__main__":
    bf = BloomFilter(n=100_000, p=0.01)
    print(f"m = {bf.m:,} bits (~{bf.m / 8 / 1024:.0f} KB), k = {bf.k} hash functions\n")

    database = set()
    for name in ["vipul99", "priya21"] + [f"user{i}" for i in range(100_000 - 2)]:
        database.add(name)
        bf.add(name)

    for name in ["vipul99", "amit42", "neha07", "rohan7"]:
        if not bf.might_contain(name):
            print(f"{name:10} -> ✅ definitely available (0 DB calls)")
        elif name in database:
            print(f"{name:10} -> ❌ taken (confirmed by DB)")
        else:
            print(f"{name:10} -> ✅ available (false positive, DB said no)")

    # Measure the false-positive rate on names we never added
    tests = 100_000
    fp = sum(bf.might_contain(f"newname{i}") for i in range(tests))
    print(f"\nFalse-positive rate: {fp / tests:.2%} (target 1%)")
