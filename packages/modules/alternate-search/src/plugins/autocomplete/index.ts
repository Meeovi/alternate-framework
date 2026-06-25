// ---------------------------------------------------------------------------
// Autocomplete plugin — prefix-based query completion powered by a PrefixTrie
// ---------------------------------------------------------------------------
//
// Builds a per-index trie from indexed document fields.  For each incoming
// query the last incomplete token is looked up in the trie and completions are
// placed into `ctx.meta.completions: string[]`.
//
// Adapters that natively support completions (Elasticsearch completion
// suggester, Typesense, Meilisearch) can take over when the `autocomplete`
// adapter capability is advertised — the plugin then skips in-process lookup.
// ---------------------------------------------------------------------------

import type { IndexSchema, SearchPlugin } from "../../core/types";
import { tokenize } from "../../core/tokenizer";

// ---------------------------------------------------------------------------
// Module augmentation
// ---------------------------------------------------------------------------

declare module "../../core/types" {
  interface SearchPluginRegistry {
    "autocomplete": { creator: typeof autocomplete };
  }
}

export const AUTOCOMPLETE_ERROR_CODES = {
  NO_COMPLETIONS: "AUTOCOMPLETE_NO_COMPLETIONS",
} as const;

// ---------------------------------------------------------------------------
// PrefixTrie (export used by main index barrel)
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
      const cur = stack.pop()!;
      for (const w of cur.completions) {
        results.push(w);
        if (results.length >= max) break;
      }
      for (const child of cur.children.values()) stack.push(child);
    }
    return results;
  }
}

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type AutocompleteOptions = {
  /** Minimum characters before completing. Default: 2. */
  minChars?: number;
  /** Maximum completions to return. Default: 8. */
  maxSuggestions?: number;
  /**
   * Fields to harvest completions from per index.
   * Falls back to all string fields when omitted.
   */
  fields?: Record<string, string[]>;
  /**
   * Delegate to adapter if it exposes an `autocomplete` capability.
   */
  useAdapterAutocomplete?: boolean;
};

// ---------------------------------------------------------------------------
// Plugin factory
// ---------------------------------------------------------------------------

export function autocomplete(options: AutocompleteOptions = {}): SearchPlugin {
  const minChars = options.minChars ?? 2;
  const maxSuggestions = options.maxSuggestions ?? 8;

  // Per-index tries
  const tries = new Map<string, PrefixTrie>();

  function trieFor(indexName: string): PrefixTrie {
    if (!tries.has(indexName)) tries.set(indexName, new PrefixTrie());
    return tries.get(indexName)!;
  }

  return {
    id: "autocomplete",
    $ERROR_CODES: AUTOCOMPLETE_ERROR_CODES,

    init(indexes: Record<string, IndexSchema>) {
      for (const name of Object.keys(indexes)) trieFor(name);
    },

    beforeIndex(ctx) {
      const trie = trieFor(ctx.indexName);
      const fields = options.fields?.[ctx.indexName];

      for (const doc of ctx.docs) {
        const values = fields
          ? fields.map((f) => doc[f])
          : Object.values(doc);

        for (const value of values) {
          if (typeof value !== "string") continue;
          for (const token of tokenize(value, { locale: "en", stopwords: false })) {
            if (token.length >= minChars) trie.insert(token);
          }
        }
      }
    },

    beforeQuery(ctx) {
      if (
        options.useAdapterAutocomplete &&
        (ctx.meta.adapterCapabilities as string[] | undefined)?.includes("autocomplete")
      ) {
        return;
      }

      const q = (ctx.query.q ?? ctx.query.term ?? "").trim().toLowerCase();
      if (q.length < minChars) return;

      const lastToken = q.split(/\s+/).pop() ?? "";
      if (lastToken.length < minChars) return;

      const trie = trieFor(ctx.indexName);
      ctx.meta.completions = trie.suggest(lastToken, maxSuggestions);
    },
  };
}
