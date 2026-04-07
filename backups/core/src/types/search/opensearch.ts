export interface OpenSearchHit<T = unknown> {
  _source: T
}

export interface OpenSearchHits<T = unknown> {
  total: { value: number }
  hits: Array<OpenSearchHit<T>>
}

export interface OpenSearchAggregations {
  [key: string]: {
    buckets: Array<{ key: string; doc_count: number }>
  }
}

export interface OpenSearchResponse<T = unknown> {
  hits: OpenSearchHits<T>
  aggregations?: OpenSearchAggregations
}