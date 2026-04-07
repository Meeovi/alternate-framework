import { createSearch } from "./alternate-search/core/search";
import { pgvectorAdapter } from "../../packages/modules/alternate-search/packages/alternate-search/adapters/pgvector";
import { indexes } from "../../packages/modules/alternate-search/packages/alternate-search/schema/indexes";
import { autocomplete, semanticSearch } from "../../packages/modules/alternate-search/plugins";

export const search = createSearch({
  adapter: pgvectorAdapter({ connectionString: process.env.DB_URL }),
  indexes,
  plugins: [
    semanticSearch({ provider: "openai" }),
    autocomplete()
  ]
});