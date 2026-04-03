// ---------------------------------------------------------------------------
// Optimizations plugin — query normalisation and performance guards
// ---------------------------------------------------------------------------
//
// Applies a set of lightweight pre-processing rules to every query to prevent
// common performance pitfalls (unbounded pages, deep pagination, empty filters)
// and to normalise query structure for downstream adapters.
// ---------------------------------------------------------------------------

import type { FilterCondition, IndexSchema, SearchPlugin } from "../core/types";

declare module "../core/types" {
	interface SearchPluginRegistry {
		"optimizations": { creator: typeof optimizations };
	}
}

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type OptimizationsOptions = {
	/**
	 * Hard cap on `query.limit` / `query._options.limit`.  Default: 100.
	 */
	maxPageSize?: number;
	/**
	 * Default page size when caller doesn't specify.  Default: 20.
	 */
	defaultPageSize?: number;
	/**
	 * Prevent deep pagination beyond offset + limit > this value.  Default: 10 000.
	 */
	maxOffset?: number;
	/**
	 * Remove filter conditions where value is null / undefined / "".
	 * Default: true.
	 */
	pruneEmptyFilters?: boolean;
	/**
	 * Trim leading/trailing whitespace from the query string.  Default: true.
	 */
	trimQuery?: boolean;
	/**
	 * Collapse repeated whitespace in the query string.  Default: true.
	 */
	collapseWhitespace?: boolean;
	/**
	 * Lowercase the query string.  Default: false.
	 */
	lowercaseQuery?: boolean;
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function isEmpty(value: unknown): boolean {
	return value === null || value === undefined || value === "" || (Array.isArray(value) && value.length === 0);
}

function pruneFilters(filters: unknown): FilterCondition[] | undefined {
	if (!filters) return undefined;
	if (Array.isArray(filters)) {
		const pruned = (filters as FilterCondition[]).filter((f) => !isEmpty(f.value));
		return pruned.length > 0 ? pruned : undefined;
	}
	const entries = Object.entries(filters as Record<string, unknown>).filter(([, v]) => !isEmpty(v));
	return entries.length > 0
		? entries.map(([field, value]) => ({ field, operator: "=" as const, value }))
		: undefined;
}

// ---------------------------------------------------------------------------
// Plugin factory
// ---------------------------------------------------------------------------

export function optimizations(options: OptimizationsOptions = {}): SearchPlugin {
	const maxPageSize     = options.maxPageSize     ?? 100;
	const defaultPageSize = options.defaultPageSize ?? 20;
	const maxOffset       = options.maxOffset       ?? 10_000;
	const pruneEmpty      = options.pruneEmptyFilters !== false;
	const trimQuery       = options.trimQuery        !== false;
	const collapseWS      = options.collapseWhitespace !== false;
	const lowercase       = options.lowercaseQuery  ?? false;

	return {
		id: "optimizations",

		init(_indexes: Record<string, IndexSchema>) {},

		beforeQuery(ctx) {
			// 1. Normalise query string
			let q = ctx.query.q ?? ctx.query.term ?? "";
			if (trimQuery)    q = q.trim();
			if (collapseWS)   q = q.replace(/\s+/g, " ");
			if (lowercase)    q = q.toLowerCase();
			if (ctx.query.q !== undefined)    ctx.query.q    = q || undefined;
			if (ctx.query.term !== undefined) ctx.query.term = q || undefined;

			// 2. Prune empty filters
			if (pruneEmpty && ctx.query.filters) {
				ctx.query.filters = pruneFilters(ctx.query.filters);
			}

			// 3. Page size guard
			const opts = ctx.query._options ?? {};
			let limit  = Number(opts.limit ?? defaultPageSize);
			let offset = Number(opts.offset ?? 0);

			if (isNaN(limit) || limit <= 0)   limit  = defaultPageSize;
			if (isNaN(offset) || offset < 0)  offset = 0;
			if (limit > maxPageSize)           limit  = maxPageSize;

			// Deep-pagination guard
			if (offset + limit > maxOffset) {
				offset = Math.max(0, maxOffset - limit);
				ctx.meta.paginationClamped = true;
			}

			ctx.query._options = { ...opts, limit, offset };
		},
	};
}
