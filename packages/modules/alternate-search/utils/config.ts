// ---------------------------------------------------------------------------
// Config utility — env-override resolution + validation
// ---------------------------------------------------------------------------

import type { SearchConfig } from "../core/types";
import { SearchConfigError } from "../core/errors";

type EnvOverrides = {
  SEARCH_ADAPTER?: string;
  SEARCH_TIMEOUT_MS?: string;
  SEARCH_LOG_LEVEL?: string;
  SEARCH_BATCH_SIZE?: string;
  [key: string]: string | undefined;
};

/**
 * Merge partial config with environment overrides.
 * Environment variables WIN over config object values.
 * Prefix all env vars with `SEARCH_` by default.
 */
export function resolveConfig(
  partial: Partial<SearchConfig>,
  env: EnvOverrides = process.env as EnvOverrides,
): SearchConfig {
  const timeoutFromEnv = env.SEARCH_TIMEOUT_MS ? Number(env.SEARCH_TIMEOUT_MS) : undefined;
  const batchFromEnv   = env.SEARCH_BATCH_SIZE  ? Number(env.SEARCH_BATCH_SIZE)  : undefined;

  return {
    ...partial,
    queryTimeoutMs:  timeoutFromEnv ?? partial.queryTimeoutMs,
    indexBatchSize:  batchFromEnv   ?? partial.indexBatchSize,
  } as SearchConfig;
}

/**
 * Validate the resolved config.
 * Throws `SearchConfigError` describing the first invalid field.
 */
export function validateConfig(config: SearchConfig): void {
  if (!config.adapter) {
    throw new SearchConfigError("SearchConfig.adapter is required");
  }
  if (config.queryTimeoutMs !== undefined) {
    if (typeof config.queryTimeoutMs !== "number" || config.queryTimeoutMs < 0) {
      throw new SearchConfigError("SearchConfig.queryTimeoutMs must be a non-negative number");
    }
  }
  if (config.indexBatchSize !== undefined) {
    if (typeof config.indexBatchSize !== "number" || config.indexBatchSize < 1) {
      throw new SearchConfigError("SearchConfig.indexBatchSize must be >= 1");
    }
  }
}
