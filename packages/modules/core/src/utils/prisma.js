import { PrismaPg } from '@prisma/adapter-pg';
const prismaClientSingleton = () => {
    const pool = new PrismaPg({ connectionString: process.env.NUXT_DATABASE_URL });
    // instantiate the generated Prisma client from this package
    const PrismaClientClass = require('../../prisma/generated/prisma/client').PrismaClient;
    return new PrismaClientClass({ adapter: pool });
};
const globalForPrisma = globalThis;
export const prisma = globalForPrisma.prisma ?? prismaClientSingleton();
if (process.env.NODE_ENV !== 'production')
    globalForPrisma.prisma = prisma;
export const useDB = async (_event) => {
    return prisma;
};
export function isValidTable(name) {
    return typeof prisma[name] !== 'undefined';
}
export default prisma;
