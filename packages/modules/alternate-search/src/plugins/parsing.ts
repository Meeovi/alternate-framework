// ---------------------------------------------------------------------------
// Parsing plugin — structured query-string parser (Lucene / simple DSL)
// ---------------------------------------------------------------------------
//
// Parses a Lucene-style query string (e.g. `title:"red shoes" price:>50
// category:sneakers -brand:cheap`) into a structured `ctx.query.filters`
// array.  The plain text remainder becomes `ctx.query.q`.
//
// Adapters that natively accept Lucene syntax can receive the raw string via
// `ctx.query._options.rawQuery` and skip in-process parsing.
// ---------------------------------------------------------------------------

import type { FilterCondition, FilterOperator, IndexSchema, SearchPlugin } from "../core/types";

declare module "../core/types" {
  interface SearchPluginRegistry {
    "parsing": { creator: typeof parsing };
  }
}

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type ParseSyntax = "lucene" | "simple";

export type ParsingOptions = {
  /** Parser mode. Default: "lucene". */
  syntax?: ParseSyntax;
  /**
   * Allowlist of field names that may appear in the query string.
   * Unknown fields are treated as plain text.
   */
  allowedFields?: string[];
  /**
   * Pass the raw (un-parsed) query to the adapter via `_options.rawQuery`
   * and skip in-process parsing when this is true and the adapter exposes
   * a `lucene` capability.  Default: false.
   */
  useAdapterParsing?: boolean;
};

// ---------------------------------------------------------------------------
// Parser
// ---------------------------------------------------------------------------

type ParsedClause =
  | { kind: "text"; value: string; negated: boolean }
  | { kind: "field"; field: string; op: FilterOperator; value: unknown; negated: boolean };

/** Tokenise a Lucene-like query string into clauses. */
function parseLucene(raw: string, allowed?: string[]): ParsedClause[] {
  const clauses: ParsedClause[] = [];
  const regex = /(-?)(\w+):(["><=!]+)?("(?:[^"\\]|\\.)*"|\S+)|(-?)("(?:[^"\\]|\\.)*"|\S+)/g;
  let match: RegExpExecArray | null;

  while ((match = regex.exec(raw)) !== null) {
    if (match[2]) {
      const negated = match[1] === "-";
      const field   = match[2];
      const opStr   = (match[3] ?? "").trim();
      const rawVal  = (match[4] ?? "").replace(/^"|"$/g, "");

      if (allowed && !allowed.includes(field)) {
        clauses.push({ kind: "text", value: match[0].replace(/^-/, ""), negated });
        continue;
      }

      let op: FilterOperator = "=";
      if (opStr === ">")  op = ">";
      else if (opStr === ">=") op = ">=";
      else if (opStr === "<")  op = "<";
      else if (opStr === "<=") op = "<=";
      else if (opStr === "!=" || negated) op = "!=";

      const numVal = Number(rawVal);
      const value: unknown = isNaN(numVal) ? rawVal : numVal;

      clauses.push({ kind: "field", field, op, value, negated: negated && op === "=" });
    } else if (match[6]) {
      const negated = match[5] === "-";
      const value   = match[6].replace(/^"|"$/g, "");
      clauses.push({ kind: "text", value, negated });
    }
  }

  return clauses;
}

// ---------------------------------------------------------------------------
// Plugin factory
// ---------------------------------------------------------------------------

export function parsing(options: ParsingOptions = {}): SearchPlugin {
  const syntax        = options.syntax ?? "lucene";
  const allowedFields = options.allowedFields;

  return {
    id: "parsing",

    init(_indexes: Record<string, IndexSchema>) {},

    beforeQuery(ctx) {
      const raw = ctx.query.q ?? ctx.query.term ?? "";
      if (!raw.trim()) return;

      ctx.query._options = { ...ctx.query._options, rawQuery: raw };

      if (
        options.useAdapterParsing &&
        (ctx.meta.adapterCapabilities as string[] | undefined)?.includes("lucene")
      ) {
        return;
      }

      if (syntax === "simple") return;

      const clauses = parseLucene(raw, allowedFields);
      const textParts: string[] = [];
      const filters: FilterCondition[] = [];

      for (const clause of clauses) {
        if (clause.kind === "text") {
          if (!clause.negated) textParts.push(clause.value);
        } else {
          filters.push({
            field: clause.field,
            operator: clause.op,
            value:    clause.value,
          });
        }
      }

      ctx.query.q = textParts.join(" ") || undefined;
      if (filters.length > 0) {
        const existing = ctx.query.filters;
        const existingArray: FilterCondition[] = !existing
          ? []
          : Array.isArray(existing)
            ? existing
            : Object.entries(existing).map(([k, v]) => ({ field: k, operator: "=" as FilterOperator, value: v }));
        ctx.query.filters = [...existingArray, ...filters];
      }

      ctx.meta.parsedClauses = clauses.length;
    },
  };
}
