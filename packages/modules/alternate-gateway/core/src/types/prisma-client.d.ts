declare module 'alternate-gateway/core/prisma' {
  // Re-export the generated PrismaClient type from the shared generated client
  import type { PrismaClient as GeneratedPrismaClient } from '../../prisma/generated/client'
  
  export type PrismaClient = GeneratedPrismaClient
  export { GeneratedPrismaClient as PrismaClient }
}
