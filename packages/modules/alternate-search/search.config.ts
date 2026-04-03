// ---------------------------------------------------------------------------
// search.config.ts — example / reference configuration file
//
// Copy this file to your app and customise. Import `createSearch` from the
// package root and pass the config object.
// ---------------------------------------------------------------------------

import { createSearch } from "./core/search";
import { memoryAdapter } from "./adapters/memory/index";
import { semanticSearch } from "./plugins/semantic/index";
import { autocomplete } from "./plugins/autocomplete/index";
import { synonyms } from "./plugins/synonyms/index";
import { spellcheck } from "./plugins/spellcheck/index";
import { permissions } from "./plugins/permissions/index";
import { multitenancy } from "./plugins/multitenancy/index";
import { defineIndex } from "./schema/indexes";
import { textField, keywordField, numberField, tagsField, vectorField } from "./schema/fields";

// ---------------------------------------------------------------------------
// 1. Define your indexes
// ---------------------------------------------------------------------------
const productsIndex = defineIndex({
  name: "products",
  fieldMap: {
    id:          keywordField(),
    title:       textField({ sortable: true }),
    description: textField(),
    price:       numberField({ facetable: true }),
    category:    keywordField({ facetable: true }),
    tags:        tagsField(),
    _vector:     vectorField(1536), // OpenAI text-embedding-3-small
  },
  primaryKey: "id",
});

// ---------------------------------------------------------------------------
// 2. Create the search instance (server-side / edge)
// ---------------------------------------------------------------------------
export const search = createSearch({
  adapter: memoryAdapter(),

  indexes: {
    products: productsIndex,
  },

  plugins: [
    // Semantic / vector search via OpenAI embeddings
    semanticSearch({
      embedder: {
        provider: "openai",
        model: "text-embedding-3-small",
        apiKey: process.env.OPENAI_API_KEY ?? "",
      },
      fields: { products: ["title", "description"] },
    }),

    // Prefix autocomplete
    autocomplete({ minChars: 2, maxSuggestions: 8 }),

    // Synonym expansion
    synonyms({
      map: { laptop: ["notebook", "macbook"], sneakers: ["shoes", "trainers"] },
    }),

    // Spell checking
    spellcheck({ maxDistance: 2, minWordLength: 4 }),

    // RBAC + row-level security
    permissions({
      permissions: [
        {
          index: "products",
          roles: ["viewer", "admin"],
          deniedFields: ["internalCost"],
          rlsFilter: { field: "published", operator: "=", value: true },
        },
        {
          index: "*",
          roles: ["admin"],
        },
      ],
      getRoles: async (_userId) => ["viewer"], // replace with real RBAC lookup
    }),

    // Multi-tenant data isolation (filter strategy)
    multitenancy({ strategy: "filter", tenantField: "tenantId", requireTenant: false }),
  ],

  queryTimeoutMs: 5_000,
  indexBatchSize: 500,
});
