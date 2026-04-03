// ---------------------------------------------------------------------------
// Reranker — re-orders results by relevance after an initial retrieval pass
// ---------------------------------------------------------------------------
import type { SearchDocument } from "../../core/types";
import { cosineSimilarity } from "../../core/vectorizer";

export type RerankerProvider = "cohere" | "local";

export type RerankerConfig = {
  provider: RerankerProvider;
  apiKey?: string;
  baseUrl?: string;
  model?: string;
  /** Keep top-k results after reranking. Default: keep all. */
  topK?: number;
};

export type RankedDocument<T = SearchDocument> = T & { _rerankScore?: number };

export type Reranker = {
  rerank<T extends SearchDocument>(
    query: string,
    docs: T[],
    fields: string[],
  ): Promise<RankedDocument<T>[]>;
};

// ---------------------------------------------------------------------------
// Factory
// ---------------------------------------------------------------------------

export function createReranker(config: RerankerConfig): Reranker {
  const { provider, apiKey, topK } = config;

  function baseUrl(): string {
    if (config.baseUrl) return config.baseUrl.replace(/\/$/, "");
    return provider === "cohere" ? "https://api.cohere.ai/v1" : "";
  }

  function model(): string {
    return config.model ?? (provider === "cohere" ? "rerank-english-v3.0" : "local");
  }

  async function cohereRerank<T extends SearchDocument>(
    query: string,
    docs: T[],
    fields: string[],
  ): Promise<RankedDocument<T>[]> {
    const documents = docs.map((d) =>
      fields.map((f) => String(d[f] ?? "")).join(" "),
    );

    const resp = await fetch(`${baseUrl()}/rerank`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({ model: model(), query, documents, top_n: topK ?? docs.length }),
    });

    if (!resp.ok) {
      const body = await resp.text();
      throw new Error(`Cohere rerank failed (${resp.status}): ${body}`);
    }

    const json = await resp.json() as {
      results: Array<{ index: number; relevance_score: number }>;
    };

    return json.results.map((r) => ({
      ...docs[r.index]!,
      _rerankScore: r.relevance_score,
    }));
  }

  function localRerank<T extends SearchDocument>(
    query: string,
    docs: T[],
    fields: string[],
  ): RankedDocument<T>[] {
    // Local: simple TF-IDF cosine similarity between query and document text
    const tokens = query.toLowerCase().split(/\s+/);
    const dims = 512;

    function hashVec(text: string): number[] {
      const words = text.toLowerCase().split(/\s+/);
      const vec = new Float64Array(dims);
      for (const w of words) {
        let h = 5381;
        for (let i = 0; i < w.length; i++) h = ((((h << 5) + h) ^ w.charCodeAt(i)) >>> 0);
        vec[h % dims] += 1 / words.length;
      }
      const norm = Math.sqrt(Array.from(vec).reduce((s, v) => s + v * v, 0)) || 1;
      return Array.from(vec).map((v) => v / norm);
    }

    const qVec = hashVec(tokens.join(" "));
    const scored = docs.map((doc) => {
      const text = fields.map((f) => String(doc[f] ?? "")).join(" ");
      const dVec = hashVec(text);
      return { doc, score: cosineSimilarity(qVec, dVec) };
    });

    scored.sort((a, b) => b.score - a.score);
    const result = scored.slice(0, topK ?? docs.length);
    return result.map((r) => ({ ...r.doc, _rerankScore: r.score }));
  }

  return {
    async rerank<T extends SearchDocument>(
      query: string,
      docs: T[],
      fields: string[],
    ): Promise<RankedDocument<T>[]> {
      if (docs.length === 0) return [];
      if (provider === "cohere") {
        return cohereRerank(query, docs, fields);
      }
      return localRerank(query, docs, fields);
    },
  };
}
