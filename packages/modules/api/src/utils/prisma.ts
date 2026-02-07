import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient } from '../../../../../layers/shared/prisma/generated/client'

const prismaClientSingleton = () => {
  const pool = new PrismaPg({ connectionString: process.env.NUXT_DATABASE_URL! })
  return new PrismaClient({ adapter: pool })
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
