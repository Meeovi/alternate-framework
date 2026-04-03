import type { FacetRequest, FacetResult, FacetValue, FilterCondition } from "../../core/types";

// ---------------------------------------------------------------------------
// Filter → Meilisearch expression
// ---------------------------------------------------------------------------

export function toMeilisearchFilter(
  filters?: FilterCondition[] | Record<string, unknown>,
): string[] | undefined {
  if (!filters) return undefined;
  if (!Array.isArray(filters)) {
    const parts = Object.entries(filters).map(([k, v]) => `${k} = ${JSON.stringify(v)}`);
    return parts.length > 0 ? parts : undefined;
  }
  const parts = filters.map(conditionToMeili);
  return parts.length > 0 ? parts : undefined;
}

function conditionToMeili(c: FilterCondition): string {
  const { field: f, operator: op = "=", value: v } = c;
  switch (op) {
    case "=":      return `${f} = ${JSON.stringify(v)}`;
    case "!=":     return `${f} != ${JSON.stringify(v)}`;
    case "<":      return `${f} < ${JSON.stringify(v)}`;
    case "<=":     return `${f} <= ${JSON.stringify(v)}`;
    case ">":      return `${f} > ${JSON.stringify(v)}`;
    case ">=":     return `${f} >= ${JSON.stringify(v)}`;
    case "IN":     return Array.isArray(v)
      ? `${f} IN [${v.map((i) => JSON.stringify(i)).join(", ")}]`
      : `${f} = ${JSON.stringify(v)}`;
    case "NOT IN": return Array.isArray(v)
      ? `${f} NOT IN [${v.map((i) => JSON.stringify(i)).join(", ")}]`
      : `${f} != ${JSON.stringify(v)}`;
    default:       return `${f} = ${JSON.stringify(v)}`;
  }
}

// ---------------------------------------------------------------------------
// Sort
// ---------------------------------------------------------------------------

export function toMeilisearchSort(
  sort?: { field: string; order?: string } | { field: string; order?: string }[],
): string[] | undefined {
  if (!sort) return undefined;
  const arr = Array.isArray(sort) ? sort : [sort];
  return arr.map((s) => `${s.field}:${s.order ?? "asc"}`);
}

// ---------------------------------------------------------------------------
// Facets
// ---------------------------------------------------------------------------

export function toMeilisearchFacets(
  facets?: FacetRequest[] | string[],
): string[] | undefined {
  if (!facets || facets.length === 0) return undefined;
  return (facets as Array<string | FacetRequest>).map((f) =>
    typeof f === "string" ? f : f.field,
  );
}

export function fromMeilisearchFacets(
  distribution?: Record<string, Record<string, number>>,
  statsMap?: Record<string, { min: number; max: number }>,
): FacetResult[] {
  if (!distribution) return [];
  return Object.entries(distribution).map(([field, counts]) => {
    const values: FacetValue[] = Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .map(([value, count]) => ({ value: value as string | number | boolean, count }));
    const raw = statsMap?.[field];
    return {
      field,
      values,
      stats: raw
        ? { min: raw.min, max: raw.max, avg: (raw.min + raw.max) / 2, sum: 0 }
        : undefined,
    };
  });
}
