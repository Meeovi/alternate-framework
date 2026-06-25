export declare const SEARCH_ERROR_CODES: {
    readonly MISSING_ADAPTER: "MISSING_ADAPTER";
    readonly MISSING_INDEXES: "MISSING_INDEXES";
    readonly UNKNOWN_INDEX: "UNKNOWN_INDEX";
    readonly INVALID_CONFIG: "INVALID_CONFIG";
    readonly INVALID_QUERY: "INVALID_QUERY";
    readonly QUERY_TIMEOUT: "QUERY_TIMEOUT";
    readonly QUERY_ABORTED: "QUERY_ABORTED";
    readonly PAGE_OUT_OF_RANGE: "PAGE_OUT_OF_RANGE";
    readonly ADAPTER_ERROR: "ADAPTER_ERROR";
    readonly ADAPTER_CONNECTION_ERROR: "ADAPTER_CONNECTION_ERROR";
    readonly ADAPTER_SETUP_ERROR: "ADAPTER_SETUP_ERROR";
    readonly ADAPTER_INDEX_ERROR: "ADAPTER_INDEX_ERROR";
    readonly PLUGIN_INIT_ERROR: "PLUGIN_INIT_ERROR";
    readonly PLUGIN_HOOK_ERROR: "PLUGIN_HOOK_ERROR";
    readonly FORBIDDEN: "FORBIDDEN";
    readonly UNAUTHENTICATED: "UNAUTHENTICATED";
    readonly TENANT_REQUIRED: "TENANT_REQUIRED";
};
export type SearchErrorCode = (typeof SEARCH_ERROR_CODES)[keyof typeof SEARCH_ERROR_CODES];
export declare class SearchError extends Error {
    readonly code: SearchErrorCode;
    readonly status: number;
    readonly cause?: unknown;
    constructor(code: SearchErrorCode, message: string, options?: {
        cause?: unknown;
        status?: number;
    });
    /** Factory shorthand. */
    static from(code: SearchErrorCode, message?: string, options?: {
        cause?: unknown;
        status?: number;
    }): SearchError;
    toJSON(): Record<string, unknown>;
}
export declare class SearchConfigError extends SearchError {
    constructor(message: string, cause?: unknown);
}
export declare class SearchAdapterError extends SearchError {
    constructor(message: string, cause?: unknown);
}
export declare class SearchQueryError extends SearchError {
    constructor(message: string, cause?: unknown);
}
export declare class SearchTimeoutError extends SearchError {
    constructor(timeoutMs?: number);
}
export declare class SearchForbiddenError extends SearchError {
    constructor(message?: string);
}
export declare class SearchPluginError extends SearchError {
    readonly pluginId: string;
    constructor(pluginId: string, message: string, cause?: unknown);
}
/** Wrap any unknown value thrown by an adapter call into a SearchAdapterError. */
export declare function wrapAdapterError(err: unknown, ctx?: string): SearchAdapterError;
/** Wrap any unknown value thrown by a plugin hook into a SearchPluginError. */
export declare function wrapPluginError(pluginId: string, err: unknown): SearchPluginError;
