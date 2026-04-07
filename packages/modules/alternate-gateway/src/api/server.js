"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
var node_http_1 = require("node:http");
var load_base_app_env_1 = require("../../app/utils/load-base-app-env");
var graphql_yoga_1 = require("graphql-yoga");
var plugin_csrf_prevention_1 = require("@graphql-yoga/plugin-csrf-prevention");
var plugin_persisted_operations_1 = require("@graphql-yoga/plugin-persisted-operations");
var plugin_apq_1 = require("@graphql-yoga/plugin-apq");
var server_plugin_cookies_1 = require("@whatwg-node/server-plugin-cookies");
var yoga_1 = require("@graphql-hive/yoga");
var federation_1 = require("@graphql-tools/federation");
var apollo_managed_federation_1 = require("@graphql-yoga/apollo-managed-federation");
var plugin_prometheus_1 = require("@graphql-yoga/plugin-prometheus");
var graphql_armor_cost_limit_1 = require("@escape.tech/graphql-armor-cost-limit");
var graphql_armor_max_aliases_1 = require("@escape.tech/graphql-armor-max-aliases");
var graphql_armor_max_depth_1 = require("@escape.tech/graphql-armor-max-depth");
var graphql_armor_max_directives_1 = require("@escape.tech/graphql-armor-max-directives");
var graphql_armor_max_tokens_1 = require("@escape.tech/graphql-armor-max-tokens");
var store = {
    ecf4edb46db40b5132295c0291d62fb65d6759a9eedfa4d5d612dd5ec54a6b38: '{__typename}'
};
(function () { return __awaiter(void 0, void 0, void 0, function () {
    var loadedBaseAppDir, supergraphFetcher, supergraphSdl, yoga, server;
    var _a, _b;
    return __generator(this, function (_c) {
        switch (_c.label) {
            case 0:
                loadedBaseAppDir = (0, load_base_app_env_1.loadBaseAppEnv)();
                supergraphFetcher = (0, yoga_1.createSupergraphSDLFetcher)({
                    key: "".concat((_a = process.env.HIVE_CDN_KEY) !== null && _a !== void 0 ? _a : ''),
                    endpoint: "".concat((_b = process.env.HIVE_CDN_URL) !== null && _b !== void 0 ? _b : '')
                });
                return [4 /*yield*/, supergraphFetcher()
                    // Create a Yoga instance with a GraphQL schema.
                ];
            case 1:
                supergraphSdl = (_c.sent()).supergraphSdl;
                yoga = (0, graphql_yoga_1.createYoga)({
                    plugins: [
                        (0, graphql_yoga_1.useExecutionCancellation)(),
                        (0, plugin_csrf_prevention_1.useCSRFPrevention)({
                            requestHeaders: ['x-graphql-yoga-csrf'] // default
                        }),
                        (0, plugin_persisted_operations_1.usePersistedOperations)({
                            skipDocumentValidation: true,
                            getPersistedOperation: function (sha256Hash) {
                                return store[sha256Hash];
                            },
                        }),
                        (0, plugin_apq_1.useAPQ)(),
                        (0, server_plugin_cookies_1.useCookies)(),
                        (0, apollo_managed_federation_1.useManagedFederation)(),
                        (0, plugin_prometheus_1.usePrometheus)({
                            endpoint: '/metrics', // optional, default is `/metrics`, you can disable it by setting it to `false` if registry is configured in "push" mode
                            // Optional, see default values below
                            metrics: {
                                // This metric is disabled by default.
                                // Warning: enabling resolvers level metrics will introduce significant overhead
                                graphql_envelop_execute_resolver: false
                            }
                        }),
                        (0, graphql_armor_cost_limit_1.costLimitPlugin)(),
                        (0, graphql_armor_max_tokens_1.maxTokensPlugin)(),
                        (0, graphql_armor_max_depth_1.maxDepthPlugin)(),
                        (0, graphql_armor_max_directives_1.maxDirectivesPlugin)(),
                        (0, graphql_armor_max_aliases_1.maxAliasesPlugin)()
                    ],
                    schema: (0, federation_1.getStitchedSchemaFromSupergraphSdl)({
                        supergraphSdl: supergraphSdl
                    }),
                    graphqlEndpoint: '/api/server',
                    batching: true,
                    logging: 'debug',
                    healthCheckEndpoint: '/live',
                    cors: {
                        origin: "".concat(process.env.NUXT_PUBLIC_SITE_URL),
                        credentials: true,
                        allowedHeaders: ["".concat(process.env.GRAPHQL_HEADER_AUTH)],
                        methods: ["POST"],
                    },
                });
                server = (0, node_http_1.createServer)(yoga);
                // Start the server and you're done!
                server.listen(4000, function () {
                    if (loadedBaseAppDir) {
                        console.info("Loaded gateway env from base app: ".concat(loadedBaseAppDir));
                    }
                    console.info('Server is running on http://localhost:4000/graphql');
                });
                return [2 /*return*/];
        }
    });
}); })();
