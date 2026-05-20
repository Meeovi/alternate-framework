import type { AdapterIndexOptions, FilterCondition, IndexSchema, SearchAdapter, SearchDocument, SearchPlugin } from "./types";
/**
 * Creates an index-lifecycle manager that wraps an adapter with:
 * - Chunked bulk indexing to avoid adapter request size limits
 * - Plugin beforeIndex / afterIndex hook invocation
 * - Consistent error wrapping
 */
export declare function createIndexManager(args: {
    adapter: SearchAdapter;
    plugins: SearchPlugin[];
    indexes: Record<string, IndexSchema>;
    batchSize?: number;
}): {
    setup: () => Promise<void>;
    index: (indexName: string, docs: SearchDocument[], options?: AdapterIndexOptions) => Promise<void>;
    delete: (indexName: string, id: string) => Promise<void>;
    deleteWhere: (indexName: string, filters: FilterCondition[]) => Promise<number>;
    stats: (indexName: string) => Promise<{
        count: number;
        size?: number;
    }>;
};
