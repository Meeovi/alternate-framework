import { SEARCH_ERROR_CODES, SearchError, wrapAdapterError, wrapPluginError } from "./errors";
import { rankResults } from "./ranker";
import { tokenize } from "./tokenizer";
import { vectorize } from "./vectorizer";
import type {
  PipelineContext,
  SearchAdapter,
  SearchErrorLifecycleContext,
  SearchLifecycleHook,
  SearchLifecycleHooks,
  SearchMiddleware,
  SearchMiddlewareContext,
  SearchPlugin,
  SearchQuery,
  SearchResult,
  SearchResultLifecycleContext,
} from "./types";

// ---------------------------------------------------------------------------
// Abort-signal helper
// ---------------------------------------------------------------------------

function throwIfAborted(signal: AbortSignal | undefined): void {
  if (!signal?.aborted) return;
  const reason = signal.reason;
  if (reason instanceof SearchError) throw reason;
  throw SearchError.from(SEARCH_ERROR_CODES.QUERY_ABORTED, "Query was aborted", {
    cause: reason,
  });
}

/** Build a single AbortSignal that fires on either `external` or `timeout`. */
function buildSignal(external: AbortSignal | undefined, timeoutMs: number): [AbortSignal, ReturnType<typeof setTimeout>] {
  const ctrl = new AbortController();
  const handle = setTimeout(() => {
    ctrl.abort(SearchError.from(SEARCH_ERROR_CODES.QUERY_TIMEOUT, `Query timed out after ${timeoutMs} ms`));
  }, timeoutMs);

  if (external) {
    if (external.aborted) {
      ctrl.abort(external.reason);
    } else {
      external.addEventListener("abort", () => ctrl.abort(external.reason), { once: true });
    }
  }

  return [ctrl.signal, handle];
}

// ---------------------------------------------------------------------------
// Pipeline execution
// ---------------------------------------------------------------------------

export async function runSearchPipeline(args: {
  adapter: SearchAdapter;
  plugins: SearchPlugin[];
  indexName: string;
  query: SearchQuery;
  options?: Record<string, unknown>;
  middleware?: SearchMiddleware[];
  hooks?: SearchLifecycleHooks;
  timeoutMs?: number;
  signal?: AbortSignal;
}): Promise<SearchResult> {
  const { timeoutMs = 10_000 } = args;
  const [signal, handle] = buildSignal(args.signal, timeoutMs);
  try {
    return await _runPipeline({ ...args, signal });
  } finally {
    clearTimeout(handle);
  }
}

async function _runPipeline(args: {
  adapter: SearchAdapter;
  plugins: SearchPlugin[];
  indexName: string;
  query: SearchQuery;
  options?: Record<string, unknown>;
  middleware?: SearchMiddleware[];
  hooks?: SearchLifecycleHooks;
  signal: AbortSignal;
}): Promise<SearchResult> {
  const ctx: SearchMiddlewareContext = {
    indexName: args.indexName,
    // shallow clone so downstream mutations do not affect caller
    query: { ...args.query },
    options: args.options ?? {},
    tokens: tokenize(String(args.query.q ?? args.query.term ?? ""), {
      locale: args.query.locale,
    }),
    meta: {},
    signal: args.signal,
    requestId: crypto.randomUUID(),
    startedAt: Date.now(),
  };

  await runLifecycleHook(args.hooks?.onQuery, ctx);

  const middleware = args.middleware ?? [];

  try {
    await runMiddleware(ctx, middleware, async () => {
      // ---- beforeQuery hooks ------------------------------------------------
      for (const plugin of args.plugins) {
        if (!plugin.beforeQuery) continue;
        try {
          throwIfAborted(ctx.signal);
          await plugin.beforeQuery(ctx);
        } catch (err) {
          if (err instanceof SearchError) throw err;
          throw wrapPluginError(plugin.id, err);
        }
      }

      throwIfAborted(ctx.signal);

      if (ctx.result) {
        if (ctx.meta.cacheRefreshRequired === true) {
          runBackgroundRefresh(args.adapter, args.plugins, ctx);
        }
        return;
      }

      // ---- Vectorise --------------------------------------------------------
      if (!ctx.vector) {
        ctx.vector = vectorize(ctx.tokens);
      }

      // ---- Adapter query ----------------------------------------------------
      try {
        throwIfAborted(ctx.signal);
        ctx.result = await args.adapter.query(args.indexName, ctx.query);
      } catch (err) {
        if (err instanceof SearchError) throw err;
        throw wrapAdapterError(err, `query(${args.indexName})`);
      }

      // ---- In-process re-rank -----------------------------------------------
      ctx.result = rankResults(ctx.result, {
        queryTokens: ctx.tokens,
        queryVector: ctx.vector,
      });

      // ---- afterQuery hooks -------------------------------------------------
      for (const plugin of args.plugins) {
        if (!plugin.afterQuery) continue;
        try {
          throwIfAborted(ctx.signal);
          await plugin.afterQuery(ctx);
        } catch (err) {
          if (err instanceof SearchError) throw err;
          throw wrapPluginError(plugin.id, err);
        }
      }
    });
  } catch (err) {
    const error = err instanceof SearchError
      ? err
      : SearchError.from(SEARCH_ERROR_CODES.ADAPTER_ERROR, "Search pipeline failed", { cause: err });

    const errorCtx: SearchErrorLifecycleContext = {
      ...ctx,
      durationMs: Date.now() - ctx.startedAt,
      error,
    };

    for (const plugin of args.plugins) {
      if (!plugin.onError) continue;
      try {
        await plugin.onError(errorCtx);
      } catch (pluginError) {
        throw wrapPluginError(plugin.id, pluginError);
      }
    }

    await runLifecycleHook(args.hooks?.onError, errorCtx);
    throw error;
  }

  const resultCtx: SearchResultLifecycleContext = {
    ...ctx,
    durationMs: Date.now() - ctx.startedAt,
    result: ctx.result!,
  };

  await runLifecycleHook(args.hooks?.onResult, resultCtx);

  return ctx.result!;
}

async function runMiddleware(
  ctx: SearchMiddlewareContext,
  middleware: SearchMiddleware[],
  terminal: () => Promise<void>,
): Promise<void> {
  let index = -1;

  async function dispatch(position: number): Promise<void> {
    if (position <= index) {
      throw SearchError.from(SEARCH_ERROR_CODES.PLUGIN_HOOK_ERROR, "Middleware called next() multiple times");
    }
    index = position;

    const fn = middleware[position];
    if (!fn) {
      await terminal();
      return;
    }

    throwIfAborted(ctx.signal);
    await fn(ctx, () => dispatch(position + 1));
  }

  await dispatch(0);
}

async function runLifecycleHook<TContext>(
  hook: SearchLifecycleHook<TContext> | undefined,
  ctx: TContext,
): Promise<void> {
  if (!hook) return;
  const handlers = Array.isArray(hook) ? hook : [hook];
  for (const handler of handlers) {
    await handler(ctx);
  }
}

function runBackgroundRefresh(
  adapter: SearchAdapter,
  plugins: SearchPlugin[],
  originalCtx: SearchMiddlewareContext,
): void {
  queueMicrotask(async () => {
    const refreshCtx: SearchMiddlewareContext = {
      ...originalCtx,
      query: { ...originalCtx.query },
      tokens: [...originalCtx.tokens],
      meta: {
        ...originalCtx.meta,
        cacheHit: false,
        cacheRefreshRequired: false,
        cacheRefreshBackground: true,
      },
      startedAt: Date.now(),
      requestId: crypto.randomUUID(),
      result: undefined,
    };

    try {
      refreshCtx.result = await adapter.query(refreshCtx.indexName, refreshCtx.query);
      refreshCtx.result = rankResults(refreshCtx.result, {
        queryTokens: refreshCtx.tokens,
        queryVector: refreshCtx.vector,
      });

      for (const plugin of plugins) {
        if (!plugin.afterQuery) continue;
        await plugin.afterQuery(refreshCtx);
      }
    } catch {
      // Non-fatal: stale response was already returned.
    }
  });
}