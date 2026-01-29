import { SearchContext } from './SearchContext';
import { QueryBuilder } from './QueryBuilder';
import { SearchPipeline } from './Pipeline';
export class SearchManager {
    context;
    pipeline;
    adapter;
    constructor(adapter, initial) {
        this.context = new SearchContext(initial);
        this.pipeline = new SearchPipeline();
        this.adapter = adapter;
    }
    async search() {
        const builder = new QueryBuilder(this.context);
        let query = builder.build();
        query = this.pipeline.runBefore(query);
        const result = await this.adapter.search(query);
        return this.pipeline.runAfter(result);
    }
}
