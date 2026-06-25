// ---------------------------------------------------------------------------
// search-core.test.ts — tests for core search functionality
//
// Covers: indexing, full-text search, filter conditions, pagination, sorting,
//         facets, geo search, document deletion, deleteWhere, and stats.
//
// Uses memoryAdapter — no external backends required.
// ---------------------------------------------------------------------------

import { describe, it, expect, beforeAll } from "vitest";
import {
  getTestInstance,
  PRODUCTS_INDEX,
  ARTICLES_INDEX,
} from "./test-instance";
import { PRODUCT_FIXTURES, ARTICLE_FIXTURES } from "./fixtures";
import {
  resultIds,
  expectResultContains,
  expectResultExcludes,
  expectEmptyResult,
} from "./headers";

// ---------------------------------------------------------------------------
// Indexing
// ---------------------------------------------------------------------------

describe("indexing", () => {
  it("indexes documents and reports correct stats", async () => {
    const { search, seed } = await getTestInstance();
    await seed(PRODUCTS_INDEX, PRODUCT_FIXTURES);
    const stats = await search.stats(PRODUCTS_INDEX);
    expect(stats.count).toBe(PRODUCT_FIXTURES.length);
  });

  it("overwrites a document with the same id on re-index", async () => {
    const { search, seed } = await getTestInstance();
    await seed(PRODUCTS_INDEX, [
      { id: "dup", title: "Original", price: 10, category: "x", published: true, score: 0 },
    ]);
    await seed(PRODUCTS_INDEX, [
      { id: "dup", title: "Updated", price: 20, category: "x", published: true, score: 0 },
    ]);
    const result = await search.query(PRODUCTS_INDEX, { q: "Updated" });
    expect(result.total).toBe(1);
    expect(result.items[0]!.title).toBe("Updated");
  });

  it("upserts (partial merge) a document when upsert=true", async () => {
    const { search, seed } = await getTestInstance();
    await seed(PRODUCTS_INDEX, [
      { id: "u1", title: "Laptop", price: 100, category: "electronics", published: true, score: 0 },
    ]);
    // Only update price; original fields must be preserved
    await search.index(PRODUCTS_INDEX, [{ id: "u1", price: 200 }], { upsert: true });
    const result = await search.query(PRODUCTS_INDEX, { q: "Laptop" });
    expect(result.items[0]!.price).toBe(200);
    expect(result.items[0]!.title).toBe("Laptop");
  });

  it("indexes documents into multiple indexes independently", async () => {
    const { search, seed } = await getTestInstance();
    await seed(PRODUCTS_INDEX, PRODUCT_FIXTURES);
    await seed(ARTICLES_INDEX, ARTICLE_FIXTURES);
    const ps = await search.stats(PRODUCTS_INDEX);
    const as = await search.stats(ARTICLES_INDEX);
    expect(ps.count).toBe(PRODUCT_FIXTURES.length);
    expect(as.count).toBe(ARTICLE_FIXTURES.length);
  });
});

// ---------------------------------------------------------------------------
// Full-text search
// ---------------------------------------------------------------------------

describe("full-text search", () => {
  let search: Awaited<ReturnType<typeof getTestInstance>>["search"];

  beforeAll(async () => {
    const ctx = await getTestInstance();
    await ctx.seed(PRODUCTS_INDEX, PRODUCT_FIXTURES);
    await ctx.seed(ARTICLES_INDEX, ARTICLE_FIXTURES);
    search = ctx.search;
  });

  it("returns matching documents for a keyword query", async () => {
    const result = await search.query(PRODUCTS_INDEX, { q: "shoes" });
    expect(result.total).toBeGreaterThan(0);
    expectResultContains(result, "p1");
  });

  it("ranks more-relevant documents higher (BM25)", async () => {
    const result = await search.query(PRODUCTS_INDEX, { q: "laptop" });
    expect(result.total).toBeGreaterThan(0);
    // "Laptop Pro 15" contains the exact term; should be the top result
    expect(result.items[0]!.id).toBe("p3");
  });

  it("returns all documents when query string is empty", async () => {
    const result = await search.query(PRODUCTS_INDEX, {});
    expect(result.total).toBe(PRODUCT_FIXTURES.length);
  });

  it("returns empty result set for a non-matching query", async () => {
    const result = await search.query(PRODUCTS_INDEX, {
      q: "zyxqwerty_nonexistent_token_xyz",
    });
    expectEmptyResult(result);
  });

  it("searches across multiple text fields", async () => {
    const result = await search.query(ARTICLES_INDEX, { q: "inverted" });
    expect(result.total).toBeGreaterThan(0);
    expectResultContains(result, "a3");
  });

  it("supports the `term` alias for `q`", async () => {
    const r1 = await search.query(PRODUCTS_INDEX, { q: "shoes" });
    const r2 = await search.query(PRODUCTS_INDEX, { term: "shoes" });
    expect(resultIds(r1)).toEqual(resultIds(r2));
  });
});

// ---------------------------------------------------------------------------
// Filter conditions
// ---------------------------------------------------------------------------

describe("filter conditions", () => {
  let search: Awaited<ReturnType<typeof getTestInstance>>["search"];

  beforeAll(async () => {
    const ctx = await getTestInstance();
    await ctx.seed(PRODUCTS_INDEX, PRODUCT_FIXTURES);
    search = ctx.search;
  });

  it("filters by equality operator (=)", async () => {
    const result = await search.query(PRODUCTS_INDEX, {
      filters: [{ field: "category", operator: "=", value: "footwear" }],
    });
    expect(result.total).toBe(2);
    for (const item of result.items) expect(item.category).toBe("footwear");
  });

  it("filters by inequality operator (!=)", async () => {
    const result = await search.query(PRODUCTS_INDEX, {
      filters: [{ field: "category", operator: "!=", value: "footwear" }],
    });
    expect(result.total).toBe(PRODUCT_FIXTURES.length - 2);
  });

  it("filters by numeric greater-than (>)", async () => {
    const result = await search.query(PRODUCTS_INDEX, {
      filters: [{ field: "price", operator: ">", value: 100 }],
    });
    for (const item of result.items)
      expect(Number(item.price)).toBeGreaterThan(100);
  });

  it("filters by numeric less-than-or-equal (<=)", async () => {
    const result = await search.query(PRODUCTS_INDEX, {
      filters: [{ field: "price", operator: "<=", value: 25 }],
    });
    for (const item of result.items)
      expect(Number(item.price)).toBeLessThanOrEqual(25);
  });

  it("filters with IN operator", async () => {
    const result = await search.query(PRODUCTS_INDEX, {
      filters: [{ field: "category", operator: "IN", value: ["footwear", "sports"] }],
    });
    for (const item of result.items)
      expect(["footwear", "sports"]).toContain(item.category);
  });

  it("filters with NOT IN operator", async () => {
    const result = await search.query(PRODUCTS_INDEX, {
      filters: [{ field: "category", operator: "NOT IN", value: ["footwear", "sports"] }],
    });
    for (const item of result.items)
      expect(["footwear", "sports"]).not.toContain(item.category);
  });

  it("applies multiple filters with AND semantics", async () => {
    const result = await search.query(PRODUCTS_INDEX, {
      filters: [
        { field: "category", operator: "=",  value: "electronics" },
        { field: "price",    operator: ">",  value: 100 },
      ],
    });
    for (const item of result.items) {
      expect(item.category).toBe("electronics");
      expect(Number(item.price)).toBeGreaterThan(100);
    }
  });

  it("accepts a plain key=value Record as filter map", async () => {
    const result = await search.query(PRODUCTS_INDEX, {
      filters: { category: "kitchen" },
    });
    expect(result.total).toBe(2);
    for (const item of result.items) expect(item.category).toBe("kitchen");
  });
});

// ---------------------------------------------------------------------------
// Pagination
// ---------------------------------------------------------------------------

describe("pagination", () => {
  let search: Awaited<ReturnType<typeof getTestInstance>>["search"];

  beforeAll(async () => {
    const ctx = await getTestInstance();
    await ctx.seed(PRODUCTS_INDEX, PRODUCT_FIXTURES);
    search = ctx.search;
  });

  it("returns the requested page size", async () => {
    const result = await search.query(PRODUCTS_INDEX, { pageSize: 3 });
    expect(result.items.length).toBe(3);
    expect(result.total).toBe(PRODUCT_FIXTURES.length);
    expect(result.page).toBe(1);
    expect(result.pageSize).toBe(3);
  });

  it("page 2 contains different items than page 1", async () => {
    const p1 = await search.query(PRODUCTS_INDEX, { page: 1, pageSize: 3 });
    const p2 = await search.query(PRODUCTS_INDEX, { page: 2, pageSize: 3 });
    const p1Ids = resultIds(p1);
    const p2Ids = resultIds(p2);
    expect(p2Ids.length).toBeGreaterThan(0);
    for (const id of p2Ids) expect(p1Ids).not.toContain(id);
  });

  it("returns empty items for a page beyond the total", async () => {
    const result = await search.query(PRODUCTS_INDEX, {
      page: 9999,
      pageSize: 10,
    });
    expect(result.items.length).toBe(0);
  });

  it("supports `limit` as an alias for pageSize", async () => {
    const result = await search.query(PRODUCTS_INDEX, { limit: 2 });
    expect(result.items.length).toBe(2);
  });

  it("total remains consistent across pages", async () => {
    const p1 = await search.query(PRODUCTS_INDEX, { page: 1, pageSize: 4 });
    const p2 = await search.query(PRODUCTS_INDEX, { page: 2, pageSize: 4 });
    expect(p1.total).toBe(p2.total);
  });
});

// ---------------------------------------------------------------------------
// Sorting
// ---------------------------------------------------------------------------

describe("sorting", () => {
  let search: Awaited<ReturnType<typeof getTestInstance>>["search"];

  beforeAll(async () => {
    const ctx = await getTestInstance();
    await ctx.seed(PRODUCTS_INDEX, PRODUCT_FIXTURES);
    search = ctx.search;
  });

  it("sorts ascending by price", async () => {
    const result = await search.query(PRODUCTS_INDEX, {
      sort: { field: "price", order: "asc" },
    });
    const prices = result.items.map((d) => Number(d.price));
    for (let i = 1; i < prices.length; i++)
      expect(prices[i]!).toBeGreaterThanOrEqual(prices[i - 1]!);
  });

  it("sorts descending by price", async () => {
    const result = await search.query(PRODUCTS_INDEX, {
      sort: { field: "price", order: "desc" },
    });
    const prices = result.items.map((d) => Number(d.price));
    for (let i = 1; i < prices.length; i++)
      expect(prices[i]!).toBeLessThanOrEqual(prices[i - 1]!);
  });

  it("supports multi-field sort (category asc, price asc)", async () => {
    const result = await search.query(PRODUCTS_INDEX, {
      sort: [
        { field: "category", order: "asc" },
        { field: "price",    order: "asc" },
      ],
    });
    const categories = result.items.map((d) => String(d.category));
    const sorted = [...categories].sort();
    expect(categories).toEqual(sorted);
  });
});

// ---------------------------------------------------------------------------
// Faceted search
// ---------------------------------------------------------------------------

describe("faceted search", () => {
  let search: Awaited<ReturnType<typeof getTestInstance>>["search"];

  beforeAll(async () => {
    const ctx = await getTestInstance();
    await ctx.seed(PRODUCTS_INDEX, PRODUCT_FIXTURES);
    search = ctx.search;
  });

  it("returns facet buckets for a keyword field", async () => {
    const result = await search.query(PRODUCTS_INDEX, { facets: ["category"] });
    expect(result.facets).toBeDefined();
    const catFacet = result.facets?.find((f) => f.field === "category");
    expect(catFacet).toBeDefined();
    expect(catFacet!.values.length).toBeGreaterThan(0);
    const total = catFacet!.values.reduce((s, v) => s + v.count, 0);
    expect(total).toBe(PRODUCT_FIXTURES.length);
  });

  it("respects the facet value limit", async () => {
    const result = await search.query(PRODUCTS_INDEX, {
      facets: [{ field: "category", limit: 2 }],
    });
    const catFacet = result.facets?.find((f) => f.field === "category");
    expect(catFacet!.values.length).toBeLessThanOrEqual(2);
  });

  it("returns numeric stats when requested", async () => {
    const result = await search.query(PRODUCTS_INDEX, {
      facets: [{ field: "price", stats: true }],
    });
    const priceFacet = result.facets?.find((f) => f.field === "price");
    expect(priceFacet?.stats).toBeDefined();
    expect(priceFacet!.stats!.min).toBeGreaterThanOrEqual(0);
    expect(priceFacet!.stats!.max).toBeGreaterThanOrEqual(priceFacet!.stats!.min);
    expect(priceFacet!.stats!.avg).toBeGreaterThan(0);
    expect(priceFacet!.stats!.sum).toBeGreaterThan(0);
  });

  it("computes facets on the filtered result set (not the whole index)", async () => {
    const result = await search.query(PRODUCTS_INDEX, {
      filters: [{ field: "category", operator: "=", value: "footwear" }],
      facets: ["category"],
    });
    const catFacet = result.facets?.find((f) => f.field === "category");
    for (const v of catFacet!.values) expect(v.value).toBe("footwear");
  });

  it("returns multiple facets in a single query", async () => {
    const result = await search.query(PRODUCTS_INDEX, {
      facets: ["category", "published"],
    });
    expect(result.facets?.length).toBe(2);
  });
});

// ---------------------------------------------------------------------------
// Geospatial search
// ---------------------------------------------------------------------------

describe("geospatial search", () => {
  let search: Awaited<ReturnType<typeof getTestInstance>>["search"];

  beforeAll(async () => {
    const ctx = await getTestInstance();
    await ctx.seed(PRODUCTS_INDEX, PRODUCT_FIXTURES);
    search = ctx.search;
  });

  it("returns documents within the specified radius", async () => {
    // p9 (SF) and p10 (Oakland) are both within 30 km of SF centre
    const result = await search.query(PRODUCTS_INDEX, {
      geo: { center: { lat: 37.7749, lng: -122.4194 }, radiusKm: 30 },
    });
    expect(result.total).toBeGreaterThan(0);
    expectResultContains(result, "p9");
    expectResultContains(result, "p10");
  });

  it("excludes documents outside the radius", async () => {
    // Only p9 is within 1 km of the SF centre coordinates
    const result = await search.query(PRODUCTS_INDEX, {
      geo: { center: { lat: 37.7749, lng: -122.4194 }, radiusKm: 1 },
    });
    for (const id of resultIds(result)) expect(id).toBe("p9");
  });

  it("returns no geo results when no documents have coordinates", async () => {
    const { search: s, seed } = await getTestInstance();
    await seed(PRODUCTS_INDEX, [
      { id: "no-geo", title: "No coords", price: 10, category: "x", published: true, score: 0 },
    ]);
    const result = await s.query(PRODUCTS_INDEX, {
      geo: { center: { lat: 37.7749, lng: -122.4194 }, radiusKm: 100 },
    });
    expectEmptyResult(result);
  });

  it("combines geo filter with text search", async () => {
    const result = await search.query(PRODUCTS_INDEX, {
      q: "watch",
      geo: { center: { lat: 37.7749, lng: -122.4194 }, radiusKm: 30 },
    });
    expectResultContains(result, "p9");
  });
});

// ---------------------------------------------------------------------------
// Document deletion
// ---------------------------------------------------------------------------

describe("document deletion", () => {
  it("deletes a single document by id", async () => {
    const { search, seed } = await getTestInstance();
    await seed(PRODUCTS_INDEX, PRODUCT_FIXTURES);
    await search.delete(PRODUCTS_INDEX, "p1");
    const result = await search.query(PRODUCTS_INDEX, { q: "Running Shoes" });
    expectResultExcludes(result, "p1");
    const stats = await search.stats(PRODUCTS_INDEX);
    expect(stats.count).toBe(PRODUCT_FIXTURES.length - 1);
  });

  it("deleting a non-existent id is a no-op", async () => {
    const { search, seed } = await getTestInstance();
    await seed(PRODUCTS_INDEX, PRODUCT_FIXTURES);
    await search.delete(PRODUCTS_INDEX, "does-not-exist");
    const stats = await search.stats(PRODUCTS_INDEX);
    expect(stats.count).toBe(PRODUCT_FIXTURES.length);
  });

  it("deleteWhere removes all matching documents", async () => {
    const { search, seed } = await getTestInstance();
    await seed(PRODUCTS_INDEX, PRODUCT_FIXTURES);
    const deleted = await search.deleteWhere(PRODUCTS_INDEX, [
      { field: "category", operator: "=", value: "footwear" },
    ]);
    expect(deleted).toBe(2);
    const result = await search.query(PRODUCTS_INDEX, {
      filters: [{ field: "category", operator: "=", value: "footwear" }],
    });
    expectEmptyResult(result);
  });

  it("deleteWhere returns 0 when no documents match", async () => {
    const { search, seed } = await getTestInstance();
    await seed(PRODUCTS_INDEX, PRODUCT_FIXTURES);
    const deleted = await search.deleteWhere(PRODUCTS_INDEX, [
      { field: "category", operator: "=", value: "nonexistent-cat" },
    ]);
    expect(deleted).toBe(0);
    const stats = await search.stats(PRODUCTS_INDEX);
    expect(stats.count).toBe(PRODUCT_FIXTURES.length);
  });
});

// ---------------------------------------------------------------------------
// Stats
// ---------------------------------------------------------------------------

describe("stats", () => {
  it("returns zero count for an empty index", async () => {
    const { search } = await getTestInstance();
    const stats = await search.stats(PRODUCTS_INDEX);
    expect(stats.count).toBe(0);
  });

  it("reflects count after incremental indexing", async () => {
    const { search } = await getTestInstance();
    const batch1 = PRODUCT_FIXTURES.slice(0, 3);
    const batch2 = PRODUCT_FIXTURES.slice(3, 7);
    await search.index(PRODUCTS_INDEX, batch1);
    expect((await search.stats(PRODUCTS_INDEX)).count).toBe(batch1.length);
    await search.index(PRODUCTS_INDEX, batch2);
    expect((await search.stats(PRODUCTS_INDEX)).count).toBe(batch1.length + batch2.length);
  });
});
