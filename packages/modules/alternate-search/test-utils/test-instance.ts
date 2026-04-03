// ---------------------------------------------------------------------------
// test-instance.ts — search test factory for alternate-search
//
// Creates a fully initialised in-memory SearchInstance suitable for all unit
// and integration tests.  Uses `memoryAdapter()` so no external backends are
// required.  Re-export from this module rather than constructing instances
// manually inside individual test files.
// ---------------------------------------------------------------------------

import { createSearch } from "../core/search";
import { memoryAdapter } from "../adapters/memory/index";
import { defineIndex } from "../schema/indexes";
import {
  textField,
  keywordField,
  numberField,
  booleanField,
  geoField,
} from "../schema/fields";
import type {
  SearchConfig,
  SearchDocument,
  SearchInstance,
  SearchPlugin,
} from "../core/types";

// ---------------------------------------------------------------------------
// Shared index names
// ---------------------------------------------------------------------------

export const PRODUCTS_INDEX = "products" as const;
export const ARTICLES_INDEX = "articles" as const;

// ---------------------------------------------------------------------------
// Default index schemas used across all tests
// ---------------------------------------------------------------------------

export const productsSchema = defineIndex({
  name: PRODUCTS_INDEX,
  primaryKey: "id",
  fieldMap: {
    id:        keywordField(),
    title:     textField({ sortable: true }),
    body:      textField(),
    price:     numberField({ facetable: true }),
    category:  keywordField({ facetable: true }),
    published: booleanField(),
    score:     numberField({ facetable: true }),
    _geo:      geoField(),
  },
});

export const articlesSchema = defineIndex({
  name: ARTICLES_INDEX,
  primaryKey: "id",
  fieldMap: {
    id:        keywordField(),
    title:     textField({ sortable: true }),
    content:   textField(),
    author:    keywordField({ facetable: true }),
    wordCount: numberField({ facetable: true }),
    tenantId:  keywordField({ filterable: true }),
  },
});

// ---------------------------------------------------------------------------
// Factory
// ---------------------------------------------------------------------------

export interface SearchTestContext {
  /** Fully initialised search instance backed by memoryAdapter. */
  search: SearchInstance;
  /** Index an array of documents into the named index. */
  seed(indexName: string, docs: SearchDocument[]): Promise<void>;
}

/**
 * Create and set up a search test instance.
 *
 * Uses `memoryAdapter()` so no external backends are required.
 * Accepts optional extra plugins and `SearchConfig` overrides.
 */
export async function getTestInstance(
  options: { plugins?: SearchPlugin[]; extraConfig?: Partial<SearchConfig> } = {},
): Promise<SearchTestContext> {
  const search = createSearch({
    adapter: memoryAdapter(),
    indexes: {
      [PRODUCTS_INDEX]: productsSchema,
      [ARTICLES_INDEX]: articlesSchema,
    },
    plugins: options.plugins ?? [],
    ...options.extraConfig,
  });

  await search.setup();

  return {
    search,
    async seed(indexName: string, docs: SearchDocument[]) {
      await search.index(indexName, docs);
    },
  };
}
