"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
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
exports.gatewayConfig = void 0;
require("../shared/logs/telemetry");
var gateway_1 = require("@graphql-hive/gateway");
var plugin_apq_1 = require("@graphql-yoga/plugin-apq");
var router_runtime_1 = require("@graphql-hive/router-runtime");
var graphql_armor_max_directives_1 = require("@escape.tech/graphql-armor-max-directives");
var plugin_newrelic_1 = require("@graphql-mesh/plugin-newrelic");
var plugin_sofa_1 = require("@graphql-yoga/plugin-sofa");
var types_1 = require("@graphql-mesh/types");
var load_base_app_env_1 = require("./app/utils/load-base-app-env");
var loadedBaseAppDir = (0, load_base_app_env_1.loadBaseAppEnv)();
if (loadedBaseAppDir) {
    console.info("[gateway] Loaded gateway env from base app: ".concat(loadedBaseAppDir));
}
function createMeshLogger(log) {
    var wrap = function (prefix) {
        var nextLog = typeof prefix === "string"
            ? log.child(prefix)
            : prefix
                ? log.child(JSON.stringify(prefix))
                : log;
        return {
            name: typeof prefix === "string" ? prefix : undefined,
            log: function () {
                var args = [];
                for (var _i = 0; _i < arguments.length; _i++) {
                    args[_i] = arguments[_i];
                }
                return Reflect.apply(nextLog.log, nextLog, args);
            },
            warn: function () {
                var args = [];
                for (var _i = 0; _i < arguments.length; _i++) {
                    args[_i] = arguments[_i];
                }
                return Reflect.apply(nextLog.warn, nextLog, args);
            },
            info: function () {
                var args = [];
                for (var _i = 0; _i < arguments.length; _i++) {
                    args[_i] = arguments[_i];
                }
                return Reflect.apply(nextLog.info, nextLog, args);
            },
            error: function () {
                var args = [];
                for (var _i = 0; _i < arguments.length; _i++) {
                    args[_i] = arguments[_i];
                }
                return Reflect.apply(nextLog.error, nextLog, args);
            },
            debug: function () {
                var args = [];
                for (var _i = 0; _i < arguments.length; _i++) {
                    args[_i] = arguments[_i];
                }
                return Reflect.apply(nextLog.debug, nextLog, args);
            },
            child: function (name) { return wrap(name); },
            addPrefix: function (name) { return wrap(name); },
        };
    };
    return wrap();
}
exports.gatewayConfig = (0, gateway_1.defineConfig)({
    healthCheckEndpoint: "/healthcheck",
    readinessCheckEndpoint: "/readiness",
    unifiedGraphHandler: router_runtime_1.unifiedGraphHandler,
    maxDepth: true,
    maxTokens: true,
    rateLimiting: true,
    upstreamRetry: {
        maxRetries: 3,
    },
    logging: new gateway_1.Logger({
        writers: [new gateway_1.JSONLogWriter()]
    }),
    openTelemetry: {
        traces: true,
    },
    proxy: {
        endpoint: "http://localhost:3000/graphql",
    },
    hmacSignature: {
        secret: "".concat(process.env.HMAC_SECRET),
    },
    cache: {
        type: "redis",
        host: "".concat(process.env.NUXT_REDIS_URL), // The host of the Redis server
        port: "".concat(process.env.NUXT_REDIS_PORT), // The port of the Redis server
        password: "".concat(process.env.NUXT_REDIS_PASSWORD), // The password of the Redis server
        lazyConnect: true, // If true, the connection will be established when the first operation is executed
    },
    responseCaching: {
        session: function () { return null; },
    },
    cors: {
        origin: "".concat(process.env.NUXT_PUBLIC_SITE_URL),
        credentials: true,
        allowedHeaders: ["".concat(process.env.GRAPHQL_HEADER_AUTH)],
        methods: ["POST"],
    },
    csrfPrevention: {
        requestHeaders: ["x-gateway-csrf"],
    },
    plugins: function (ctx) { return __spreadArray([
        (0, plugin_apq_1.useAPQ)(),
        (0, graphql_armor_max_directives_1.maxDirectivesPlugin)({
            // Number of directives allowed | Default: 10
            n: 10,
            // Do you want to propagate the rejection to the client? | default: true
            propagateOnRejection: true,
        }),
        (0, plugin_sofa_1.useSofa)(__assign(__assign({}, ctx), { basePath: "/rest" }))
    ], (ctx.cache && ctx.pubsub ? [(0, plugin_newrelic_1.default)({
            logger: createMeshLogger(ctx.log),
            cache: ctx.cache,
            pubsub: (0, types_1.toMeshPubSub)(ctx.pubsub),
            baseDir: ctx.cwd,
            importFn: function (moduleId) { return __awaiter(void 0, void 0, void 0, function () { return __generator(this, function (_a) {
                return [2 /*return*/, Promise.resolve("".concat(moduleId)).then(function (s) { return require(s); })];
            }); }); },
        })] : []), true); },
});
