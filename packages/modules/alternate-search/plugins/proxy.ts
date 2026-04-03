// ---------------------------------------------------------------------------
// Proxy plugin — transparent HTTP proxy / backend forwarder
// ---------------------------------------------------------------------------
//
// Forwards search queries to an external HTTP search API and populates
// `ctx.result` directly, bypassing any other adapter.  Useful for staging /
// shadow-traffic setups or when plugging in a third-party hosted search
// service (Algolia, Typesense Cloud, Pinecone) without writing a full adapter.
// ---------------------------------------------------------------------------

import type { IndexSchema, PipelineContext, SearchPlugin, SearchResult } from "../core/types";

declare module "../core/types" {
	interface SearchPluginRegistry {
		"proxy": { creator: typeof proxy };
	}
}

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type ProxyMode = "replace" | "shadow";

export type ProxyOptions = {
	/**
	 * Base URL of the remote search API.
	 */
	baseUrl: string;
	/**
	 * Extra headers appended to every proxied request.
	 */
	headers?: Record<string, string>;
	/**
	 * How the proxy behaves:
	 * - "replace": use the remote result exclusively (skip local adapter).
	 * - "shadow":  fire request in parallel but always use the local result.
	 *
	 * Default: "replace".
	 */
	mode?: ProxyMode;
	/**
	 * Transform the query before forwarding.
	 */
	transformRequest?: (ctx: PipelineContext) => Record<string, unknown>;
	/**
	 * Transform the remote response into a SearchResult.
	 */
	transformResponse?: (raw: unknown, ctx: PipelineContext) => SearchResult;
	/**
	 * Request timeout in milliseconds.  Default: 5000.
	 */
	timeoutMs?: number;
};

// ---------------------------------------------------------------------------
// Plugin factory
// ---------------------------------------------------------------------------

export function proxy(options: ProxyOptions): SearchPlugin {
	const mode = options.mode ?? "replace";

	async function forwardQuery(ctx: PipelineContext): Promise<SearchResult | null> {
		const body = options.transformRequest
			? options.transformRequest(ctx)
			: {
					query:   ctx.query.q,
					index:   ctx.indexName,
					options: ctx.query._options,
				};

		const controller = new AbortController();
		const timeout    = setTimeout(
			() => controller.abort(),
			options.timeoutMs ?? 5000,
		);

		try {
			const signal  = AbortSignal.any
				? AbortSignal.any([controller.signal, ctx.signal].filter(Boolean) as AbortSignal[])
				: controller.signal;

			const res = await fetch(`${options.baseUrl}/search`, {
				method:  "POST",
				headers: { "Content-Type": "application/json", ...(options.headers ?? {}) },
				body:    JSON.stringify(body),
				signal,
			});

			if (!res.ok) return null;

			const rawJson: unknown = await res.json();

			return options.transformResponse
				? options.transformResponse(rawJson, ctx)
				: (rawJson as SearchResult);
		} catch {
			return null;
		} finally {
			clearTimeout(timeout);
		}
	}

	return {
		id: "proxy",

		init(_indexes: Record<string, IndexSchema>) {},

		async beforeQuery(ctx: PipelineContext) {
			if (mode === "shadow") {
				// Fire-and-forget — we never actually block or replace
				ctx.meta.shadowProxy = forwardQuery(ctx);
				return;
			}

			const result = await forwardQuery(ctx);
			if (result) {
				ctx.result = result;
				ctx.meta.proxied = true;
			}
		},
	};
}
