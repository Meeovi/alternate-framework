import { PrismaPg } from '@prisma/adapter-pg';
const globalForPrisma = globalThis;
let prismaInstance;
/**
 * Initialize Prisma with a PrismaClient instance from the consuming app.
 * This must be called once during app initialization with the generated client.
 *
 * @param PrismaClientClass - The generated PrismaClient class from the consuming app
 * @returns The initialized Prisma instance
 *
 * @example
 * import { initializePrisma } from 'alternate-gateway/core'
 * import { PrismaClient } from '@prisma/client'
 *
 * export default defineNuxtPlugin(() => {
 *   initializePrisma(PrismaClient)
 * })
 */
export function initializePrisma(PrismaClientClass) {
    // Return existing instance if already initialized
    if (prismaInstance) {
        return prismaInstance;
    }
    if (globalForPrisma.__mframework_prisma) {
        prismaInstance = globalForPrisma.__mframework_prisma;
        return prismaInstance;
    }
    // Ensure DATABASE_URL or NUXT_DATABASE_URL is available
    const databaseUrl = process.env.DATABASE_URL || process.env.NUXT_DATABASE_URL;
    if (!databaseUrl) {
        throw new Error('[alternate-gateway/core] Neither DATABASE_URL nor NUXT_DATABASE_URL environment variable is set. ' +
            'Prisma requires a database connection string.');
    }
    // Create PostgreSQL connection pool adapter
    const pool = new PrismaPg({ connectionString: databaseUrl });
    // Instantiate the Prisma client with the adapter
    const instance = new PrismaClientClass({ adapter: pool });
    // Store in global for reuse in non-production environments
    if (process.env.NODE_ENV !== 'production') {
        globalForPrisma.__mframework_prisma = instance;
    }
    prismaInstance = instance;
    return instance;
}
/**
 * Get the initialized Prisma instance.
 * Throws if Prisma hasn't been initialized yet.
 *
 * @returns The Prisma client instance
 * @throws Error if Prisma hasn't been initialized
 */
export function getPrisma() {
    if (!prismaInstance && !globalForPrisma.__mframework_prisma) {
        throw new Error('[alternate-gateway/core] Prisma not initialized. ' +
            'Call initializePrisma() with your generated PrismaClient during app startup (e.g., in a Nuxt plugin).');
    }
    return prismaInstance || globalForPrisma.__mframework_prisma;
}
/**
 * Database helper for server routes and composables
 * @param _event - Optional Nuxt event context
 * @returns The Prisma client instance
 */
export const useDB = async (_event) => {
    return getPrisma();
};
/**
 * Check if a table exists in the Prisma schema
 * @param name - The table/model name to check
 * @returns true if the table exists, false otherwise
 */
export function isValidTable(name) {
    try {
        const prisma = getPrisma();
        return typeof prisma[name] !== 'undefined';
    }
    catch {
        // Prisma not initialized yet
        return false;
    }
}
/**
 * Default export - alias for getPrisma()
 * @deprecated Use getPrisma() or useDB() instead
 */
export const prisma = new Proxy({}, {
    get() {
        return getPrisma();
    }
});
export default getPrisma;
