// ---------------------------------------------------------------------------
// Indices plugin — index lifecycle management helpers
// ---------------------------------------------------------------------------
//
// Exposes `create()`, `update()`, `delete()`, `alias()`, and `listAliases()`
// helpers on the returned plugin object. The underlying calls are forwarded
// to user-supplied handler functions so they can target any backend
// (Elasticsearch, Meilisearch, Typesense, etc.) without coupling the core
// pipeline to any specific adapter's admin API.
// ---------------------------------------------------------------------------

import type { IndexSchema, SearchPlugin } from "../core/types";

declare module "../core/types" {
	interface SearchPluginRegistry {
		"indices": { creator: typeof indices };
	}
}

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type IndexDefinition = {
	name: string;
	schema?: IndexSchema;
	settings?: Record<string, unknown>;
};

export type IndicesOptions = {
	/**
	 * Create (or ensure-exists) an index.
	 */
	create?: (def: IndexDefinition) => Promise<void>;
	/**
	 * Update settings / mappings of an existing index.
	 */
	update?: (name: string, settings: Record<string, unknown>) => Promise<void>;
	/**
	 * Delete an index.
	 */
	delete?: (name: string) => Promise<void>;
	/**
	 * Assign an alias to an index (zero-downtime re-index helper).
	 */
	addAlias?: (index: string, alias: string) => Promise<void>;
	/**
	 * Remove an alias.
	 */
	removeAlias?: (index: string, alias: string) => Promise<void>;
	/**
	 * List all aliases.
	 */
	listAliases?: () => Promise<Record<string, string[]>>;
};

// ---------------------------------------------------------------------------
// Plugin factory
// ---------------------------------------------------------------------------

export function indices(options: IndicesOptions): SearchPlugin & {
	create(def: IndexDefinition): Promise<void>;
	update(name: string, settings: Record<string, unknown>): Promise<void>;
	delete(name: string): Promise<void>;
	addAlias(index: string, alias: string): Promise<void>;
	removeAlias(index: string, alias: string): Promise<void>;
	listAliases(): Promise<Record<string, string[]>>;
} {
	function notConfigured(op: string): never {
		throw new Error(`Indices plugin: "${op}" handler not configured`);
	}

	return {
		id: "indices",

		init(_indexes: Record<string, IndexSchema>) {},

		async create(def: IndexDefinition) {
			if (!options.create) notConfigured("create");
			await options.create(def);
		},

		async update(name: string, settings: Record<string, unknown>) {
			if (!options.update) notConfigured("update");
			await options.update(name, settings);
		},

		async delete(name: string) {
			if (!options.delete) notConfigured("delete");
			await options.delete(name);
		},

		async addAlias(index: string, alias: string) {
			if (!options.addAlias) notConfigured("addAlias");
			await options.addAlias(index, alias);
		},

		async removeAlias(index: string, alias: string) {
			if (!options.removeAlias) notConfigured("removeAlias");
			await options.removeAlias(index, alias);
		},

		async listAliases() {
			if (!options.listAliases) notConfigured("listAliases");
			return options.listAliases();
		},
	};
}
