import { existsSync } from 'node:fs'
import {
  resolve
} from 'path'
import {
  defineNuxtConfig
} from 'nuxt/config'
import vuetify from 'vite-plugin-vuetify'

// Default PWA icons: the public/icons/ set every app ships. An app that
// lists its own icons replaces these.
const defaultPwaIcons = [
  { src: '/icons/icon-96x96.png', sizes: '96x96', type: 'image/png' },
  { src: '/icons/icon-192x192.png', sizes: '192x192', type: 'image/png' },
  { src: '/icons/icon-192x192.maskable.png', sizes: '192x192', type: 'image/png', purpose: 'maskable' },
  { src: '/icons/icon-512x512.png', sizes: '512x512', type: 'image/png' },
  { src: '/icons/icon-512x512.maskable.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
]

const sw = process.env.SW === 'true'
const pwaDevEnabled = process.env.PWA_DEV === 'true'

export default defineNuxtConfig({
  $meta: {
    name: 'ui-shell',
    description: 'UI Shell Layer is the UI structure for all applications and websites.',
  },
  devtools: { enabled: true },

  alias: {
    '@mframework/meeovi-forms': resolve(__dirname, '../../packages/plugins/Marketing-SEO/meeovi-forms/src'),
    '@mframework/meeovi-forms/': resolve(__dirname, '../../packages/plugins/Marketing-SEO/meeovi-forms/src/'),
  },

  modules: [
    '@nuxt/image',
    // Layer config arrays are concatenated, so an app's pwa.manifest.icons
    // arrive followed by defaultPwaIcons. Keep the app's list when it has
    // one. Must run before @vite-pwa/nuxt, which copies its options on setup.
    (_options: unknown, nuxt: any) => {
      const manifest = nuxt.options.pwa?.manifest
      if (!manifest?.icons) return
      const isDefault = (icon: { src: string, purpose?: string }) =>
        defaultPwaIcons.some(d => d.src === icon.src && d.purpose === icon.purpose)
      const own = manifest.icons.filter((icon: any) => !isDefault(icon))
      manifest.icons = own.length ? own : defaultPwaIcons
    },
    '@vite-pwa/nuxt',
    '@nuxt/fonts',
    '@storefront-ui/nuxt',
    // Every layout lives in this layer's app/layouts/. Each app picks its
    // own in its nuxt.config:
    //   appConfig: { uiShell: { layout: 'starter', layouts: ['auth'], aliases: { nolive: 'starter' } } }
    // `layout` becomes the app's `default`; `layouts` are the other ones its
    // pages use (auth for the auth layer's pages, search for /search…);
    // `aliases` serve a layer page's layout name with another shell layout.
    // Everything else here is dropped from the app's build — those layouts
    // import layers (#social, #shared…) and files other apps don't have.
    // A layout the app itself defines always wins.
    (_options: unknown, nuxt: any) => {
      const shellLayouts = resolve(__dirname, 'app/layouts')
      nuxt.hook('app:resolve', (app: { layouts: Record<string, { name: string, file: string }> }) => {
        const { layout, layouts = [], aliases = {} } = nuxt.options.appConfig?.uiShell || {}
        if (!layout) return
        const wanted: Record<string, string> = { ...aliases }
        for (const name of [layout, ...layouts]) wanted[name] = name
        const appOwn = (name: string) => app.layouts[name]?.file.startsWith(nuxt.options.srcDir)
        for (const [name, entry] of Object.entries(app.layouts)) {
          if (entry.file.startsWith(shellLayouts) && !appOwn(name)) delete app.layouts[name]
        }
        for (const [name, source] of Object.entries(wanted)) {
          const file = resolve(shellLayouts, `${source}.vue`)
          if (!existsSync(file)) throw new Error(`[ui-shell] layout "${source}" (wanted as "${name}") not found in ${shellLayouts}`)
          if (!appOwn(name)) app.layouts[name] = { name, file }
        }
        app.layouts.default = { ...app.layouts[layout]!, name: 'default' }
      })
    },
  ],

  // @ts-ignore - @nuxtjs/fonts module augments this key at runtime
  fonts: {
    priority: ['bunny', 'google'],
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
      icons: defaultPwaIcons,
    },
    workbox: {
      globPatterns: ['**/*.{js,css,html,png,svg,ico}'],
      maximumFileSizeToCacheInBytes: 5 * 1024 * 1024,
      // @vite-pwa/nuxt defaults this to /_nuxt/, precaching every chunk with
      // `revision: null` on the assumption that its filename hash covers its
      // content. It doesn't: Rolldown can rewrite a chunk's import list
      // without renaming it, so returning visitors kept the previous build's
      // copy forever and the nuxt-security SRI check blocked it ("Failed to
      // fetch dynamically imported module"). A never-matching pattern makes
      // Workbox revision every file by its content hash instead.
      dontCacheBustURLsMatching: /^$/,
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

  // The service worker and web manifest must always be revalidated: a CDN
  // (Cloudflare caches .js by default) or browser holding an old sw.js keeps
  // visitors on the previous build's precache after a deploy.
  routeRules: {
    '/sw.js': { headers: { 'cache-control': 'no-cache, no-store, must-revalidate' } },
    '/manifest.webmanifest': { headers: { 'cache-control': 'no-cache, no-store, must-revalidate' } },
  },

  build: {
    transpile: [
      'vuetify',
      '@svar-ui/vue-grid',
      '@svar-ui/vue-editor',
      '@svar-ui/vue-core',
    ],
  },

  vite: {
    optimizeDeps: {
      // `vuetify` itself stays excluded (unchanged) — bundling the bare
      // package alongside vite-plugin-vuetify's autoImport risks two
      // separate Vuetify instances (createVuetify() called once per
      // instance means duplicate theme/locale/icon state). But autoImport
      // doesn't import from `vuetify` at all — it rewrites `<v-btn>` etc.
      // into imports from `vuetify/components`/`vuetify/directives`, and
      // those subpaths were NOT excluded, so Vite discovered Vuetify's
      // ~800 individual component/composable/CSS files one at a time,
      // cold, on whichever route first used them — each newly-discovered
      // file triggered a fresh "Re-optimizing dependencies" + full-reload
      // cycle, which raced and cancelled the page's own in-flight
      // requests (ERR_NETWORK_CHANGED on dozens of files at once).
      // Pre-bundling these subpaths as a single unit up front removes the
      // cold, incremental discovery entirely — confirmed live 2026-09-16
      // reproducing on first visits to layers/business's dashboard pages.
      exclude: ['vuetify'],
      include: ['vuetify/components', 'vuetify/directives', 'vuetify/labs/components'],
    },
    logLevel: 'info',
    plugins: [
      // @ts-ignore
      vuetify({
        autoImport: true
      }),
    ],
    resolve: {
      dedupe: ['vue', 'vue-router'],
      alias: {
        // @jsonforms/vue-vuetify@3.x (used by @mframework/meeovi-forms) imports
        // VStepperVertical from Vuetify's `labs` entrypoint. In Vuetify 4 the
        // component graduated to stable with the same public API, and the labs
        // path no longer exists — remap it so the dependency resolves.
        'vuetify/labs/VStepperVertical': 'vuetify/components/VStepperVertical',
      }
    },
    vue: {
      template: {
        compilerOptions: {
          // The top-level `vue.compilerOptions` Nuxt config below isn't
          // forwarded to @vitejs/plugin-vue in this Nuxt version, so the
          // video-player/media-* custom elements never resolved without
          // this duplicate, Vite-level passthrough. paypal-* are the PayPal
          // v6 SDK's buttons (checkout.vue).
          isCustomElement: (tag: string) =>
            tag.startsWith('video-') ||
            tag.startsWith('media-') ||
            tag.startsWith('paypal-') ||
            tag.endsWith('-video')
        }
      }
    },
  },
})
