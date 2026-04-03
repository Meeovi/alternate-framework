// ---------------------------------------------------------------------------
// backend-health.test.ts — continuous search backend health monitor
//
// Starts a background polling loop that calls `search.stats()` at a fixed
// interval throughout the entire test run.  Three test suites run while the
// poller is active:
//
//   1. "backend availability" — single-shot latency and correctness checks.
//   2. "backend resilience"   — concurrent indexing/querying stress tests.
//   3. "health log assertions" — validates all poll records are healthy.
//
// A console summary table is printed after the suite finishes.
// ---------------------------------------------------------------------------

import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { createSearch } from "../core/search";
import { memoryAdapter } from "../adapters/memory/index";
import { productsSchema, articlesSchema, PRODUCTS_INDEX, ARTICLES_INDEX } from "./test-instance";
import { PRODUCT_FIXTURES } from "./fixtures";
import { makeProducts } from "./headers";

// ---------------------------------------------------------------------------
// Health record type
// ---------------------------------------------------------------------------

interface HealthRecord {
  checkedAt: Date;
  available: boolean;
  latencyMs: number;
  docCount?: number;
  error?: string;
}

// ---------------------------------------------------------------------------
// Shared state
// ---------------------------------------------------------------------------

const POLL_INTERVAL_MS   = 150; // poll every 150 ms
const LATENCY_BUDGET_MS  = 500; // warn if a check exceeds this

const healthLog: HealthRecord[] = [];
let search: ReturnType<typeof createSearch>;
let pollHandle: ReturnType<typeof setInterval>;
let setupComplete = false;

// ---------------------------------------------------------------------------
// Poll function — called on every interval tick
// ---------------------------------------------------------------------------

async function pollBackendHealth(): Promise<void> {
  if (!setupComplete) return;
  const start = Date.now();
  try {
    const stats = await search.stats(PRODUCTS_INDEX);
    healthLog.push({
      checkedAt: new Date(),
      available: true,
      latencyMs: Date.now() - start,
      docCount: stats.count,
    });
  } catch (err) {
    healthLog.push({
      checkedAt: new Date(),
      available: false,
      latencyMs: Date.now() - start,
      error: err instanceof Error ? err.message : String(err),
    });
  }
}

// ---------------------------------------------------------------------------
// Suite lifecycle
// ---------------------------------------------------------------------------

beforeAll(async () => {
  search = createSearch({
    adapter: memoryAdapter(),
    indexes: {
      [PRODUCTS_INDEX]: productsSchema,
      [ARTICLES_INDEX]: articlesSchema,
    },
  });

  await search.setup();
  await search.index(PRODUCTS_INDEX, PRODUCT_FIXTURES);
  setupComplete = true;

  // Begin continuous health polling
  pollHandle = setInterval(() => {
    void pollBackendHealth();
  }, POLL_INTERVAL_MS);
});

afterAll(async () => {
  clearInterval(pollHandle);

  // Final forced poll to capture end-of-suite state
  await pollBackendHealth();

  // ── Summary ────────────────────────────────────────────────────────────
  const total   = healthLog.length;
  const passed  = healthLog.filter((r) => r.available).length;
  const failed  = total - passed;
  const avgLat  = total > 0
    ? Math.round(healthLog.reduce((s, r) => s + r.latencyMs, 0) / total)
    : 0;
  const slowCount = healthLog.filter((r) => r.latencyMs > LATENCY_BUDGET_MS).length;
  const errors    = healthLog.filter((r) => r.error).map((r) => r.error!);

  console.info(
    "\n─── Backend Health Summary ─────────────────────────────────────" +
    "\n  Total polls  : " + total +
    "\n  Available    : " + passed +
    "\n  Degraded     : " + failed +
    "\n  Avg latency  : " + avgLat + " ms" +
    "\n  Slow checks  : " + slowCount + " (>" + LATENCY_BUDGET_MS + " ms)" +
    (errors.length ? "\n  Errors       : " + errors.join("; ") : "") +
    "\n────────────────────────────────────────────────────────────────\n",
  );
});

// ---------------------------------------------------------------------------
// 1. Backend availability
// ---------------------------------------------------------------------------

describe("backend availability", () => {
  it("setup completes and documents are indexed before tests run", async () => {
    const stats = await search.stats(PRODUCTS_INDEX);
    expect(stats.count).toBe(PRODUCT_FIXTURES.length);
  });

  it("answers a text search query within latency budget", async () => {
    const start = Date.now();
    const result = await search.query(PRODUCTS_INDEX, { q: "shoes", pageSize: 5 });
    const elapsed = Date.now() - start;
    expect(result.total).toBeGreaterThanOrEqual(0);
    expect(elapsed).toBeLessThan(LATENCY_BUDGET_MS);
  });

  it("answers a full-scan query within latency budget", async () => {
    const start = Date.now();
    const result = await search.query(PRODUCTS_INDEX, {});
    const elapsed = Date.now() - start;
    expect(result.total).toBe(PRODUCT_FIXTURES.length);
    expect(elapsed).toBeLessThan(LATENCY_BUDGET_MS);
  });

  it("answers a filtered query within latency budget", async () => {
    const start = Date.now();
    const result = await search.query(PRODUCTS_INDEX, {
      filters: [{ field: "category", operator: "=", value: "electronics" }],
    });
    const elapsed = Date.now() - start;
    expect(result.total).toBeGreaterThanOrEqual(0);
    expect(elapsed).toBeLessThan(LATENCY_BUDGET_MS);
  });

  it("answers a faceted query within latency budget", async () => {
    const start = Date.now();
    const result = await search.query(PRODUCTS_INDEX, {
      facets: ["category"],
    });
    const elapsed = Date.now() - start;
    expect(result.facets?.length).toBeGreaterThan(0);
    expect(elapsed).toBeLessThan(LATENCY_BUDGET_MS);
  });

  it("reports zero documents on the articles index (not yet seeded)", async () => {
    const stats = await search.stats(ARTICLES_INDEX);
    expect(stats.count).toBe(0);
  });
});

// ---------------------------------------------------------------------------
// 2. Backend resilience
// ---------------------------------------------------------------------------

describe("backend resilience", () => {
  it("handles 25 rapid consecutive queries without error", async () => {
    const queries = Array.from({ length: 25 }, () =>
      search.query(PRODUCTS_INDEX, { q: "shoes", pageSize: 5 }),
    );
    const results = await Promise.all(queries);
    for (const r of results) expect(r.total).toBeGreaterThanOrEqual(0);
  });

  it("handles concurrent index + query + stats without data corruption", async () => {
    const tempDocs = makeProducts(15, { category: "temp-resilience" });

    await Promise.all([
      search.index(ARTICLES_INDEX, tempDocs),
      search.query(PRODUCTS_INDEX, { q: "laptop" }),
      search.stats(PRODUCTS_INDEX),
      search.query(PRODUCTS_INDEX, { facets: ["category"] }),
    ]);

    const stats = await search.stats(ARTICLES_INDEX);
    expect(stats.count).toBeGreaterThanOrEqual(tempDocs.length);
  });

  it("maintains accurate stats after deleteWhere", async () => {
    const before = await search.stats(PRODUCTS_INDEX);
    const deleted = await search.deleteWhere(PRODUCTS_INDEX, [
      { field: "category", operator: "=", value: "kitchen" },
    ]);
    expect(deleted).toBe(2); // p5 + p6 are kitchen
    const after = await search.stats(PRODUCTS_INDEX);
    expect(after.count).toBe(before.count - 2);
  });

  it("answers queries correctly after document deletion", async () => {
    const result = await search.query(PRODUCTS_INDEX, {
      filters: [{ field: "category", operator: "=", value: "kitchen" }],
    });
    expect(result.total).toBe(0);
  });

  it("handles a large batch index operation within latency budget", async () => {
    const largeBatch = makeProducts(200, { category: "stress-batch" });
    const start = Date.now();
    await search.index(ARTICLES_INDEX, largeBatch);
    const elapsed = Date.now() - start;
    expect(elapsed).toBeLessThan(LATENCY_BUDGET_MS * 10); // generous budget for 200 docs
    const stats = await search.stats(ARTICLES_INDEX);
    expect(stats.count).toBeGreaterThanOrEqual(largeBatch.length);
  });
});

// ---------------------------------------------------------------------------
// 3. Health log assertions (run after the above suites have exercised the backend)
// ---------------------------------------------------------------------------

describe("health log assertions", () => {
  it("records at least one successful poll", async () => {
    // Allow time for at least 2 poll intervals
    await new Promise<void>((resolve) => setTimeout(resolve, POLL_INTERVAL_MS * 3));
    const available = healthLog.filter((r) => r.available);
    expect(available.length).toBeGreaterThan(0);
  });

  it("has no failed health records", () => {
    const failed = healthLog.filter((r) => !r.available);
    if (failed.length > 0) {
      console.warn("Failed health records:\n", JSON.stringify(failed, null, 2));
    }
    expect(failed.length).toBe(0);
  });

  it("all recorded latencies are within the budget", () => {
    const slow = healthLog.filter((r) => r.latencyMs > LATENCY_BUDGET_MS);
    if (slow.length > 0) {
      console.warn(`${slow.length} slow poll(s) detected:`, slow.map((r) => r.latencyMs));
    }
    expect(slow.length).toBe(0);
  });

  it("all polled doc counts are numerically sane", () => {
    for (const record of healthLog) {
      if (record.available && record.docCount !== undefined) {
        expect(record.docCount).toBeGreaterThanOrEqual(0);
      }
    }
  });

  it("health log contains status information for every recorded poll", () => {
    for (const record of healthLog) {
      expect(record.checkedAt).toBeInstanceOf(Date);
      expect(record.latencyMs).toBeGreaterThanOrEqual(0);
      expect(typeof record.available).toBe("boolean");
    }
  });
});
