export interface FacetValue {
  value: string
  count: number
}

export interface Facet {
  field: string
  values: FacetValue[]
}