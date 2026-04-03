import { afterAll, describe, expect, it } from "vitest";
import { createSearch } from "../core/search";
import { elasticsearchAdapter } from "../adapters/elasticsearch/index";
import type { IndexSchema } from "../core/types";

const OPENSEARCH_URL = process.env.OPENSEARCH_URL ?? "https://search.meeovicms.com";
const INDEX_NAME = `alt_search_live_${Date.now()}`;

const indexSchema: IndexSchema = {
  primaryKey: "id",
  fieldMap: {
    id: { type: "string", searchable: false, filterable: true, sortable: true },
    title: { type: "string", searchable: true, sortable: true },
    body: { type: "string", searchable: true },
    category: { type: "string", searchable: false, filterable: true, facetable: true },
    price: { type: "number", filterable: true, sortable: true, facetable: true },
  },
};

const search = createSearch({
  adapter: elasticsearchAdapter({
    baseUrl: OPENSEARCH_URL,
    username: process.env.OPENSEARCH_USERNAME,
    password: process.env.OPENSEARCH_PASSWORD,
    apiKey: process.env.OPENSEARCH_API_KEY,
  }),
  indexes: {
    [INDEX_NAME]: indexSchema,
  },
});

describe("live OpenSearch integration", () => {
  it("can setup, index, query and return stats", async () => {
    await search.setup();

    await search.index(INDEX_NAME, [
      {
        id: "d1",
        title: "Running Shoes",
        body: "Lightweight sneakers for daily training",
        category: "footwear",
        price: 89.99,
      },
      {
        id: "d2",
        title: "Laptop Stand",
        body: "Aluminum stand for notebooks",
        category: "office",
        price: 49.99,
      },
    ]);

    const result = await search.query(INDEX_NAME, {
      q: "sneakers",
      page: 1,
      pageSize: 10,
      facets: ["category"],
    });

    expect(result.total).toBeGreaterThan(0);
    expect(result.items.some((item) => item.id === "d1")).toBe(true);

    const stats = await search.stats(INDEX_NAME);
    expect(stats.count).toBeGreaterThanOrEqual(2);
  }, 60_000);
});

afterAll(async () => {
  try {
    await search.deleteWhere(INDEX_NAME, [
      { field: "id", operator: "IN", value: ["d1", "d2"] },
    ]);
  } catch {
    // Best-effort cleanup only.
  }
});
