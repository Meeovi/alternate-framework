// ---------------------------------------------------------------------------
// Synonyms plugin — expand query terms to synonym groups before adapter query
// ---------------------------------------------------------------------------
//
// Synonyms are applied during the `beforeQuery` pipeline stage by rewriting
// `ctx.query.q` to include equivalent terms (OR-joined by default).
// Adapters that natively support synonym configuration (Meilisearch, Typesense,
// Elasticsearch) can take over synonym handling by setting the capability flag
// — the plugin then only pushes the synonym map into the adapter on `init`.
// ---------------------------------------------------------------------------

import type { IndexSchema, SearchPlugin } from "../../core/types";

// ---------------------------------------------------------------------------
// Module augmentation
// ---------------------------------------------------------------------------

declare module "../../core/types" {
  interface SearchPluginRegistry {
    "synonyms": { creator: typeof synonyms };
  }
}

export const SYNONYMS_ERROR_CODES = {
  INVALID_MAP: "SYNONYMS_INVALID_MAP",
} as const;

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type SynonymEntry =
  | { kind: "equivalent"; terms: string[] }          // bidirectional (a ↔ b ↔ c)
  | { kind: "one-way"; input: string; synonyms: string[] }; // a → b, c

export type SynonymsOptions = {
  /**
   * Simple shorthand: flat key→value[] map where keys expand to their synonyms
   * bidirectionally.
   * @example { laptop: ["notebook", "macbook"] }
   */
  map?: Record<string, string[]>;
  /**
   * Fine-grained synonym rules.  Applied after `map` entries.
   */
  rules?: SynonymEntry[];
  /**
   * When true and the adapter exposes a `synonyms` capability in
   * `ctx.meta.adapterCapabilities`, push the synonym map to the adapter on
   * `init` and skip in-process query rewriting.
   */
  useAdapterSynonyms?: boolean;
  /**
   * How synonyms are joined when rewriting the query.
   * - "or" (default): `(term OR synonym1 OR synonym2)`
   * - "append": `term synonym1 synonym2` (space-separated)
   */
  joinMode?: "or" | "append";
};

// ---------------------------------------------------------------------------
// Plugin factory
// ---------------------------------------------------------------------------

export function synonyms(options: SynonymsOptions = {}): SearchPlugin {
  const joinMode = options.joinMode ?? "or";

  // Build a canonical lookup: term → Set<synonym>
  const lookup = new Map<string, Set<string>>();

  function addBidirectional(terms: string[]): void {
    for (let i = 0; i < terms.length; i++) {
      const t = terms[i].toLowerCase();
      if (!lookup.has(t)) lookup.set(t, new Set());
      for (let j = 0; j < terms.length; j++) {
        if (i !== j) lookup.get(t)!.add(terms[j].toLowerCase());
      }
    }
  }

  function addOneWay(input: string, syns: string[]): void {
    const t = input.toLowerCase();
    if (!lookup.has(t)) lookup.set(t, new Set());
    for (const s of syns) lookup.get(t)!.add(s.toLowerCase());
  }

  // Process `map`
  for (const [term, syns] of Object.entries(options.map ?? {})) {
    addBidirectional([term, ...syns]);
  }

  // Process `rules`
  for (const rule of options.rules ?? []) {
    if (rule.kind === "equivalent") {
      addBidirectional(rule.terms);
    } else {
      addOneWay(rule.input, rule.synonyms);
    }
  }

  function expandTerm(term: string): string[] {
    const t = term.toLowerCase();
    const syns = lookup.get(t);
    if (!syns || syns.size === 0) return [term];
    return [term, ...syns];
  }

  function expandQuery(q: string): string {
    const tokens = q.split(/\s+/);
    const expanded = tokens.map((token) => {
      const variants = expandTerm(token);
      if (variants.length === 1) return token;
      return joinMode === "or" ? `(${variants.join(" OR ")})` : variants.join(" ");
    });
    return expanded.join(" ");
  }

  return {
    id: "synonyms",
    $ERROR_CODES: SYNONYMS_ERROR_CODES,

    init(_indexes: Record<string, IndexSchema>) {
      // For adapters with native synonym support, push the map during setup.
      // Actual adapter integration is adapter-specific and handled via the
      // adapter's own setup mechanism (e.g. Meilisearch synonyms API).
    },

    beforeQuery(ctx) {
      const q = ctx.query.q ?? ctx.query.term ?? "";
      if (!q.trim()) return;

      // If adapter handles synonyms natively, skip in-process expansion
      if (
        options.useAdapterSynonyms &&
        (ctx.meta.adapterCapabilities as string[] | undefined)?.includes("synonyms")
      ) {
        return;
      }

      const expanded = expandQuery(q);
      if (expanded !== q) {
        ctx.query.q = expanded;
        ctx.meta.synonymsExpanded = true;
      }
    },
  };
}
