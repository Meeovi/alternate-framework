// ---------------------------------------------------------------------------
// SolidStart integration for alternate-search
// ---------------------------------------------------------------------------
//
// Create an API route at:
//   src/routes/api/search/[index].ts
//
// Usage:
//   import { search } from "~/lib/server/search";
//   import { toSolidStartHandler } from "alternate-search/integrations/solid-start";
//
//   const { GET, POST, DELETE, OPTIONS } = toSolidStartHandler(search);
//   export { GET, POST, DELETE, OPTIONS };
//
// REST contract (index resolved from the [index] route param):
//   GET  /api/search/:index                 Full-text query (query-string params)
//   GET  /api/search/:index?_action=stats   Index statistics
//   POST /api/search/:index                 Full SearchQuery body
//   POST /api/search/:index?_action=index   Bulk-index ({ documents: [...] })
//   DELETE /api/search/:index?id=:docId     Delete document by id
// ---------------------------------------------------------------------------

import type { SearchInstance, SearchQuery } from "../core/types";
import { SearchError } from "../core/errors";

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

export type SearchSolidStartHandlerOptions = {
  /**
   * Allowed CORS origins.
   * Pass `"*"` to allow all origins, or an array of explicit origins.
   * Omit to disable CORS headers entirely.
   */
  cors?: string | string[];
};

/** Event shape passed by the SolidStart / Vinxi API route runtime. */
type SolidStartEvent = {
  request: Request;
  params: Record<string, string>;
};

/**
 * Create SolidStart API route handlers for alternate-search.
 * Returns `{ GET, POST, DELETE, OPTIONS }` for use with
 * `createAPIFileRoute` or as plain named exports from a route file.
 */
export function toSolidStartHandler(
  search: SearchInstance,
  options: SearchSolidStartHandlerOptions = {},
): {
  GET: (event: SolidStartEvent) => Promise<Response>;
  POST: (event: SolidStartEvent) => Promise<Response>;
  DELETE: (event: SolidStartEvent) => Promise<Response>;
  OPTIONS: (event: SolidStartEvent) => Promise<Response>;
} {
  // ── GET /:index ────────────────────────────────────────────────────────────
  async function GET({ request, params }: SolidStartEvent): Promise<Response> {
    const indexName = params.index ?? "";
    if (!indexName) return jsonError({ error: "Index name is required" }, 400);

    const url = new URL(request.url);
    const action = url.searchParams.get("_action");

    try {
      if (action === "stats") {
        return jsonOk(
          await search.stats(indexName),
          corsHeaders(request, options.cors),
        );
      }

      const query: SearchQuery = {
        q: url.searchParams.get("q") ?? undefined,
        page: url.searchParams.has("page") ? Number(url.searchParams.get("page")) : undefined,
        pageSize: url.searchParams.has("pageSize")
          ? Number(url.searchParams.get("pageSize"))
          : undefined,
        locale: url.searchParams.get("locale") ?? undefined,
      };

      return jsonOk(
        await search.query(indexName, query, request.signal),
        corsHeaders(request, options.cors),
      );
    } catch (err) {
      return errorResponse(err);
    }
  }

  // ── POST /:index ───────────────────────────────────────────────────────────
  async function POST({ request, params }: SolidStartEvent): Promise<Response> {
    const indexName = params.index ?? "";
    if (!indexName) return jsonError({ error: "Index name is required" }, 400);

    const url = new URL(request.url);
    const action = url.searchParams.get("_action");

    try {
      if (action === "index") {
        const body = (await request.json()) as { documents?: unknown[] };
        if (!Array.isArray(body?.documents)) {
          return jsonError({ error: "'documents' array is required" }, 400);
        }
        await search.index(
          indexName,
          body.documents as Parameters<typeof search.index>[1],
        );
        return jsonOk({ success: true });
      }

      const query = (await request.json()) as SearchQuery;
      return jsonOk(
        await search.query(indexName, query, request.signal),
        corsHeaders(request, options.cors),
      );
    } catch (err) {
      return errorResponse(err);
    }
  }

  // ── DELETE /:index?id=:docId ───────────────────────────────────────────────
  async function DELETE({ request, params }: SolidStartEvent): Promise<Response> {
    const indexName = params.index ?? "";
    if (!indexName) return jsonError({ error: "Index name is required" }, 400);

    const url = new URL(request.url);
    const id = url.searchParams.get("id");
    if (!id) return jsonError({ error: "Query param 'id' is required" }, 400);

    try {
      await search.delete(indexName, id);
      return jsonOk({ success: true });
    } catch (err) {
      return errorResponse(err);
    }
  }

  // ── OPTIONS (CORS preflight) ───────────────────────────────────────────────
  async function OPTIONS({ request }: SolidStartEvent): Promise<Response> {
    return new Response(null, {
      status: 204,
      headers: {
        ...corsHeaders(request, options.cors),
        "Access-Control-Allow-Methods": "GET, POST, DELETE, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization",
      },
    });
  }

  return { GET, POST, DELETE, OPTIONS };
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function corsHeaders(
  request: Request,
  cors: string | string[] | undefined,
): Record<string, string> {
  if (!cors) return {};
  if (cors === "*") return { "Access-Control-Allow-Origin": "*" };

  const origins = Array.isArray(cors) ? cors : [cors];
  const origin = request.headers.get("origin");
  if (origin && origins.includes(origin)) {
    return { "Access-Control-Allow-Origin": origin, Vary: "Origin" };
  }
  return {};
}

function jsonOk(body: unknown, headers: Record<string, string> = {}): Response {
  return new Response(JSON.stringify(body), {
    status: 200,
    headers: { "Content-Type": "application/json", ...headers },
  });
}

function jsonError(body: unknown, status: number): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

function errorResponse(err: unknown): Response {
  if (err instanceof SearchError) {
    return jsonError({ error: err.message, code: err.code }, err.status);
  }
  return jsonError({ error: "Internal server error" }, 500);
}
