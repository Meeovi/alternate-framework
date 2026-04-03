export type OpenSearchHit<T = unknown> = {
  _source: T;
};

export type OpenSearchHits<T = unknown> = {
  total: { value: number };
  hits: Array<OpenSearchHit<T>>;
};

export type OpenSearchAggregations = {
  [key: string]: {
    buckets: Array<{ key: string; doc_count: number }>;
  };
};

export type OpenSearchResponse<T = unknown> = {
  hits: OpenSearchHits<T>;
  aggregations?: OpenSearchAggregations;
};