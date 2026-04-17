import {
  fileURLToPath
} from 'node:url'
import {
  defineNuxtConfig
} from 'nuxt/config'
import process from 'node:process'
import {
  createRequire
} from 'node:module'
import {
  withAlternateUiNuxtConfig
} from 'alternate-ui/nuxt'
import {
  defaultAlternateLocateLocale,
  defaultAlternateLocateLocales,
} from 'alternate-locate/adapters/nuxt/i18n'

const require = createRequire(import.meta.url)

function hasOptionalModule(name: string): boolean {
  try {
    require.resolve(name)
    return true
  } catch {
    return false
  }
}

const sw = process.env.SW === 'true'
const pwaDevEnabled = process.env.PWA_DEV === 'true'
const isProd = process.env.NODE_ENV === 'production'
const disabledDevModules = new Set(
  String(process.env.NUXT_DEV_DISABLE_MODULES || '')
    .split(',')
    .map(name => name.trim())
    .filter(Boolean)
)
const hasI18nModule = hasOptionalModule('@nuxtjs/i18n')
const hasPwaNuxtModule = hasOptionalModule('@vite-pwa/nuxt')
const hasApiClientNuxtModule = hasOptionalModule('@mframework/api-client/nuxt')
const enablePwaModule = (pwaDevEnabled || sw) && hasPwaNuxtModule
const resolveFromConfig = (path: string) => fileURLToPath(new URL(path, import.meta.url))
const enableSeoModule = isProd
const disableSharedPlugins = process.env.NUXT_DEV_DISABLE_SHARED_PLUGINS === 'true'
const disableSharedMiddleware = process.env.NUXT_DEV_DISABLE_SHARED_MIDDLEWARE === 'true'
const useMinimalSharedConfig = process.env.NODE_ENV === 'development' && process.env.NUXT_DEV_SHARED_MINIMAL === 'true'

const minimalSharedConfig = {
  $meta: {
    name: 'shared-nuxt-minimal',
    description: 'Minimal shared layer config for dev isolation',
  },
}

const withModuleFilter = (modules: string[]) => {
  if (process.env.NODE_ENV !== 'development' || disabledDevModules.size === 0) {
    return modules
  }
  return modules.filter(moduleName => !disabledDevModules.has(moduleName))
}

export default defineNuxtConfig(useMinimalSharedConfig ? minimalSharedConfig : withAlternateUiNuxtConfig({
  $meta: {
    name: 'shared-nuxt',
    description: 'Nuxt-specific glue for alternate-* modules',
  },

  modules: withModuleFilter([
    '@pinia/nuxt',
    '@vueuse/nuxt',
    'nuxt-security',
    '@nuxt/image',
    'vuetify-nuxt-module',
    ...(enableSeoModule ? ['@nuxtjs/seo'] : []),
    ...(hasI18nModule ? ['@nuxtjs/i18n'] : []),
    ...(enablePwaModule ? ['@vite-pwa/nuxt'] : []),
    ...(hasApiClientNuxtModule ? ['@mframework/api-client/nuxt'] : []),
  ]),

  ...(hasI18nModule ? {
    i18n: {
      strategy: 'no_prefix' as const,
      defaultLocale: defaultAlternateLocateLocale,
      locales: defaultAlternateLocateLocales.map(locale => ({ ...locale })),
    },
  } : {}),

  css: [
    'alternate-media/styles/media.css',
    resolveFromConfig('./assets/css/ui.css'),
    resolveFromConfig('./assets/css/media.css'),
    resolveFromConfig('./assets/css/search.css'),
    resolveFromConfig('./assets/css/locate.css'),
  ],

  // Nuxt 4 auto-registers layer plugins from app/plugins.
  // Keeping plugin definitions in app/plugins avoids custom path wiring.
  imports: {
    dirs: ['./runtime/composables'],
  },

  ...(process.env.NODE_ENV === 'development' && (disableSharedPlugins || disableSharedMiddleware) ? {
    ignore: [
      ...(disableSharedPlugins ? ['./app/plugins/**'] : []),
      ...(disableSharedMiddleware ? ['./app/middleware/**'] : []),
    ],
  } : {}),

  site: {
    url: `${process.env.NUXT_PUBLIC_SITE_URL || 'https://example.com'}`,
    name: `${process.env.NUXT_PUBLIC_SITE_NAME || 'M Framework Starter Template'}`,
    description: `${process.env.NUXT_PUBLIC_SITE_DESCRIPTION || 'Welcome to my awesome site!'}`,
  },

  pwa: {
    strategies: sw ? 'injectManifest' : 'generateSW',
    srcDir: sw ? 'service-worker' : undefined,
    filename: sw ? 'sw.ts' : undefined,
    registerType: 'autoUpdate',
    manifest: {
      name: process.env.NUXT_PUBLIC_SITE_NAME || 'M Framework Starter Template',
      short_name: process.env.NUXT_PUBLIC_SITE_NAME || 'M Framework Starter Template',
      theme_color: '#ffffff',
      icons: [{
          src: 'pwa-192x192.png',
          sizes: '192x192',
          type: 'image/png',
        },
        {
          src: 'pwa-512x512.png',
          sizes: '512x512',
          type: 'image/png',
        },
        {
          src: 'pwa-512x512.png',
          sizes: '512x512',
          type: 'image/png',
          purpose: 'any maskable',
        },
      ],
    },
    workbox: {
      globPatterns: ['**/*.{js,css,html,png,svg,ico}'],
      maximumFileSizeToCacheInBytes: 5 * 1024 * 1024,
    },
    injectManifest: {
      globPatterns: ['**/*.{js,css,html,png,svg,ico}'],
    },
    client: {
      installPrompt: true,
      // you don't need to include this: only for testing purposes
      // if enabling periodic sync for update use 1 hour or so (periodicSyncForUpdates: 3600)
      periodicSyncForUpdates: 20,
    },

    devOptions: {
      enabled: pwaDevEnabled,
      suppressWarnings: true,
      navigateFallback: '/',
      navigateFallbackAllowlist: [/^\/$/],
      type: 'module',
    },
  },

  security: {
    enabled: process.env.NODE_ENV === 'production',
    rateLimiter: process.env.NODE_ENV === 'production' ? {
      tokensPerInterval: 150,
      interval: 60 * 1000,
      throwError: true,
      headers: true,
    } : false,
    headers: {
      contentSecurityPolicy: false as
      const,
      strictTransportSecurity: {
        maxAge: 0,
      },
      crossOriginOpenerPolicy: false as
      const,
      crossOriginEmbedderPolicy: false as
      const,
      permissionsPolicy: false as
      const,
    },
  },

  includeCoreStyles: false,
  includeStorefrontStyles: true,
  includeStorefrontModule: true,

  vite: {
    optimizeDeps: {
      include: []
    }
  },

  nitro: {
    compressPublicAssets: true,
    experimental: {
      wasm: true,
    },
  },
}))