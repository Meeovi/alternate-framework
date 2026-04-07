import { readFileSync } from "node:fs";
import { join } from "node:path";
import type { GatewayContext } from "../../context";

const typeDefs = readFileSync(join(process.cwd(), "app", "adapters", "search", "schema.graphql"), "utf-8");

type FediverseBinding = {
  getUnifiedFeed?: (identity: string, limit?: number) => Promise<Array<Record<string, unknown>>>;
};

const getFediverseBinding = (context: GatewayContext): FediverseBinding | undefined => {
  const searchFediverse = (context.adapters["search"] as Record<string, unknown> | undefined)?.[
    "fediverse"
  ];
  if (searchFediverse && typeof searchFediverse === "object") {
    return searchFediverse as FediverseBinding;
  }

  const federationFediverse = (context.adapters["federation"] as Record<string, unknown> | undefined)?.[
    "fediverse"
  ];
  if (federationFediverse && typeof federationFediverse === "object") {
    return federationFediverse as FediverseBinding;
  }

  return undefined;
};

export const searchAdapter = {
  name: "search",
  typeDefs,
  resolvers: {
    Query: {
      searchQuery: async (_: unknown, args: { input: { query: string } }) => ({
        items: [
          {
            id: "search-1",
            title: `Result for ${args.input.query}`,
            snippet: "Adapter-backed search result",
            score: 0.95
          }
        ],
        facets: [
          { key: "type:post", count: 12 },
          { key: "type:product", count: 4 }
        ],
        total: 16
      }),
      searchFacets: async () => [
        { key: "language:en", count: 100 },
        { key: "region:global", count: 81 }
      ],
      searchFediverse: async (
        _: unknown,
        args: { input: { identity: string; query?: string; limit?: number } },
        context: GatewayContext
      ) => {
        const fediverse = getFediverseBinding(context);
        if (!fediverse?.getUnifiedFeed) {
          return { items: [], facets: [], total: 0 };
        }

        const feed = await fediverse.getUnifiedFeed(args.input.identity, args.input.limit ?? 20);
        const keyword = args.input.query?.toLowerCase().trim();

        const filtered = !keyword
          ? feed
          : feed.filter((entry) =>
              String(entry.content ?? "").toLowerCase().includes(keyword)
            );

        return {
          items: filtered.map((entry, index) => ({
            id: String(entry.id ?? `fediverse-${index + 1}`),
            title: String(entry.author ?? "fediverse"),
            snippet: String(entry.content ?? ""),
            score: 1
          })),
          facets: [
            { key: "protocol:activitypub", count: filtered.filter((x) => x.protocol === "activitypub").length },
            { key: "protocol:atproto", count: filtered.filter((x) => x.protocol === "atproto").length }
          ],
          total: filtered.length
        };
      }
    }
  }
};