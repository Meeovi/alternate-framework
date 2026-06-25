// ---------------------------------------------------------------------------
// Logger plugin — structured query & indexing event logging
// ---------------------------------------------------------------------------
//
// Logs query parameters, result counts, timing, and indexing events to any
// `SearchLogger`-compatible sink (console, pino, winston, etc.).
// Sensitive fields (userId, apiKey) are redacted by default.
// ---------------------------------------------------------------------------

import type { IndexSchema, SearchLogger, SearchPlugin } from "../core/types";

declare module "../core/types" {
	interface SearchPluginRegistry {
		"logger": { creator: typeof logger };
	}
}

export type LoggerOptions = {
	/** Logger instance. Falls back to console when omitted. */
	logger?: SearchLogger;
	/** Minimum log level: "debug" | "info" | "warn" | "error". Default: "info". */
	level?: "debug" | "info" | "warn" | "error";
	/** Include result items in afterQuery logs. Default: false. */
	includeResults?: boolean;
	/** Fields redacted from query logs. Default: ["userId", "apiKey"]. */
	redactFields?: string[];
	/** Threshold (ms) above which a query is flagged as slow. Default: 1000. */
	slowQueryMs?: number;
};

const CONSOLE_LOGGER: SearchLogger = {
	debug: (m, meta) => console.debug(`[search] ${m}`, meta ?? ""),
	info:  (m, meta) => console.info(`[search] ${m}`, meta ?? ""),
	warn:  (m, meta) => console.warn(`[search] ${m}`, meta ?? ""),
	error: (m, cause) => console.error(`[search] ${m}`, cause ?? ""),
};

export function logger(options: LoggerOptions = {}): SearchPlugin {
	const log = options.logger ?? CONSOLE_LOGGER;
	const level = options.level ?? "info";
	const redact = new Set(options.redactFields ?? ["userId", "apiKey", "tenantId"]);
	const slowMs = options.slowQueryMs ?? 1000;

	function redactQuery(q: Record<string, unknown>): Record<string, unknown> {
		const out: Record<string, unknown> = {};
		for (const [k, v] of Object.entries(q)) {
			out[k] = redact.has(k) ? "[redacted]" : v;
		}
		return out;
	}

	const timers = new Map<string, number>();

	return {
		id: "logger",

		init(_indexes: Record<string, IndexSchema>) {
			if (level === "debug") log.debug("Search logger initialised");
		},

		beforeQuery(ctx) {
			const key = `${ctx.indexName}:${JSON.stringify(ctx.query)}`;
			timers.set(key, Date.now());
			if (level === "debug") {
				log.debug("Search query", { index: ctx.indexName, query: redactQuery(ctx.query as Record<string, unknown>) });
			}
		},

		afterQuery(ctx) {
			const key = `${ctx.indexName}:${JSON.stringify(ctx.query)}`;
			const took = Date.now() - (timers.get(key) ?? Date.now());
			timers.delete(key);

			const meta: Record<string, unknown> = {
				index: ctx.indexName,
				total: ctx.result?.total ?? 0,
				page: ctx.result?.page,
				took,
			};

			if (options.includeResults) meta.items = ctx.result?.items;

			if (took >= slowMs) {
				log.warn("Slow search query", { ...meta, query: redactQuery(ctx.query as Record<string, unknown>) });
			} else if (level === "debug" || level === "info") {
				log[level]("Search query complete", meta);
			}
		},

		beforeIndex(ctx) {
			if (level === "debug") {
				log.debug("Indexing documents", { index: ctx.indexName, count: ctx.docs.length });
			}
		},

		afterIndex(ctx) {
			log[level === "debug" ? "debug" : "info"](
				"Indexing complete",
				{ index: ctx.indexName, count: ctx.docs.length },
			);
		},
	};
}
