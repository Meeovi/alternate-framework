export interface NormalizedCategory {
  id: number
  name: string
  children: NormalizedCategory[]
}

export function normalizeCategoryREST(raw: any): NormalizedCategory {
  return {
    id: raw.id,
    name: raw.name,
    children: (raw.children_data || []).map(normalizeCategoryREST),
  }
}
