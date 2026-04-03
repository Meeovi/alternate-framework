// ---------------------------------------------------------------------------
// Alerts plugin — emit notifications on slow queries, errors, or anomalies
// ---------------------------------------------------------------------------
//
// Monitors query latency, zero-result rates, and error spikes.
// Fires a caller-supplied `onAlert` callback that can forward to PagerDuty,
// Slack, DataDog, OpenTelemetry spans, etc.
// ---------------------------------------------------------------------------

import type { IndexSchema, SearchPlugin } from "../core/types";
import { SearchError } from "../core/errors";

declare module "../core/types" {
	interface SearchPluginRegistry {
		"alerts": { creator: typeof alerts };
	}
}

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type AlertSeverity = "info" | "warning" | "critical";

export type AlertEvent = {
	kind: "slow_query" | "zero_results" | "error_spike" | "index_error";
	severity: AlertSeverity;
	indexName: string;
	message: string;
	details?: Record<string, unknown>;
	timestamp: string;
};

export type AlertsOptions = {
	/** Callback invoked when an alert condition is met. */
	onAlert: (event: AlertEvent) => void | Promise<void>;
	/** Query duration (ms) that triggers a slow-query alert. Default: 2000. */
	slowQueryMs?: number;
	/** Trigger an alert when a query returns 0 results. Default: false. */
	alertOnZeroResults?: boolean;
	/**
	 * Number of consecutive errors within `errorWindowMs` that trigger an
	 * error-spike alert. Default: 5.
	 */
	errorThreshold?: number;
	/** Rolling window for error-rate counting (ms). Default: 60 000. */
	errorWindowMs?: number;
};

// ---------------------------------------------------------------------------
// Plugin factory
// ---------------------------------------------------------------------------

export function alerts(options: AlertsOptions): SearchPlugin {
	const slowQueryMs      = options.slowQueryMs      ?? 2_000;
	const alertOnZero      = options.alertOnZeroResults ?? false;
	const errorThreshold   = options.errorThreshold   ?? 5;
	const errorWindowMs    = options.errorWindowMs    ?? 60_000;

	// Error-rate sliding window per index
	const errorTimestamps = new Map<string, number[]>();
	const queryStartTimes = new Map<string, number>();

	function fire(event: Omit<AlertEvent, "timestamp">): void {
		void Promise.resolve(
			options.onAlert({ ...event, timestamp: new Date().toISOString() }),
		);
	}

	function recordError(indexName: string): void {
		const now = Date.now();
		const ts = (errorTimestamps.get(indexName) ?? []).filter(
			(t) => now - t < errorWindowMs,
		);
		ts.push(now);
		errorTimestamps.set(indexName, ts);

		if (ts.length >= errorThreshold) {
			fire({
				kind: "error_spike",
				severity: "critical",
				indexName,
				message: `${ts.length} errors on index "${indexName}" within ${errorWindowMs}ms`,
				details: { errorCount: ts.length, windowMs: errorWindowMs },
			});
			errorTimestamps.set(indexName, []); // reset after alert
		}
	}

	return {
		id: "alerts",

		init(_indexes: Record<string, IndexSchema>) {},

		beforeQuery(ctx) {
			queryStartTimes.set(ctx.indexName, Date.now());
		},

		afterQuery(ctx) {
			const start = queryStartTimes.get(ctx.indexName);
			if (start !== undefined) {
				const took = Date.now() - start;
				queryStartTimes.delete(ctx.indexName);

				if (took >= slowQueryMs) {
					fire({
						kind: "slow_query",
						severity: took >= slowQueryMs * 2 ? "critical" : "warning",
						indexName: ctx.indexName,
						message: `Slow query on "${ctx.indexName}" took ${took}ms`,
						details: { took, threshold: slowQueryMs, q: ctx.query.q ?? ctx.query.term },
					});
				}
			}

			if (alertOnZero && ctx.result?.total === 0) {
				fire({
					kind: "zero_results",
					severity: "info",
					indexName: ctx.indexName,
					message: `Zero results for query on "${ctx.indexName}"`,
					details: { q: ctx.query.q ?? ctx.query.term },
				});
			}
		},

		afterIndex(ctx) {
			// Detect index errors surfaced via meta
			if (ctx.meta.indexError) {
				recordError(ctx.indexName);
			}
		},
	};
}
