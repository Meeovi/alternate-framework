// ---------------------------------------------------------------------------
// Backups plugin — index snapshot / restore helpers
// ---------------------------------------------------------------------------
//
// Captures indexed documents after each `afterIndex` call and persists them
// via a user-supplied async `store` function.  An optional `schedule`
// (cron-like interval ms) triggers periodic full-export snapshots.
//
// Restore is available via the `restore()` method on the returned plugin object.
// ---------------------------------------------------------------------------

import type { IndexContext, IndexSchema, SearchDocument, SearchPlugin } from "../core/types";

declare module "../core/types" {
	interface SearchPluginRegistry {
		"backups": { creator: typeof backups };
	}
}

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type BackupRecord = {
	indexName: string;
	timestamp: number;
	docs: SearchDocument[];
};

export type BackupsOptions = {
	/**
	 * Persist a backup record.
	 */
	store: (record: BackupRecord) => Promise<void>;
	/**
	 * Load a backup record for restore.
	 */
	load?: (indexName: string) => Promise<BackupRecord | null>;
	/**
	 * Interval in ms between automatic snapshots.  0 = disabled.  Default: 0.
	 */
	intervalMs?: number;
	/**
	 * Accumulate documents across multiple `afterIndex` calls before flushing.
	 * Default: false (flush on every call).
	 */
	accumulate?: boolean;
	/**
	 * Compress doc arrays (informational flag passed into `BackupRecord.meta`).
	 */
	compress?: boolean;
};

// ---------------------------------------------------------------------------
// Plugin factory
// ---------------------------------------------------------------------------

export function backups(options: BackupsOptions): SearchPlugin & {
	restore(indexName: string): Promise<SearchDocument[] | null>;
	flush(indexName: string): Promise<void>;
} {
	const accumulated: Record<string, SearchDocument[]> = {};
	let timer: ReturnType<typeof setInterval> | undefined;

	async function flush(indexName: string): Promise<void> {
		const docs = accumulated[indexName];
		if (!docs || docs.length === 0) return;
		await options.store({
			indexName,
			timestamp: Date.now(),
			docs: docs.slice(),
		});
		accumulated[indexName] = [];
	}

	async function restore(indexName: string): Promise<SearchDocument[] | null> {
		if (!options.load) return null;
		const record = await options.load(indexName);
		return record?.docs ?? null;
	}

	const plugin: SearchPlugin & {
		restore(indexName: string): Promise<SearchDocument[] | null>;
		flush(indexName: string): Promise<void>;
	} = {
		id: "backups",
		restore,
		flush,

		init(indexes: Record<string, IndexSchema>) {
			if (options.intervalMs && options.intervalMs > 0) {
				timer = setInterval(async () => {
					for (const name of Object.keys(indexes)) {
						await flush(name).catch(() => undefined);
					}
				}, options.intervalMs);

				// Allow Node.js process to exit even if timer is running
				if (typeof timer === "object" && timer !== null && "unref" in timer) {
					(timer as { unref(): void }).unref();
				}
			}
		},

		async afterIndex(ctx: IndexContext) {
			const docs = ctx.docs as SearchDocument[];
			if (!accumulated[ctx.indexName]) accumulated[ctx.indexName] = [];
			accumulated[ctx.indexName].push(...docs);

			if (!options.accumulate) {
				await flush(ctx.indexName);
			}
		},
	};

	return plugin;
}
