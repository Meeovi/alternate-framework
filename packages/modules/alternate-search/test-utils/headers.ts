// ---------------------------------------------------------------------------
// helpers.ts — assertion and fixture-building helpers for search tests
// ---------------------------------------------------------------------------

import type { SearchDocument, SearchResult } from "../core/types";

// ---------------------------------------------------------------------------
// Assertion helpers
// ---------------------------------------------------------------------------

/** Assert that a result set contains a document with the given id. */
export function expectResultContains(result: SearchResult, id: string): void {
  const ids = result.items.map((d) => String(d.id));
  if (!ids.includes(id)) {
    throw new Error(
      `Expected result to contain id "${id}", got: [${ids.join(", ")}]`,
    );
  }
}

/** Assert that a result set does NOT contain a document with the given id. */
export function expectResultExcludes(result: SearchResult, id: string): void {
  const ids = result.items.map((d) => String(d.id));
  if (ids.includes(id)) {
    throw new Error(`Expected result NOT to contain id "${id}"`);
  }
}

/** Extract all document ids from a result set. */
export function resultIds(result: SearchResult): string[] {
  return result.items.map((d) => String(d.id));
}

/** Assert the result set contains zero documents. */
export function expectEmptyResult(result: SearchResult): void {
  if (result.total !== 0 || result.items.length !== 0) {
    throw new Error(`Expected empty result, got total=${result.total}`);
  }
}

// ---------------------------------------------------------------------------
// Document builders
// ---------------------------------------------------------------------------

/** Build a minimal product document. */
export function makeProduct(
  overrides: Partial<SearchDocument> & { id: string },
): SearchDocument {
  return {
    title: `Product ${overrides.id}`,
    price: 10,
    category: "general",
    published: true,
    score: 0,
    ...overrides,
  };
}

/** Build N numbered product documents with optional base overrides. */
export function makeProducts(
  n: number,
  base: Partial<SearchDocument> = {},
): SearchDocument[] {
  return Array.from({ length: n }, (_, i) =>
    makeProduct({
      id: `prod-${i + 1}`,
      title: `Product ${i + 1}`,
      score: i,
      ...base,
    }),
  );
}

/** Build a minimal article document. */
export function makeArticle(
  overrides: Partial<SearchDocument> & { id: string },
): SearchDocument {
  return {
    title: `Article ${overrides.id}`,
    content: "default content",
    author: "alice",
    wordCount: 100,
    ...overrides,
  };
}
