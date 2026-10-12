"""
Connection pooling demo: the Diwali sale, with and without a pool.
Run:  python code/connection_pooling.py
"""
import queue
import threading
import time
from concurrent.futures import ThreadPoolExecutor

CONNECT_MS = 30   # TCP + TLS + auth
QUERY_MS = 2      # the actual work
REQUESTS = 1000
CONCURRENT = 200  # requests arriving at the same time


class FakePostgres:
    def __init__(self, max_connections=100):
        self.max = max_connections
        self.open = 0
        self.peak = 0
        self.lock = threading.Lock()

    def connect(self):
        with self.lock:
            if self.open >= self.max:
                raise ConnectionError("FATAL: too many connections")
            self.open += 1
            self.peak = max(self.peak, self.open)
        time.sleep(CONNECT_MS / 1000)
        return object()

    def query(self, conn):
        time.sleep(QUERY_MS / 1000)

    def close(self, conn):
        with self.lock:
            self.open -= 1


def without_pool(db):
    def handle(_):
        try:
            conn = db.connect()           # open
        except ConnectionError:
            return False
        db.query(conn)                    # query
        db.close(conn)                    # close
        return True
    return handle


def with_pool(db, size):
    pool = queue.Queue()
    for _ in range(size):                 # open once, at startup
        pool.put(db.connect())

    def handle(_):
        try:
            conn = pool.get(timeout=30)   # borrow (wait if all busy)
        except queue.Empty:
            return False
        db.query(conn)
        pool.put(conn)                    # return
        return True
    return handle


def run(name, make_handler):
    db = FakePostgres(max_connections=100)
    handler = make_handler(db)
    start = time.time()
    with ThreadPoolExecutor(max_workers=CONCURRENT) as ex:
        results = list(ex.map(handler, range(REQUESTS)))
    took = time.time() - start
    ok = sum(results)
    print(f"{name:22} ok={ok:4}  failed={REQUESTS - ok:4}  "
          f"peak DB connections={db.peak:3}  time={took:.2f}s")


if __name__ == "__main__":
    print(f"Diwali sale: {REQUESTS} requests, {CONCURRENT} at a time, "
          f"Postgres max_connections=100\n")
    run("No pool (open/close)", without_pool)
    run("Pool of 10", lambda db: with_pool(db, 10))
