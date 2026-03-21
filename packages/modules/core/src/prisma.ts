// Minimal runtime-safe `prisma` re-export for monorepo typechecks.
// Real projects should replace this with the real Prisma client export,
// e.g. `export { prisma } from '~/server/prisma'` or similar.
export const prisma: any = {} as any

export type PrismaClientLike = any

export default prisma
