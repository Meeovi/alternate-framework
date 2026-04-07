"use strict";
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createGatewayYogaServer = void 0;
var node_fs_1 = require("node:fs");
var node_path_1 = require("node:path");
var merge_1 = require("@graphql-tools/merge");
var schema_1 = require("@graphql-tools/schema");
var graphql_yoga_1 = require("graphql-yoga");
var adapters_1 = require("./adapters");
var context_1 = require("./context");
var jwt_1 = require("./envelop/auth/jwt");
var session_1 = require("./envelop/auth/session");
var cache_1 = require("./envelop/performance/cache");
var persisted_queries_1 = require("./envelop/performance/persisted-queries");
var armor_1 = require("./envelop/security/armor");
var cost_limit_1 = require("./envelop/security/cost-limit");
var depth_limit_1 = require("./envelop/security/depth-limit");
var disable_introspection_1 = require("./envelop/security/disable-introspection");
var hive_1 = require("./envelop/observability/hive");
var logging_1 = require("./envelop/observability/logging");
var sofa_1 = require("./rest/sofa");
var schemaBasePath = (0, node_path_1.join)(process.cwd(), "app", "schema", "base");
var baseTypeDefs = [
    (0, node_fs_1.readFileSync)((0, node_path_1.join)(schemaBasePath, "scalars.graphql"), "utf-8"),
    (0, node_fs_1.readFileSync)((0, node_path_1.join)(schemaBasePath, "directives.graphql"), "utf-8"),
    (0, node_fs_1.readFileSync)((0, node_path_1.join)(process.cwd(), "app", "schema", "stitched", "index.graphql"), "utf-8")
];
var mergedTypeDefs = (0, merge_1.mergeTypeDefs)(__spreadArray(__spreadArray([], baseTypeDefs, true), adapters_1.adapterModules.map(function (module) { return module.typeDefs; }), true));
var mergedResolvers = (0, merge_1.mergeResolvers)(adapters_1.adapterModules.map(function (module) { return module.resolvers; }));
var schema = (0, schema_1.makeExecutableSchema)({
    typeDefs: mergedTypeDefs,
    resolvers: mergedResolvers
});
var createGatewayYogaServer = function () {
    return (0, graphql_yoga_1.createYoga)({
        schema: schema,
        graphqlEndpoint: "/graphql",
        context: function (_a) {
            var request = _a.request;
            return (0, context_1.createGatewayContext)(request);
        },
        plugins: [
            (0, logging_1.useRequestLoggingPlugin)(),
            (0, hive_1.useHiveUsagePlugin)(),
            (0, jwt_1.useJwtAuthPlugin)(),
            (0, session_1.useSessionPlugin)(),
            (0, armor_1.useGraphqlArmorPlugin)(),
            (0, depth_limit_1.useDepthLimitPlugin)(),
            (0, cost_limit_1.useCostLimitPlugin)(),
            (0, disable_introspection_1.useDisableIntrospectionPlugin)(),
            (0, cache_1.useResponseCachePlugin)(),
            (0, persisted_queries_1.usePersistedQueriesPlugin)(),
            (0, sofa_1.useSofaPlugin)(schema)
        ]
    });
};
exports.createGatewayYogaServer = createGatewayYogaServer;
