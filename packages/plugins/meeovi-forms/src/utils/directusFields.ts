import type { DirectusField } from '../types.js'

// Directus marks relational columns (many-to-one, one-to-many, many-to-many,
// many-to-any, translations) with one of these values in `meta.special` —
// this is the same signal Directus's own admin app uses to group fields
// under "Relational" rather than "Standard". Fields with a plain scalar
// interface never carry these, so checking `special` is more reliable than
// guessing from the interface name (which also matches non-relational
// interfaces like "many" free-choice selects).
const RELATIONAL_SPECIALS = new Set(['m2o', 'o2m', 'm2m', 'm2a', 'translations', 'files'])

/**
 * True when a Directus field represents a relationship to another
 * collection (m2o/o2m/m2m/m2a/translations) rather than a plain value
 * stored on the collection itself.
 */
export function isRelationalField(field: DirectusField | null | undefined): boolean {
  if (!field) return false

  const special = (field.meta as any)?.special
  if (Array.isArray(special) && special.some((s: string) => RELATIONAL_SPECIALS.has(s))) {
    return true
  }

  return false
}

/**
 * Filters a list of Directus fields down to plain fields — drops hidden
 * fields and relational fields (m2o/o2m/m2m/m2a/translations), keeping
 * only fields that store a value directly on the collection.
 */
export function filterDisplayFields(fields: DirectusField[] | null | undefined): DirectusField[] {
  return (fields || []).filter((field) => !field?.meta?.hidden && !isRelationalField(field))
}
