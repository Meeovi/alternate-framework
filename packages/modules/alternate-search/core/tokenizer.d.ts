export declare const STOPWORDS_EN: ReadonlySet<string>;
export declare const STOPWORDS_ES: ReadonlySet<string>;
export declare const STOPWORDS_DE: ReadonlySet<string>;
export type TokenizeOptions = {
    locale?: string;
    lowercase?: boolean;
    stripPunctuation?: boolean;
    /** Minimum token character length (inclusive). Default 2. */
    minLength?: number;
    /** Custom stopword set (overrides locale default). */
    stopwords?: ReadonlySet<string> | false;
    /** Enable n-gram extraction. */
    ngrams?: {
        min: number;
        max: number;
    };
};
/**
 * Tokenise `input` into an array of normalised tokens.
 *
 * Stages:
 *  1. Unicode NFC normalisation
 *  2. Lower-case
 *  3. Split on whitespace + common punctuation
 *  4. Strip leading/trailing non-word characters from each token
 *  5. Remove stopwords (locale-aware, or custom set)
 *  6. Apply minimum length filter
 *  7. Optional n-gram extraction
 */
export declare function tokenize(input: string, options?: TokenizeOptions): string[];
