import type { FieldDefinition, FieldType, IndexSchema } from "../core/types";

export type JsonSchema = {
  $schema: string;
  title?: string;
  type: string;
  properties?: Record<string, unknown>;
  required?: string[];
  additionalProperties?: boolean;
  items?: unknown;
  enum?: unknown[];
  description?: string;
};

function fieldTypeToJsonType(fieldType: FieldType): JsonSchema {
  switch (fieldType) {
    case "number":
      return { $schema: "https://json-schema.org/draft/2020-12/schema", type: "number" };
    case "boolean":
      return { $schema: "https://json-schema.org/draft/2020-12/schema", type: "boolean" };
    case "date":
      return {
        $schema: "https://json-schema.org/draft/2020-12/schema",
        type: "string",
        description: "ISO-8601 date or datetime",
      };
    case "string[]":
      return {
        $schema: "https://json-schema.org/draft/2020-12/schema",
        type: "array",
        items: { type: "string" },
      };
    case "number[]":
      return {
        $schema: "https://json-schema.org/draft/2020-12/schema",
        type: "array",
        items: { type: "number" },
      };
    case "geo":
      return {
        $schema: "https://json-schema.org/draft/2020-12/schema",
        type: "object",
        properties: {
          lat: { type: "number" },
          lng: { type: "number" },
        },
        required: ["lat", "lng"],
        additionalProperties: false,
      };
    case "vector":
      return {
        $schema: "https://json-schema.org/draft/2020-12/schema",
        type: "array",
        items: { type: "number" },
      };
    default:
      return { $schema: "https://json-schema.org/draft/2020-12/schema", type: "string" };
  }
}

function fieldDefinitionToSchema(field: FieldDefinition): Record<string, unknown> {
  const typeSchema = fieldTypeToJsonType(field.type);
  const schema: Record<string, unknown> = { ...typeSchema };
  if (field.type === "vector" && typeof field.dimensions === "number") {
    schema.minItems = field.dimensions;
    schema.maxItems = field.dimensions;
  }
  return schema;
}

export function indexSchemaToJsonSchema(indexName: string, schema: IndexSchema): JsonSchema {
  const fields = schema.fieldMap
    ? schema.fieldMap
    : Object.fromEntries((schema.fields ?? []).map((field) => [field, { type: "string" as const }]));

  const properties: Record<string, unknown> = {
    id: { type: "string" },
  };

  const required = [schema.primaryKey ?? "id"];

  for (const [fieldName, definition] of Object.entries(fields)) {
    properties[fieldName] = fieldDefinitionToSchema(definition as FieldDefinition);
    if (!(definition as FieldDefinition).optional && (definition as FieldDefinition).stored !== false) {
      required.push(fieldName);
    }
  }

  return {
    $schema: "https://json-schema.org/draft/2020-12/schema",
    title: `${indexName}Document`,
    type: "object",
    properties,
    required: [...new Set(required)],
    additionalProperties: true,
  };
}

export function searchIndexesToJsonSchema(indexes: Record<string, IndexSchema>): JsonSchema {
  const properties = Object.fromEntries(
    Object.entries(indexes).map(([indexName, schema]) => [indexName, indexSchemaToJsonSchema(indexName, schema)]),
  );

  return {
    $schema: "https://json-schema.org/draft/2020-12/schema",
    title: "AlternateSearchIndexes",
    type: "object",
    properties,
    additionalProperties: false,
  };
}
