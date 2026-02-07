import "dotenv/config"
import { betterAuth } from "better-auth"
import { prismaAdapter } from "better-auth/adapters/prisma"
import { prisma } from "@mframework/api"

// Create and export the BetterAuth runtime instance using the centralized
// Prisma client exported from packages/modules/api. Layers can import `auth`
// from this package to get the configured auth instance.
export const auth = betterAuth({
  experimental: { joins: true },
  database: prismaAdapter(prisma as any, { provider: 'postgresql' }),
  emailAndPassword: { enabled: true }
})

export type Auth = typeof auth
