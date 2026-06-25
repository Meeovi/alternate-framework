// ---------------------------------------------------------------------------
// Node.js / Express / Connect / Fastify integration for alternate-search
// ---------------------------------------------------------------------------
//
// Usage — Express:
//   import express from "express";
//   import { toNodeHandler } from "alternate-search/integrations/node";
//   import { search } from "./lib/search";
//
//   const app = express();
//   app.use("/api/search", toNodeHandler(search));
//
// Usage — bare Node.js http:
//   import http from "node:http";
//   import { toNodeHandler } from "alternate-search/integrations/node";
//   import { search } from "./lib/search";
//
//   http.createServer(toNodeHandler(search, { basePath: "/" })).listen(3000);
//
// REST contract (all paths relative to basePath):
//   GET  /:index                  Full-text query via query-string params
//   GET  /:index?_action=stats    Index statistics
//   POST /:index                  Full SearchQuery body
//   POST /:index?_action=index    Bulk-index documents ({ documents: [...] })
//   POST /:index?_action=purge    Purge cached search entries
//   DELETE /:index?id=:docId      Delete document by id
// ---------------------------------------------------------------------------

import type { IncomingMessage, ServerResponse } from "node:http";
import type { SearchInstance, SearchQuery } from "../core/types";
import { SearchError } from "../core/errors";

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

export type SearchNodeHandlerOptions = {
  /**
   * URL prefix the handler is mounted on.
   * The handler strips this prefix before routing.
   * Default: "/api/search"
   */
  basePath?: string;
  /** Header name that enables debug payload in the response body. */
  debugHeaderName?: string;
  /** Optional cache purge hook used by POST /:index?_action=purge. */
  purge?: SearchNodePurgeHandler;
};

export type SearchNodePurgeScope = "index" | "tenant" | "query" | "all";

export type SearchNodePurgeRequest = {
  scope?: SearchNodePurgeScope;
  tenantId?: string;
  query?: SearchQuery;
  key?: string;
};

export type SearchNodePurgeResponse = {
  success?: boolean;
  purged?: number | null;
  scope?: SearchNodePurgeScope;
  [key: string]: unknown;
};

export type SearchNodePurgeHandler = (payload: {
  indexName: string;
  request: SearchNodePurgeRequest;
  req: IncomingMessage;
}) => Promise<SearchNodePurgeResponse> | SearchNodePurgeResponse;

/**
 * Return a Node.js `(req, res) => Promise<void>` handler that exposes a
 * `SearchInstance` over HTTP.  Drop-in compatible with Express, Connect,
 * Fastify (via `addHook("onRequest", …)`), and plain `node:http`.
 */
export function toNodeHandler(
  search: SearchInstance,
  options: SearchNodeHandlerOptions = {},
): (req: IncomingMessage, res: ServerResponse) => Promise<void> {
  const basePath = (options.basePath ?? "/api/search").replace(/\/$/, "");
  const debugHeaderName = (options.debugHeaderName ?? "x-search-debug").toLowerCase();

  return async function searchNodeHandler(req, res) {
    const rawUrl = req.url ?? "/";
    const method = (req.method ?? "GET").toUpperCase();

    if (!rawUrl.startsWith(basePath)) {
      sendJson(res, 404, { error: "Not found" });
      return;
    }

    // Strip base path and query-string
    const withoutBase = rawUrl.slice(basePath.length);
    const [pathPart, qsPart = ""] = withoutBase.split("?");
    const segments = pathPart.split("/").filter(Boolean);
    const qs = new URLSearchParams(qsPart);

    try {
      if (segments.length === 0) {
        sendJson(res, 400, { error: "Index name is required" });
        return;
      }

      const [indexName, subResource] = segments;

      // ── POST /:index?_action=index — bulk-index documents ─────────────────
      if (method === "POST" && qs.get("_action") === "index") {
        const body = await readJson<{ documents?: unknown[] }>(req);
        if (!Array.isArray(body?.documents)) {
          sendJson(res, 400, { error: "'documents' array is required" });
          return;
        }
        await search.index(indexName, body.documents as Parameters<typeof search.index>[1]);
        sendJson(res, 200, { success: true });
        return;
      }

      // ── POST /:index?_action=purge — invalidate cache entries ─────────────
      if (method === "POST" && qs.get("_action") === "purge") {
        if (!options.purge) {
          sendJson(res, 501, { error: "Purge handler is not configured" });
          return;
        }

        const body = await readJson<SearchNodePurgeRequest>(req);
        const scope = body.scope ?? "index";
        if (!["index", "tenant", "query", "all"].includes(scope)) {
          sendJson(res, 400, { error: "scope must be 'index', 'tenant', 'query', or 'all'" });
          return;
        }

        const purgeResult = await options.purge({
          indexName,
          request: { ...body, scope },
          req,
        });

        sendJson(res, 200, { success: true, scope, ...purgeResult });
        return;
      }

      // ── GET /:index?_action=stats ─────────────────────────────────────────
      if (method === "GET" && qs.get("_action") === "stats") {
        sendJson(res, 200, await search.stats(indexName));
        return;
      }

      // ── DELETE /:index?id=:docId ──────────────────────────────────────────
      if (method === "DELETE") {
        const id = qs.get("id") ?? subResource;
        if (!id) {
          sendJson(res, 400, { error: "Query param 'id' is required" });
          return;
        }
        await search.delete(indexName, id);
        sendJson(res, 200, { success: true });
        return;
      }

      // ── POST /:index — SearchQuery body ───────────────────────────────────
      if (method === "POST") {
        const query = await readJson<SearchQuery>(req);
        const debugEnabled = isDebugEnabled(req.headers[debugHeaderName]);
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
        req.once("close", () => controller.abort());
        const startedAt = Date.now();
        const result = await search.query(indexName, queryWithDebug, controller.signal);
        sendJson(res, 200, debugEnabled
          ? withDebugPayload(result, {
            rawQuery: queryWithDebug,
            executionMs: Date.now() - startedAt,
          })
          : result);
        return;
      }

      // ── GET /:index?q=...&page=...&pageSize=... ───────────────────────────
      if (method === "GET") {
        const debugEnabled = isDebugEnabled(req.headers[debugHeaderName]);
        const query: SearchQuery = {
          q: qs.get("q") ?? undefined,
          page: qs.has("page") ? Number(qs.get("page")) : undefined,
          pageSize: qs.has("pageSize") ? Number(qs.get("pageSize")) : undefined,
          locale: qs.get("locale") ?? undefined,
          ...(debugEnabled
            ? {
              _options: { debug: true },
            }
            : {}),
        };
        const startedAt = Date.now();
        const result = await search.query(indexName, query);
        sendJson(res, 200, debugEnabled
          ? withDebugPayload(result, {
            rawQuery: query,
            executionMs: Date.now() - startedAt,
          })
          : result);
        return;
      }

      sendJson(res, 405, { error: "Method not allowed" });
    } catch (err) {
      if (err instanceof SearchError) {
        sendJson(res, err.status, { error: err.message, code: err.code });
      } else {
        sendJson(res, 500, { error: "Internal server error" });
      }
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
// Helpers
// ---------------------------------------------------------------------------

function sendJson(res: ServerResponse, status: number, body: unknown): void {
  const payload = JSON.stringify(body);
  res.writeHead(status, {
    "Content-Type": "application/json",
    "Content-Length": Buffer.byteLength(payload),
  });
  res.end(payload);
}

function readJson<T>(req: IncomingMessage): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const chunks: Buffer[] = [];
    req.on("data", (chunk: Buffer) => chunks.push(chunk));
    req.on("end", () => {
      try {
        resolve(JSON.parse(Buffer.concat(chunks).toString("utf-8")) as T);
      } catch (cause) {
        reject(
          new SearchError("INVALID_QUERY", "Request body is not valid JSON", { cause }),
        );
      }
    });
    req.on("error", reject);
  });
}
