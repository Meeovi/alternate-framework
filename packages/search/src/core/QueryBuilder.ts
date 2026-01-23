import { SearchContext } from './SearchContext'

export interface BuiltSearchQuery {
  term: string
  page: number
  pageSize: number
  sort?: string
  filters: Record<string, any>
}

export class QueryBuilder {
  private context: SearchContext

  constructor(context: SearchContext) {
    this.context = context
  }

  build(): BuiltSearchQuery {
    return {
      term: this.context.state.query,
      page: this.context.state.page,
      pageSize: this.context.state.pageSize,
      sort: this.context.state.sort,
      filters: this.context.state.filters
    }
  }
}