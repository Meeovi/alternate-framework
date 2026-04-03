import { readFileSync } from "node:fs";
import { join } from "node:path";
import { mergeResolvers, mergeTypeDefs } from "@graphql-tools/merge";
import { makeExecutableSchema } from "@graphql-tools/schema";
import { createYoga } from "graphql-yoga";
import { adapterModules } from "./adapters";
import { createGatewayContext } from "./context";
import { useJwtAuthPlugin } from "./envelop/auth/jwt";
import { useSessionPlugin } from "./envelop/auth/session";
import { useResponseCachePlugin } from "./envelop/performance/cache";
import { usePersistedQueriesPlugin } from "./envelop/performance/persisted-queries";
import { useGraphqlArmorPlugin } from "./envelop/security/armor";
import { useCostLimitPlugin } from "./envelop/security/cost-limit";
import { useDepthLimitPlugin } from "./envelop/security/depth-limit";
import { useDisableIntrospectionPlugin } from "./envelop/security/disable-introspection";
import { useHiveUsagePlugin } from "./envelop/observability/hive";
import { useRequestLoggingPlugin } from "./envelop/observability/logging";
import { useSofaPlugin } from "./rest/sofa";

const schemaBasePath = join(process.cwd(), "app", "schema", "base");

const baseTypeDefs = [
  readFileSync(join(schemaBasePath, "scalars.graphql"), "utf-8"),
  readFileSync(join(schemaBasePath, "directives.graphql"), "utf-8"),
  readFileSync(join(process.cwd(), "app", "schema", "stitched", "index.graphql"), "utf-8")
];

const mergedTypeDefs = mergeTypeDefs([
  ...baseTypeDefs,
  ...adapterModules.map((module) => module.typeDefs)
]);

const mergedResolvers = mergeResolvers(adapterModules.map((module) => module.resolvers));

const schema = makeExecutableSchema({
  typeDefs: mergedTypeDefs,
  resolvers: mergedResolvers
});

export const createGatewayYogaServer = () =>
  createYoga({
    schema,
    graphqlEndpoint: "/graphql",
    context: ({ request }) => createGatewayContext(request),
    plugins: [
      useRequestLoggingPlugin(),
      useHiveUsagePlugin(),
      useJwtAuthPlugin(),
      useSessionPlugin(),
      useGraphqlArmorPlugin(),
      useDepthLimitPlugin(),
      useCostLimitPlugin(),
      useDisableIntrospectionPlugin(),
      useResponseCachePlugin(),
      usePersistedQueriesPlugin(),
      useSofaPlugin(schema)
    ]
  });