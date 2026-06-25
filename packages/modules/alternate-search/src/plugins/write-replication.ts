// ---------------------------------------------------------------------------
// Write-replication plugin — mirror index writes to a secondary adapter
// ---------------------------------------------------------------------------
//
// After each successful `afterIndex` call the plugin forwards documents to
// a secondary destination (another index on the same cluster, a different
// backend, or an async message queue) via a user-supplied `replicate`
// function.  Replication can be synchronous (default) or fire-and-forget.
// ---------------------------------------------------------------------------

import type { IndexContext, IndexSchema, SearchPlugin } from "../core/types";

declare module "../core/types" {
	interface SearchPluginRegistry {
		"write-replication": { creator: typeof writeReplication };
	}
}

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type ReplicationOptions = {
	/**
	 * Async function that persists documents to the replica destination.
	 * Receives the same `IndexContext` that just completed indexing.
	 */
	replicate: (ctx: IndexContext) => Promise<void>;
	/**
	 * When true, replication errors are swallowed and logged to `ctx.meta`
	 * rather than re-thrown.  Default: true.
	 */
	tolerateErrors?: boolean;
	/**
	 * When true, `replicate` is called asynchronously without awaiting.
	 * The main indexing flow completes immediately.  Default: false.
	 */
	async?: boolean;
	/**
	 * Replication operation to use.  "index" = full overwrite, "upsert" = merge.
	 * Informational only — passed through in `ctx.meta.replicaMode`.
	 */
	mode?: "index" | "upsert";
	/**
	 * Optional filter — only replicate documents where this predicate returns true.
	 */
	filter?: (doc: Record<string, unknown>) => boolean;
};

// ---------------------------------------------------------------------------
// Plugin factory
// ---------------------------------------------------------------------------

export function writeReplication(options: ReplicationOptions): SearchPlugin {
	const tolerateErrors = options.tolerateErrors !== false;

	return {
		id: "write-replication",

		init(_indexes: Record<string, IndexSchema>) {},

		async afterIndex(ctx: IndexContext) {
			const replicationCtx: IndexContext = {
				...ctx,
				docs: options.filter
					? (ctx.docs as Array<Record<string, unknown>>).filter(options.filter) as typeof ctx.docs
					: ctx.docs,
				meta: {
					...ctx.meta,
					replicaMode: options.mode ?? "index",
					isReplica:   true,
				},
			};

			if (replicationCtx.docs.length === 0) return;

			const run = async () => {
				try {
					await options.replicate(replicationCtx);
					ctx.meta.replicationOk = true;
				} catch (err) {
					ctx.meta.replicationError = String(err instanceof Error ? err.message : err);
					if (!tolerateErrors) throw err;
				}
			};

			if (options.async) {
				// Non-blocking — side-effect; cast to satisfy async signature
				void run();
			} else {
				await run();
			}
		},
	};
}
