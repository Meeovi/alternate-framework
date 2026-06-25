// ---------------------------------------------------------------------------
// Storage plugin — storage-engine hints and persistence options
// ---------------------------------------------------------------------------
//
// Injects storage-backend configuration into `ctx.query._options.storage` and
// `ctx.meta.storage` so that adapters that support multiple storage engines
// (e.g. Elasticsearch with multiple tiers, Typesense with custom data dirs,
// local file-backed stores) can pick the right engine per index.
//
// The plugin itself does NOT perform I/O — it is purely advisory.
// ---------------------------------------------------------------------------

import type { IndexContext, IndexSchema, PipelineContext, SearchPlugin } from "../core/types";

declare module "../core/types" {
	interface SearchPluginRegistry {
		"storage": { creator: typeof storage };
	}
}

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type StorageEngine =
	| "memory"
	| "mmapfs"
	| "niofs"
	| "hybridfs"
	| "simplefs"
	| "rocksdb"
	| "leveldb"
	| (string & {});

export type StorageTier = "hot" | "warm" | "cold" | "frozen";

export type IndexStorageConfig = {
	engine?: StorageEngine;
	/**
	 * Absolute or relative path hint for the storage engine.
	 * Useful for file-backed stores.
	 */
	path?: string;
	/**
	 * Maximum index size in bytes.  Adapters may refuse writes if exceeded.
	 */
	maxSizeBytes?: number;
	/**
	 * Compress stored documents.  Default: false.
	 */
	compression?: boolean;
	/**
	 * ILM/data tier hint for adapters that support index life-cycle management.
	 */
	tier?: StorageTier;
	/**
	 * Arbitrary key-value options passed through to the adapter unchanged.
	 */
	extra?: Record<string, unknown>;
};

export type StorageOptions = {
	/**
	 * Default storage config, applied to all indexes unless overridden.
	 */
	default?: IndexStorageConfig;
	/**
	 * Per-index storage configs.  Merged (override) on top of `default`.
	 */
	indexes?: Record<string, IndexStorageConfig>;
};

// ---------------------------------------------------------------------------
// Plugin factory
// ---------------------------------------------------------------------------

export function storage(options: StorageOptions = {}): SearchPlugin {
	function configFor(indexName: string): IndexStorageConfig {
		return {
			...(options.default ?? {}),
			...(options.indexes?.[indexName] ?? options.indexes?.["*"] ?? {}),
		};
	}

	return {
		id: "storage",

		init(_indexes: Record<string, IndexSchema>) {},

		beforeQuery(ctx: PipelineContext) {
			const cfg = configFor(ctx.indexName);
			if (Object.keys(cfg).length === 0) return;
			ctx.query._options = { ...ctx.query._options, storage: cfg };
			ctx.meta.storage   = cfg;
		},

		beforeIndex(ctx: IndexContext) {
			const cfg = configFor(ctx.indexName);
			if (Object.keys(cfg).length === 0) return;
			ctx.meta.storage = cfg;
			if (cfg.maxSizeBytes !== undefined) {
				ctx.meta.storageLimitBytes = cfg.maxSizeBytes;
			}
		},
	};
}
