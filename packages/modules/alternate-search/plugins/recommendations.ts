// ---------------------------------------------------------------------------
// Recommendations plugin — "More Like This" and collaborative filtering
// ---------------------------------------------------------------------------
//
// Enriches `ctx.result.items` with per-item recommendation lists.  Supports
// two strategies:
//   • "more-like-this"   — content similarity via shared field tokens
//   • "collaborative"    — adapter-backed "users who clicked X also saw Y"
// ---------------------------------------------------------------------------

import type { IndexSchema, SearchDocument, SearchPlugin } from "../core/types";

declare module "../core/types" {
	interface SearchPluginRegistry {
		"recommendations": { creator: typeof recommendations };
	}
}

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type RecommendStrategy = "more-like-this" | "collaborative";

export type RecommendationsOptions = {
	/**
	 * Strategy used to generate recommendations.  Default: "more-like-this".
	 */
	strategy?: RecommendStrategy;
	/**
	 * Fields used for similarity when strategy = "more-like-this".
	 * Default: all string fields.
	 */
	fields?: string[];
	/**
	 * Maximum number of recommendations per result item.  Default: 5.
	 */
	maxRecommendations?: number;
	/**
	 * Only annotate the top N result items.  Default: 3.
	 */
	topN?: number;
	/**
	 * Custom async recommendation function.
	 * Receives the source document and should return recommendation documents.
	 */
	recommend?: (
		doc: SearchDocument,
		indexName: string,
		max: number,
	) => Promise<SearchDocument[]>;
	/**
	 * In-process pool of documents to compare against for "more-like-this".
	 * Has no effect when `recommend` is supplied.
	 */
	corpus?: SearchDocument[];
};

// ---------------------------------------------------------------------------
// In-process More-Like-This scorer (token overlap / Jaccard similarity)
// ---------------------------------------------------------------------------

function tokenSet(doc: SearchDocument, fields: string[]): Set<string> {
	const tokens = new Set<string>();
	for (const f of fields) {
		const val = doc[f];
		if (typeof val !== "string") continue;
		for (const tok of val.toLowerCase().split(/\W+/).filter(Boolean)) {
			tokens.add(tok);
		}
	}
	return tokens;
}

function jaccard(a: Set<string>, b: Set<string>): number {
	if (a.size === 0 && b.size === 0) return 0;
	let inter = 0;
	for (const t of a) if (b.has(t)) inter++;
	return inter / (a.size + b.size - inter);
}

function moreLikeThis(
	source: SearchDocument,
	corpus: SearchDocument[],
	fields: string[],
	max: number,
): SearchDocument[] {
	const srcTokens = tokenSet(source, fields);
	return corpus
		.filter((d) => d.id !== source.id)
		.map((d) => ({ doc: d, score: jaccard(srcTokens, tokenSet(d, fields)) }))
		.sort((a, b) => b.score - a.score)
		.slice(0, max)
		.map((e) => e.doc);
}

// ---------------------------------------------------------------------------
// Plugin factory
// ---------------------------------------------------------------------------

export function recommendations(options: RecommendationsOptions = {}): SearchPlugin {
	const strategy  = options.strategy ?? "more-like-this";
	const maxRecs   = options.maxRecommendations ?? 5;
	const topN      = options.topN ?? 3;

	return {
		id: "recommendations",

		init(_indexes: Record<string, IndexSchema>) {},

		async afterQuery(ctx) {
			if (!ctx.result || ctx.result.items.length === 0) return;

			const items = ctx.result.items as SearchDocument[];
			const slice = items.slice(0, topN);

			for (const item of slice) {
				let recs: SearchDocument[] = [];

				if (options.recommend) {
					recs = await options.recommend(item, ctx.indexName, maxRecs);
				} else if (strategy === "more-like-this" && options.corpus) {
					const fields = options.fields ?? Object.keys(item).filter((k) => typeof item[k] === "string");
					recs = moreLikeThis(item, options.corpus, fields, maxRecs);
				}

				if (recs.length > 0) {
					(item as Record<string, unknown>)._recommendations = recs;
				}
			}
		},
	};
}
