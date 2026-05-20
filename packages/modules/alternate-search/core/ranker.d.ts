import type { SearchDocument, SearchResult } from "./types";
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
export declare function rankResults(result: SearchResult<SearchDocument>, options?: RankOptions): SearchResult<SearchDocument>;
