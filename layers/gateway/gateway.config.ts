import "../shared/logs/telemetry";
import {
    defineConfig,
    JSONLogWriter,
    Logger,
    type GatewayConfigContext
} from "@graphql-hive/gateway";
import {
    useAPQ
} from "@graphql-yoga/plugin-apq";
import {
    unifiedGraphHandler,
} from "@graphql-hive/router-runtime";
import {
    maxDirectivesPlugin
} from "@escape.tech/graphql-armor-max-directives";
import useNewRelic from "@graphql-mesh/plugin-newrelic";
import {
    useSofa
} from "@graphql-yoga/plugin-sofa";
import {
    toMeshPubSub,
    type Logger as MeshLogger
} from "@graphql-mesh/types";
import { loadBaseAppEnv } from "./app/utils/load-base-app-env";

const loadedBaseAppDir = loadBaseAppEnv();
if (loadedBaseAppDir) {
    console.info(`[gateway] Loaded gateway env from base app: ${loadedBaseAppDir}`);
}

function createMeshLogger(log: GatewayConfigContext["log"]): MeshLogger {
    const wrap = (prefix?: string | Record<string, string | number>): MeshLogger => {
        const nextLog = typeof prefix === "string"
            ? log.child(prefix)
            : prefix
                ? log.child(JSON.stringify(prefix))
                : log;

        return {
            name: typeof prefix === "string" ? prefix : undefined,
            log: (...args) => Reflect.apply(nextLog.log, nextLog, args),
            warn: (...args) => Reflect.apply(nextLog.warn, nextLog, args),
            info: (...args) => Reflect.apply(nextLog.info, nextLog, args),
            error: (...args) => Reflect.apply(nextLog.error, nextLog, args),
            debug: (...args) => Reflect.apply(nextLog.debug, nextLog, args),
            child: (name) => wrap(name),
            addPrefix: (name) => wrap(name),
        };
    };

    return wrap();
}

export const gatewayConfig = defineConfig({
    healthCheckEndpoint: "/healthcheck",
    readinessCheckEndpoint: "/readiness",
    unifiedGraphHandler,
    maxDepth: true,
    maxTokens: true,
    rateLimiting: true,
    upstreamRetry: {
        maxRetries: 3,
    },
    logging: new Logger({
        writers: [new JSONLogWriter()]
    }),
    openTelemetry: {
        traces: true,
    },
    proxy: {
        endpoint: "http://localhost:3000/graphql",
    },
    hmacSignature: {
        secret: `${process.env.HMAC_SECRET}`,
    },
    cache: {
        type: "redis",
        host: `${process.env.NUXT_REDIS_URL}`, // The host of the Redis server
        port: `${process.env.NUXT_REDIS_PORT}`, // The port of the Redis server
        password: `${process.env.NUXT_REDIS_PASSWORD}`, // The password of the Redis server
        lazyConnect: true, // If true, the connection will be established when the first operation is executed
    },
    responseCaching: {
        session: () => null,
    },
    cors: {
        origin: `${process.env.NUXT_PUBLIC_SITE_URL}`,
        credentials: true,
        allowedHeaders: [`${process.env.GRAPHQL_HEADER_AUTH}`],
        methods: ["POST"],
    },
    csrfPrevention: {
        requestHeaders: ["x-gateway-csrf"],
    },
    plugins: (ctx) => [
        useAPQ(),
        maxDirectivesPlugin({

            // Number of directives allowed | Default: 10
            n: 10,
            // Do you want to propagate the rejection to the client? | default: true
            propagateOnRejection: true,
        }),
        useSofa({
            ...ctx,
            basePath: "/rest",
        }),
        ...(ctx.cache && ctx.pubsub ? [useNewRelic({
            logger: createMeshLogger(ctx.log),
            cache: ctx.cache,
            pubsub: toMeshPubSub(ctx.pubsub),
            baseDir: ctx.cwd,
            importFn: async <T = unknown>(moduleId: string) => import(moduleId) as Promise<T>,
        })] : []),
    ],
});