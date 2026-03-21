// adapter-auth/src/module.ts
import {
  defineNuxtModule,
  addServerHandler,
  addPlugin,
  addTemplate,
  addImportsDir,
  createResolver
} from '@nuxt/kit'

export interface AdapterAuthModuleOptions {
  /**
   * API route for Better Auth handler.
   * Recommended: `/api/auth/[...all]`
   */
  endpoint?: string

  /**
   * Public client config passed to better-auth/vue createAuthClient.
   * Exposed via runtimeConfig.public.adapterAuth.client.
   */
  client?: {
    baseURL?: string
    [key: string]: any
  }

  /**
   * Extra Better Auth server config merged into the default
   * Prisma + Masto + ATProto setup.
   *
   * Stored in runtimeConfig.adapterAuth.betterAuth and merged
   * in the generated server auth config.
   */
  betterAuth?: Record<string, any>

  /**
   * Import path for Prisma client.
   * Must export `prisma` (or override via prismaExportName).
   */
  prismaImportPath?: string

  /**
   * Export name for Prisma client from prismaImportPath.
   * Default: "prisma"
   */
  prismaExportName?: string
}

export default defineNuxtModule<AdapterAuthModuleOptions>({
  meta: {
    name: 'adapter-auth',
    configKey: 'adapterAuth'
  },
  defaults: {
    endpoint: '/api/auth/[...all]',
    client: {
      baseURL: '/api/auth'
    },
    betterAuth: {},
    prismaImportPath: '@mframework/core',
    prismaExportName: 'prisma'
  },
  setup(options, nuxt) {
    const resolver = createResolver(import.meta.url)

    // -----------------------------------------------------------------------
    // Runtime config wiring
    // -----------------------------------------------------------------------
    nuxt.options.runtimeConfig = nuxt.options.runtimeConfig || {}
    nuxt.options.runtimeConfig.adapterAuth = {
      ...(nuxt.options.runtimeConfig.adapterAuth || {}),
      betterAuth: options.betterAuth || {},
      endpoint: options.endpoint,
      prismaImportPath: options.prismaImportPath,
      prismaExportName: options.prismaExportName
    }

    nuxt.options.runtimeConfig.public = nuxt.options.runtimeConfig.public || {}
    nuxt.options.runtimeConfig.public.adapterAuth = {
      ...(nuxt.options.runtimeConfig.public.adapterAuth || {}),
      client: options.client || {}
    }

    // -----------------------------------------------------------------------
    // Generated server auth instance (virtual import: #adapter-auth/server)
    // -----------------------------------------------------------------------
    const authConfigTemplate = addTemplate({
      filename: 'adapter-auth.server.ts',
      getContents: () => {
        const prismaImportPath = options.prismaImportPath || '@mframework/core'
        const prismaExportName = options.prismaExportName || 'prisma'

        return `import { auth } from 'better-auth'
import { prismaAdapter } from 'better-auth/adapters/prisma'
import { mastodon, atproto } from 'better-auth/plugins'
import { useRuntimeConfig } from '#imports'
import { ${prismaExportName} } from '${prismaImportPath}'

/**
 * Adapter Auth server instance.
 *
 * - Uses Prisma from ${prismaImportPath} (${prismaExportName})
 * - Enables Masto + ATProto plugins
 * - Merges extra Better Auth config from runtimeConfig.adapterAuth.betterAuth
 */
export const adapterAuth = (() => {
  const config = useRuntimeConfig()

  const baseConfig = {
    // You can override these via runtimeConfig.adapterAuth.betterAuth
    // or environment variables (e.g. BETTER_AUTH_SECRET, BETTER_AUTH_URL).
    database: prismaAdapter(${prismaExportName}),
    plugins: [
      mastodon(),
      atproto()
    ]
  }

  const mergedConfig = {
    ...baseConfig,
    ...(config.adapterAuth?.betterAuth || {})
  }

  return auth(mergedConfig)
})()
`
      }
    })

    nuxt.options.alias = nuxt.options.alias || {}
    nuxt.options.alias['#adapter-auth/server'] = authConfigTemplate.dst

    // -----------------------------------------------------------------------
    // Generated server API handler for Better Auth
    // -----------------------------------------------------------------------
    const handlerTemplate = addTemplate({
      filename: 'adapter-auth.handler.ts',
      getContents: () => `import { defineEventHandler } from 'h3'
import { toWebRequest } from 'better-auth/nuxt'
import { adapterAuth } from '#adapter-auth/server'

/**
 * Nuxt server API handler that forwards requests to Better Auth.
 */
export default defineEventHandler((event) => {
  return adapterAuth.handler(toWebRequest(event))
})
`
    })

    addServerHandler({
      route: options.endpoint || '/api/auth/[...all]',
      handler: handlerTemplate.dst
    })

    // -----------------------------------------------------------------------
    // Generated client plugin for better-auth/vue
    // -----------------------------------------------------------------------
    const clientPluginTemplate = addTemplate({
      filename: 'adapter-auth.client.ts',
      getContents: () => `import { defineNuxtPlugin, useRuntimeConfig } from '#app'
import { createAuthClient } from 'better-auth/vue'

/**
 * Injects $authClient (Better Auth Vue client) into the Nuxt app.
 *
 * Config is read from runtimeConfig.public.adapterAuth.client.
 */
export default defineNuxtPlugin(() => {
  const config = useRuntimeConfig()
  const clientConfig = config.public.adapterAuth?.client || {}

  const authClient = createAuthClient({
    baseURL: clientConfig.baseURL || '/api/auth',
    ...clientConfig
  })

  return {
    provide: {
      authClient
    }
  }
})
`
    })

    addPlugin({
      src: clientPluginTemplate.dst,
      mode: 'all'
    })

    // -----------------------------------------------------------------------
    // Generated composables: useAdapterAuthClient, useAdapterAuthSession
    // -----------------------------------------------------------------------
    const composablesDir = addTemplate({
      // This is just a marker so we can resolve the directory;
      // actual composables are separate templates below.
      filename: 'adapter-auth.composables.index.ts',
      getContents: () => `// Generated by adapter-auth module`
    })

    // useAdapterAuthClient
    const useClientComposable = addTemplate({
      filename: 'composables/useAdapterAuthClient.ts',
      getContents: () => `import { useNuxtApp } from '#app'

/**
 * Access the Better Auth Vue client injected as $authClient.
 */
export const useAdapterAuthClient = () => {
  const nuxtApp = useNuxtApp()
  return nuxtApp.$authClient
}
`
    })

    // useAdapterAuthSession
    const useSessionComposable = addTemplate({
      filename: 'composables/useAdapterAuthSession.ts',
      getContents: () => `import { useAdapterAuthClient } from './useAdapterAuthClient'

/**
 * Convenience composable for accessing the Better Auth session.
 * Relies on authClient.useSession() from better-auth/vue.
 */
export const useAdapterAuthSession = () => {
  const authClient = useAdapterAuthClient()
  const session = authClient.useSession()
  return session
}
`
    })

    // Register composables directory for auto-imports
    addImportsDir(resolver.resolve(composablesDir.dst, '..', 'composables'))

    // -----------------------------------------------------------------------
    // Type augmentation for $authClient
    // -----------------------------------------------------------------------
    const typesTemplate = addTemplate({
      filename: 'adapter-auth.d.ts',
      getContents: () => `import type { AuthClient } from 'better-auth/vue'

declare module '#app' {
  interface NuxtApp {
    $authClient: AuthClient
  }
}

declare module 'vue' {
  interface ComponentCustomProperties {
    $authClient: AuthClient
  }
}
`
    })

    nuxt.options.typescript = nuxt.options.typescript || {}
    nuxt.options.typescript.tsConfig = nuxt.options.typescript.tsConfig || {}
    const include = (nuxt.options.typescript.tsConfig.include ||= [])
    if (!include.includes(typesTemplate.dst)) {
      include.push(typesTemplate.dst)
    }
  }
})