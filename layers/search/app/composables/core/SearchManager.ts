import type { SearchAdapter } from '@meeovi/core'
import { SearchContext, type SearchContextState } from './SearchContext'
import { QueryBuilder } from './QueryBuilder'
import { SearchPipeline } from './Pipeline'

export class SearchManager<TItem> {
  context: SearchContext
  pipeline: SearchPipeline
  adapter: SearchAdapter<TItem>

  constructor(adapter: SearchAdapter<TItem>, initial?: Partial<SearchContextState>) {
    this.context = new SearchContext(initial)
    this.pipeline = new SearchPipeline()
    this.adapter = adapter
  }

  async search() {
    const builder = new QueryBuilder(this.context)
    let query = builder.build()

    query = this.pipeline.runBefore(query)

    const result = await this.adapter.search(query as any)

    return this.pipeline.runAfter(result)
  }
}