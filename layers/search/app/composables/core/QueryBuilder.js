export class QueryBuilder {
    context;
    constructor(context) {
        this.context = context;
    }
    build() {
        return {
            term: this.context.state.query,
            page: this.context.state.page,
            pageSize: this.context.state.pageSize,
            sort: this.context.state.sort,
            filters: this.context.state.filters
        };
    }
}
