// ---------------------------------------------------------------------------
// Error codes  (mirrors better-auth's $ERROR_CODES pattern)
// ---------------------------------------------------------------------------

export const SEARCH_ERROR_CODES = {
  // Config
  MISSING_ADAPTER: "MISSING_ADAPTER",
  MISSING_INDEXES: "MISSING_INDEXES",
  UNKNOWN_INDEX: "UNKNOWN_INDEX",
  INVALID_CONFIG: "INVALID_CONFIG",
  // Query
  INVALID_QUERY: "INVALID_QUERY",
  QUERY_TIMEOUT: "QUERY_TIMEOUT",
  QUERY_ABORTED: "QUERY_ABORTED",
  PAGE_OUT_OF_RANGE: "PAGE_OUT_OF_RANGE",
  // Adapter
  ADAPTER_ERROR: "ADAPTER_ERROR",
  ADAPTER_CONNECTION_ERROR: "ADAPTER_CONNECTION_ERROR",
  ADAPTER_SETUP_ERROR: "ADAPTER_SETUP_ERROR",
  ADAPTER_INDEX_ERROR: "ADAPTER_INDEX_ERROR",
  // Plugin
  PLUGIN_INIT_ERROR: "PLUGIN_INIT_ERROR",
  PLUGIN_HOOK_ERROR: "PLUGIN_HOOK_ERROR",
  // Auth / permissions
  FORBIDDEN: "FORBIDDEN",
  UNAUTHENTICATED: "UNAUTHENTICATED",
  TENANT_REQUIRED: "TENANT_REQUIRED",
} as const;

export type SearchErrorCode = (typeof SEARCH_ERROR_CODES)[keyof typeof SEARCH_ERROR_CODES];

// ---------------------------------------------------------------------------
// HTTP status map
// ---------------------------------------------------------------------------

const HTTP_STATUS: Partial<Record<SearchErrorCode, number>> = {
  INVALID_QUERY: 400,
  INVALID_CONFIG: 500,
  UNKNOWN_INDEX: 404,
  QUERY_TIMEOUT: 408,
  QUERY_ABORTED: 408,
  PAGE_OUT_OF_RANGE: 400,
  FORBIDDEN: 403,
  UNAUTHENTICATED: 401,
  TENANT_REQUIRED: 400,
  ADAPTER_CONNECTION_ERROR: 503,
};

// ---------------------------------------------------------------------------
// Base error class
// ---------------------------------------------------------------------------

export class SearchError extends Error {
  public readonly code: SearchErrorCode;
  public readonly status: number;
  public override readonly cause?: unknown;

  constructor(
    code: SearchErrorCode,
    message: string,
    options?: { cause?: unknown; status?: number },
  ) {
    super(message, options?.cause ? { cause: options.cause } : undefined);
    this.name = "SearchError";
    this.code = code;
    this.status = options?.status ?? HTTP_STATUS[code] ?? 500;
    this.cause = options?.cause;
  }

  /** Factory shorthand. */
  static from(
    code: SearchErrorCode,
    message?: string,
    options?: { cause?: unknown; status?: number },
  ): SearchError {
    return new SearchError(code, message ?? code, options);
  }

  toJSON(): Record<string, unknown> {
    return { name: this.name, code: this.code, message: this.message, status: this.status };
  }
}

// ---------------------------------------------------------------------------
// Specialised subclasses
// ---------------------------------------------------------------------------

export class SearchConfigError extends SearchError {
  constructor(message: string, cause?: unknown) {
    super(SEARCH_ERROR_CODES.INVALID_CONFIG, message, { cause, status: 500 });
    this.name = "SearchConfigError";
  }
}

export class SearchAdapterError extends SearchError {
  constructor(message: string, cause?: unknown) {
    super(SEARCH_ERROR_CODES.ADAPTER_ERROR, message, { cause, status: 502 });
    this.name = "SearchAdapterError";
  }
}

export class SearchQueryError extends SearchError {
  constructor(message: string, cause?: unknown) {
    super(SEARCH_ERROR_CODES.INVALID_QUERY, message, { cause, status: 400 });
    this.name = "SearchQueryError";
  }
}

export class SearchTimeoutError extends SearchError {
  constructor(timeoutMs?: number) {
    super(
      SEARCH_ERROR_CODES.QUERY_TIMEOUT,
      timeoutMs ? `Query timed out after ${timeoutMs} ms` : "Query timed out",
      { status: 408 },
    );
    this.name = "SearchTimeoutError";
  }
}

export class SearchForbiddenError extends SearchError {
  constructor(message = "Access denied") {
    super(SEARCH_ERROR_CODES.FORBIDDEN, message, { status: 403 });
    this.name = "SearchForbiddenError";
  }
}

export class SearchPluginError extends SearchError {
  public readonly pluginId: string;

  constructor(pluginId: string, message: string, cause?: unknown) {
    super(SEARCH_ERROR_CODES.PLUGIN_HOOK_ERROR, `[${pluginId}] ${message}`, {
      cause,
      status: 500,
    });
    this.name = "SearchPluginError";
    this.pluginId = pluginId;
  }
}

// ---------------------------------------------------------------------------
// Error wrapping helpers
// ---------------------------------------------------------------------------

/** Wrap any unknown value thrown by an adapter call into a SearchAdapterError. */
export function wrapAdapterError(err: unknown, ctx?: string): SearchAdapterError {
  if (err instanceof SearchAdapterError) return err;
  const msg = err instanceof Error ? err.message : String(err);
  return new SearchAdapterError(ctx ? `${ctx}: ${msg}` : msg, err);
}

/** Wrap any unknown value thrown by a plugin hook into a SearchPluginError. */
export function wrapPluginError(pluginId: string, err: unknown): SearchPluginError {
  if (err instanceof SearchPluginError && err.pluginId === pluginId) return err;
  const msg = err instanceof Error ? err.message : String(err);
  return new SearchPluginError(pluginId, msg, err);
}