import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const currentDir = dirname(fileURLToPath(import.meta.url));
const typeDefs = readFileSync(join(currentDir, "schema.graphql"), "utf-8");

type OpenSearchContext = {
  adapters: {
    search: {
      opensearch: {
        search: (input: unknown) => Promise<unknown>;
      };
    };
  };
};

export const openSearchAdapter = {
  name: "search-opensearch",
  typeDefs,
  resolvers: {
    Query: {
      opensearchSearch: (_: unknown, { input }: { input: unknown }, ctx: OpenSearchContext) =>
        ctx.adapters.search.opensearch.search(input)
    }
  }
};