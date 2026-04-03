import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const currentDir = dirname(fileURLToPath(import.meta.url));
const typeDefs = readFileSync(join(currentDir, "schema.graphql"), "utf-8");

type RocketChatContext = {
  adapters: {
    chat: {
      rocketchat: {
        listRooms: () => Promise<unknown[]>;
        getMessages: (roomId: string, limit?: number) => Promise<unknown[]>;
        sendMessage: (roomId: string, body: string) => Promise<unknown>;
      };
    };
  };
};

export const rocketChatAdapter = {
  name: "chat-rocketchat",
  typeDefs,
  resolvers: {
    Query: {
      rocketchatRooms: (_: unknown, __: unknown, ctx: RocketChatContext) =>
        ctx.adapters.chat.rocketchat.listRooms(),
      rocketchatMessages: (
        _: unknown,
        { roomId, limit }: { roomId: string; limit?: number },
        ctx: RocketChatContext
      ) => ctx.adapters.chat.rocketchat.getMessages(roomId, limit)
    },
    Mutation: {
      rocketchatSendMessage: (
        _: unknown,
        { roomId, body }: { roomId: string; body: string },
        ctx: RocketChatContext
      ) => ctx.adapters.chat.rocketchat.sendMessage(roomId, body)
    }
  }
};