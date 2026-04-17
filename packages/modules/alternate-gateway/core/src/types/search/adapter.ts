import type { BaseAdapter } from '../../adapters/common'
import type {
    SearchQuery
} from './query';
import type { SearchResult } from './result'

export interface SearchAdapter<TItem = unknown> extends BaseAdapter {
  search(query: SearchQuery): Promise<SearchResult<TItem>>
}