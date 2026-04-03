// ---------------------------------------------------------------------------
// Semantic Search plugin — vector embedding + optional re-ranking
// ---------------------------------------------------------------------------
//
// Plugs into the `beforeQuery` hook to compute a dense vector embedding for
// the query string, then places it into `ctx.query.vector` so adapters with
// vector-search support (pgvector, Typesense, Meilisearch ≥1.3,
// Elasticsearch kNN) can use it directly.
//
// After the adapter returns results, an optional `afterQuery` pass re-ranks
// them using either a Cohere API call or an in-process cosine-similarity
// fallback.
// ---------------------------------------------------------------------------

import type { IndexSchema, SearchPlugin } from "../../core/types";
import { vectorize } from "../../core/vectorizer";
export { createReranker } from "./reranker";
export type { RerankerConfig, RerankerProvider, Reranker } from "./reranker";

// ---------------------------------------------------------------------------
// Module augmentation
// ---------------------------------------------------------------------------

declare module "../../core/types" {
  interface SearchPluginRegistry {
    "semantic-search": { creator: typeof semanticSearch };
  }
}

export const SEMANTIC_ERROR_CODES = {
  EMBEDDER_ERROR: "SEMANTIC_EMBEDDER_ERROR",
  RERANKER_ERROR: "SEMANTIC_RERANKER_ERROR",
  MISSING_API_KEY: "SEMANTIC_MISSING_API_KEY",
} as const;

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type EmbedderProvider = "openai" | "cohere" | "huggingface" | "local";

export type EmbedderConfig = {
  provider: EmbedderProvider;
  model?: string;
  apiKey?: string;
  baseUrl?: string;
  /** Number of dimensions for the output vector. Default: provider-specific. */
  dimensions?: number;
};

export type Embedder = {
  embed(text: string): Promise<number[]>;
  embedBatch(texts: string[]): Promise<number[][]>;
};

export type SemanticSearchOptions = {
  embedder: EmbedderConfig | Embedder;
  /**
   * Which fields to concatenate when building the embedding for indexed docs.
   * Per-index map.  Falls back to all string fields when omitted.
   */
  fields?: Record<string, string[]>;
  /**
   * Whether to embed indexed documents and store the result in the `_vector`
   * field.  Default: true.
   */
  embedDocuments?: boolean;
  /**
   * Use re-ranking to re-order adapter results by semantic relevance.
   * Requires a provider with list-wise scoring (Cohere) or falls back to
   * in-process cosine similarity.
   */
  rerank?: {
    provider: "cohere" | "local";
    apiKey?: string;
    model?: string;
    topK?: number;
    fields?: string[];
  };
};

// ---------------------------------------------------------------------------
// Embedder factory
// ---------------------------------------------------------------------------

export function createEmbedder(config: EmbedderConfig): Embedder {
  const { provider, apiKey, dimensions } = config;

  function baseUrl(): string {
    if (config.baseUrl) return config.baseUrl.replace(/\/$/, "");
    if (provider === "openai") return "https://api.openai.com/v1";
    if (provider === "cohere") return "https://api.cohere.ai/v1";
    if (provider === "huggingface") return "https://api-inference.huggingface.co/pipeline/feature-extraction";
    return "";
  }

  function model(): string {
    if (config.model) return config.model;
    if (provider === "openai") return "text-embedding-3-small";
    if (provider === "cohere") return "embed-english-v3.0";
    return "local";
  }

  async function openAiEmbed(texts: string[]): Promise<number[][]> {
    const resp = await fetch(`${baseUrl()}/embeddings`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({ input: texts, model: model() }),
    });
    if (!resp.ok) {
      const body = await resp.text();
      throw new Error(`OpenAI embeddings failed (${resp.status}): ${body}`);
    }
    const json = await resp.json() as { data: Array<{ embedding: number[] }> };
    return json.data.map((d) => d.embedding);
  }

  async function cohereEmbed(texts: string[]): Promise<number[][]> {
    const resp = await fetch(`${baseUrl()}/embed`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({ texts, model: model(), input_type: "search_query" }),
    });
    if (!resp.ok) {
      const body = await resp.text();
      throw new Error(`Cohere embed failed (${resp.status}): ${body}`);
    }
    const json = await resp.json() as { embeddings: number[][] };
    return json.embeddings;
  }

  function localEmbed(texts: string[]): number[][] {
    const dims = dimensions ?? 512;
    return texts.map((text) => {
      const tokens = text.toLowerCase().split(/\s+/);
      return vectorize(tokens, { dimensions: dims });
    });
  }

  async function embedBatch(texts: string[]): Promise<number[][]> {
    if (provider === "openai") return openAiEmbed(texts);
    if (provider === "cohere") return cohereEmbed(texts);
    if (provider === "huggingface") return openAiEmbed(texts); // HF uses same shape
    return localEmbed(texts);
  }

  return {
    embed: (text: string) => embedBatch([text]).then((r) => r[0] ?? []),
    embedBatch,
  };
}

// ---------------------------------------------------------------------------
// Plugin factory
// ---------------------------------------------------------------------------

export function semanticSearch(options: SemanticSearchOptions): SearchPlugin {
  const embedDocuments = options.embedDocuments !== false;

  const embedder: Embedder =
    typeof (options.embedder as Embedder).embed === "function"
      ? (options.embedder as Embedder)
      : createEmbedder(options.embedder as EmbedderConfig);

  return {
    id: "semantic-search",
    $ERROR_CODES: SEMANTIC_ERROR_CODES,

    async init(_indexes: Record<string, IndexSchema>) {
      // No-op: embedder is stateless
    },

    async beforeIndex(ctx) {
      if (!embedDocuments) return;

      const fields = options.fields?.[ctx.indexName];
      const texts = ctx.docs.map((doc) => {
        const sources = fields
          ? fields.map((f) => String(doc[f] ?? ""))
          : Object.values(doc).filter((v): v is string => typeof v === "string");
        return sources.join(" ");
      });

      const vectors = await embedder.embedBatch(texts);
      ctx.docs = ctx.docs.map((doc, i) => ({ ...doc, _vector: vectors[i] ?? [] }));
    },

    async beforeQuery(ctx) {
      const q = ctx.query.q ?? ctx.query.term ?? "";
      if (!q.trim()) return;
      if (ctx.query.vector) return; // caller already provided a vector

      try {
        ctx.query.vector = await embedder.embed(q);
        ctx.vector = ctx.query.vector;
      } catch (err) {
        // Non-fatal: fall back to keyword search without a vector
        ctx.meta.semanticEmbedError = String(err);
      }
    },

    async afterQuery(ctx) {
      if (!options.rerank) return;
      if (!ctx.result || ctx.result.items.length === 0) return;

      const q = ctx.query.q ?? ctx.query.term ?? "";
      if (!q.trim()) return;

      try {
        const { createReranker } = await import("./reranker");
        const reranker = createReranker({
          provider: options.rerank.provider,
          apiKey: options.rerank.apiKey,
          model: options.rerank.model,
          topK: options.rerank.topK,
        });
        const fields = options.rerank.fields ??
          options.fields?.[ctx.indexName] ??
          ["title", "description", "content"];
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        ctx.result.items = await reranker.rerank(q, ctx.result.items as any[], fields) as typeof ctx.result.items;
      } catch (err) {
        ctx.meta.rerankError = String(err);
      }
    },
  };
}
