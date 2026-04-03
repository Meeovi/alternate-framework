// ---------------------------------------------------------------------------
// Faceted-search plugin — facet injection, enrichment, and client-side compute
// ---------------------------------------------------------------------------
//
// Ensures configured facets are always requested even when the caller omits
// them, and post-processes raw adapter facet results with display labels,
// ordering, and count capping.  Falls back to in-process facet counting when
// the adapter does not return facet data.
// ---------------------------------------------------------------------------

import type { FacetRequest, FacetResult, IndexSchema, SearchDocument, SearchPlugin } from "../core/types";

declare module "../core/types" {
	interface SearchPluginRegistry {
		"faceted-search": { creator: typeof facetedSearch };
	}
}

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type FacetConfig = {
	field: string;
	/** Maximum number of facet values to return. Default: 20. */
	limit?: number;
	/**
	 * Sort facet values: "count" (desc, default), "alpha" (ascending label), or "value".
	 */
	sort?: "count" | "alpha" | "value";
	/** Human-readable label override for the facet field. */
	label?: string;
	/** Include numeric stats (min/max/avg/sum) for numeric fields. Default: false. */
	stats?: boolean;
};

export type FacetedSearchOptions = {
	/**
	 * Per-index facet configurations.
	 * These facets are **always** requested, even if the caller doesn't ask for them.
	 */
	facets: Record<string, FacetConfig[]>;
	/**
	 * When true, compute facets in-process from result items when the adapter
	 * doesn't return facet data.  Default: true.
	 */
	fallbackToClientSide?: boolean;
};

// ---------------------------------------------------------------------------
// In-process facet computer
// ---------------------------------------------------------------------------

function computeFacets(
	items: SearchDocument[],
	configs: FacetConfig[],
): FacetResult[] {
	return configs.map((cfg) => {
		const counts = new Map<string | number | boolean, number>();
		for (const doc of items) {
			const raw = doc[cfg.field];
			const vals = Array.isArray(raw) ? raw : [raw];
			for (const v of vals) {
				if (v === undefined || v === null) continue;
				const key = v as string | number | boolean;
				counts.set(key, (counts.get(key) ?? 0) + 1);
			}
		}

		let values = [...counts.entries()].map(([value, count]) => ({ value, count }));

		values = values.sort((a, b) => {
			if (cfg.sort === "alpha")  return String(a.value).localeCompare(String(b.value));
			if (cfg.sort === "value")  return a.value < b.value ? -1 : a.value > b.value ? 1 : 0;
			return b.count - a.count; // "count" default
		}).slice(0, cfg.limit ?? 20);

		const result: FacetResult = { field: cfg.field, values };

		if (cfg.stats) {
			const nums = values.map((v) => Number(v.value)).filter((n) => !isNaN(n));
			if (nums.length > 0) {
				const sum = nums.reduce((a, b) => a + b, 0);
				result.stats = {
					min: Math.min(...nums),
					max: Math.max(...nums),
					avg: sum / nums.length,
					sum,
				};
			}
		}

		return result;
	});
}

// ---------------------------------------------------------------------------
// Plugin factory
// ---------------------------------------------------------------------------

export function facetedSearch(options: FacetedSearchOptions): SearchPlugin {
	const fallback = options.fallbackToClientSide !== false;

	return {
		id: "faceted-search",

		init(_indexes: Record<string, IndexSchema>) {},

		beforeQuery(ctx) {
			const configs = options.facets[ctx.indexName] ?? options.facets["*"] ?? [];
			if (!configs.length) return;

			const configuredRequests: FacetRequest[] = configs.map((c) => ({
				field: c.field,
				limit: c.limit ?? 20,
				stats: c.stats,
			}));

			const existing: FacetRequest[] = !ctx.query.facets
				? []
				: ctx.query.facets.map((f) =>
						typeof f === "string" ? { field: f } : f,
					);

			// Merge: configured facets first, then caller-added facets
			const merged = [...configuredRequests];
			for (const req of existing) {
				if (!merged.some((m) => m.field === req.field)) merged.push(req);
			}
			ctx.query.facets = merged;
		},

		afterQuery(ctx) {
			const configs = options.facets[ctx.indexName] ?? options.facets["*"] ?? [];
			if (!configs.length || !ctx.result) return;

			const hasFacetsFromAdapter = ctx.result.facets && ctx.result.facets.length > 0;

			if (!hasFacetsFromAdapter && fallback) {
				// Compute in-process from result items
				ctx.result = {
					...ctx.result,
					facets: computeFacets(ctx.result.items as SearchDocument[], configs),
				};
			} else if (hasFacetsFromAdapter) {
				// Enrich adapter-returned facets with sort / label config
				const configMap = new Map(configs.map((c) => [c.field, c]));
				ctx.result = {
					...ctx.result,
					facets: ctx.result.facets!.map((f) => {
						const cfg = configMap.get(f.field);
						if (!cfg) return f;
						const sorted = [...f.values].sort((a, b) => {
							if (cfg.sort === "alpha")  return String(a.value).localeCompare(String(b.value));
							if (cfg.sort === "value")  return a.value < b.value ? -1 : a.value > b.value ? 1 : 0;
							return b.count - a.count;
						}).slice(0, cfg.limit ?? 20);
						return { ...f, values: sorted };
					}),
				};
			}
		},
	};
}
