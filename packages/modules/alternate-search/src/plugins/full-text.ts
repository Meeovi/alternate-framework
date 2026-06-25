// ---------------------------------------------------------------------------
// Full-text plugin — field-level boosting, default operator, and query rewriting
// ---------------------------------------------------------------------------
//
// Wraps the raw query string with explicit field targets and boost weights,
// then writes backward-compatible `_options.fullText` for adapters that honour
// structured full-text hints (Elasticsearch multi_match, Typesense query_by,
// Meilisearch attributesToSearchOn).
//
// Works for every adapter — if an adapter ignores `_options.fullText`, the
// plain query string is still forwarded unchanged.
// ---------------------------------------------------------------------------

import type { IndexSchema, SearchPlugin } from "../core/types";

declare module "../core/types" {
	interface SearchPluginRegistry {
		"full-text": { creator: typeof fullText };
	}
}

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type FullTextFieldConfig = {
	field: string;
	/** Boost multiplier (1 = default weight). */
	boost?: number;
	/** Include this field in the full-text match. Default: true. */
	searchable?: boolean;
};

export type FullTextOptions = {
	/**
	 * Per-index field list with optional boosts.
	 * Merged with adapter-level field lists.
	 */
	fields?: Record<string, FullTextFieldConfig[]>;
	/**
	 * Default boolean operator used between query tokens.
	 * "AND" = all tokens must match; "OR" = any token must match.
	 * Default: "OR".
	 */
	defaultOperator?: "AND" | "OR";
	/**
	 * Minimum number of tokens that must match (for "OR" operator).
	 * Expressed as absolute number or percentage string like "75%".
	 */
	minimumShouldMatch?: number | string;
	/**
	 * Enable phrase matching (requires quoted substrings in the query).
	 * Default: true.
	 */
	phraseMatch?: boolean;
	/**
	 * Fuzziness for typo-tolerant matching.
	 * 0 = exact, 1 = 1-edit, 2 = 2-edits, "AUTO" = backend decides.
	 * Default: "AUTO".
	 */
	fuzziness?: 0 | 1 | 2 | "AUTO";
};

// ---------------------------------------------------------------------------
// Plugin factory
// ---------------------------------------------------------------------------

export function fullText(options: FullTextOptions = {}): SearchPlugin {
	const defaultOperator       = options.defaultOperator ?? "OR";
	const minimumShouldMatch    = options.minimumShouldMatch;
	const phraseMatch           = options.phraseMatch !== false;
	const fuzziness             = options.fuzziness ?? "AUTO";

	return {
		id: "full-text",

		init(_indexes: Record<string, IndexSchema>) {},

		beforeQuery(ctx) {
			const q = ctx.query.q ?? ctx.query.term ?? "";
			if (!q.trim()) return;

			const indexFields = options.fields?.[ctx.indexName] ?? options.fields?.["*"];

			// Build structured full-text options for adapters that support them
			ctx.query._options = {
				...ctx.query._options,
				fullText: {
					fields:              indexFields?.map((f) => ({ field: f.field, boost: f.boost ?? 1 })),
					defaultOperator,
					minimumShouldMatch,
					phraseMatch,
					fuzziness,
				},
			};

			// If the adapter does NOT use _options.fullText, patch the query string
			// to include a field-boost prefix understood by many backends:
			// e.g. Lucene: "title^3 description^1"
			if (!indexFields?.length) return;

			const searchableFields = indexFields
				.filter((f) => f.searchable !== false)
				.map((f) => (f.boost && f.boost !== 1 ? `${f.field}^${f.boost}` : f.field));

			ctx.query._options.queryFields = searchableFields;
		},
	};
}
