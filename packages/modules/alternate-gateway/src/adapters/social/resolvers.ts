import { readFileSync } from "node:fs";
import { join } from "node:path";
import type { GatewayContext } from "../../context";

const typeDefs = readFileSync(join(process.cwd(), "app", "adapters", "social", "schema.graphql"), "utf-8");

type FediverseBinding = {
  getUnifiedFeed?: (identity: string, limit?: number) => Promise<unknown>;
  publish?: (input: { protocol: "activitypub" | "atproto"; content: string; actor?: string }) => Promise<unknown>;
};

const getFediverseBinding = (context: GatewayContext): FediverseBinding | undefined => {
  const socialFediverse = (context.adapters["social"] as Record<string, unknown> | undefined)?.[
    "fediverse"
  ];
  if (socialFediverse && typeof socialFediverse === "object") {
    return socialFediverse as FediverseBinding;
  }

  const federationFediverse = (context.adapters["federation"] as Record<string, unknown> | undefined)?.[
    "fediverse"
  ];
  if (federationFediverse && typeof federationFediverse === "object") {
    return federationFediverse as FediverseBinding;
  }

  return undefined;
};

export const socialAdapter = {
  name: "social",
  typeDefs,
  resolvers: {
    Query: {
      socialFeed: async () => [
        {
          id: "post-1",
          body: "Hello from the social adapter",
          authorId: "user-local-dev",
          createdAt: new Date().toISOString()
        }
      ],
      socialNotifications: async () => [
        {
          id: "notif-1",
          text: "You have a new follower",
          read: false
        }
      ],
      socialFediverseFeed: async (
        _: unknown,
        args: { identity: string; limit?: number },
        context: GatewayContext
      ) => {
        const fediverse = getFediverseBinding(context);
        if (!fediverse?.getUnifiedFeed) {
          return [];
        }
        return fediverse.getUnifiedFeed(args.identity, args.limit);
      }
    },
    Mutation: {
      socialPost: async (_: unknown, args: { input: { body: string } }, context: GatewayContext) => ({
        id: crypto.randomUUID(),
        body: args.input.body,
        authorId: context.user?.id ?? "anonymous",
        createdAt: new Date().toISOString()
      }),
      socialFediversePublish: async (
        _: unknown,
        args: { protocol: string; content: string; actor?: string },
        context: GatewayContext
      ) => {
        const fediverse = getFediverseBinding(context);
        if (!fediverse?.publish) {
          return { success: false, reason: "fediverse-adapter-unavailable" };
        }

        const protocol = args.protocol === "atproto" ? "atproto" : "activitypub";
        return fediverse.publish({
          protocol,
          content: args.content,
          actor: args.actor
        });
      }
    }
  }
};