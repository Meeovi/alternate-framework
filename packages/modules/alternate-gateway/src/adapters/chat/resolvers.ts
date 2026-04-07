import { readFileSync } from "node:fs";
import { join } from "node:path";
import type { GatewayContext } from "../../context";

const typeDefs = readFileSync(join(process.cwd(), "app", "adapters", "chat", "schema.graphql"), "utf-8");

type FediverseBinding = {
  getActivityPubInbox?: (actor: string) => Promise<unknown>;
};

const getFediverseBinding = (context: GatewayContext): FediverseBinding | undefined => {
  const chatFediverse = (context.adapters["chat"] as Record<string, unknown> | undefined)?.[
    "fediverse"
  ];
  if (chatFediverse && typeof chatFediverse === "object") {
    return chatFediverse as FediverseBinding;
  }

  const federationFediverse = (context.adapters["federation"] as Record<string, unknown> | undefined)?.[
    "fediverse"
  ];
  if (federationFediverse && typeof federationFediverse === "object") {
    return federationFediverse as FediverseBinding;
  }

  return undefined;
};

export const chatAdapter = {
  name: "chat",
  typeDefs,
  resolvers: {
    Query: {
      chatMessages: async (_: unknown, args: { roomId: string }) => [
        {
          id: "message-1",
          roomId: args.roomId,
          senderId: "user-local-dev",
          body: "Welcome to room",
          createdAt: new Date().toISOString()
        }
      ],
      chatPresence: async (_: unknown, args: { roomId: string }) => [
        {
          userId: "user-local-dev",
          roomId: args.roomId,
          status: "online"
        }
      ],
      chatFediverseInbox: async (
        _: unknown,
        args: { actor: string },
        context: GatewayContext
      ) => {
        const fediverse = getFediverseBinding(context);
        if (!fediverse?.getActivityPubInbox) {
          return { items: [] };
        }
        return fediverse.getActivityPubInbox(args.actor);
      }
    },
    Mutation: {
      chatSendMessage: async (
        _: unknown,
        args: { input: { roomId: string; body: string } },
        context: GatewayContext
      ) => ({
        id: crypto.randomUUID(),
        roomId: args.input.roomId,
        senderId: context.user?.id ?? "anonymous",
        body: args.input.body,
        createdAt: new Date().toISOString()
      }),
      chatTyping: async () => true
    }
  }
};