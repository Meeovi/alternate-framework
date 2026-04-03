// ---------------------------------------------------------------------------
// Filters plugin — filter normalization, validation, and injection
// ---------------------------------------------------------------------------
//
// Normalises mixed `Record<string,unknown>` and `FilterCondition[]` filter
// formats into a canonical `FilterCondition[]` before the adapter sees them.
// Optionally validates against an allowed-field allowlist and injects
// mandatory baseline filters (e.g. `{ published: true }`).
// ---------------------------------------------------------------------------

import type { FilterCondition, FilterOperator, IndexSchema, SearchPlugin } from "../core/types";

declare module "../core/types" {
	interface SearchPluginRegistry {
		"filters": { creator: typeof filters };
	}
}

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type FilterRule = {
	/** Index name or "*" for all indexes. */
	index: string;
	/**
	 * Baseline filters always injected into every query on this index.
	 * These are merged with caller-supplied filters (AND semantics).
	 */
	baseline?: FilterCondition[];
	/**
	 * Fields that callers are allowed to filter on.
	 * Unrecognised fields are stripped when strict mode is on.
	 */
	allowedFields?: string[];
	/**
	 * Strip unrecognised filter fields instead of throwing.
	 * Default: true.
	 */
	strict?: boolean;
};

export type FiltersOptions = {
	rules: FilterRule[];
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function normalizeFilters(
	raw: FilterCondition[] | Record<string, unknown> | undefined,
): FilterCondition[] {
	if (!raw) return [];
	if (Array.isArray(raw)) return raw;
	return Object.entries(raw).map(([field, value]) => ({
		field,
		operator: "=" as FilterOperator,
		value,
	}));
}

// ---------------------------------------------------------------------------
// Plugin factory
// ---------------------------------------------------------------------------

export function filters(options: FiltersOptions): SearchPlugin {
	const rules = options.rules;

	function findRule(indexName: string): FilterRule | undefined {
		return rules.find((r) => r.index === indexName) ?? rules.find((r) => r.index === "*");
	}

	return {
		id: "filters",

		init(_indexes: Record<string, IndexSchema>) {},

		beforeQuery(ctx) {
			// 1. Normalize to FilterCondition[]
			let normalized = normalizeFilters(ctx.query.filters);

			const rule = findRule(ctx.indexName);
			if (!rule) {
				ctx.query.filters = normalized;
				return;
			}

			// 2. Strip / validate fields
			if (rule.allowedFields) {
				const allowed = new Set(rule.allowedFields);
				if (rule.strict !== false) {
					normalized = normalized.filter((f) => allowed.has(f.field));
				}
			}

			// 3. Inject baseline filters
			if (rule.baseline?.length) {
				normalized = [...rule.baseline, ...normalized];
			}

			ctx.query.filters = normalized;
		},
	};
}
