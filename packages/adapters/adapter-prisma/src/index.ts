import type { PrismaClient as BasePrismaClient, Prisma } from "@prisma/client";
import type { PrismaClientOptions } from "@prisma/client/runtime/library";
import { PrismaClient } from "@prisma/client";

export type PrismaDriverAdapter = unknown; // user passes concrete adapter type

export type AdapterPrismaConfig = {
  datasourceUrl?: string;
  datasourceName?: string; // default "db"
  log?: PrismaClientOptions["log"];
  driverAdapter?: PrismaDriverAdapter;
};

type PrismaClientSingleton = BasePrismaClient & {
  // extend here if you want custom helpers later
};

let prismaSingleton: PrismaClientSingleton | null = null;

function buildClient(config: AdapterPrismaConfig = {}): PrismaClientSingleton {
  const {
    datasourceUrl,
    datasourceName = "db",
    log,
    driverAdapter
  } = config;

  const datasources =
    datasourceUrl != null
      ? { [datasourceName]: { url: datasourceUrl } }
      : undefined;

  const client = new PrismaClient({
    datasources,
    log,
    ...(driverAdapter == null ? {} : { adapter: driverAdapter })
  } as PrismaClientOptions) as PrismaClientSingleton;

  return client;
}

/**
 * Initialize the Prisma client singleton.
 * Safe to call multiple times; returns the same instance.
 */
export function createPrismaClient(
  config: AdapterPrismaConfig = {}
): PrismaClientSingleton {
  if (prismaSingleton) return prismaSingleton;

  // Dev hot-reload guard
  const globalForPrisma = globalThis as unknown as {
    __adapterPrismaClient?: PrismaClientSingleton;
  };

  if (!globalForPrisma.__adapterPrismaClient) {
    globalForPrisma.__adapterPrismaClient = buildClient(config);
  }

  prismaSingleton = globalForPrisma.__adapterPrismaClient;
  return prismaSingleton;
}

export const prisma = createPrismaClient();

/**
 * Get the already-initialized Prisma client.
 * Throws if createPrismaClient has not been called yet.
 */
export function getPrisma(): PrismaClientSingleton {
  if (!prismaSingleton) {
    throw new Error(
      "[adapter-prisma] Prisma client not initialized. " +
        "Call createPrismaClient() during startup."
    );
  }
  return prismaSingleton;
}

/**
 * Convenience helper to run a function with the Prisma client.
 */
export async function withPrisma<T>(
  fn: (client: PrismaClientSingleton) => Promise<T> | T
): Promise<T> {
  const client = prismaSingleton ?? createPrismaClient();
  return await fn(client);
}

export type { PrismaClientSingleton as AdapterPrismaClient };
export type { Prisma };
export { resolvePrismaFromEnv } from "./env-config";
//export * from './client'