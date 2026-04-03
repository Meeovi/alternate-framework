import { readFileSync } from "node:fs";
import { join } from "node:path";
import type { GatewayContext } from "../../context";

const typeDefs = readFileSync(join(process.cwd(), "app", "adapters", "lists", "schema.graphql"), "utf-8");

type FediverseBinding = {
  getUnifiedFeed?: (identity: string, limit?: number) => Promise<Array<Record<string, unknown>>>;
};

const getFediverseBinding = (context: GatewayContext): FediverseBinding | undefined => {
  const listsFediverse = (context.adapters["lists"] as Record<string, unknown> | undefined)?.[
    "fediverse"
  ];
  if (listsFediverse && typeof listsFediverse === "object") {
    return listsFediverse as FediverseBinding;
  }

  const federationFediverse = (context.adapters["federation"] as Record<string, unknown> | undefined)?.[
    "fediverse"
  ];
  if (federationFediverse && typeof federationFediverse === "object") {
    return federationFediverse as FediverseBinding;
  }

  return undefined;
};

export const listsAdapter = {
  name: "lists",
  typeDefs,
  resolvers: {
    Query: {
      listsByOwner: async (_: unknown, args: { ownerId: string }) => [
        {
          id: "list-1",
          ownerId: args.ownerId,
          title: "Starter List",
          items: ["item-1", "item-2"]
        }
      ],
      listsFediverseAuthors: async (
        _: unknown,
        args: { identity: string; limit?: number },
        context: GatewayContext
      ) => {
        const fediverse = getFediverseBinding(context);
        if (!fediverse?.getUnifiedFeed) {
          return [];
        }

        const feed = await fediverse.getUnifiedFeed(args.identity, args.limit ?? 20);
        const uniqueAuthors = new Set<string>();

        for (const entry of feed) {
          const author = String(entry.author ?? "").trim();
          if (author) {
            uniqueAuthors.add(author);
          }
        }

        return Array.from(uniqueAuthors);
      }
    },
    Mutation: {
      listsCreate: async (_: unknown, args: { input: { ownerId: string; title: string } }) => ({
        id: crypto.randomUUID(),
        ownerId: args.input.ownerId,
        title: args.input.title,
        items: []
      }),
      listsUpdate: async (_: unknown, args: { input: { id: string; title?: string; items?: string[] } }) => ({
        id: args.input.id,
        ownerId: "owner-1",
        title: args.input.title ?? "Updated List",
        items: args.input.items ?? []
      }),
      listsDelete: async () => true
    }
  }
};