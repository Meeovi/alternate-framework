// ---------------------------------------------------------------------------
// Stopword sets
// ---------------------------------------------------------------------------

export const STOPWORDS_EN: ReadonlySet<string> = new Set([
  "a", "an", "the", "and", "or", "but", "in", "on", "at", "to", "for",
  "of", "with", "by", "from", "as", "is", "was", "are", "were", "be",
  "been", "being", "have", "has", "had", "do", "does", "did", "will",
  "would", "could", "should", "may", "might", "shall", "can", "not",
  "no", "it", "its", "this", "that", "these", "those", "i", "me", "my",
  "we", "our", "you", "your", "he", "she", "they", "them", "their",
]);

export const STOPWORDS_ES: ReadonlySet<string> = new Set([
  "de", "la", "el", "en", "y", "a", "los", "del", "se", "las", "un",
  "por", "con", "una", "su", "para", "es", "al", "lo", "como",
]);

export const STOPWORDS_DE: ReadonlySet<string> = new Set([
  "der", "die", "das", "und", "in", "von", "zu", "den", "mit", "ist",
  "im", "ein", "eine", "es", "auf", "bei", "an", "des", "dem",
]);

const STOPWORDS_BY_LOCALE: Record<string, ReadonlySet<string>> = {
  en: STOPWORDS_EN,
  es: STOPWORDS_ES,
  de: STOPWORDS_DE,
};

// ---------------------------------------------------------------------------
// Options
// ---------------------------------------------------------------------------

export type TokenizeOptions = {
  locale?: string;
  lowercase?: boolean;
  stripPunctuation?: boolean;
  /** Minimum token character length (inclusive). Default 2. */
  minLength?: number;
  /** Custom stopword set (overrides locale default). */
  stopwords?: ReadonlySet<string> | false;
  /** Enable n-gram extraction. */
  ngrams?: { min: number; max: number };
};

// ---------------------------------------------------------------------------
// Core tokenizer
// ---------------------------------------------------------------------------

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
export function tokenize(input: string, options: TokenizeOptions = {}): string[] {
  const {
    locale = "en",
    lowercase = true,
    stripPunctuation = true,
    minLength = 2,
    stopwords,
    ngrams,
  } = options;

  let text = input.normalize("NFC");
  if (lowercase) text = text.toLowerCase();

  // Split on whitespace and punctuation (preserve unicode letters/numbers)
  const rawTokens = text.split(/[\s\u200B\u00A0,;:!?.'"/\\|@#$%^&*+=~`()\[\]{}<>]+/);

  const effectiveStopwords: ReadonlySet<string> | false =
    stopwords === false
      ? false
      : (stopwords ?? STOPWORDS_BY_LOCALE[locale] ?? STOPWORDS_EN);

  const tokens: string[] = [];
  for (let token of rawTokens) {
    if (stripPunctuation) {
      // Remove non-word characters from the edges (unicode-safe)
      token = token.replace(/^[^\w\u00C0-\u024F]+|[^\w\u00C0-\u024F]+$/g, "");
    }
    if (!token || token.length < minLength) continue;
    if (effectiveStopwords !== false && effectiveStopwords.has(token)) continue;
    tokens.push(token);
  }

  if (ngrams && tokens.length > 0) {
    const { min, max } = ngrams;
    const gramTokens: string[] = [];
    for (let size = min; size <= max; size++) {
      for (let i = 0; i <= tokens.length - size; i++) {
        gramTokens.push(tokens.slice(i, i + size).join(" "));
      }
    }
    return gramTokens;
  }

  return tokens;
}