import "dotenv/config"
import { betterAuth } from "better-auth"
import { prismaAdapter } from "better-auth/adapters/prisma"

// Create and export the BetterAuth runtime instance when possible. Attempt
// to dynamically import the centralized Prisma client from `@mframework/core`.
// If `@mframework/core` is not present, avoid throwing and export `auth` as
// undefined; callers can create the auth instance manually.
export let auth: any

(async () => {
  try {
    const core = await import('@mframework/core')
    const prisma = core.prisma
    auth = betterAuth({
      experimental: { joins: true },
      database: prismaAdapter(prisma as any, { provider: 'postgresql' }),
      emailAndPassword: { enabled: true }
    })
  } catch (e) {
    // `@mframework/core` not available at runtime — leave `auth` undefined.
  }
})()

export type Auth = typeof auth
