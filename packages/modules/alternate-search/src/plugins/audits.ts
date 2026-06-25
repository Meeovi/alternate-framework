// ---------------------------------------------------------------------------
// Audits plugin — immutable audit trail for search queries and index mutations
// ---------------------------------------------------------------------------
//
// Every query and every index write generates an `AuditRecord` delivered to
// a caller-supplied async `store` function.  The store can persist to a DB,
// emit to a SIEM, write to a log file, etc.
// ---------------------------------------------------------------------------

import type { IndexSchema, SearchPlugin } from "../core/types";

declare module "../core/types" {
	interface SearchPluginRegistry {
		"audits": { creator: typeof audits };
	}
}

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type AuditEventType = "query" | "index" | "delete";

export type AuditRecord = {
	eventType: AuditEventType;
	indexName: string;
	timestamp: string;           // ISO-8601
	userId?: string;
	tenantId?: string;
	query?: Record<string, unknown>;
	documentCount?: number;
	resultCount?: number;
	durationMs?: number;
	meta?: Record<string, unknown>;
};

export type AuditsOptions = {
	/** Async sink that persists audit records. Required. */
	store: (record: AuditRecord) => Promise<void> | void;
	/** Emit audit records for queries. Default: true. */
	includeQueries?: boolean;
	/** Emit audit records for index writes. Default: true. */
	includeIndexing?: boolean;
	/** Fields redacted from query snapshots. Default: ["userId", "apiKey"]. */
	redactFields?: string[];
	/** When true, errors in the store function are silenced. Default: true. */
	silentErrors?: boolean;
};

export function audits(options: AuditsOptions): SearchPlugin {
	const includeQueries  = options.includeQueries  !== false;
	const includeIndexing = options.includeIndexing !== false;
	const silentErrors    = options.silentErrors    !== false;
	const redact = new Set(options.redactFields ?? ["userId", "apiKey"]);

	async function emit(record: AuditRecord): Promise<void> {
		try {
			await Promise.resolve(options.store(record));
		} catch (err) {
			if (!silentErrors) throw err;
		}
	}

	function redactQuery(q: Record<string, unknown>): Record<string, unknown> {
		const out: Record<string, unknown> = {};
		for (const [k, v] of Object.entries(q)) out[k] = redact.has(k) ? "[redacted]" : v;
		return out;
	}

	const startTimes = new Map<string, number>();

	return {
		id: "audits",

		init(_indexes: Record<string, IndexSchema>) {},

		beforeQuery(ctx) {
			if (!includeQueries) return;
			startTimes.set(ctx.indexName + JSON.stringify(ctx.query), Date.now());
		},

		async afterQuery(ctx) {
			if (!includeQueries) return;
			const key = ctx.indexName + JSON.stringify(ctx.query);
			const durationMs = Date.now() - (startTimes.get(key) ?? Date.now());
			startTimes.delete(key);

			await emit({
				eventType: "query",
				indexName: ctx.indexName,
				timestamp: new Date().toISOString(),
				userId: ctx.query.userId,
				tenantId: ctx.query.tenantId,
				query: redactQuery(ctx.query as Record<string, unknown>),
				resultCount: ctx.result?.total,
				durationMs,
			});
		},

		async afterIndex(ctx) {
			if (!includeIndexing) return;
			await emit({
				eventType: "index",
				indexName: ctx.indexName,
				timestamp: new Date().toISOString(),
				documentCount: ctx.docs.length,
				meta: ctx.meta,
			});
		},
	};
}
