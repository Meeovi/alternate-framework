// ---------------------------------------------------------------------------
// Schema index helpers — defineIndex, mergeSchema
// ---------------------------------------------------------------------------

import type { FieldDefinition, IndexSchema } from "../core/types";

/**
 * Define a fully validated IndexSchema.
 * Throws at startup if required fields are missing.
 */
export function defineIndex(schema: IndexSchema): IndexSchema {
  if (!schema.name) throw new Error("IndexSchema must have a 'name'");
  if (!schema.fieldMap || Object.keys(schema.fieldMap).length === 0) {
    throw new Error(`IndexSchema '${schema.name}' must have at least one field`);
  }
  // Validate that vector fields have dimensions
  for (const [name, field] of Object.entries(schema.fieldMap)) {
    if (field.type === "vector" && !field.dimensions) {
      throw new Error(`Vector field '${name}' in index '${schema.name}' must specify 'dimensions'`);
    }
  }
  return schema;
}

/**
 * Merge two IndexSchemas — fields in `override` win over `base`.
 * Useful for inheriting a shared base schema and extending with index-specific fields.
 */
export function mergeSchema(base: IndexSchema, override: Partial<IndexSchema> & { name: string }): IndexSchema {
  return {
    ...base,
    ...override,
    fieldMap: {
      ...base.fieldMap,
      ...(override.fieldMap ?? {}),
    },
  };
}

/**
 * Create a schema subset view containing only the specified fields.
 * Handy for tenant-specific virtual projections.
 */
export function projectSchema(schema: IndexSchema, fields: string[]): IndexSchema {
  const fieldSet = new Set(fields);
  const projected: Record<string, FieldDefinition> = {};
  for (const [k, v] of Object.entries(schema.fieldMap)) {
    if (fieldSet.has(k)) projected[k] = v;
  }
  return { ...schema, fieldMap: projected };
}
