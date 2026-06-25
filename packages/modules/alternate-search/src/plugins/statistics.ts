// ---------------------------------------------------------------------------
// Statistics plugin — in-process query analytics and usage metrics
// ---------------------------------------------------------------------------
//
// Tracks per-index query counts, average latency, zero-result rate, and top
// search terms.  Metrics are exposed via `getStats()` on the returned plugin
// object and optionally flushed to an external sink.
// ---------------------------------------------------------------------------

import type { IndexSchema, SearchPlugin } from "../core/types";

declare module "../core/types" {
	interface SearchPluginRegistry {
		"statistics": { creator: typeof statistics };
	}
}

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type IndexStats = {
	queryCount: number;
	zeroResultCount: number;
	totalResultCount: number;
	totalDurationMs: number;
	avgDurationMs: number;
	topTerms: Array<{ term: string; count: number }>;
};

export type StatisticsOptions = {
	/**
	 * Top-N terms to track per index. Default: 50.
	 */
	topTermsLimit?: number;
	/**
	 * Optional async flush target: called on every query if provided.
	 * Use for external time-series stores (InfluxDB, ClickHouse, etc.).
	 */
	onRecord?: (indexName: string, stats: IndexStats) => void | Promise<void>;
};

// ---------------------------------------------------------------------------
// Plugin factory
// ---------------------------------------------------------------------------

export function statistics(options: StatisticsOptions = {}): SearchPlugin & {
	getStats(indexName?: string): Record<string, IndexStats>;
	resetStats(indexName?: string): void;
} {
	const topTermsLimit = options.topTermsLimit ?? 50;
	const statsMap = new Map<string, IndexStats>();
	const termFreq  = new Map<string, Map<string, number>>();
	const startTimes = new Map<string, number>();

	function ensureIndex(name: string): IndexStats {
		if (!statsMap.has(name)) {
			statsMap.set(name, {
				queryCount: 0, zeroResultCount: 0,
				totalResultCount: 0, totalDurationMs: 0,
				avgDurationMs: 0, topTerms: [],
			});
			termFreq.set(name, new Map());
		}
		return statsMap.get(name)!;
	}

	function updateTopTerms(indexName: string, term: string): void {
		const freq = termFreq.get(indexName)!;
		freq.set(term, (freq.get(term) ?? 0) + 1);
		const sorted = [...freq.entries()]
			.sort((a, b) => b[1] - a[1])
			.slice(0, topTermsLimit);
		statsMap.get(indexName)!.topTerms = sorted.map(([t, count]) => ({ term: t, count }));
	}

	return {
		id: "statistics",

		init(indexes: Record<string, IndexSchema>) {
			for (const name of Object.keys(indexes)) ensureIndex(name);
		},

		beforeQuery(ctx) {
			startTimes.set(ctx.indexName, Date.now());
		},

		async afterQuery(ctx) {
			const stat = ensureIndex(ctx.indexName);
			const took = Date.now() - (startTimes.get(ctx.indexName) ?? Date.now());
			startTimes.delete(ctx.indexName);

			stat.queryCount++;
			stat.totalDurationMs += took;
			stat.avgDurationMs = stat.totalDurationMs / stat.queryCount;
			const count = ctx.result?.total ?? 0;
			stat.totalResultCount += count;
			if (count === 0) stat.zeroResultCount++;

			const term = ctx.query.q ?? ctx.query.term ?? "";
			if (term.trim()) updateTopTerms(ctx.indexName, term.trim().toLowerCase());

			if (options.onRecord) {
				await Promise.resolve(options.onRecord(ctx.indexName, { ...stat }));
			}
		},

		// Exposed API methods
		getStats(indexName?: string): Record<string, IndexStats> {
			if (indexName) return { [indexName]: ensureIndex(indexName) };
			return Object.fromEntries(statsMap);
		},

		resetStats(indexName?: string): void {
			if (indexName) {
				statsMap.delete(indexName);
				termFreq.delete(indexName);
			} else {
				statsMap.clear();
				termFreq.clear();
			}
		},
	};
}
