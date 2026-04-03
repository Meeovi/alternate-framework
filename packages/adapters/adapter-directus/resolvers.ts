import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const currentDir = dirname(fileURLToPath(import.meta.url));
const typeDefs = readFileSync(join(currentDir, "schema.graphql"), "utf-8");

type DirectusContext = {
  adapters: {
    content: {
      directus: {
        getSchema: (collection: string) => Promise<unknown>;
        getItem: (collection: string, id: string) => Promise<unknown>;
        createItem: (collection: string, input: Record<string, unknown>) => Promise<unknown>;
      };
    };
  };
};

export const directusAdapter = {
  name: "content-directus",
  typeDefs,
  resolvers: {
    Query: {
      directusSchema: (_: unknown, { collection }: { collection: string }, ctx: DirectusContext) =>
        ctx.adapters.content.directus.getSchema(collection),
      directusItem: (
        _: unknown,
        { collection, id }: { collection: string; id: string },
        ctx: DirectusContext
      ) => ctx.adapters.content.directus.getItem(collection, id)
    },
    Mutation: {
      directusCreateItem: (
        _: unknown,
        { collection, input }: { collection: string; input: Record<string, unknown> },
        ctx: DirectusContext
      ) => ctx.adapters.content.directus.createItem(collection, input)
    }
  }
};