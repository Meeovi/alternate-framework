import {
  resolve
} from 'path'
import {
  defineNuxtConfig
} from 'nuxt/config'
import process from 'node:process'
import { createRequire } from 'node:module'
import vuetify from 'vite-plugin-vuetify'

const sw = process.env.SW === 'true'
const pwaDevEnabled = process.env.PWA_DEV === 'true'

// @novu/js's package.json "exports" map doesn't list "./dist/index.css" as
// a subpath (confirmed: `node -e "require.resolve('@novu/js/dist/index.css')"`
// throws ERR_PACKAGE_PATH_NOT_EXPORTED), so a plain `import '@novu/js/dist/
// index.css'` in application code would fail under Vite's resolver too —
// without it, the notification bell widget mounts with correct structure
// but zero styling (every `nt-*`/`nv-*` utility class and the bell icon's
// SVG gradient resolve to nothing: a shrunk, black icon and an
// un-positioned popover that pushes into the header's layout instead of
// overlaying it — confirmed live 2026-09-16). Resolving the package's own
// root export (".", which IS in the exports map) and deriving the CSS
// path from there — rather than hardcoding an absolute filesystem path —
// keeps this portable across machines/CI; the `resolve.alias` entry below
// then lets application code use the normal-looking bare specifier, with
// Vite substituting this real path before Node's exports enforcement ever
// applies (alias resolution happens first).
const novuCssPath = (() => {
  try {
    const require = createRequire(import.meta.url)
    const novuEntry = require.resolve('@novu/js')
    return novuEntry.replace(/dist[\\/].*$/, 'dist/index.css')
  } catch {
    return null
  }
})()

/**
 * The site-wide Content-Security-Policy header (applied via routeRules).
 *
 * Only the directives listed here are enforced; anything not named is
 * unrestricted. `connect-src` is the tight one — every host the browser is
 * allowed to fetch/beacon/WebSocket to has to be enumerated, so a new
 * integration that talks to its own API from the client (Sentry, Coral,
 * analytics pixels, …) must be added here or it fails silently.
 */
function buildContentSecurityPolicy(): string {
  const httpsOrigin = (url?: string) => (url ? url.replace(/^https?:/, 'https:') : '')
  const wssOrigin = (url?: string) => (url ? url.replace(/^https?:\/\//, 'wss://').replace(/\/$/, '') : '')

  const directusHttps = httpsOrigin(process.env.DIRECTUS_URL)
  const coralHttps = httpsOrigin(process.env.CORAL_SERVER_URL)
  const coralWss = wssOrigin(process.env.CORAL_SERVER_URL)

  // Self-hosted Novu (/home/meebuzo/github/novu) is plain http:// on a raw
  // IP, not https:// like the others above — httpsOrigin() would rewrite
  // the scheme to something nothing is actually listening on, so these are
  // used as-is. NOVU_WEBSOCKET_HOSTNAME is given as http:// too (matches
  // its own container's exposed port) but the client opens it as a
  // WebSocket, and Novu's socket.io client also polls over plain http
  // before upgrading — both schemes need to be allowed for that host.
  const novuApi = process.env.NOVU_API_HOSTNAME || ''
  const novuWs = process.env.NOVU_WEBSOCKET_HOSTNAME || ''
  const novuWss = novuWs.replace(/^https?:\/\//, 'ws://')

  // Analytics / marketing tag endpoints. Google Tag Manager (configured
  // with a real container id) can itself load any of these downstream, and
  // the @nuxt/scripts registry entries below (Bing UET, and the pixel
  // stubs) beacon to them directly — without these, every one was blocked
  // with a console CSP violation on every page.
  const analyticsHosts = [
    'https://www.googletagmanager.com',
    'https://*.google-analytics.com',
    'https://*.analytics.google.com',
    'https://www.google.com',
    'https://googleads.g.doubleclick.net',
    'https://td.doubleclick.net',
    'https://bat.bing.com',
    'https://analytics.tiktok.com',
    'https://*.tiktok.com',
    'https://*.reddit.com',
    'https://tr.snapchat.com',
    'https://analytics.twitter.com',
    'https://static.ads-twitter.com',
    'https://t.co',
    'https://srv.carbonads.net',
    'https://cdn.carbonads.com',
  ]

  const connectSrc = [
    "'self'",
    'https://*.mux.com',
    // Covers every regional Sentry ingest host (o<org>.ingest.us.sentry.io,
    // .ingest.de.sentry.io, …) — without it every error report is dropped.
    'https://*.sentry.io',
    directusHttps,
    coralHttps,
    coralWss,
    novuApi,
    novuWs,
    novuWss,
    ...analyticsHosts,
  ].filter(Boolean).join(' ')

  return [
    // Videos come from Mux (streamed) or straight from Directus assets
    // (layers/social's shorts.video); media-src previously only allowed Mux.
    `media-src 'self' blob: https://stream.mux.com ${directusHttps};`,
    "worker-src 'self' blob:;", // parsing engines that run on workers
    `connect-src ${connectSrc};`,
    // Defence-in-depth directives that don't need a per-integration
    // allowlist and carry near-zero breakage risk. A real `script-src` /
    // `default-src` still needs a dedicated hardening pass (Vuetify + GTM
    // + Nuxt inline hydration make a strict one non-trivial).
    //  - object-src 'none': kills the <object>/<embed> plugin XSS vector.
    //  - base-uri 'self': stops an injected <base> tag rewriting every
    //    relative URL on the page to an attacker origin.
    //  - frame-ancestors 'self': clickjacking (belt-and-braces alongside
    //    nuxt-security's default X-Frame-Options: SAMEORIGIN).
    //  - form-action: 'self' plus the payment redirect targets that
    //    legitimately receive a form POST (PayPal classic checkout).
    "object-src 'none';",
    "base-uri 'self';",
    "frame-ancestors 'self';",
    "form-action 'self' https://www.paypal.com https://www.sandbox.paypal.com https://checkout.stripe.com;",
  ].join(' ')
}

export default defineNuxtConfig({
  $meta: {
    name: 'shared',
    description: 'Nuxt-specific glue for alternate-* modules',
  },

  app: {
    head: {
      script: [{
          innerHTML: `
            window._cyA11yConfig = {
              "iconId": "default",
              "position": { "mobile": "bottom-right", "desktop": "bottom-left" },
              "language": { "default": "en", "selected": [] },
              "modules": { "statement": { "enabled": true, "url": "https://meeovi.com/accessibility" } },
              "keyboard": { "enabled": true, "shortcut": "alt+a" }
            };
          `,
          type: 'text/javascript',
          tagPosition: 'bodyClose'
        },
        {
          src: 'https://cdn-cookieyes.com/widgets/accessibility.js?id=39a5baae-e2fd-4b95-8f39-ffeca39a37da',
          async: true,
          tagPosition: 'bodyClose'
        },
        {
          src: 'https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-3854548303717312',
          async: true,
          crossorigin: 'anonymous'
        }
      ]
    }
  },

  alias: {
    '@mframework/meeovi-forms': resolve(__dirname, '../../packages/plugins/meeovi-forms/src/index.ts'),
    '@mframework/meeovi-forms/': resolve(__dirname, '../../packages/plugins/meeovi-forms/src/'),
  },

  // Shared components are not auto-registered: every consumer imports them
  // by path (#shared/app/components/...). The previous `path: 'app/components'`
  // resolved against this layer's srcDir (already app/), i.e. the nonexistent
  // app/app/components, so it never registered anything anyway.
  components: {
    dirs: []
  },

  modules: [
    '@vueuse/nuxt',
    'nuxt-security',
    '@nuxt/image',
    '@vueuse/motion/nuxt',
    '@nuxtjs/seo',
    '@nuxtjs/i18n',
    '@vite-pwa/nuxt',
    '@nuxtjs/turnstile',
    '@nuxtjs/leaflet',
    '@nuxt/scripts',
    '@nuxt/fonts',
    '@nuxtjs/mcp-toolkit',
    '@storefront-ui/nuxt',
    resolve(__dirname, '../../packages/plugins/meeovi-forms/module.ts'),
    resolve(__dirname, '../../packages/plugins/experience-builder/module.ts'),
    'nuxt-skill-hub'
  ],

  // @ts-ignore - @nuxtjs/fonts module augments this key at runtime
  fonts: {
    priority: ['bunny', 'google'],
  },

  // @ts-ignore - @nuxtjs/seo module augments this key at runtime
  seo: {
    meta: {
      // Basic SEO
      description: `${process.env.NUXT_PUBLIC_SITE_DESCRIPTION || 'Welcome to my awesome site!'}`,
      author: `${process.env.NUXT_PUBLIC_SITE_AUTHOR || 'John Doe'}`,

      // Theme & Color
      themeColor: [{
          content: '#18181b',
          media: '(prefers-color-scheme: dark)'
        },
        {
          content: 'white',
          media: '(prefers-color-scheme: light)'
        },
      ],
      colorScheme: 'dark light',

      // Social Media
      twitterCreator: `${process.env.NUXT_PUBLIC_TWITTER_HANDLE || '@myhandle'}`,
      twitterSite: `${process.env.NUXT_PUBLIC_TWITTER_HANDLE || '@myhandle'}`,

      // App Info
      applicationName: `${process.env.NUXT_PUBLIC_SITE_NAME || 'M Framework Starter Template'} App`,

      // Nuxt SEO Utils already sets the below tags for you
      ogSiteName: `${process.env.NUXT_PUBLIC_SITE_NAME || 'M Framework Starter Template'}`,
      ogLocale: 'en_US',
      ogType: 'website',
      ogUrl: 'https://example.com',
      ogTitle: `${process.env.NUXT_PUBLIC_SITE_NAME || 'M Framework Starter Template'} - ${process.env.NUXT_PUBLIC_SITE_DESCRIPTION || 'Welcome to my awesome site!'}`,

      // Other Nuxt SEO modules handle these
      ogImage: `${process.env.NUXT_PUBLIC_SITE_URL || 'https://example.com'}/og-image.png`,
      robots: 'index, follow',
    }
  },

  // @ts-ignore - @nuxtjs/seo module augments this key at runtime
  site: {
    url: `${process.env.NUXT_PUBLIC_SITE_URL || 'https://example.com'}`,
    name: `${process.env.NUXT_PUBLIC_SITE_NAME || 'M Framework Starter Template'}`,
    description: `${process.env.NUXT_PUBLIC_SITE_DESCRIPTION || 'Welcome to my awesome site!'}`,
  },

  image: {
    providers: {
      // Custom wrapper around the built-in cloudinary provider — falls
      // back to serving the original image untransformed when
      // CLOUDINARY_CLOUD_NAME isn't set, instead of 404ing against a
      // placeholder account name. See providers/cloudinary-safe.ts.
      cloudinary: {
        name: 'cloudinary',
        provider: resolve(__dirname, 'providers/cloudinary-safe.ts'),
        options: {
          baseURL: `https://res.cloudinary.com/${process.env.CLOUDINARY_CLOUD_NAME}/image/upload/`,
        },
      },
    },
    domains: [
      process.env.NUXT_PUBLIC_SITE_URL || 'https://example.com',
    ],
    screens: {
      xs: 320,
      sm: 640,
      md: 768,
      lg: 1024,
      xl: 1280,
      xxl: 1536,
    },
    format: ['webp', 'avif'],
    presets: {
      default: {
        modifiers: {
          format: 'webp',
          quality: 80,
        },
      },
    },
    densities: [1, 2, 3],
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
    // nuxt-security's default `removeLoggers: true` sets `vite.esbuild.drop`,
    // which Rolldown-powered Vite 8 ignores in favour of oxc — so console
    // statements were shipping to production untouched. Passing an explicit
    // options object makes it register the bundler-agnostic unplugin-remove
    // Vite plugin instead, which strips these in production builds only.
    removeLoggers: {
      consoleType: ['log', 'debug', 'info'],
      include: [/\.[jt]sx?$/, /\.vue\??/],
      exclude: [/node_modules/, /\.git/],
    },
    rateLimiter: process.env.NODE_ENV === 'production' ? {
      tokensPerInterval: 150,
      interval: 60 * 1000,
      throwError: true,
      headers: true,
    } : false,
    headers: {
      contentSecurityPolicy: false as
      const,
      // HSTS. Only sent in production (security.enabled gates the whole block)
      // and only honoured by browsers over HTTPS, so it is safe to always set.
      // 1 year + subdomains is the standard baseline; `preload` is intentionally
      // left off until the apex domain is submitted to the HSTS preload list.
      strictTransportSecurity: {
        maxAge: 31536000,
        includeSubdomains: true,
      },
      crossOriginOpenerPolicy: false as
      const,
      crossOriginEmbedderPolicy: false as
      const,
      permissionsPolicy: false as
      const,
    },
  },

  i18n: {
    locales: [{
        code: 'en',
        language: 'en-US',
        file: 'en.json'
      },
      {
        code: 'fr',
        language: 'fr-FR',
        file: 'fr.json'
      }
    ],
    langDir: 'locales',
    strategy: "prefix_except_default",
    defaultLocale: "en",
    detectBrowserLanguage: {
      useCookie: true,
      alwaysRedirect: true,
      cookieCrossOrigin: true,
      cookieKey: 'i18n_redirected',
      redirectOn: 'root', // recommended
    }
  },

  sitemap: {
    sources: [
      '/api/__sitemap__/urls',
    ],
  },

  scripts: {
    registry: {
      googleAnalytics: {
        trigger: 'onNuxtReady'
      },
      googleAdsense: {
        trigger: 'onNuxtReady'
      },
      // Tracking pixels — registered only when their id env var is set, so
      // an unconfigured pixel neither warns at build time nor ships an
      // inert <script>. Google Tag Manager (below) can also fire these
      // downstream from its own container config.
      ...(process.env.NUXT_PUBLIC_SCRIPTS_META_PIXEL_ID ? { metaPixel: { trigger: 'onNuxtReady' } } : {}),
      ...(process.env.NUXT_PUBLIC_SCRIPTS_REDDIT_PIXEL_ID ? { redditPixel: { trigger: 'onNuxtReady' } } : {}),
      ...(process.env.NUXT_PUBLIC_SCRIPTS_SNAPCHAT_PIXEL_ID ? { snapchatPixel: { trigger: 'onNuxtReady' } } : {}),
      ...(process.env.NUXT_PUBLIC_SCRIPTS_TIKTOK_PIXEL_ID ? { tiktokPixel: { trigger: 'onNuxtReady' } } : {}),
      ...(process.env.NUXT_PUBLIC_SCRIPTS_X_PIXEL_ID ? { xPixel: { trigger: 'onNuxtReady' } } : {}),
      bingUet: {
        trigger: 'onNuxtReady'
      },
      carbonAds: {
        trigger: 'onNuxtReady',
      },
      googleTagManager: {
        trigger: 'onNuxtReady'
      },
      blueskyEmbed: {},
      googleRecaptcha: {
        trigger: 'onNuxtReady'
      },
      gravatar: {
        trigger: 'onNuxtReady',
      },
      paypal: {
        trigger: 'onNuxtReady',
      },
      stripe: {
        trigger: 'onNuxtReady'
      },
      lemonSqueezy: {
        trigger: 'onNuxtReady',
      },
    }
  },

  leaflet: {
    markerCluster: true
  },

  mcp: {
    name: `${process.env.NUXT_PUBLIC_SITE_NAME || 'M Framework Starter Template'} MCP`,
    sessions: true,
    route: '/mcp', // Default route for the MCP server
    dir: 'mcp', // Base directory for MCP definitions (relative to server/)
  },

  // @ts-ignore - routeRules is augmented by Nuxt at runtime
  routeRules: {
    '/**': {
      robots: true,
      isr: process.env.NODE_ENV === 'development' ? false : 60,
      headers: {
        'Content-Security-Policy': buildContentSecurityPolicy(),
      }
    },
    // nuxt-og-image's own routes must not be caught by the wildcard ISR
    // rule above (it warns at build time that this breaks them).
    '/__og-image__/**': { isr: false },
    '/__nuxt_og_image__/**': { isr: false },

    // --- ISR exclusions -------------------------------------------------
    // The wildcard `isr: 60` above caches the *rendered SSR response* and
    // replays it to every visitor for 60s. That is only safe for pages
    // whose HTML is identical for everyone. Any route that renders
    // per-user content server-side (or is an API/SSE endpoint) MUST opt
    // out, or one user's page (name, email, cart, orders, feed, DMs) gets
    // served to the next visitor. `isr: false` also implies no CDN
    // micro-caching of these.
    '/api/**': { isr: false },
    '/u/**': { isr: false },
    '/account/**': { isr: false },
    '/settings/**': { isr: false },
    '/security/**': { isr: false },
    '/profile/**': { isr: false },
    '/notifications': { isr: false },
    '/notifications/**': { isr: false },
    '/lists/**': { isr: false },
    '/dates': { isr: false },
    '/your-friends': { isr: false },
    // Social surfaces are personalised (feed, spaces, DMs, calendar).
    '/connect/**': { isr: false },
    // Commerce: cart / checkout / account / post-purchase are per-user.
    '/cart': { isr: false },
    '/checkout': { isr: false },
    '/checkout/**': { isr: false },
    '/orders': { isr: false },
    '/order/**': { isr: false },
    '/invoice/**': { isr: false },
    '/transaction/**': { isr: false },
    '/transactions': { isr: false },
    '/wishlist': { isr: false },
    '/compare': { isr: false },
    '/customer-portal': { isr: false },
    '/return': { isr: false },
    '/success': { isr: false },
    '/tracking': { isr: false },
    '/shipment/**': { isr: false },
    // Search results vary by query string; caching the first query's HTML
    // and replaying it for every later query is just wrong.
    '/results': { isr: false },
    '/search/**': { isr: false },
    // Business/admin dashboards.
    '/dashboard/**': { isr: false },
  },

  experimental: {
    viewTransition: true,
  },

  runtimeConfig: {
    redisUrl: process.env.NUXT_REDIS_URL || 'redis://localhost:6379',
    mframework: {
      auth: '~/auth/authImplementation',
      user: '~/auth/currentUser'
    },
    turnstile: {
      // This can be overridden at runtime via the NUXT_TURNSTILE_SECRET_KEY
      // environment variable.
      secretKey: `${process.env.NUXT_TURNSTILE_SECRET_KEY || ''}`,
    },
    notify: {
      sendgridApiKey: process.env.SENDGRID_API_KEY,
      sendgridFromEmail: process.env.SENDGRID_FROM_EMAIL,
      sendgridFromName: process.env.SENDGRID_FROM_NAME,
      twilioSid: process.env.TWILIO_SID,
      twilioToken: process.env.TWILIO_TOKEN,
      twilioFrom: process.env.TWILIO_FROM,
      fcmServerKey: process.env.FCM_SERVER_KEY
    },
    novuSecretKey: process.env.NOVU_SECRET_KEY,
    // Server-to-server calls (subscriber upsert, workflow trigger) stay on
    // the box's own loopback rather than routing out through the public IP.
    novuApiUrl: process.env.NOVU_API_URL || 'http://localhost:3090',

    public: {
      // Read by getAssetURL() (layers/shared/app/utils/get-asset-url.ts) to
      // build <img src> URLs for Directus-hosted files in the browser.
      // Vite's import.meta.env only exposes VITE_-prefixed vars, so the
      // previous `import.meta.env.DIRECTUS_URL` read was always undefined,
      // producing broken "undefined/assets/<file>" image URLs site-wide.
      directusUrl: process.env.DIRECTUS_URL || '',
      novuAppId: process.env.NOVU_APPLICATION_IDENTIFIER,
      // No static novuSubscriberId here on purpose — a public env var can
      // only ever hold ONE fixed value, but every logged-in user needs
      // their OWN subscriber id (their own user id). That's resolved
      // per-request instead, from #shared/server/api/novu/session.get.ts,
      // alongside an HMAC subscriberHash (Novu's recommended production
      // auth — without it, anyone who knows another user's id could read
      // their notifications by passing it as `subscriber` client-side).
      novuBackendUrl: process.env.NOVU_API_HOSTNAME || '',
      novuSocketUrl: process.env.NOVU_WEBSOCKET_HOSTNAME || '',
      segmentWriteKey: process.env.NUXT_PUBLIC_SEGMENT_WRITE_KEY || '',
      googleAdsense: {
        id: process.env.GOOGLE_ADSENSE_ID,
        test: process.env.GOOGLE_ADSENSE_TEST_MODE === 'true',
        onPageLoad: false,
        pageLevelAds: false,
      },
      siteUrl: process.env.NUXT_PUBLIC_SITE_URL || 'https://example.com',
      siteName: process.env.NUXT_PUBLIC_SITE_NAME || 'M Framework Starter Template',
      siteDescription: process.env.NUXT_PUBLIC_SITE_DESCRIPTION || 'Welcome to my awesome site!',
      apiEndpoint: process.env.NUXT_PUBLIC_API_ENDPOINT || 'https://api.example.com',
      i18n: {
        locales: [{
            code: 'en',
            iso: 'en-US',
          },
          {
            code: 'fr',
            iso: 'fr-FR',
          }
        ],
        baseUrl: `${process.env.NUXT_PUBLIC_SITE_URL || 'https://example.com'}`,
      },
      motion: {
        directives: {
          'pop-bottom': {
            initial: {
              scale: 0,
              opacity: 0,
              y: 100,
            },
            visible: {
              scale: 1,
              opacity: 1,
              y: 0,
            }
          }
        }
      },
    },
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
        // See novuCssPath's own comment above (top of file) for why this
        // alias exists at all rather than a plain bare import.
        ...(novuCssPath ? { '@novu/js/dist/index.css': novuCssPath } : {}),
      }
    },
    vue: {
      template: {
        compilerOptions: {
          // The top-level `vue.compilerOptions` Nuxt config below isn't
          // forwarded to @vitejs/plugin-vue in this Nuxt version, so the
          // video-player/media-* custom elements never resolved without
          // this duplicate, Vite-level passthrough.
          isCustomElement: (tag: string) =>
            tag.startsWith('video-') ||
            tag.startsWith('media-') ||
            tag.endsWith('-video')
        }
      }
    },
  },

  nitro: {
    prerender: {
      crawlLinks: true,
      routes: [
        '/assets/images/*',
      ]
    },
    compressPublicAssets: true,
    experimental: {
      asyncContext: true,
    },
  },

  sourcemap: {
    client: 'hidden'
  },

  typescript: {
    tsConfig: {
      include: [
        // this path is relative to the generated .nuxt/tsconfig.json
        '../test/e2e/**/*',
      ],
    },
  },

  vue: {
    compilerOptions: {
      // Instruct Vue to treat all tags starting with 'video-' or 'media-' as custom elements
      isCustomElement: (tag: string) =>
        tag.startsWith('video-') ||
        tag.startsWith('media-') ||
        tag.endsWith('-video')
    }
  },
})