import {
  betterAuth
} from 'better-auth'
import { prismaAdapter } from "better-auth/adapters/prisma";
import { createRequire } from "node:module";

const appCwd = process.env.INIT_CWD || process.cwd();
const requireFromAppCwd = createRequire(`${appCwd}/package.json`);

type PrismaModule = { PrismaClient?: new (...args: any[]) => any }

function createClientFromModule(mod: PrismaModule | null | undefined) {
  const Client = mod?.PrismaClient
  if (!Client) return null

  const connectionString = process.env.NUXT_DATABASE_URL || process.env.DATABASE_URL || process.env.BETTER_AUTH_DATABASE_URL

  if (connectionString) {
    try {
      const { PrismaPg } = requireFromAppCwd("@prisma/adapter-pg")
      return new Client({
        adapter: new PrismaPg({ connectionString }),
      })
    } catch {
      // Fall through to default constructor.
    }
  }

  try {
    return new Client()
  } catch {
    return null
  }
}

async function resolvePrismaClient() {
  try {
    const mod = await import("@prisma/client") as PrismaModule;
    const client = createClientFromModule(mod)
    if (client) return client
  } catch {
    // Fall through to cwd-based resolve for linked workspace packages.
  }

  const mod = requireFromAppCwd("@prisma/client") as PrismaModule;
  const client = createClientFromModule(mod)
  if (client) return client

  throw new Error('Unable to initialize PrismaClient. Run "prisma generate" in the consuming app.');
}

const prisma = await resolvePrismaClient();
const config = useRuntimeConfig()

type SocialProviderOptions = Record < string, string | string[] | undefined >
  type PluginOptions = Record < string, unknown >
  type PluginFactory = (options ? : PluginOptions) => unknown

// Build social providers from env/config
async function buildSocialProviders() {
  const providers: Record < string, SocialProviderOptions > = {}

  const configs = config.betterAuth?.socialProviders || []

  for (const providerConfig of configs) {
    const {
      name,
      ...options
    } = providerConfig

    // Skip if no credentials (allows toggling via env)
    if (!options.clientId || !options.clientSecret) continue

    // Map provider name to config
    providers[name] = {
      ...options,
      // Allow env variable overrides
      clientId: options.clientId || process.env[`${name.toUpperCase()}_CLIENT_ID`],
      clientSecret: options.clientSecret || process.env[`${name.toUpperCase()}_CLIENT_SECRET`],
    }
  }

  return providers
}

// Dynamically load and configure plugins
async function buildPlugins() {
  const plugins: unknown[] = []
  const configs = config.betterAuth?.plugins || []

  for (const pluginConfig of configs) {
    const plugin = await loadPlugin(pluginConfig.name, pluginConfig.options)
    if (plugin) plugins.push(plugin)
  }

  return plugins
}

async function loadPlugin(name: string, options: PluginOptions = {}) {
  // Core plugins from better-auth/plugins
  const {
    twoFactor,
    organization,
    username,
    passkey,
    magicLink,
    emailOTP,
    jwt,
    bearer,
    admin,
    apiKey,
    sso,
    oidcProvider,
    stripe,
    // Add more as needed
  } = await import('better-auth/plugins')

  const pluginMap: Record < string, PluginFactory > = {
    '2fa': twoFactor,
    'twoFactor': twoFactor,
    'organization': organization,
    'username': username,
    'passkey': passkey,
    'magicLink': magicLink,
    'emailOTP': emailOTP,
    'jwt': jwt,
    'bearer': bearer,
    'admin': admin,
    'apiKey': apiKey,
    'sso': sso,
    'oidcProvider': oidcProvider,
    'stripe': stripe,
  }

  const pluginFn = pluginMap[name]
  if (!pluginFn) {
    console.warn(`[better-auth] Unknown plugin: ${name}`)
    return null
  }

  return pluginFn(options)
}

const socialProviders = await buildSocialProviders()
const plugins = await buildPlugins()

export const auth = betterAuth({
  experimental: {
    joins: true
  },

  database: prismaAdapter(prisma, {
    provider: `${process.env.BETTER_AUTH_DATABASE_PROVIDER}`,
  }),

  baseURL: config.public.auth?.baseURL || process.env.BETTER_AUTH_URL,
  secret: config.auth?.secret || process.env.BETTER_AUTH_SECRET,

  // Dynamic social providers
  socialProviders,

  // Dynamic plugins array
  plugins,

  // Optional: email/password configuration
  emailAndPassword: config.betterAuth?.emailAndPassword !== false ? {
    enabled: true,
    autoSignIn: true,
  } : undefined,

  // Merge any additional options
  ...config.betterAuth?.options,
})
