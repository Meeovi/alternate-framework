export type SearchEvents = {
  "search:query": { term: string };
  "search:results": { term: string; total: number };
};
