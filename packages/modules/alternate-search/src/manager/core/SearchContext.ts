export type SearchContextState = {
  index: string;
  q: string;
  query: string;
  page: number;
  pageSize: number;
  sort?: string;
  filters: Record<string, unknown>;
};

export class SearchContext {
  [x: string]: any;
  state: SearchContextState;

  constructor(initial?: Partial<SearchContextState>) {
    this.state = {
      index: "",
      q: "",
      query: "",
      page: 1,
      pageSize: 20,
      filters: {},
      ...initial,
    };
  }

  setQuery(query: string): void {
    this.state.query = query;
  }

  setPage(page: number): void {
    this.state.page = page;
  }

  setPageSize(size: number): void {
    this.state.pageSize = size;
  }

  setSort(sort: string | undefined): void {
    this.state.sort = sort;
  }

  setFilter(key: string, value: unknown): void {
    this.state.filters[key] = value;
  }

  removeFilter(key: string): void {
    delete this.state.filters[key];
  }

  reset(): void {
    this.state = {
      index: "",
      q: "",
      query: "",
      page: 1,
      pageSize: 20,
      filters: {},
    };
  }
}
