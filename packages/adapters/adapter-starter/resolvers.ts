import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const currentDir = dirname(fileURLToPath(import.meta.url));
const typeDefs = readFileSync(join(currentDir, "schema.graphql"), "utf-8");

type StarterContext = {
  adapters: {
    starter: {
      adapter: {
        health: () => string;
        search: (query: string) => Promise<unknown>;
      };
    };
  };
};

export const starterAdapterModule = {
  name: "starter-adapter",
  typeDefs,
  resolvers: {
    Query: {
      starterHealth: (_: unknown, __: unknown, ctx: StarterContext) =>
        ctx.adapters.starter.adapter.health(),
      starterSearch: (_: unknown, { query }: { query: string }, ctx: StarterContext) =>
        ctx.adapters.starter.adapter.search(query)
    }
  }
};