// Search-specific event types
export interface SearchEvents {
  'search:query': { term: string }
  'search:results': { term: string; total: number }
}