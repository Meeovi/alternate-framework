/** Compute the cosine similarity between two equal-length float vectors. */
export declare function cosineSimilarity(a: number[], b: number[]): number;
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
export declare function vectorize(tokens: string[], options?: VectorizeOptions): number[];
