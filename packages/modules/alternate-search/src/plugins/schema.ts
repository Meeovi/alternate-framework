// ---------------------------------------------------------------------------
// Schema plugin — dynamic field-type inference and schema tracking
// ---------------------------------------------------------------------------
//
// Observes documents during indexing to maintain a per-index field-type
// registry.  In strict mode it enforces a declared schema and rejects
// documents with unknown or type-mismatched fields.
// ---------------------------------------------------------------------------

import type { IndexContext, IndexSchema, SearchDocument, SearchPlugin } from "../core/types";

declare module "../core/types" {
	interface SearchPluginRegistry {
		"schema": { creator: typeof schema };
	}
}

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type FieldTypeHint = "string" | "number" | "boolean" | "date" | "array" | "object";

export type FieldDefinition = {
	type: FieldTypeHint;
	nullable?: boolean;
	searchable?: boolean;
	sortable?: boolean;
	filterable?: boolean;
};

export type SchemaRecord = Record<string, FieldDefinition>;

export type SchemaOptions = {
	/**
	 * Predeclared schemas per index name.
	 */
	schemas?: Record<string, SchemaRecord>;
	/**
	 * Infer missing field types from the first batch of documents.
	 * Default: true.
	 */
	autoInfer?: boolean;
	/**
	 * Reject documents with undeclared or type-mismatched fields when a
	 * schema exists for the index.  Default: false.
	 */
	strict?: boolean;
	/**
	 * Called whenever the inferred schema for an index changes.
	 */
	onSchemaChange?: (indexName: string, schema: SchemaRecord) => void;
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function inferType(value: unknown): FieldTypeHint {
	if (value === null || value === undefined) return "string";
	if (Array.isArray(value)) return "array";
	if (value instanceof Date || (typeof value === "string" && /^\d{4}-\d{2}-\d{2}/.test(value)))
		return "date";
	return typeof value as FieldTypeHint;
}

// ---------------------------------------------------------------------------
// Plugin factory
// ---------------------------------------------------------------------------

export function schema(options: SchemaOptions = {}): SearchPlugin & {
	getSchema(indexName: string): SchemaRecord | undefined;
} {
	const autoInfer = options.autoInfer !== false;
	const strict    = options.strict ?? false;

	// Live schema registry — starts with any predeclared schemas
	const registry: Record<string, SchemaRecord> = { ...(options.schemas ?? {}) };

	function getSchema(indexName: string): SchemaRecord | undefined {
		return registry[indexName];
	}

	return {
		id: "schema",
		getSchema,

		init(_indexes: Record<string, IndexSchema>) {
			// Optionally parse declared schemas from IndexSchema definitions here
		},

		beforeIndex(ctx: IndexContext) {
			const existing = registry[ctx.indexName];
			const docs = ctx.docs as SearchDocument[];
			const updated: SchemaRecord = existing ? { ...existing } : {};
			let changed = false;

			if (autoInfer || strict) {
				for (const doc of docs) {
					for (const [key, val] of Object.entries(doc)) {
						if (key.startsWith("_")) continue;
						if (!updated[key]) {
							if (!autoInfer && strict) {
								ctx.meta.schemaErrors = ((ctx.meta.schemaErrors as number) || 0) + 1;
								continue;
							}
							updated[key] = { type: inferType(val) };
							changed = true;
						}
					}
				}
			}

			if (strict && existing) {
				const filtered: SearchDocument[] = [];
				for (const doc of docs) {
					let valid = true;
					for (const key of Object.keys(doc)) {
						if (key.startsWith("_")) continue;
						if (!existing[key]) { valid = false; break; }
						const inferred = inferType(doc[key]);
						if (inferred !== existing[key].type) { valid = false; break; }
					}
					if (valid) filtered.push(doc);
					else ctx.meta.schemaErrors = ((ctx.meta.schemaErrors as number) || 0) + 1;
				}
				ctx.docs = filtered as typeof ctx.docs;
			}

			if (changed) {
				registry[ctx.indexName] = updated;
				options.onSchemaChange?.(ctx.indexName, updated);
			}

			// Expose current schema in meta for other plugins / adapters
			ctx.meta.schema = registry[ctx.indexName];
		},
	};
}
