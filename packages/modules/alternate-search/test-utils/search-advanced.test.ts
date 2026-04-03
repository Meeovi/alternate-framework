import { describe, expect, it } from "vitest";
import { createSearch } from "../core/search";
import { memoryAdapter } from "../adapters/memory/index";
import { defineIndex } from "../schema/indexes";
import { booleanField, keywordField, textField } from "../schema/fields";
import { searchIndexesToJsonSchema } from "../schema/json-schema";

describe("advanced search features", () => {
  it("fuses multi-index results with reciprocal rank fusion", async () => {
    const search = createSearch({
      adapter: memoryAdapter(),
      indexes: {
        products: defineIndex({
          name: "products",
          fieldMap: {
            id: keywordField(),
            title: textField(),
          },
        }),
        articles: defineIndex({
          name: "articles",
          fieldMap: {
            id: keywordField(),
            title: textField(),
          },
        }),
      },
    });

    await search.setup();
    await search.index("products", [
      { id: "p1", title: "running shoes" },
      { id: "p2", title: "trail shoes" },
    ]);
    await search.index("articles", [
      { id: "a1", title: "running guide" },
      { id: "a2", title: "shoe maintenance" },
    ]);

    const result = await search.queryFederated([
      { indexName: "products", query: { q: "running shoes" } },
      { indexName: "articles", query: { q: "running shoes" } },
    ], { limit: 3 });

    expect(result.items.length).toBe(3);
    expect(result.items[0]?.score).toBeGreaterThan(0);
    expect(result.items[0]?.indexName).toBeDefined();
  });

  it("routes logical indexes through prefix aliases", async () => {
    const search = createSearch({
      adapter: memoryAdapter(),
      indexPrefix: "prod_",
      indexAliases: {
        products: "catalog",
      },
      indexes: {
        products: defineIndex({
          name: "products",
          fieldMap: {
            id: keywordField(),
            title: textField(),
            published: booleanField(),
          },
        }),
      },
    });

    await search.setup();
    await search.index("products", [{ id: "1", title: "aliased doc", published: true }]);

    const result = await search.query("products", { q: "aliased" });
    expect(result.total).toBe(1);
    expect((result.items[0] as { title: string }).title).toBe("aliased doc");
  });

  it("supports virtual indices with baseline filters", async () => {
    const search = createSearch({
      adapter: memoryAdapter(),
      virtualIndexes: {
        publishedProducts: {
          sourceIndex: "products",
          filters: [{ field: "published", operator: "=", value: true }],
        },
      },
      indexes: {
        products: defineIndex({
          name: "products",
          fieldMap: {
            id: keywordField(),
            title: textField(),
            published: booleanField({ filterable: true }),
          },
        }),
      },
    });

    await search.setup();
    await search.index("products", [
      { id: "1", title: "public item", published: true },
      { id: "2", title: "private item", published: false },
    ]);

    const publicOnly = await search.query("publishedProducts", { q: "item" });
    expect(publicOnly.total).toBe(1);
    expect((publicOnly.items[0] as { id: string }).id).toBe("1");
  });

  it("exports index schemas as JSON Schema documents", () => {
    const schema = searchIndexesToJsonSchema({
      products: defineIndex({
        name: "products",
        fieldMap: {
          id: keywordField(),
          title: textField(),
          published: booleanField(),
        },
      }),
    });

    const products = (schema.properties as Record<string, unknown>).products as Record<string, unknown>;
    expect(schema.type).toBe("object");
    expect(products.type).toBe("object");
    expect((products.properties as Record<string, unknown>).title).toBeDefined();
  });
});
