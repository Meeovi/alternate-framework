// ---------------------------------------------------------------------------
// Schema field helpers — type-safe field definition builders
// ---------------------------------------------------------------------------

import type { FieldDefinition, FieldType } from "../core/types";

/**
 * Define a text/full-text field.
 * Searchable by default; not filterable/sortable unless explicitly enabled.
 */
export function textField(options?: Partial<Omit<FieldDefinition, "type">>): FieldDefinition {
  return { type: "string", searchable: true, stored: true, ...options };
}

/** Define an exact-match keyword field (not analysed for full-text). */
export function keywordField(options?: Partial<Omit<FieldDefinition, "type">>): FieldDefinition {
  return { type: "string", searchable: false, filterable: true, sortable: true, stored: true, ...options };
}

/** Define a numeric field. Filterable and sortable by default. */
export function numberField(options?: Partial<Omit<FieldDefinition, "type">>): FieldDefinition {
  return { type: "number", filterable: true, sortable: true, stored: true, ...options };
}

/** Define a boolean field. Filterable by default. */
export function booleanField(options?: Partial<Omit<FieldDefinition, "type">>): FieldDefinition {
  return { type: "boolean", filterable: true, stored: true, ...options };
}

/** Define a date/timestamp field. Filterable and sortable by default. */
export function dateField(options?: Partial<Omit<FieldDefinition, "type">>): FieldDefinition {
  return { type: "date", filterable: true, sortable: true, stored: true, ...options };
}

/** Define a multi-value string field (tags, categories). Filterable and facetable by default. */
export function tagsField(options?: Partial<Omit<FieldDefinition, "type">>): FieldDefinition {
  return { type: "string[]", filterable: true, facetable: true, stored: true, ...options };
}

/** Define a geolocation field. */
export function geoField(options?: Partial<Omit<FieldDefinition, "type">>): FieldDefinition {
  return { type: "geo", filterable: true, stored: true, ...options };
}

/**
 * Define a dense vector field for semantic / kNN search.
 * @param dimensions The vector dimensionality (must match the embedder output).
 */
export function vectorField(
  dimensions: number,
  options?: Partial<Omit<FieldDefinition, "type" | "dimensions">>,
): FieldDefinition {
  return { type: "vector", dimensions, searchable: false, stored: false, ...options };
}

/** Define a facetable numeric field (sortable + filterable + facetable). */
export function facetField(type: Extract<FieldType, "number" | "string">, options?: Partial<Omit<FieldDefinition, "type">>): FieldDefinition {
  return { type, filterable: true, sortable: type === "number", facetable: true, stored: true, ...options };
}
