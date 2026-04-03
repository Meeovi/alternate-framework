import { cosineSimilarity } from "./vectorizer";
import type { SearchDocument, SearchResult } from "./types";

// ---------------------------------------------------------------------------
// BM25 scoring
// ---------------------------------------------------------------------------

const BM25_ASSUMED_AVG_DOC_LEN = 15;

function bm25Score(
  words: string[],
  tokens: string[],
  k1 = 1.5,
  b = 0.75,
): number {
  if (tokens.length === 0) return 0;
  const docLen = words.length || 1;
  let score = 0;
  for (const token of tokens) {
    const tf = words.filter((w) => w.includes(token)).length;
    if (tf === 0) continue;
    // Approximate IDF \u2014 without a corpus we use a fixed "corpus size" of 1000
    const idf = Math.log((1000 - tf + 0.5) / (tf + 0.5) + 1);
    const tfNorm =
      (tf * (k1 + 1)) /
      (tf + k1 * (1 - b + b * (docLen / BM25_ASSUMED_AVG_DOC_LEN)));
    score += idf * tfNorm;
  }
  return score;
}

// ---------------------------------------------------------------------------
// Text extraction
// ---------------------------------------------------------------------------

function extractText(doc: SearchDocument): string {
  return Object.values(doc)
    .filter((v): v is string => typeof v === "string")
    .join(" ");
}

// ---------------------------------------------------------------------------
// Public interface
// ---------------------------------------------------------------------------

export type RankOptions = {
  queryTokens?: string[];
  queryVector?: number[];
  /**
   * Weight for the lexical (BM25) score component [0\u20131].
   * Defaults to 1.0 when no query vector is provided, 0.5 otherwise.
   */
  lexicalWeight?: number;
  /**
   * Weight for the vector cosine-similarity component [0\u20131].
   * Defaults to 0.0 when no query vector is provided, 0.5 otherwise.
   */
  vectorWeight?: number;
  /** BM25 k1 saturation parameter. Default 1.5. */
  k1?: number;
  /** BM25 b length-normalisation parameter. Default 0.75. */
  b?: number;
};

/**
 * Re-rank search results using a hybrid BM25 + cosine-similarity score.
 *
 * Documents may carry a pre-computed `_vector` field (number[]) for the
 * cosine component.  When both a query vector and document vectors exist,
 * the score is blended using `lexicalWeight` and `vectorWeight`.
 */
export function rankResults(
  result: SearchResult<SearchDocument>,
  options: RankOptions = {},
): SearchResult<SearchDocument> {
  const {
    queryTokens = [],
    queryVector,
    lexicalWeight = queryVector ? 0.5 : 1.0,
    vectorWeight = queryVector ? 0.5 : 0.0,
    k1 = 1.5,
    b = 0.75,
  } = options;

  if (queryTokens.length === 0 && !queryVector) return result;

  const scored = result.items.map((item) => {
    const text = extractText(item);
    const words = text.toLowerCase().split(/\s+/);
    const lex = queryTokens.length > 0 ? bm25Score(words, queryTokens, k1, b) : 0;
    const docVec = Array.isArray(item["_vector"]) ? (item["_vector"] as number[]) : null;
    const vec =
      queryVector && docVec && docVec.length > 0
        ? cosineSimilarity(queryVector, docVec)
        : 0;
    return { item, score: lex * lexicalWeight + vec * vectorWeight };
  });

  scored.sort((a, c) => c.score - a.score);

  return { ...result, items: scored.map((s) => s.item) };
}