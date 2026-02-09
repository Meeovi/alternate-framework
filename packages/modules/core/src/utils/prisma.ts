import { PrismaPg } from '@prisma/adapter-pg'
import type { PrismaClient as GeneratedPrismaClient } from '../../prisma/generated/prisma/client'

const prismaClientSingleton = () => {
  const pool = new PrismaPg({ connectionString: process.env.NUXT_DATABASE_URL! })
  // instantiate the generated Prisma client from this package
  const PrismaClientClass = require('../../prisma/generated/prisma/client').PrismaClient as typeof GeneratedPrismaClient
  return new PrismaClientClass({ adapter: pool })
}

type PrismaClientSingleton = ReturnType<typeof prismaClientSingleton>

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClientSingleton | undefined
}

export const prisma = globalForPrisma.prisma ?? prismaClientSingleton()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma

export const useDB = async (_event?: any) => {
  return prisma
}

export function isValidTable(name: string) {
  return typeof (prisma as any)[name] !== 'undefined'
}

export default prisma
