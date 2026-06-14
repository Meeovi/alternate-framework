import { createRequire } from "node:module";
import { resolve } from "node:path";
import { config as loadDotenv } from "dotenv";
let prismaSingleton = null;
const PROVIDER_ALIASES = {
    postgres: "postgresql",
    postgresql: "postgresql",
    mysql: "mysql",
    mariadb: "mysql",
    sqlite: "sqlite",
    sqlserver: "sqlserver",
    mssql: "sqlserver",
    cockroachdb: "cockroachdb",
    cockroach: "cockroachdb",
    mongodb: "mongodb",
    mongo: "mongodb",
};
const ADAPTER_MODULES = {
    postgresql: { packageName: "@prisma/adapter-pg", exportName: "PrismaPg" },
    mysql: { packageName: "@prisma/adapter-mysql", exportName: "PrismaMySQL" },
    sqlite: { packageName: "@prisma/adapter-sqlite", exportName: "PrismaSQLite" },
    sqlserver: { packageName: "@prisma/adapter-sqlserver", exportName: "PrismaSqlServer" },
    cockroachdb: { packageName: "@prisma/adapter-cockroachdb", exportName: "PrismaCockroachDB" },
    mongodb: { packageName: "@prisma/adapter-mongodb", exportName: "PrismaMongoDB" },
};
export function normalizeDatabaseProvider(provider) {
    const normalized = (provider ?? "postgresql").trim().toLowerCase();
    return PROVIDER_ALIASES[normalized] ?? normalized;
}
export function getSupportedDatabaseProviders() {
    return Object.keys(ADAPTER_MODULES);
}
export function getAdapterPackageForProvider(provider) {
    const canonicalProvider = normalizeDatabaseProvider(provider);
    return ADAPTER_MODULES[canonicalProvider]?.packageName ?? null;
}
function resolvePrismaClientConstructor() {
    const req = (() => {
        try {
            return createRequire(resolve(process.cwd(), "package.json"));
        }
        catch {
            return null;
        }
    })();
    if (!req) {
        throw new Error("[adapter-prisma] Unable to create a module resolver from process.cwd().");
    }
    try {
        const mod = req("@prisma/client");
        if (mod?.PrismaClient)
            return mod.PrismaClient;
        throw new Error("[adapter-prisma] @prisma/client is installed but PrismaClient export was not found.");
    }
    catch {
        throw new Error("[adapter-prisma] Unable to resolve @prisma/client from process.cwd(). " +
            "Install @prisma/client in the host app and run prisma generate.");
    }
}
function resolveRequireCandidates() {
    const candidates = [];
    try {
        candidates.push(createRequire(resolve(process.cwd(), "package.json")));
    }
    catch {
        // ignore; handled below
    }
    return candidates;
}
function loadAdapterConstructor(provider) {
    const canonicalProvider = normalizeDatabaseProvider(provider);
    const moduleMeta = ADAPTER_MODULES[canonicalProvider];
    if (!moduleMeta) {
        return null;
    }
    const requires = resolveRequireCandidates();
    for (const req of requires) {
        try {
            const mod = req(moduleMeta.packageName);
            const ctor = mod?.[moduleMeta.exportName];
            if (typeof ctor === "function") {
                return ctor;
            }
        }
        catch {
            // Try next resolver.
        }
    }
    throw new Error(`[adapter-prisma] Missing adapter package for provider "${canonicalProvider}". ` +
        `Install ${moduleMeta.packageName} in the host app.`);
}
function createAutoDriverAdapter(provider, url) {
    const AdapterCtor = loadAdapterConstructor(provider);
    if (!AdapterCtor) {
        return undefined;
    }
    // Constructor config shape differs across adapters. Try common options.
    const configCandidates = [
        { connectionString: url },
        { url },
    ];
    for (const cfg of configCandidates) {
        try {
            return new AdapterCtor(cfg);
        }
        catch {
            // Try next candidate.
        }
    }
    throw new Error(`[adapter-prisma] Unable to initialize driver adapter for provider "${provider}".`);
}
function loadAppEnvIfNeeded() {
    if (process.env.NUXT_DATABASE_URL || process.env.DATABASE_URL) {
        return;
    }
    // Resolve env from the host app (process.cwd), not the adapter package.
    loadDotenv({ path: resolve(process.cwd(), ".env") });
    loadDotenv({ path: resolve(process.cwd(), ".env.local"), override: false });
}
function buildClient(config = {}) {
    const { datasourceUrl, log, driverAdapter } = config;
    loadAppEnvIfNeeded();
    const resolvedDatasourceUrl = datasourceUrl ?? process.env.NUXT_DATABASE_URL ?? process.env.DATABASE_URL;
    const resolvedProvider = normalizeDatabaseProvider(process.env.DATABASE_PROVIDER);
    const resolvedDriverAdapter = driverAdapter ??
        (resolvedDatasourceUrl
            ? createAutoDriverAdapter(resolvedProvider, resolvedDatasourceUrl)
            : undefined);
    if (!resolvedDriverAdapter) {
        const supportedProviders = getSupportedDatabaseProviders().join(", ");
        const packageHint = getAdapterPackageForProvider(resolvedProvider);
        if (!packageHint) {
            throw new Error(`[adapter-prisma] Unsupported DATABASE_PROVIDER "${resolvedProvider}". ` +
                `Supported providers: ${supportedProviders}.`);
        }
        throw new Error("[adapter-prisma] Prisma v7 requires a driver adapter. " +
            "Set NUXT_DATABASE_URL (or DATABASE_URL) and DATABASE_PROVIDER, " +
            "or pass driverAdapter to createPrismaClient().");
    }
    const PrismaClient = resolvePrismaClientConstructor();
    const client = new PrismaClient({
        log,
        adapter: resolvedDriverAdapter,
    });
    return client;
}
/**
 * Initialize the Prisma client singleton.
 * Safe to call multiple times; returns the same instance.
 */
export function createPrismaClient(config = {}) {
    if (prismaSingleton)
        return prismaSingleton;
    // Dev hot-reload guard
    const globalForPrisma = globalThis;
    if (!globalForPrisma.__adapterPrismaClient) {
        globalForPrisma.__adapterPrismaClient = buildClient(config);
    }
    prismaSingleton = globalForPrisma.__adapterPrismaClient;
    return prismaSingleton;
}
export const prisma = new Proxy({}, {
    get(_target, prop, receiver) {
        const client = prismaSingleton ?? createPrismaClient();
        return Reflect.get(client, prop, receiver);
    },
    set(_target, prop, value, receiver) {
        const client = prismaSingleton ?? createPrismaClient();
        return Reflect.set(client, prop, value, receiver);
    },
});
/**
 * Get the already-initialized Prisma client.
 * Throws if createPrismaClient has not been called yet.
 */
export function getPrisma() {
    if (!prismaSingleton) {
        throw new Error("[adapter-prisma] Prisma client not initialized. " +
            "Call createPrismaClient() during startup.");
    }
    return prismaSingleton;
}
/**
 * Convenience helper to run a function with the Prisma client.
 */
export async function withPrisma(fn) {
    const client = prismaSingleton ?? createPrismaClient();
    return await fn(client);
}
export { resolvePrismaFromEnv } from "./env-config";
//export * from './client'
