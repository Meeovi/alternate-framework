import { SearchQuery } from "./query";
import { SearchResult } from "./result";

export interface SearchAdapter {
  search(query: SearchQuery): Promise<SearchResult>
}