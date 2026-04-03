import { elasticsearchAdapter, type ElasticsearchAdapterConfig } from "../elasticsearch/index";
import { meilisearchAdapter, type MeilisearchAdapterConfig } from "../meilisearch/index";
import { typesenseAdapter, type TypesenseAdapterConfig } from "../typesense/index";
import { sqliteAdapter, type SqliteAdapterConfig } from "../sqlite/index";
import { pgvectorAdapter, type PgvectorAdapterConfig } from "../pgvector/index";
import { memoryAdapter } from "../memory/index";
import {
  multiBackendAdapter,
  type MultiBackendAdapterConfig,
  type BackendConfig,
} from "../multi-backend/index";
import type { SearchAdapter } from "../../core/types";

type ProxyBackendCommon = {
  id: string;
  priority?: number;
  optional?: boolean;
  weight?: number;
  maxResults?: number;
  timeoutMs?: number;
};

type ElasticsearchProxyBackend = ProxyBackendCommon & {
  kind: "elasticsearch";
  config: ElasticsearchAdapterConfig;
};

type MeilisearchProxyBackend = ProxyBackendCommon & {
  kind: "meilisearch";
  config: MeilisearchAdapterConfig;
};

type TypesenseProxyBackend = ProxyBackendCommon & {
  kind: "typesense";
  config: TypesenseAdapterConfig;
};

type SqliteProxyBackend = ProxyBackendCommon & {
  kind: "sqlite";
  config: SqliteAdapterConfig;
};

type PgvectorProxyBackend = ProxyBackendCommon & {
  kind: "pgvector";
  config: PgvectorAdapterConfig;
};

type MemoryProxyBackend = ProxyBackendCommon & {
  kind: "memory";
};

type CustomProxyBackend = ProxyBackendCommon & {
  kind: "custom";
  adapter: SearchAdapter;
};

export type ProxyBackendPreset =
  | ElasticsearchProxyBackend
  | MeilisearchProxyBackend
  | TypesenseProxyBackend
  | SqliteProxyBackend
  | PgvectorProxyBackend
  | MemoryProxyBackend
  | CustomProxyBackend;

export type MultiBackendProxyConfig = Omit<
  MultiBackendAdapterConfig,
  "backends"
> & {
  backends: ProxyBackendPreset[];
};

function createAdapterFromPreset(backend: ProxyBackendPreset): SearchAdapter {
  switch (backend.kind) {
    case "elasticsearch":
      return elasticsearchAdapter(backend.config);
    case "meilisearch":
      return meilisearchAdapter(backend.config);
    case "typesense":
      return typesenseAdapter(backend.config);
    case "sqlite":
      return sqliteAdapter(backend.config);
    case "pgvector":
      return pgvectorAdapter(backend.config);
    case "memory":
      return memoryAdapter();
    case "custom":
      return backend.adapter;
    default: {
      const unreachable: never = backend;
      throw new Error(`Unsupported backend kind: ${String(unreachable)}`);
    }
  }
}

/**
 * Creates a server-side proxy adapter that fans out queries to multiple
 * configured backend adapters in parallel/cascade mode.
 *
 * This keeps frontend calls behind a single search API while backend
 * credentials and endpoints stay server-only.
 */
export function multiBackendProxyAdapter(config: MultiBackendProxyConfig): SearchAdapter {
  if (!config.backends?.length) {
    throw new Error("multiBackendProxyAdapter requires at least one backend");
  }

  const resolvedBackends: BackendConfig[] = config.backends.map((backend) => ({
    id: backend.id,
    adapter: createAdapterFromPreset(backend),
    priority: backend.priority,
    optional: backend.optional,
    weight: backend.weight,
    maxResults: backend.maxResults,
    timeoutMs: backend.timeoutMs,
  }));

  return multiBackendAdapter({
    backends: resolvedBackends,
    aggregationStrategy: config.aggregationStrategy,
    parallel: config.parallel,
    defaultMaxResults: config.defaultMaxResults,
    defaultTimeoutMs: config.defaultTimeoutMs,
    debug: config.debug,
  });
}
