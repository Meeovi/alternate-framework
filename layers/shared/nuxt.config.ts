import {
  fileURLToPath
} from 'node:url'
import {
  defineNuxtConfig
} from 'nuxt/config'
import {
  withAlternateUiNuxtConfig
} from '../../packages/modules/alternate-ui/src/shared-ui/nuxt/index'
import process from 'node:process'
import {
  createRequire
} from 'node:module'
import type {
  NuxtConfig
} from 'nuxt/schema'
import {
  useLayers
} from 'nuxt-layers-utils'
import {
  withAlternateUiNuxtConfig as applyAlternateUiNuxtConfig
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
const hasI18nModule = hasOptionalModule('@nuxtjs/i18n')
const hasPwaNuxtModule = hasOptionalModule('@vite-pwa/nuxt')
const hasApiClientNuxtModule = hasOptionalModule('@mframework/api-client/nuxt')
const enablePwaModule = (pwaDevEnabled || sw) && hasPwaNuxtModule
const resolveFromConfig = (path: string) => fileURLToPath(new URL(path, import.meta.url))
const enableSeoModule = isProd || process.env.SEO_DEV === 'true'

export default defineNuxtConfig(withAlternateUiNuxtConfig({
  $meta: {
    name: 'shared-nuxt',
    description: 'Nuxt-specific glue for alternate-* modules',
  },

  modules: [
    '@pinia/nuxt',
    '@vueuse/nuxt',
    'nuxt-security',
    '@nuxt/image',
    'vuetify-nuxt-module',
    ...(enableSeoModule ? ['@nuxtjs/seo'] : []),
    ...(hasI18nModule ? ['@nuxtjs/i18n'] : []),
    ...(enablePwaModule ? ['@vite-pwa/nuxt'] : []),
    ...(hasApiClientNuxtModule ? ['@mframework/api-client/nuxt'] : []),
  ],

  ...(hasI18nModule ? {
    i18n: {
      strategy: 'no_prefix',
      defaultLocale: defaultAlternateLocateLocale,
      locales: defaultAlternateLocateLocales,
    },
  } : {}),

  css: [
    '@mframework/alternate-media/styles/media.css',
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

  site: {
    url: `${process.env.NUXT_PUBLIC_SITE_URL || 'http://localhost:3000'}`,
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