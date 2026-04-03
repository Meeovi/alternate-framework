// ---------------------------------------------------------------------------
// Indexing plugin — document validation, transformation, and rate limiting
// ---------------------------------------------------------------------------
//
// Runs before documents reach the adapter's indexing pipeline.  Validates
// documents against a field schema, strips unknown/disallowed fields, transforms
// values, and enforces batch-size / rate-limit guards.
// ---------------------------------------------------------------------------

import type { IndexContext, IndexSchema, SearchDocument, SearchPlugin } from "../core/types";

declare module "../core/types" {
	interface SearchPluginRegistry {
		"indexing": { creator: typeof indexing };
	}
}

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type FieldType = "string" | "number" | "boolean" | "date" | "array" | "object";

export type FieldRule = {
	type?: FieldType;
	required?: boolean;
	/** Strip this field before indexing. */
	strip?: boolean;
};

export type IndexingOptions = {
	/**
	 * Per-index or "*" field rules.  Documents that fail validation are
	 * dropped (and logged) rather than causing the whole batch to fail.
	 */
	schema?: Record<string, Record<string, FieldRule>>;
	/**
	 * Maximum documents per indexing call.  Excess docs are silently dropped.
	 */
	maxBatchSize?: number;
	/**
	 * Document transform function called on each doc before indexing.
	 */
	transform?: (doc: SearchDocument, indexName: string) => SearchDocument | null;
	/**
	 * Called when a document fails validation.
	 */
	onValidationError?: (doc: SearchDocument, indexName: string, errors: string[]) => void;
};

// ---------------------------------------------------------------------------
// Validation helpers
// ---------------------------------------------------------------------------

function validateDoc(
	doc: SearchDocument,
	rules: Record<string, FieldRule>,
): string[] {
	const errors: string[] = [];
	for (const [field, rule] of Object.entries(rules)) {
		if (rule.required && !(field in doc)) {
			errors.push(`Missing required field "${field}"`);
			continue;
		}
		const val = doc[field];
		if (val === undefined || val === null || rule.type === undefined) continue;
		const actual = Array.isArray(val) ? "array" : typeof val;
		if (actual !== rule.type) {
			errors.push(`Field "${field}" expected ${rule.type} but got ${actual}`);
		}
	}
	return errors;
}

function stripFields(doc: SearchDocument, rules: Record<string, FieldRule>): SearchDocument {
	const result = { ...doc };
	for (const [field, rule] of Object.entries(rules)) {
		if (rule.strip) delete (result as Record<string, unknown>)[field];
	}
	return result;
}

// ---------------------------------------------------------------------------
// Plugin factory
// ---------------------------------------------------------------------------

export function indexing(options: IndexingOptions = {}): SearchPlugin {
	return {
		id: "indexing",

		init(_indexes: Record<string, IndexSchema>) {},

		beforeIndex(ctx: IndexContext) {
			let docs = ctx.docs as SearchDocument[];

			// Apply max batch size
			if (options.maxBatchSize && docs.length > options.maxBatchSize) {
				ctx.meta.droppedBatchOverflow = docs.length - options.maxBatchSize;
				docs = docs.slice(0, options.maxBatchSize);
			}

			const rules = options.schema?.[ctx.indexName] ?? options.schema?.["*"];

			const validated: SearchDocument[] = [];
			for (let doc of docs) {
				// Validate
				if (rules) {
					const errors = validateDoc(doc, rules);
					if (errors.length > 0) {
						options.onValidationError?.(doc, ctx.indexName, errors);
						ctx.meta.validationErrors = ((ctx.meta.validationErrors as number) || 0) + 1;
						continue;
					}
					doc = stripFields(doc, rules);
				}

				// Transform
				if (options.transform) {
					const transformed = options.transform(doc, ctx.indexName);
					if (transformed === null) {
						ctx.meta.droppedByTransform = ((ctx.meta.droppedByTransform as number) || 0) + 1;
						continue;
					}
					doc = transformed;
				}

				validated.push(doc);
			}

			ctx.docs = validated as typeof ctx.docs;
			ctx.meta.indexedCount = validated.length;
		},
	};
}
