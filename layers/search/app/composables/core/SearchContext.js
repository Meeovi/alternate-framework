export class SearchContext {
    state;
    constructor(initial) {
        this.state = {
            query: '',
            page: 1,
            pageSize: 20,
            filters: {},
            ...initial
        };
    }
    setQuery(query) {
        this.state.query = query;
    }
    setPage(page) {
        this.state.page = page;
    }
    setPageSize(size) {
        this.state.pageSize = size;
    }
    setSort(sort) {
        this.state.sort = sort;
    }
    setFilter(key, value) {
        this.state.filters[key] = value;
    }
    removeFilter(key) {
        delete this.state.filters[key];
    }
    reset() {
        this.state = {
            query: '',
            page: 1,
            pageSize: 20,
            filters: {}
        };
    }
}
