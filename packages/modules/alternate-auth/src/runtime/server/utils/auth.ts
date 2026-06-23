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

type SocialProviderOptions = Record<string, string | string[] | undefined>
type PluginOptions = Record<string, unknown>

interface SocialProviderConfig {
  name: string
  clientId?: string
  clientSecret?: string
  [key: string]: unknown
}

interface BetterAuthConfig {
  socialProviders?: SocialProviderConfig[]
  plugins?: Array<{ name: string; options?: PluginOptions }>
  emailAndPassword?: boolean | { enabled?: boolean; autoSignIn?: boolean }
  options?: Record<string, unknown>
}

declare function useRuntimeConfig(): {
  betterAuth?: BetterAuthConfig
  auth?: { secret?: string }
  public: { auth?: { baseURL?: string } } & Record<string, unknown>
}

function getBetterAuthConfig() {
  return config.betterAuth || {}
}

// Build social providers from env/config
async function buildSocialProviders() {
  const providers: Record<string, SocialProviderOptions> = {}
  const betterAuthConfig = getBetterAuthConfig()

  const configs = betterAuthConfig.socialProviders || []

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
  const betterAuthConfig = getBetterAuthConfig()
  const configs = betterAuthConfig.plugins || []

  for (const pluginConfig of configs) {
    const plugin = await loadPlugin(pluginConfig.name, pluginConfig.options)
    if (plugin) plugins.push(plugin)
  }

  return plugins
}

async function loadPlugin(name: string, options: PluginOptions = {}) {
  // Core plugins from better-auth/plugins (use any to avoid type conflicts)
  const corePlugins = await import('better-auth/plugins')
  const {
    twoFactor,
    organization,
    username,
    magicLink,
    emailOTP,
    jwt,
    bearer,
    admin,
    oidcProvider,
  } = corePlugins

  // Use any type to avoid stricter type checking on plugin options
  const pluginMap: Record<string, (options?: any) => any> = {
    '2fa': twoFactor,
    'twoFactor': twoFactor,
    'organization': organization,
    'username': username,
    'magicLink': magicLink,
    'emailOTP': emailOTP,
    'jwt': jwt,
    'bearer': bearer,
    'admin': admin,
    'oidcProvider': oidcProvider,
    'oidc': oidcProvider,
  }

  // Handle plugins from separate packages (ESM exports, no .default)
  const separatePluginLoaders: Record<string, () => Promise<any>> = {
    'passkey': async () => import('@better-auth/passkey'),
    'apiKey': async () => import('@better-auth/api-key'),
    'sso': async () => import('@better-auth/sso'),
    'stripe': async () => import('@better-auth/stripe'),
  }

  const separatePluginLoader = separatePluginLoaders[name]
  if (separatePluginLoader) {
    const pluginModule = await separatePluginLoader()
    const plugin = pluginModule.default || pluginModule
    if (plugin) return plugin(options)
    return null
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
    provider: (process.env.BETTER_AUTH_DATABASE_PROVIDER || 'postgresql') as 'postgresql' | 'sqlite' | 'cockroachdb' | 'mysql' | 'sqlserver' | 'mongodb',
  }),

  baseURL: config.public.auth?.baseURL || process.env.BETTER_AUTH_URL,
  secret: config.auth?.secret || process.env.BETTER_AUTH_SECRET,

  // Dynamic social providers
  socialProviders,

  // Dynamic plugins array
  plugins: plugins as any,

  // Optional: email/password configuration
  emailAndPassword: getBetterAuthConfig().emailAndPassword !== false ? {
    enabled: true,
    autoSignIn: true,
  } : undefined,

  // Merge any additional options
  ...getBetterAuthConfig().options,
})

export function getAuth(event?: unknown) {
  return auth
}