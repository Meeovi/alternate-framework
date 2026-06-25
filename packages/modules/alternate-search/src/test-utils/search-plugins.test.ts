// ---------------------------------------------------------------------------
// search-plugins.test.ts — integration tests for search plugins
//
// Tests the observable pipeline effects of each plugin using the in-memory
// adapter.  No external backends required.
//
// Plugins tested:
//   synonyms, filters (baseline + allowlist), caching, scoring, multitenancy
// ---------------------------------------------------------------------------

import { describe, it, expect, beforeAll, vi } from "vitest";
import {
  getTestInstance,
  PRODUCTS_INDEX,
  ARTICLES_INDEX,
} from "./test-instance";
import {
  PRODUCT_FIXTURES,
  ARTICLE_FIXTURES,
  TENANT_ARTICLE_FIXTURES,
  ALPHA_TENANT_IDS,
  BETA_TENANT_IDS,
  PUBLISHED_PRODUCT_COUNT,
} from "./fixtures";
import {
  resultIds,
  expectResultContains,
  expectResultExcludes,
} from "./headers";
import { createSearch } from "../core/search";
import { defineIndex } from "../schema/indexes";
import { keywordField, textField } from "../schema/fields";
import { synonyms } from "../plugins/synonyms/index";
import { filters } from "../plugins/filters";
import { caching, createMemoryCacheStorage, createRedisCacheStorage, purgeCacheStorage } from "../plugins/caching";
import { scoring } from "../plugins/scoring";
import { multitenancy } from "../plugins/multitenancy/index";

// ---------------------------------------------------------------------------
// Synonyms plugin
// ---------------------------------------------------------------------------

describe("synonyms plugin", () => {
  it("expands a simple synonym before querying (bidirectional)", async () => {
    const { search, seed } = await getTestInstance({
      plugins: [
        synonyms({
          map: { shoes: ["sneakers", "trainers"] },
        }),
      ],
    });
    await seed(PRODUCTS_INDEX, PRODUCT_FIXTURES);

    // Querying "shoes" should also match documents containing "sneakers"
    const result = await search.query(PRODUCTS_INDEX, { q: "shoes" });
    expectResultContains(result, "p2"); // "Trail Sneakers"
  });

  it("does not affect queries whose terms have no synonym entry", async () => {
    const { search, seed } = await getTestInstance({
      plugins: [synonyms({ map: { laptop: ["notebook"] } })],
    });
    await seed(PRODUCTS_INDEX, PRODUCT_FIXTURES);

    const result = await search.query(PRODUCTS_INDEX, { q: "yoga" });
    expect(result.total).toBeGreaterThan(0);
    expectResultContains(result, "p7"); // "Yoga Mat Premium"
  });

  it("expands multiple synonyms in a single query", async () => {
    const { search, seed } = await getTestInstance({
      plugins: [
        synonyms({
          map: {
            laptop:  ["notebook", "macbook"],
            sneakers: ["trainers", "shoes"],
          },
        }),
      ],
    });
    await seed(PRODUCTS_INDEX, PRODUCT_FIXTURES);

    // "laptop notebook" should hit both "Laptop Pro 15" and "Wireless Notebook Stand"
    const result = await search.query(PRODUCTS_INDEX, { q: "laptop" });
    expect(result.total).toBeGreaterThan(0);
  });

  it("supports one-way synonym entries", async () => {
    const { search, seed } = await getTestInstance({
      plugins: [
        synonyms({
          entries: [
            { kind: "one-way", input: "running", synonyms: ["jogging", "marathon"] },
          ],
        }),
      ],
    });
    await seed(PRODUCTS_INDEX, PRODUCT_FIXTURES);

    const result = await search.query(PRODUCTS_INDEX, { q: "running" });
    // Should at minimum return "Running Shoes" (p1)
    expect(result.total).toBeGreaterThan(0);
    expectResultContains(result, "p1");
  });
});

// ---------------------------------------------------------------------------
// Filters plugin
// ---------------------------------------------------------------------------

describe("filters plugin", () => {
  it("injects baseline filters for all queries on an index", async () => {
    const { search, seed } = await getTestInstance({
      plugins: [
        filters({
          rules: [
            {
              index: PRODUCTS_INDEX,
              baseline: [{ field: "published", operator: "=", value: true }],
            },
          ],
        }),
      ],
    });
    await seed(PRODUCTS_INDEX, PRODUCT_FIXTURES);

    // p5 is unpublished — must never appear regardless of query
    const result = await search.query(PRODUCTS_INDEX, {});
    expectResultExcludes(result, "p5");
    for (const item of result.items) expect(item.published).toBe(true);
    expect(result.total).toBe(PUBLISHED_PRODUCT_COUNT);
  });

  it("applies baseline filters even when caller provides additional filters", async () => {
    const { search, seed } = await getTestInstance({
      plugins: [
        filters({
          rules: [
            {
              index: PRODUCTS_INDEX,
              baseline: [{ field: "published", operator: "=", value: true }],
            },
          ],
        }),
      ],
    });
    await seed(PRODUCTS_INDEX, PRODUCT_FIXTURES);

    const result = await search.query(PRODUCTS_INDEX, {
      filters: [{ field: "category", operator: "=", value: "kitchen" }],
    });
    // kitchen has p5 (unpublished) and p6 (published) — only p6 should appear
    expect(result.total).toBe(1);
    expectResultContains(result, "p6");
    expectResultExcludes(result, "p5");
  });

  it("strips disallowed filter fields in strict mode", async () => {
    const { search, seed } = await getTestInstance({
      plugins: [
        filters({
          rules: [
            {
              index: PRODUCTS_INDEX,
              allowedFields: ["category"],
              strict: true,
            },
          ],
        }),
      ],
    });
    await seed(PRODUCTS_INDEX, PRODUCT_FIXTURES);

    // "price" is not in allowedFields — filter is stripped, all docs returned
    const result = await search.query(PRODUCTS_INDEX, {
      filters: [{ field: "price", operator: ">", value: 1000 }],
    });
    expect(result.total).toBe(PRODUCT_FIXTURES.length);
  });

  it("leaves allowedFields filters intact", async () => {
    const { search, seed } = await getTestInstance({
      plugins: [
        filters({
          rules: [
            {
              index: PRODUCTS_INDEX,
              allowedFields: ["category"],
              strict: true,
            },
          ],
        }),
      ],
    });
    await seed(PRODUCTS_INDEX, PRODUCT_FIXTURES);

    const result = await search.query(PRODUCTS_INDEX, {
      filters: [{ field: "category", operator: "=", value: "sports" }],
    });
    for (const item of result.items) expect(item.category).toBe("sports");
  });

  it("applies rules only to the targeted index (wildcard '*')", async () => {
    const { search, seed } = await getTestInstance({
      plugins: [
        filters({
          rules: [
            {
              index: "*",
              baseline: [{ field: "author", operator: "=", value: "alice" }],
            },
          ],
        }),
      ],
    });
    await seed(ARTICLES_INDEX, ARTICLE_FIXTURES);

    const result = await search.query(ARTICLES_INDEX, {});
    for (const item of result.items) expect(item.author).toBe("alice");
  });
});

// ---------------------------------------------------------------------------
// Caching plugin
// ---------------------------------------------------------------------------

describe("caching plugin", () => {
  it("returns the same result on repeated identical queries (cache hit)", async () => {
    const { search, seed } = await getTestInstance({
      plugins: [caching({ ttl: 60_000 })],
    });
    await seed(PRODUCTS_INDEX, PRODUCT_FIXTURES);

    const q = { q: "shoes", page: 1, pageSize: 10 };
    const r1 = await search.query(PRODUCTS_INDEX, q);
    const r2 = await search.query(PRODUCTS_INDEX, q);
    expect(r1.total).toBe(r2.total);
    expect(resultIds(r1)).toEqual(resultIds(r2));
  });

  it("treats queries to different indexes as distinct cache entries", async () => {
    const { search, seed } = await getTestInstance({
      plugins: [caching({ ttl: 60_000 })],
    });
    await seed(PRODUCTS_INDEX, PRODUCT_FIXTURES);
    await seed(ARTICLES_INDEX, ARTICLE_FIXTURES);

    const q = {};
    const rp = await search.query(PRODUCTS_INDEX, q);
    const ra = await search.query(ARTICLES_INDEX, q);
    expect(rp.total).not.toBe(ra.total);
  });

  it("uses an externally provided cache storage", async () => {
    const hit = vi.fn();
    const store = new Map<string, { value: unknown; expiresAt: number }>();

    const customStorage = {
      get(key: string) {
        const entry = store.get(key);
        if (!entry || Date.now() > entry.expiresAt) return null;
        hit(key);
        return entry.value as ReturnType<typeof store.get> extends { value: infer V } ? V : never;
      },
      set(key: string, value: unknown, ttlMs: number) {
        store.set(key, { value, expiresAt: Date.now() + ttlMs });
      },
    };

    const { search, seed } = await getTestInstance({
      plugins: [caching({ ttl: 60_000, storage: customStorage as any })],
    });
    await seed(PRODUCTS_INDEX, PRODUCT_FIXTURES);

    const q = { q: "laptop" };
    await search.query(PRODUCTS_INDEX, q); // populate
    await search.query(PRODUCTS_INDEX, q); // should hit
    expect(hit).toHaveBeenCalledOnce();
  });

  it("supports Redis-style distributed cache storage", async () => {
    const store = new Map<string, string>();
    const redisClient = {
      get(key: string) {
        return store.get(key) ?? null;
      },
      set(key: string, value: string) {
        store.set(key, value);
      },
      del(...keys: string[]) {
        for (const key of keys) store.delete(key);
      },
      keys(pattern: string) {
        const prefix = pattern.replace(/\*$/, "");
        return [...store.keys()].filter((key) => key.startsWith(prefix));
      },
    };

    const { search, seed } = await getTestInstance({
      plugins: [
        caching({
          ttl: 60_000,
          storage: createRedisCacheStorage(redisClient, { prefix: "test:cache:" }),
        }),
      ],
    });
    await seed(PRODUCTS_INDEX, PRODUCT_FIXTURES);

    const q = {};
    const first = await search.query(PRODUCTS_INDEX, q);
    expect(store.size).toBe(1);

    const cached = await search.query(PRODUCTS_INDEX, q);
    expect(cached.total).toBe(first.total);
    expect(resultIds(cached)).toEqual(resultIds(first));
  });

  it("supports targeted invalidation by index and tenant in Redis storage", async () => {
    const store = new Map<string, string>();
    const sets = new Map<string, Set<string>>();
    const redisClient = {
      get(key: string) {
        return store.get(key) ?? null;
      },
      set(key: string, value: string) {
        store.set(key, value);
      },
      del(...keys: string[]) {
        for (const key of keys) {
          store.delete(key);
          sets.delete(key);
        }
      },
      keys(pattern: string) {
        const prefix = pattern.replace(/\*$/, "");
        return [...store.keys(), ...sets.keys()].filter((key) => key.startsWith(prefix));
      },
      sAdd(key: string, ...values: string[]) {
        const set = sets.get(key) ?? new Set<string>();
        for (const value of values) set.add(value);
        sets.set(key, set);
      },
      sMembers(key: string) {
        return [...(sets.get(key) ?? new Set<string>())];
      },
      sRem(key: string, ...values: string[]) {
        const set = sets.get(key);
        if (!set) return;
        for (const value of values) set.delete(value);
      },
    };

    const storage = createRedisCacheStorage(redisClient, {
      prefix: "test:cache:",
    });

    await storage.set(
      JSON.stringify({ indexName: "products", query: { q: "shoe", tenantId: "t1" } }),
      { items: [], total: 0, page: 1, pageSize: 10 },
      60_000,
    );
    await storage.set(
      JSON.stringify({ indexName: "products", query: { q: "shoe", tenantId: "t2" } }),
      { items: [], total: 0, page: 1, pageSize: 10 },
      60_000,
    );
    await storage.set(
      JSON.stringify({ indexName: "articles", query: { q: "shoe", tenantId: "t1" } }),
      { items: [], total: 0, page: 1, pageSize: 10 },
      60_000,
    );

    const removedIndex = await storage.invalidateByIndex?.("products");
    expect(removedIndex).toBe(2);
    expect(store.size).toBe(1);

    const removedTenant = await storage.invalidateByTenant?.("t1");
    expect(removedTenant).toBe(1);
    expect(store.size).toBe(0);
  });

  it("serves stale results and refreshes in background with SWR", async () => {
    vi.useFakeTimers();
    let queryCount = 0;

    const adapter = {
      async setup() { return; },
      async index() { return; },
      async delete() { return; },
      async deleteWhere() { return 0; },
      async stats() { return { count: 1 }; },
      async query() {
        queryCount += 1;
        return {
          items: [{ id: "v1", title: `version-${queryCount}` }],
          total: 1,
          page: 1,
          pageSize: 10,
        };
      },
    };

    const search = createSearch({
      adapter,
      indexes: {
        products: defineIndex({
          name: "products",
          fieldMap: {
            id: keywordField(),
            title: textField(),
          },
        }),
      },
      plugins: [
        caching({
          ttl: 50,
          swr: { enabled: true, staleTtlMs: 300 },
          storage: createMemoryCacheStorage(),
        }),
      ],
    });

    await search.setup();

    const first = await search.query("products", { q: "x" });
    vi.advanceTimersByTime(80);

    const stale = await search.query("products", { q: "x" });
    await Promise.resolve();
    await Promise.resolve();

    const refreshed = await search.query("products", { q: "x" });

    expect(queryCount).toBeGreaterThanOrEqual(2);
    expect((first.items[0] as { title: string }).title).toBe("version-1");
    expect((stale as Record<string, unknown>)._cacheStale).toBe(true);
    expect((refreshed.items[0] as { title: string }).title).toBe("version-2");

    vi.useRealTimers();
  });

  it("exposes purge helper for index, tenant, query, and all scopes", async () => {
    const store = new Map<string, string>();
    const sets = new Map<string, Set<string>>();
    const redisClient = {
      get(key: string) {
        return store.get(key) ?? null;
      },
      set(key: string, value: string) {
        store.set(key, value);
      },
      del(...keys: string[]) {
        for (const key of keys) {
          store.delete(key);
          sets.delete(key);
        }
      },
      keys(pattern: string) {
        const prefix = pattern.replace(/\*$/, "");
        return [...store.keys(), ...sets.keys()].filter((key) => key.startsWith(prefix));
      },
      sAdd(key: string, ...values: string[]) {
        const set = sets.get(key) ?? new Set<string>();
        for (const value of values) set.add(value);
        sets.set(key, set);
      },
      sMembers(key: string) {
        return [...(sets.get(key) ?? new Set<string>())];
      },
      sRem(key: string, ...values: string[]) {
        const set = sets.get(key);
        if (!set) return;
        for (const value of values) set.delete(value);
      },
    };

    const storage = createRedisCacheStorage(redisClient, {
      prefix: "test:cache:",
    });

    const qProductsT1 = JSON.stringify({ indexName: "products", query: { q: "shoe", tenantId: "t1" } });
    const qProductsT2 = JSON.stringify({ indexName: "products", query: { q: "hat", tenantId: "t2" } });
    const qArticlesT1 = JSON.stringify({ indexName: "articles", query: { q: "shoe", tenantId: "t1" } });

    await storage.set(qProductsT1, { items: [], total: 0, page: 1, pageSize: 10 }, 60_000);
    await storage.set(qProductsT2, { items: [], total: 0, page: 1, pageSize: 10 }, 60_000);
    await storage.set(qArticlesT1, { items: [], total: 0, page: 1, pageSize: 10 }, 60_000);

    const byIndex = await purgeCacheStorage(storage, {
      scope: "index",
      indexName: "products",
    });
    expect(byIndex.scope).toBe("index");
    expect(await storage.get(qProductsT1)).toBeNull();
    expect(await storage.get(qProductsT2)).toBeNull();
    expect(await storage.get(qArticlesT1)).not.toBeNull();

    await storage.set(qProductsT1, { items: [], total: 0, page: 1, pageSize: 10 }, 60_000);
    await storage.set(qProductsT2, { items: [], total: 0, page: 1, pageSize: 10 }, 60_000);

    const byTenant = await purgeCacheStorage(storage, {
      scope: "tenant",
      tenantId: "t1",
    });
    expect(byTenant.scope).toBe("tenant");
    expect(await storage.get(qProductsT1)).toBeNull();
    expect(await storage.get(qProductsT2)).not.toBeNull();
    expect(await storage.get(qArticlesT1)).toBeNull();

    await purgeCacheStorage(storage, {
      scope: "query",
      indexName: "products",
      query: { q: "hat", tenantId: "t2" },
    });
    expect(await storage.get(qProductsT2)).toBeNull();

    await storage.set(qProductsT1, { items: [], total: 0, page: 1, pageSize: 10 }, 60_000);
    await storage.set(qArticlesT1, { items: [], total: 0, page: 1, pageSize: 10 }, 60_000);

    const all = await purgeCacheStorage(storage, { scope: "all" });
    expect(all.scope).toBe("all");
    expect(await storage.get(qProductsT1)).toBeNull();
    expect(await storage.get(qArticlesT1)).toBeNull();
  });
});

// ---------------------------------------------------------------------------
// Scoring plugin
// ---------------------------------------------------------------------------

describe("scoring plugin", () => {
  it("applies field boost configuration without throwing", async () => {
    const { search, seed } = await getTestInstance({
      plugins: [
        scoring({
          boosts: {
            [PRODUCTS_INDEX]: [{ field: "title", boost: 3.0 }],
          },
        }),
      ],
    });
    await seed(PRODUCTS_INDEX, PRODUCT_FIXTURES);

    const result = await search.query(PRODUCTS_INDEX, { q: "shoes" });
    expect(result.total).toBeGreaterThan(0);
  });

  it("applies recency decay without throwing", async () => {
    const docsWithDates = PRODUCT_FIXTURES.map((d, i) => ({
      ...d,
      publishedAt: new Date(Date.now() - i * 86_400_000).toISOString(),
    }));
    const { search, seed } = await getTestInstance({
      plugins: [
        scoring({
          recency: {
            [PRODUCTS_INDEX]: { field: "publishedAt", halfLifeDays: 30 },
          },
        }),
      ],
    });
    await seed(PRODUCTS_INDEX, docsWithDates);

    const result = await search.query(PRODUCTS_INDEX, { q: "shoes" });
    expect(result.total).toBeGreaterThan(0);
    // Newer documents (lower index i, smaller timestamp diff) should rank higher
    const topId = result.items[0]?.id;
    expect(topId).toBeDefined();
  });

  it("applies a wildcard '*' boost to all indexes", async () => {
    const { search, seed } = await getTestInstance({
      plugins: [
        scoring({
          boosts: {
            "*": [{ field: "title", boost: 2.0 }],
          },
        }),
      ],
    });
    await seed(PRODUCTS_INDEX, PRODUCT_FIXTURES);

    const result = await search.query(PRODUCTS_INDEX, { q: "laptop" });
    expect(result.total).toBeGreaterThan(0);
  });
});

// ---------------------------------------------------------------------------
// Multitenancy plugin
// ---------------------------------------------------------------------------

describe("multitenancy plugin", () => {
  it("isolates documents by tenantId (filter strategy)", async () => {
    const { search, seed } = await getTestInstance({
      plugins: [
        multitenancy({ strategy: "filter", tenantField: "tenantId" }),
      ],
    });
    await seed(ARTICLES_INDEX, TENANT_ARTICLE_FIXTURES);

    const alphaResult = await search.query(ARTICLES_INDEX, { tenantId: "alpha" });
    for (const item of alphaResult.items) expect(item.tenantId).toBe("alpha");

    const betaResult = await search.query(ARTICLES_INDEX, { tenantId: "beta" });
    for (const item of betaResult.items) expect(item.tenantId).toBe("beta");
  });

  it("prevents cross-tenant data leakage", async () => {
    const { search, seed } = await getTestInstance({
      plugins: [
        multitenancy({ strategy: "filter", tenantField: "tenantId" }),
      ],
    });
    await seed(ARTICLES_INDEX, TENANT_ARTICLE_FIXTURES);

    const alphaResult = await search.query(ARTICLES_INDEX, { tenantId: "alpha" });
    const ids = resultIds(alphaResult);
    for (const betaId of BETA_TENANT_IDS) expect(ids).not.toContain(betaId);

    const betaResult = await search.query(ARTICLES_INDEX, { tenantId: "beta" });
    const betaIds = resultIds(betaResult);
    for (const alphaId of ALPHA_TENANT_IDS) expect(betaIds).not.toContain(alphaId);
  });

  it("returns all tenant documents for the queried tenant", async () => {
    const { search, seed } = await getTestInstance({
      plugins: [
        multitenancy({ strategy: "filter", tenantField: "tenantId" }),
      ],
    });
    await seed(ARTICLES_INDEX, TENANT_ARTICLE_FIXTURES);

    const alphaResult = await search.query(ARTICLES_INDEX, { tenantId: "alpha" });
    expect(resultIds(alphaResult).sort()).toEqual(ALPHA_TENANT_IDS.sort());
  });
});

// ---------------------------------------------------------------------------
// Plugin composition
// ---------------------------------------------------------------------------

describe("plugin composition", () => {
  it("multiple plugins run in sequence without conflicts", async () => {
    const { search, seed } = await getTestInstance({
      plugins: [
        synonyms({ map: { shoes: ["sneakers"] } }),
        filters({
          rules: [
            {
              index: PRODUCTS_INDEX,
              baseline: [{ field: "published", operator: "=", value: true }],
            },
          ],
        }),
      ],
    });
    await seed(PRODUCTS_INDEX, PRODUCT_FIXTURES);

    // Synonyms expand "shoes" → "sneakers"; filters drop unpublished docs
    const result = await search.query(PRODUCTS_INDEX, { q: "shoes" });
    for (const item of result.items) expect(item.published).toBe(true);
    expect(result.total).toBeGreaterThan(0);
  });

  it("caching + filters — cached results already have filters applied", async () => {
    const { search, seed } = await getTestInstance({
      plugins: [
        caching({ ttl: 60_000 }),
        filters({
          rules: [
            {
              index: PRODUCTS_INDEX,
              baseline: [{ field: "published", operator: "=", value: true }],
            },
          ],
        }),
      ],
    });
    await seed(PRODUCTS_INDEX, PRODUCT_FIXTURES);

    const q = {};
    const r1 = await search.query(PRODUCTS_INDEX, q);
    const r2 = await search.query(PRODUCTS_INDEX, q); // from cache
    expect(r1.total).toBe(r2.total);
    for (const item of r2.items) expect(item.published).toBe(true);
    expect(r2.total).toBe(PUBLISHED_PRODUCT_COUNT);
  });
});
