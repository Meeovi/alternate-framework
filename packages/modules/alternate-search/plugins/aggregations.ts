// ---------------------------------------------------------------------------
// Aggregations plugin — metrics, counts, and bucket aggregations on results
// ---------------------------------------------------------------------------
//
// Injects configured aggregation requests into `ctx.query._options.aggregations`
// before the adapter runs, and computes in-process fallback aggregations in
// `afterQuery` for adapters that don't natively support them.
// ---------------------------------------------------------------------------

import type { IndexSchema, SearchDocument, SearchPlugin } from "../core/types";

declare module "../core/types" {
	interface SearchPluginRegistry {
		"aggregations": { creator: typeof aggregations };
	}
}

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type AggType = "terms" | "range" | "histogram" | "stats" | "date_histogram";

export type AggConfig = {
	type: AggType;
	field: string;
	/** Number of term buckets.  Default: 10. */
	size?: number;
	/** Range boundaries for type "range". */
	ranges?: Array<{ from?: number; to?: number; key?: string }>;
	/** Interval for "histogram" or "date_histogram". */
	interval?: number | string;
};

export type AggResult =
	| { type: "terms";     field: string; buckets: Array<{ key: string | number; count: number }> }
	| { type: "stats";     field: string; min: number; max: number; avg: number; sum: number; count: number }
	| { type: "range";     field: string; buckets: Array<{ key: string; count: number }> }
	| { type: "histogram"; field: string; buckets: Array<{ key: number; count: number }> };

export type AggregationsOptions = {
	/**
	 * Aggregation configs per index (or "*" for all).
	 */
	aggregations: Record<string, AggConfig[]>;
	/**
	 * Compute aggregations client-side when adapter doesn't return them.
	 * Default: true.
	 */
	clientSideFallback?: boolean;
};

// ---------------------------------------------------------------------------
// In-process aggregation computer
// ---------------------------------------------------------------------------

function computeAggregation(docs: SearchDocument[], cfg: AggConfig): AggResult | null {
	if (cfg.type === "terms") {
		const counts = new Map<string | number, number>();
		for (const doc of docs) {
			const vals = Array.isArray(doc[cfg.field]) ? doc[cfg.field] as unknown[] : [doc[cfg.field]];
			for (const v of vals) {
				if (v === null || v === undefined) continue;
				const key = v as string | number;
				counts.set(key, (counts.get(key) ?? 0) + 1);
			}
		}
		const buckets = [...counts.entries()]
			.sort((a, b) => (b[1] as number) - (a[1] as number))
			.slice(0, cfg.size ?? 10)
			.map(([key, count]) => ({ key, count }));
		return { type: "terms", field: cfg.field, buckets };
	}

	if (cfg.type === "stats") {
		let min = Infinity, max = -Infinity, sum = 0, count = 0;
		for (const doc of docs) {
			const n = Number(doc[cfg.field]);
			if (isNaN(n)) continue;
			if (n < min) min = n;
			if (n > max) max = n;
			sum += n; count++;
		}
		if (count === 0) return null;
		return { type: "stats", field: cfg.field, min, max, avg: sum / count, sum, count };
	}

	if (cfg.type === "range" && cfg.ranges) {
		const buckets = cfg.ranges.map((r) => {
			const key   = r.key ?? `${r.from ?? "*"}-${r.to ?? "*"}`;
			const count = docs.filter((doc) => {
				const n = Number(doc[cfg.field]);
				if (isNaN(n)) return false;
				if (r.from !== undefined && n < r.from) return false;
				if (r.to   !== undefined && n >= r.to)  return false;
				return true;
			}).length;
			return { key, count };
		});
		return { type: "range", field: cfg.field, buckets };
	}

	if (cfg.type === "histogram" && typeof cfg.interval === "number") {
		const bucketMap = new Map<number, number>();
		for (const doc of docs) {
			const n = Number(doc[cfg.field]);
			if (isNaN(n)) continue;
			const bucket = Math.floor(n / cfg.interval) * cfg.interval;
			bucketMap.set(bucket, (bucketMap.get(bucket) ?? 0) + 1);
		}
		const buckets = [...bucketMap.entries()]
			.sort((a, b) => a[0] - b[0])
			.map(([key, count]) => ({ key, count }));
		return { type: "histogram", field: cfg.field, buckets };
	}

	return null;
}

// ---------------------------------------------------------------------------
// Plugin factory
// ---------------------------------------------------------------------------

export function aggregations(options: AggregationsOptions): SearchPlugin {
	const fallback = options.clientSideFallback !== false;

	function configsFor(indexName: string): AggConfig[] {
		return options.aggregations[indexName] ?? options.aggregations["*"] ?? [];
	}

	return {
		id: "aggregations",

		init(_indexes: Record<string, IndexSchema>) {},

		beforeQuery(ctx) {
			const configs = configsFor(ctx.indexName);
			if (!configs.length) return;
			ctx.query._options = {
				...ctx.query._options,
				aggregations: configs,
			};
		},

		afterQuery(ctx) {
			if (!ctx.result) return;
			const configs = configsFor(ctx.indexName);
			if (!configs.length) return;

			const hasAdapterAggs =
				(ctx.result as Record<string, unknown>).aggregations !== undefined;

			if (!hasAdapterAggs && fallback) {
				const docs = ctx.result.items as SearchDocument[];
				const results: AggResult[] = [];
				for (const cfg of configs) {
					const res = computeAggregation(docs, cfg);
					if (res) results.push(res);
				}
				(ctx.result as Record<string, unknown>).aggregations = results;
				ctx.meta.clientSideAggregations = true;
			}
		},
	};
}
