import { readFileSync } from "node:fs";
import { dirname } from "node:path";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { mergeResolvers, mergeTypeDefs } from "@graphql-tools/merge";
import { makeExecutableSchema } from "@graphql-tools/schema";
import { createYoga } from "graphql-yoga";
import { adapterModules } from "./adapters";
import { createGatewayContext } from "./core/context";
import { useJwtAuthPlugin } from "./mesh/envelop/auth/jwt";
import { useSessionPlugin } from "./mesh/envelop/auth/session";
import { useResponseCachePlugin } from "./mesh/envelop/performance/cache";
import { usePersistedQueriesPlugin } from "./mesh/envelop/performance/persisted-queries";
import { useGraphqlArmorPlugin } from "./mesh/envelop/security/armor";
import { useCostLimitPlugin } from "./mesh/envelop/security/cost-limit";
import { useDepthLimitPlugin } from "./mesh/envelop/security/depth-limit";
import { useDisableIntrospectionPlugin } from "./mesh/envelop/security/disable-introspection";
import { useHiveUsagePlugin } from "./mesh/envelop/observability/hive";
import { useRequestLoggingPlugin } from "./mesh/envelop/observability/logging";

const serverDir = dirname(fileURLToPath(import.meta.url));
const schemaBasePath = join(serverDir, "schema", "base");

const baseTypeDefs = [
  readFileSync(join(schemaBasePath, "scalars.graphql"), "utf-8"),
  readFileSync(join(schemaBasePath, "directives.graphql"), "utf-8"),
  readFileSync(join(serverDir, "schema", "stitched", "index.graphql"), "utf-8")
];

const mergedTypeDefs = mergeTypeDefs([
  ...baseTypeDefs,
  ...adapterModules.map((module) => module.typeDefs)
]);

const mergedResolvers = mergeResolvers(adapterModules.map((module) => module.resolvers) as any);

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
      usePersistedQueriesPlugin()
    ]
  });