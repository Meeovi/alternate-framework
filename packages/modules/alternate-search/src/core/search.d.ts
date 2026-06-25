import type { IndexSchema, SearchConfig, SearchInstance } from "./types";
/**
 * Create a fully configured search instance.
 *
 * Follows the same factory pattern as `betterAuth` \u2014 you pass a config object
 * containing an adapter, index schemas, and optional plugins, and receive a
 * typed `SearchInstance` with `setup`, `query`, `index`, `delete`, `deleteWhere`,
 * and `stats`.
 *
 * @example
 * ```ts
 * const search = createSearch({
 *   adapter: meilisearchAdapter({ baseUrl: process.env.MEILI_URL! }),
 *   indexes: {
 *     products: { fields: ["title", "description", "tags"], vectorize: true },
 *   },
 *   plugins: [
 *     semanticSearch(),
 *     autocomplete(),
 *     multitenancy({ tenantId: "acme" }),
 *   ],
 * });
 *
 * await search.setup();
 * const results = await search.query("products", { q: "running shoes" });
 * ```
 */
type SearchIndexes = Record<string, IndexSchema>;
export declare function createSearch<TIndexes extends SearchIndexes>(config: SearchConfig & {
    indexes: TIndexes;
}): SearchInstance<TIndexes>;
export {};
