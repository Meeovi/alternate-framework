import { wrapAdapterError, wrapPluginError } from "./errors";
import type {
  AdapterIndexOptions,
  FilterCondition,
  IndexSchema,
  SearchAdapter,
  SearchDocument,
  SearchPlugin,
} from "./types";

const DEFAULT_BATCH_SIZE = 500;

// ---------------------------------------------------------------------------
// Index manager factory
// ---------------------------------------------------------------------------

/**
 * Creates an index-lifecycle manager that wraps an adapter with:
 * - Chunked bulk indexing to avoid adapter request size limits
 * - Plugin beforeIndex / afterIndex hook invocation
 * - Consistent error wrapping
 */
export function createIndexManager(args: {
  adapter: SearchAdapter;
  plugins: SearchPlugin[];
  indexes: Record<string, IndexSchema>;
  batchSize?: number;
}) {
  const batchSize = args.batchSize ?? DEFAULT_BATCH_SIZE;

  async function setup(): Promise<void> {
    try {
      await args.adapter.setup(args.indexes);
    } catch (err) {
      throw wrapAdapterError(err, "setup");
    }
    // Plugin init hooks
    for (const plugin of args.plugins) {
      if (!plugin.init) continue;
      try {
        await plugin.init(args.indexes);
      } catch (err) {
        throw wrapPluginError(plugin.id, err);
      }
    }
  }

  async function index(
    indexName: string,
    docs: SearchDocument[],
    options?: AdapterIndexOptions,
  ): Promise<void> {
    const ctx = { indexName, docs: [...docs], meta: {} as Record<string, unknown> };

    for (const plugin of args.plugins) {
      if (!plugin.beforeIndex) continue;
      try {
        await plugin.beforeIndex(ctx);
      } catch (err) {
        throw wrapPluginError(plugin.id, err);
      }
    }

    const effectiveBatch = options?.batchSize ?? batchSize;
    for (let i = 0; i < ctx.docs.length; i += effectiveBatch) {
      const chunk = ctx.docs.slice(i, i + effectiveBatch);
      try {
        await args.adapter.index(indexName, chunk, options);
      } catch (err) {
        throw wrapAdapterError(err, `index(${indexName})`);
      }
    }

    for (const plugin of args.plugins) {
      if (!plugin.afterIndex) continue;
      try {
        await plugin.afterIndex(ctx);
      } catch (err) {
        throw wrapPluginError(plugin.id, err);
      }
    }
  }

  async function del(indexName: string, id: string): Promise<void> {
    try {
      await args.adapter.delete(indexName, id);
    } catch (err) {
      throw wrapAdapterError(err, `delete(${indexName})`);
    }
  }

  async function deleteWhere(
    indexName: string,
    filters: FilterCondition[],
  ): Promise<number> {
    if (!args.adapter.deleteWhere) return 0;
    try {
      return await args.adapter.deleteWhere(indexName, filters);
    } catch (err) {
      throw wrapAdapterError(err, `deleteWhere(${indexName})`);
    }
  }

  async function stats(indexName: string): Promise<{ count: number; size?: number }> {
    if (!args.adapter.stats) return { count: 0 };
    try {
      return await args.adapter.stats(indexName);
    } catch (err) {
      throw wrapAdapterError(err, `stats(${indexName})`);
    }
  }

  return { setup, index, delete: del, deleteWhere, stats };
}