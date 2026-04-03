// ---------------------------------------------------------------------------
// Nuxt (h3) integration for alternate-search
// ---------------------------------------------------------------------------
//
// Place the result handler in a Nuxt server route, e.g.:
//   server/routes/search/[index].ts
//
// Usage:
//   import { search } from "~/lib/search";
//   import { defineSearchEventHandler } from "alternate-search/integrations/nuxt";
//
//   export default defineSearchEventHandler(search);
//
// REST contract (index resolved from the [index] route param):
//   GET  /search/:index                 Full-text query (query-string params)
//   GET  /search/:index?_action=stats   Index statistics
//   POST /search/:index                 Full SearchQuery body
//   POST /search/:index?_action=index   Bulk-index ({ documents: [...] })
//   POST /search/:index?_action=purge   Purge cached search entries
//   DELETE /search/:index?id=:docId     Delete document by id
// ---------------------------------------------------------------------------

import type { SearchInstance, SearchQuery } from "../core/types";
import { SearchError } from "../core/errors";

// h3 is a peer / transitive dep of Nuxt — import as type to avoid bundling it
// as a hard runtime dependency of alternate-search itself.
import type { H3Event } from "h3";

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

export type SearchNuxtHandlerOptions = {
  /**
   * Allowed CORS origins.
   * Pass `"*"` to allow all origins, or an array of explicit origins.
   * Omit to disable CORS headers entirely.
   */
  cors?: string | string[];
  /** Header name that enables debug payload in the response body. */
  debugHeaderName?: string;
  /** Optional cache purge hook used by POST /search/:index?_action=purge. */
  purge?: SearchNuxtPurgeHandler;
};

export type SearchNuxtPurgeScope = "index" | "tenant" | "query" | "all";

export type SearchNuxtPurgeRequest = {
  scope?: SearchNuxtPurgeScope;
  tenantId?: string;
  query?: SearchQuery;
  key?: string;
};

export type SearchNuxtPurgeResponse = {
  success?: boolean;
  purged?: number | null;
  scope?: SearchNuxtPurgeScope;
  [key: string]: unknown;
};

export type SearchNuxtPurgeHandler = (payload: {
  indexName: string;
  request: SearchNuxtPurgeRequest;
  event: H3Event;
}) => Promise<SearchNuxtPurgeResponse> | SearchNuxtPurgeResponse;

export type SearchNuxtStreamTransport = "ndjson" | "sse";

export type SearchNuxtStreamRequest = {
  requests: Array<{ indexName: string; query: SearchQuery }>;
};

/**
 * Create an h3 event handler that wires a `SearchInstance` into a Nuxt
 * server route.  The returned function can be used directly as the default
 * export of a `server/routes/search/[index].ts` file.
 */
export function defineSearchEventHandler(
  search: SearchInstance,
  options: SearchNuxtHandlerOptions = {},
) {
  const debugHeaderName = (options.debugHeaderName ?? "x-search-debug").toLowerCase();

  return async function searchEventHandler(event: H3Event): Promise<unknown> {
    const method = (event.method ?? event.node.req.method ?? "GET").toUpperCase();
    const params = (event.context?.params ?? {}) as Record<string, string>;
    const indexName: string = params.index ?? params[0] ?? "";

    if (!indexName) {
      setResponseStatus(event, 400);
      return { error: "Index name is required" };
    }

    applyCorsHeaders(event, options.cors);

    if (method === "OPTIONS") {
      setResponseStatus(event, 204);
      return null;
    }

    try {
      const qs = h3GetQuery(event);
      const action = qs._action as string | undefined;

      // ── GET ?_action=stats ─────────────────────────────────────────────────
      if (method === "GET" && action === "stats") {
        return await search.stats(indexName);
      }

      // ── GET — query via query-string ───────────────────────────────────────
      if (method === "GET") {
        const debugEnabled = isDebugEnabled(event.node.req.headers[debugHeaderName]);
        const query: SearchQuery = {
          q: (qs.q as string | undefined) ?? undefined,
          page: qs.page !== undefined ? Number(qs.page) : undefined,
          pageSize: qs.pageSize !== undefined ? Number(qs.pageSize) : undefined,
          locale: (qs.locale as string | undefined) ?? undefined,
          ...(debugEnabled
            ? {
              _options: { debug: true },
            }
            : {}),
        };
        const startedAt = Date.now();
        const result = await search.query(indexName, query);
        return debugEnabled
          ? withDebugPayload(result, {
            rawQuery: query,
            executionMs: Date.now() - startedAt,
          })
          : result;
      }

      // ── POST ?_action=index — bulk-index documents ─────────────────────────
      if (method === "POST" && action === "index") {
        const body = await h3ReadBody<{ documents?: unknown[] }>(event);
        if (!Array.isArray(body?.documents)) {
          setResponseStatus(event, 400);
          return { error: "'documents' array is required" };
        }
        await search.index(
          indexName,
          body.documents as Parameters<typeof search.index>[1],
        );
        return { success: true };
      }

      // ── POST ?_action=purge — invalidate cache entries ────────────────────
      if (method === "POST" && action === "purge") {
        if (!options.purge) {
          setResponseStatus(event, 501);
          return { error: "Purge handler is not configured" };
        }

        const body = await h3ReadBody<SearchNuxtPurgeRequest>(event);
        const scope = body.scope ?? "index";
        if (!["index", "tenant", "query", "all"].includes(scope)) {
          setResponseStatus(event, 400);
          return { error: "scope must be 'index', 'tenant', 'query', or 'all'" };
        }

        const purgeResult = await options.purge({
          indexName,
          request: { ...body, scope },
          event,
        });

        return { success: true, scope, ...purgeResult };
      }

      // ── POST — SearchQuery body ────────────────────────────────────────────
      if (method === "POST") {
        const query = await h3ReadBody<SearchQuery>(event);
        const debugEnabled = isDebugEnabled(event.node.req.headers[debugHeaderName]);
        const queryWithDebug: SearchQuery = debugEnabled
          ? {
            ...query,
            _options: {
              ...(query._options ?? {}),
              debug: true,
            },
          }
          : query;
        const controller = new AbortController();
        event.node.req.once?.("close", () => controller.abort());
        const startedAt = Date.now();
        const result = await search.query(indexName, queryWithDebug, controller.signal);
        return debugEnabled
          ? withDebugPayload(result, {
            rawQuery: queryWithDebug,
            executionMs: Date.now() - startedAt,
          })
          : result;
      }

      // ── DELETE ?id=:docId ──────────────────────────────────────────────────
      if (method === "DELETE") {
        const id = qs.id as string | undefined;
        if (!id) {
          setResponseStatus(event, 400);
          return { error: "Query param 'id' is required" };
        }
        await search.delete(indexName, id);
        return { success: true };
      }

      setResponseStatus(event, 405);
      return { error: "Method not allowed" };
    } catch (err) {
      if (err instanceof SearchError) {
        setResponseStatus(event, err.status);
        return { error: err.message, code: err.code };
      }
      setResponseStatus(event, 500);
      return { error: "Internal server error" };
    }
  };
}

/**
 * Create a Nuxt event handler that streams `queryMany` chunks as they complete.
 *
 * Request body:
 * `{ "requests": [{ "indexName": "products", "query": { "q": "shoe" } }] }`
 *
 * Query params:
 * - `transport=ndjson|sse` (default: `ndjson`)
 */
export function defineSearchStreamEventHandler(
  search: SearchInstance,
  options: SearchNuxtHandlerOptions = {},
) {
  return async function searchStreamEventHandler(event: H3Event): Promise<unknown> {
    const method = (event.method ?? event.node.req.method ?? "GET").toUpperCase();

    applyCorsHeaders(event, options.cors);

    if (method === "OPTIONS") {
      setResponseStatus(event, 204);
      return null;
    }

    if (method !== "POST") {
      setResponseStatus(event, 405);
      return { error: "Method not allowed" };
    }

    const qs = h3GetQuery(event);
    const transport = ((qs.transport as string | undefined) ?? "ndjson").toLowerCase() as SearchNuxtStreamTransport;
    if (transport !== "ndjson" && transport !== "sse") {
      setResponseStatus(event, 400);
      return { error: "transport must be 'ndjson' or 'sse'" };
    }

    const body = await h3ReadBody<SearchNuxtStreamRequest>(event);
    if (!Array.isArray(body?.requests) || body.requests.length === 0) {
      setResponseStatus(event, 400);
      return { error: "'requests' array is required" };
    }

    const requests = body.requests.map((req) => ({
      indexName: req.indexName,
      query: req.query,
    }));

    event.node.res.statusCode = 200;
    event.node.res.setHeader("Cache-Control", "no-cache, no-transform");
    event.node.res.setHeader("Connection", "keep-alive");
    event.node.res.setHeader("X-Accel-Buffering", "no");
    event.node.res.setHeader("Content-Type", transport === "sse" ? "text/event-stream; charset=utf-8" : "application/x-ndjson; charset=utf-8");

    const signalController = new AbortController();
    event.node.req.once?.("close", () => signalController.abort());

    try {
      for await (const chunk of search.queryManyStream(requests, signalController.signal)) {
        if (transport === "sse") {
          event.node.res.write(`data: ${JSON.stringify(chunk)}\n\n`);
        } else {
          event.node.res.write(`${JSON.stringify(chunk)}\n`);
        }
      }

      if (transport === "sse") {
        event.node.res.write("event: done\ndata: {}\n\n");
      }
      event.node.res.end();
      return null;
    } catch (err) {
      const payload = JSON.stringify({ error: err instanceof Error ? err.message : "Internal server error" });
      if (transport === "sse") {
        event.node.res.write(`event: error\ndata: ${payload}\n\n`);
      } else {
        event.node.res.write(`${payload}\n`);
      }
      event.node.res.end();
      return null;
    }
  };
}

function isDebugEnabled(headerValue: string | string[] | undefined): boolean {
  if (!headerValue) return false;
  const value = Array.isArray(headerValue) ? headerValue[0] : headerValue;
  return ["1", "true", "yes", "on"].includes(String(value).toLowerCase());
}

function withDebugPayload(result: unknown, data: { rawQuery: SearchQuery; executionMs: number }): unknown {
  const value = (result ?? {}) as Record<string, unknown>;
  return {
    ...value,
    debug: {
      cache: {
        hit: value._fromCache === true,
        storage: value._cacheStorage ?? null,
        stale: value._cacheStale === true,
      },
      rawQuery: data.rawQuery,
      executionMs: data.executionMs,
      bridgeTimings: value._backendTimings ?? [],
      bridgeErrors: value._backendErrors ?? [],
    },
  };
}

// ---------------------------------------------------------------------------
// Thin h3 shims — avoids a hard dependency on h3 at module load time.
// h3 is always present when running inside Nuxt, so the require() calls are safe.
// ---------------------------------------------------------------------------

function h3GetQuery(event: H3Event): Record<string, unknown> {
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const h3 = require("h3") as typeof import("h3");
    return h3.getQuery(event) as Record<string, unknown>;
  } catch {
    const raw = event.node.req.url ?? "";
    const qs = raw.includes("?") ? raw.split("?")[1] : "";
    return Object.fromEntries(new URLSearchParams(qs));
  }
}

async function h3ReadBody<T>(event: H3Event): Promise<T> {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const h3 = require("h3") as typeof import("h3");
  return h3.readBody<T>(event);
}

function setResponseStatus(event: H3Event, code: number): void {
  // h3 v1 uses event.node.res; h3 v2+ exposes setResponseStatus()
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const h3 = require("h3") as typeof import("h3");
    if (typeof (h3 as Record<string, unknown>).setResponseStatus === "function") {
      (h3 as unknown as { setResponseStatus: (e: H3Event, c: number) => void }).setResponseStatus(event, code);
      return;
    }
  } catch { /* fall through */ }
  event.node.res.statusCode = code;
}

function applyCorsHeaders(event: H3Event, cors?: string | string[]): void {
  if (!cors) return;

  const origin = event.node.req.headers.origin ?? "";

  if (cors === "*") {
    event.node.res.setHeader("Access-Control-Allow-Origin", "*");
    event.node.res.setHeader("Access-Control-Allow-Methods", "GET, POST, DELETE, OPTIONS");
    event.node.res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
    return;
  }

  const allowed = Array.isArray(cors) ? cors : [cors];
  if (origin && allowed.includes(origin)) {
    event.node.res.setHeader("Access-Control-Allow-Origin", origin);
    event.node.res.setHeader("Vary", "Origin");
    event.node.res.setHeader("Access-Control-Allow-Methods", "GET, POST, DELETE, OPTIONS");
    event.node.res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  }
}
