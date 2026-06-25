// ---------------------------------------------------------------------------
// Scoring plugin — custom field boosts, recency decay, and score overrides
// ---------------------------------------------------------------------------
//
// Injects per-field boost values into `ctx.query._options` for adapters that
// support boost natively (Elasticsearch, Typesense).  For adapters that don't,
// an `afterQuery` pass applies a client-side scoring layer using BM25 + decay.
// ---------------------------------------------------------------------------

import type { IndexSchema, SearchDocument, SearchPlugin } from "../core/types";

declare module "../core/types" {
	interface SearchPluginRegistry {
		"scoring": { creator: typeof scoring };
	}
}

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type FieldBoost = {
	field: string;
	/** Multiplicative boost factor. Values > 1 increase relevance. Default: 1. */
	boost: number;
};

export type RecencyDecay = {
	/** Document date/timestamp field name. */
	field: string;
	/** Half-life in days: score halves every N days. Default: 30. */
	halfLifeDays?: number;
};

export type ScoringOptions = {
	/**
	 * Per-index field boosts.
	 * @example { products: [{ field: "title", boost: 3 }, { field: "tags", boost: 2 }] }
	 */
	boosts?: Record<string, FieldBoost[]>;
	/**
	 * Recency decay: newer documents score higher.
	 * Per-index configuration.
	 */
	recency?: Record<string, RecencyDecay>;
	/**
	 * Custom scoring function applied after the adapter returns results.
	 * Receives a document and the current query string; return a numeric score.
	 * Higher = more relevant.
	 */
	scoreDoc?: (doc: SearchDocument, query: string, indexName: string) => number;
	/**
	 * When true, inject boosts as `_options.boosts` for adapters that support it.
	 * Default: true.
	 */
	useAdapterBoosts?: boolean;
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function recencyScore(doc: SearchDocument, field: string, halfLifeDays: number): number {
	const raw = doc[field];
	if (!raw) return 1;
	const date = raw instanceof Date ? raw : new Date(String(raw));
	if (isNaN(date.getTime())) return 1;
	const ageDays = (Date.now() - date.getTime()) / 86_400_000;
	return Math.pow(0.5, ageDays / halfLifeDays);
}

// ---------------------------------------------------------------------------
// Plugin factory
// ---------------------------------------------------------------------------

export function scoring(options: ScoringOptions = {}): SearchPlugin {
	const useAdapterBoosts = options.useAdapterBoosts !== false;

	return {
		id: "scoring",

		init(_indexes: Record<string, IndexSchema>) {},

		beforeQuery(ctx) {
			const boosts = options.boosts?.[ctx.indexName] ?? options.boosts?.["*"];
			if (boosts?.length && useAdapterBoosts) {
				// Pack boosts into _options for adapters that read them (Elasticsearch, etc.)
				ctx.query._options = {
					...ctx.query._options,
					boosts: Object.fromEntries(boosts.map((b) => [b.field, b.boost])),
				};
			}
		},

		afterQuery(ctx) {
			if (!ctx.result || ctx.result.items.length === 0) return;

			const boosts    = options.boosts?.[ctx.indexName]   ?? options.boosts?.["*"];
			const recency   = options.recency?.[ctx.indexName]  ?? options.recency?.["*"];
			const scoreDoc  = options.scoreDoc;
			const q         = ctx.query.q ?? ctx.query.term ?? "";

			// Skip re-scoring if nothing custom is configured
			if (!boosts?.length && !recency && !scoreDoc) return;

			const scored = ctx.result.items.map((doc) => {
				const typed = doc as SearchDocument;
				let score = (typed._score as number | undefined) ?? 1;

				if (boosts) {
					for (const { field, boost } of boosts) {
						const val = String(typed[field] ?? "").toLowerCase();
						if (val && q && val.includes(q.toLowerCase())) score *= boost;
					}
				}

				if (recency) {
					score *= recencyScore(typed, recency.field, recency.halfLifeDays ?? 30);
				}

				if (scoreDoc) {
					score = scoreDoc(typed, q, ctx.indexName);
				}

				return { ...typed, _score: score };
			});

			// Re-sort by custom score descending
			scored.sort((a, b) => ((b._score as number) ?? 0) - ((a._score as number) ?? 0));
			ctx.result = { ...ctx.result, items: scored as typeof ctx.result.items };
		},
	};
}
