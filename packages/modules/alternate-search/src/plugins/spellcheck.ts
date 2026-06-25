// ---------------------------------------------------------------------------
// Spellcheck plugin — suggest and optionally auto-correct misspelled query terms
// ---------------------------------------------------------------------------
//
// Works entirely in-process using Levenshtein distance against a user-supplied
// or built-in dictionary.  When the active adapter exposes a spellcheck API
// (Meilisearch typo-tolerance, Typesense, Elasticsearch) the plugin can
// delegate to it instead — backend-specific logic is **opt-in** via
// `useAdapterSpellcheck: true`.
// ---------------------------------------------------------------------------

import type { IndexSchema, SearchPlugin } from "../core/types";
import { tokenize } from "../core/tokenizer";

// ---------------------------------------------------------------------------
// Module augmentation
// ---------------------------------------------------------------------------

declare module "../core/types" {
  interface SearchPluginRegistry {
    "spellcheck": { creator: typeof spellcheck };
  }
}

export const SPELLCHECK_ERROR_CODES = {
  DICTIONARY_LOAD_ERROR: "SPELLCHECK_DICTIONARY_LOAD_ERROR",
} as const;

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type SpellcheckOptions = {
  /**
   * Maximum Levenshtein edit distance to accept a correction. Default: 2.
   */
  maxDistance?: number;
  /**
   * Minimum word length to check. Very short words are skipped. Default: 4.
   */
  minWordLength?: number;
  /**
   * Static word list used as the correction dictionary.
   * Populated lazily from indexed documents when omitted.
   */
  dictionary?: string[];
  /**
   * Automatically rewrite `ctx.query.q` to the best correction.
   * When false (default) suggestions are only written to `ctx.meta.spellSuggestions`.
   */
  autoCorrect?: boolean;
  /**
   * When true and the adapter exposes a `spellcheck` capability in
   * `ctx.meta.adapterCapabilities`, delegate to it and skip in-process checking.
   */
  useAdapterSpellcheck?: boolean;
};

// ---------------------------------------------------------------------------
// Levenshtein distance (Wagner–Fischer DP)
// ---------------------------------------------------------------------------

function levenshtein(a: string, b: string): number {
  if (a === b) return 0;
  const m = a.length, n = b.length;
  const dp: number[][] = Array.from({ length: m + 1 }, (_, i) =>
    Array.from({ length: n + 1 }, (_, j) => (i === 0 ? j : j === 0 ? i : 0)),
  );
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      dp[i][j] =
        a[i - 1] === b[j - 1]
          ? dp[i - 1][j - 1]
          : 1 + Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1]);
    }
  }
  return dp[m][n];
}

// ---------------------------------------------------------------------------
// Plugin factory
// ---------------------------------------------------------------------------

export function spellcheck(options: SpellcheckOptions = {}): SearchPlugin {
  const maxDistance = options.maxDistance ?? 2;
  const minWordLength = options.minWordLength ?? 4;
  const autoCorrect = options.autoCorrect ?? false;

  // Grow the dictionary from indexed documents
  const wordSet = new Set<string>(options.dictionary ?? []);

  function suggest(word: string): string | null {
    if (wordSet.has(word)) return null; // already correct
    let best: string | null = null;
    let bestDist = maxDistance + 1;
    for (const candidate of wordSet) {
      if (Math.abs(candidate.length - word.length) > maxDistance) continue;
      const d = levenshtein(word, candidate);
      if (d < bestDist) {
        bestDist = d;
        best = candidate;
      }
    }
    return bestDist <= maxDistance ? best : null;
  }

  return {
    id: "spellcheck",
    $ERROR_CODES: SPELLCHECK_ERROR_CODES,

    init(_indexes: Record<string, IndexSchema>) {
      // dictionary pre-seeded via options; docs also populate wordSet via beforeIndex
    },

    beforeIndex(ctx) {
      // Harvest words from indexed documents to grow the dictionary
      for (const doc of ctx.docs) {
        for (const value of Object.values(doc)) {
          if (typeof value !== "string") continue;
          for (const token of tokenize(value, { locale: "en", stopwords: false })) {
            if (token.length >= minWordLength) wordSet.add(token);
          }
        }
      }
    },

    beforeQuery(ctx) {
      const q = ctx.query.q ?? ctx.query.term ?? "";
      if (!q.trim()) return;

      // Delegate to adapter if it exposes spellcheck capability
      if (
        options.useAdapterSpellcheck &&
        (ctx.meta.adapterCapabilities as string[] | undefined)?.includes("spellcheck")
      ) {
        return; // adapter will handle it
      }

      const tokens = tokenize(q, { locale: ctx.query.locale, stopwords: false });
      const suggestions: Record<string, string> = {};
      const correctedTokens: string[] = [];

      for (const token of tokens) {
        if (token.length < minWordLength) {
          correctedTokens.push(token);
          continue;
        }
        const suggestion = suggest(token);
        if (suggestion) {
          suggestions[token] = suggestion;
          correctedTokens.push(autoCorrect ? suggestion : token);
        } else {
          correctedTokens.push(token);
        }
      }

      ctx.meta.spellSuggestions = suggestions;

      if (autoCorrect && Object.keys(suggestions).length > 0) {
        ctx.query.q = correctedTokens.join(" ");
      }
    },
  };
}
