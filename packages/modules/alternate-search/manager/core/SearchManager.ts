import { QueryBuilder } from "./QueryBuilder";
import { SearchPipeline } from "./Pipeline";
import { SearchContext, type SearchContextState } from "./SearchContext";

export type ManagerSearchAdapter = {
  search(query: unknown): Promise<unknown>;
};

export class SearchManager {
  context: SearchContext;
  pipeline: SearchPipeline;
  adapter: ManagerSearchAdapter;

  constructor(adapter: ManagerSearchAdapter, initial?: Partial<SearchContextState>) {
    this.context = new SearchContext(initial);
    this.pipeline = new SearchPipeline();
    this.adapter = adapter;
  }

  async search(): Promise<unknown> {
    const builder = new QueryBuilder(this.context);
    let query = builder.build();

    query = this.pipeline.runBefore(query) as typeof query;

    const result = await this.adapter.search(query);

    return this.pipeline.runAfter(result);
  }
}
