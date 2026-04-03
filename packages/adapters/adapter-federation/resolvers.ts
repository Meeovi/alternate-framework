import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const currentDir = dirname(fileURLToPath(import.meta.url));
const typeDefs = readFileSync(join(currentDir, "schema.graphql"), "utf-8");

type FederationContext = {
  adapters: {
    federation: {
      fediverse: {
        getActivityPubInbox: (actor: string) => Promise<unknown>;
        getActivityPubOutbox: (actor: string, limit?: number) => Promise<unknown>;
        getAtprotoProfile: (handle: string) => Promise<unknown>;
        getAtprotoFeed: (actor: string, limit?: number) => Promise<unknown>;
        getUnifiedFeed: (identity: string, limit?: number) => Promise<unknown>;
        publish: (input: { protocol: "activitypub" | "atproto"; content: string; actor?: string }) => Promise<unknown>;
        fanoutToLayers: (payload: unknown) => Promise<unknown>;
      };
    };
  };
};

export const federationAdapter = {
  name: "federation-fediverse",
  typeDefs,
  resolvers: {
    Query: {
      fediverseActivityPubInbox: (
        _: unknown,
        { actor }: { actor: string },
        ctx: FederationContext
      ) => ctx.adapters.federation.fediverse.getActivityPubInbox(actor),
      fediverseActivityPubOutbox: (
        _: unknown,
        { actor, limit }: { actor: string; limit?: number },
        ctx: FederationContext
      ) => ctx.adapters.federation.fediverse.getActivityPubOutbox(actor, limit),
      fediverseAtprotoProfile: (
        _: unknown,
        { handle }: { handle: string },
        ctx: FederationContext
      ) => ctx.adapters.federation.fediverse.getAtprotoProfile(handle),
      fediverseAtprotoFeed: (
        _: unknown,
        { actor, limit }: { actor: string; limit?: number },
        ctx: FederationContext
      ) => ctx.adapters.federation.fediverse.getAtprotoFeed(actor, limit),
      fediverseUnifiedFeed: (
        _: unknown,
        { identity, limit }: { identity: string; limit?: number },
        ctx: FederationContext
      ) => ctx.adapters.federation.fediverse.getUnifiedFeed(identity, limit)
    },
    Mutation: {
      fediversePublish: (
        _: unknown,
        {
          input
        }: {
          input: { protocol: "activitypub" | "atproto"; content: string; actor?: string };
        },
        ctx: FederationContext
      ) => ctx.adapters.federation.fediverse.publish(input),
      fediverseLayerFanout: (_: unknown, { input }: { input: unknown }, ctx: FederationContext) =>
        ctx.adapters.federation.fediverse.fanoutToLayers(input)
    }
  }
};