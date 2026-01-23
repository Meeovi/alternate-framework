export interface SearchContextState {
  query: string
  page: number
  pageSize: number
  sort?: string
  filters: Record<string, any>
}

export class SearchContext {
  state: SearchContextState

  constructor(initial?: Partial<SearchContextState>) {
    this.state = {
      query: '',
      page: 1,
      pageSize: 20,
      filters: {},
      ...initial
    }
  }

  setQuery(query: string) {
    this.state.query = query
  }

  setPage(page: number) {
    this.state.page = page
  }

  setPageSize(size: number) {
    this.state.pageSize = size
  }

  setSort(sort: string | undefined) {
    this.state.sort = sort
  }

  setFilter(key: string, value: any) {
    this.state.filters[key] = value
  }

  removeFilter(key: string) {
    delete this.state.filters[key]
  }

  reset() {
    this.state = {
      query: '',
      page: 1,
      pageSize: 20,
      filters: {}
    }
  }
}