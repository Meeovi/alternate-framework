// ---------------------------------------------------------------------------
// Cosine similarity
// ---------------------------------------------------------------------------

/** Compute the cosine similarity between two equal-length float vectors. */
export function cosineSimilarity(a: number[], b: number[]): number {
  if (a.length === 0 || a.length !== b.length) return 0;
  let dot = 0, magA = 0, magB = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    magA += a[i] * a[i];
    magB += b[i] * b[i];
  }
  const denom = Math.sqrt(magA) * Math.sqrt(magB);
  return denom === 0 ? 0 : dot / denom;
}

// ---------------------------------------------------------------------------
// Hash-based vectorizer (djb2 projection)
// ---------------------------------------------------------------------------

function hashProject(token: string): number {
  let h = 5381;
  for (let i = 0; i < token.length; i++) {
    h = (((h << 5) + h) ^ token.charCodeAt(i)) >>> 0;
  }
  return h;
}

function hashVector(tokens: string[], dimensions: number): number[] {
  const vec = new Array<number>(dimensions).fill(0);
  for (const token of tokens) {
    const slot = hashProject(token) % dimensions;
    vec[slot] += 1;
  }
  // L2 normalise
  const norm = Math.sqrt(vec.reduce((s, v) => s + v * v, 0)) || 1;
  return vec.map((v) => v / norm);
}

// ---------------------------------------------------------------------------
// TF-IDF approximation (no corpus required)
// ---------------------------------------------------------------------------

function tfidfApproxVector(tokens: string[], dimensions: number): number[] {
  const tf = new Map<string, number>();
  for (const t of tokens) tf.set(t, (tf.get(t) ?? 0) + 1);

  const vec = new Array<number>(dimensions).fill(0);
  const totalTokens = tokens.length || 1;

  for (const [token, count] of tf) {
    // Proxy IDF: longer tokens are rarer  (inverse log of char length)
    const idfProxy = 1 + Math.log(Math.max(2, token.length));
    const weight = (count / totalTokens) * idfProxy;
    const slot = hashProject(token) % dimensions;
    vec[slot] += weight;
  }

  // L2 normalise
  const norm = Math.sqrt(vec.reduce((s, v) => s + v * v, 0)) || 1;
  return vec.map((v) => Number((v / norm).toFixed(8)));
}

// ---------------------------------------------------------------------------
// Public interface
// ---------------------------------------------------------------------------

export type VectorStrategy = "hash" | "tfidf-approx";

export type VectorizeOptions = {
  strategy?: VectorStrategy;
  dimensions?: number;
};

/**
 * Vectorize a list of tokens into a fixed-dimension dense float vector.
 *
 * - `tfidf-approx` (default): weighted TF \u00d7 proxy-IDF, L2-normalised.  Good for
 *   fast in-process re-ranking without a corpus.
 * - `hash`: plain term-frequency projection, faster but less discriminative.
 *
 * For real semantic embeddings, use the `semanticSearch` plugin which calls
 * an external model API and injects `ctx.vector` before this stage.
 */
export function vectorize(tokens: string[], options: VectorizeOptions = {}): number[] {
  const dimensions = options.dimensions ?? 128;
  const strategy = options.strategy ?? "tfidf-approx";
  if (tokens.length === 0) return new Array<number>(dimensions).fill(0);
  return strategy === "hash"
    ? hashVector(tokens, dimensions)
    : tfidfApproxVector(tokens, dimensions);
}