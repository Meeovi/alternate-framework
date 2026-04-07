import { readFileSync } from "node:fs";
import { join } from "node:path";
import type { GatewayContext } from "../../context";

const typeDefs = readFileSync(join(process.cwd(), "app", "adapters", "auth", "schema.graphql"), "utf-8");

export const authAdapter = {
  name: "auth",
  typeDefs,
  resolvers: {
    Query: {
      authGetUser: (_: unknown, __: unknown, context: GatewayContext) => {
        if (!context.user) {
          return null;
        }

        return {
          id: context.user.id,
          email: context.user.email ?? "unknown@meeovi.com",
          roles: context.user.roles
        };
      }
    },
    Mutation: {
      authLogin: async (_: unknown, args: { input: { email: string } }) => ({
        accessToken: "replace-with-real-access-token",
        refreshToken: "replace-with-real-refresh-token",
        user: {
          id: "user-local-dev",
          email: args.input.email,
          roles: ["user"]
        }
      }),
      authRefresh: async () => ({
        accessToken: "replace-with-rotated-access-token",
        refreshToken: "replace-with-rotated-refresh-token",
        user: {
          id: "user-local-dev",
          email: "user@meeovi.com",
          roles: ["user"]
        }
      })
    }
  }
};