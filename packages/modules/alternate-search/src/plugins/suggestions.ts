// ---------------------------------------------------------------------------
// Suggestions plugin — autocomplete / query suggestions
// ---------------------------------------------------------------------------
//
// Maintains an in-process prefix trie built from indexed document strings.
// When the active adapter exposes a suggestions / completion API (Meilisearch,
// Typesense, Elasticsearch suggest), the plugin can delegate to it instead —
// backend-specific logic is **opt-in** via `useAdapterSuggestions: true`.
//
// Suggestions are written to `ctx.meta.suggestions: string[]` after
// `beforeQuery` runs.  Callers can read them from `result.meta` once exposed
// by the HTTP layer.
// ---------------------------------------------------------------------------

import type { IndexSchema, SearchPlugin } from "../core/types";
import { tokenize } from "../core/tokenizer";

// ---------------------------------------------------------------------------
// Module augmentation
// ---------------------------------------------------------------------------

declare module "../core/types" {
  interface SearchPluginRegistry {
    "suggestions": { creator: typeof suggestions };
  }
}

export const SUGGESTIONS_ERROR_CODES = {
  NO_TRIE: "SUGGESTIONS_NO_TRIE",
} as const;

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type SuggestionsOptions = {
  /**
   * Minimum number of characters before suggestions are generated. Default: 2.
   */
  minChars?: number;
  /**
   * Maximum number of suggestions to return. Default: 8.
   */
  maxSuggestions?: number;
  /**
   * Fields to index for suggestions (all string fields when omitted).
   */
  fields?: string[];
  /**
   * When true and the adapter exposes a `suggestions` capability in
   * `ctx.meta.adapterCapabilities`, delegate to the adapter.
   */
  useAdapterSuggestions?: boolean;
  /**
   * Minimum term frequency before a term enters the trie. Default: 1.
   */
  minFrequency?: number;
};

// ---------------------------------------------------------------------------
// Compact prefix trie
// ---------------------------------------------------------------------------

export class PrefixTrie {
  private children = new Map<string, PrefixTrie>();
  private completions = new Set<string>();

  insert(word: string): void {
    let node: PrefixTrie = this;
    for (const ch of word) {
      if (!node.children.has(ch)) node.children.set(ch, new PrefixTrie());
      node = node.children.get(ch)!;
    }
    node.completions.add(word);
  }

  suggest(prefix: string, max: number): string[] {
    let node: PrefixTrie = this;
    for (const ch of prefix) {
      if (!node.children.has(ch)) return [];
      node = node.children.get(ch)!;
    }
    const results: string[] = [];
    const stack: PrefixTrie[] = [node];
    while (stack.length > 0 && results.length < max) {
      const current = stack.pop()!;
      for (const w of current.completions) {
        results.push(w);
        if (results.length >= max) break;
      }
      for (const child of current.children.values()) stack.push(child);
    }
    return results;
  }
}

// ---------------------------------------------------------------------------
// Plugin factory
// ---------------------------------------------------------------------------

export function suggestions(options: SuggestionsOptions = {}): SearchPlugin {
  const minChars = options.minChars ?? 2;
  const maxSuggestions = options.maxSuggestions ?? 8;
  const minFrequency = options.minFrequency ?? 1;

  const trie = new PrefixTrie();
  const freq = new Map<string, number>();

  function addTerm(term: string): void {
    const count = (freq.get(term) ?? 0) + 1;
    freq.set(term, count);
    if (count >= minFrequency) trie.insert(term);
  }

  return {
    id: "suggestions",
    $ERROR_CODES: SUGGESTIONS_ERROR_CODES,

    init(_indexes: Record<string, IndexSchema>) {
      // Populated via beforeIndex as documents arrive
    },

    beforeIndex(ctx) {
      for (const doc of ctx.docs) {
        const entries = options.fields
          ? options.fields.map((f) => doc[f])
          : Object.values(doc);

        for (const value of entries) {
          if (typeof value !== "string") continue;
          for (const token of tokenize(value, { locale: "en", stopwords: false })) {
            if (token.length >= minChars) addTerm(token);
          }
        }
      }
    },

    beforeQuery(ctx) {
      const prefix = (ctx.query.q ?? ctx.query.term ?? "").trim().toLowerCase();
      if (prefix.length < minChars) return;

      // Delegate to adapter capability if available
      if (
        options.useAdapterSuggestions &&
        (ctx.meta.adapterCapabilities as string[] | undefined)?.includes("suggestions")
      ) {
        return;
      }

      const lastToken = prefix.split(/\s+/).pop() ?? "";
      if (lastToken.length >= minChars) {
        ctx.meta.suggestions = trie.suggest(lastToken, maxSuggestions);
      }
    },
  };
}
