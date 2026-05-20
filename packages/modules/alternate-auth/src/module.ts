import { defineNuxtModule, addServerHandler, createResolver } from '@nuxt/kit'

export interface SocialProviderConfig {
  name: string
  clientId?: string
  clientSecret?: string
  scope?: string[]
  redirectURI?: string
}

export interface PluginConfig {
  name: string
  options?: Record<string, unknown>
}

export interface ModuleOptions {
  databaseProvider?: string
  databaseUrl?: string
  emailAndPassword?: boolean
  socialProviders?: SocialProviderConfig[]
  plugins?: PluginConfig[]
  authOptions?: Record<string, unknown>
}

export default defineNuxtModule<ModuleOptions>({
  meta: {
    name: 'alternate-auth',
    configKey: 'alternateAuth',
  },

  defaults: {
    databaseProvider: process.env.BETTER_AUTH_DATABASE_PROVIDER || 'sqlite',
    databaseUrl: process.env.BETTER_AUTH_DATABASE_URL || 'file:./auth.db',
    emailAndPassword: true,
    socialProviders: [],
    plugins: [],
    authOptions: {},
  },

  async setup(options, nuxt) {
    const resolver = createResolver(import.meta.url)

    //
    // ---------------------------------------------------------
    // 1. Inject Nitro externals so optional adapters NEVER break
    // ---------------------------------------------------------
    //
    const optionalDeps = [
      '@better-auth/better-sqlite3-adapter',
      '@better-auth/drizzle-adapter',
      '@better-auth/prisma-adapter',
      '@better-auth/pg-adapter',
      '@vercel/postgres',
      'better-sqlite3',
      'pg',
      'mongodb'
    ]

    nuxt.options.nitro = nuxt.options.nitro || {}
    nuxt.options.nitro.externals = nuxt.options.nitro.externals || {}

    nuxt.options.nitro.externals.external = [
      ...(nuxt.options.nitro.externals.external || []),
      ...optionalDeps
    ]

    //
    // ---------------------------------------------------------
    // 2. Silence Nitro warnings for missing optional deps
    // ---------------------------------------------------------
    //
    nuxt.options.nitro.rollupConfig = nuxt.options.nitro.rollupConfig || {}
    const existingOnWarn = nuxt.options.nitro.rollupConfig.onwarn

    nuxt.options.nitro.rollupConfig.onwarn = (warning, handler) => {
      if (
        warning.message?.includes('Could not resolve') &&
        optionalDeps.some(dep => warning.message.includes(dep))
      ) {
        return
      }
      if (existingOnWarn) return existingOnWarn(warning, handler)
      handler(warning)
    }

    //
    // ---------------------------------------------------------
    // 3. Pass config to Nitro runtime
    // ---------------------------------------------------------
    //
    nuxt.options.runtimeConfig.betterAuth = {
      provider: options.databaseProvider,
      url: options.databaseUrl,
      emailAndPassword: options.emailAndPassword,
      socialProviders: options.socialProviders,
      plugins: options.plugins,
      options: options.authOptions,
    }

    //
    // ---------------------------------------------------------
    // 4. Register the API route
    // ---------------------------------------------------------
    //
    addServerHandler({
      route: '/api/auth/[...all]',
      handler: resolver.resolve('./runtime/server/api/auth/[...all]'),
    })
  },
})
