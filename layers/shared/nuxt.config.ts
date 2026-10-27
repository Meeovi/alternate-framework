import {
  resolve
} from 'path'
import {
  defineNuxtConfig
} from 'nuxt/config'
import process from 'node:process'
import { createRequire } from 'node:module'

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
 * The site-wide Content-Security-Policy, enforced since 18 October 2026
 * (sent by server/plugins/content-security-policy.ts; NUXT_CSP_REPORT_ONLY=true
 * switches it back to report-only without a rebuild). Browsers report
 * violations to /api/csp-report (logged once each, see
 * server/api/csp-report.post.ts):
 *   journalctl -u meeovi-demo | grep '\[csp\]'
 *
 * Only the directives listed here are enforced; anything not named is
 * unrestricted. `connect-src` is the tight one — every host the browser is
 * allowed to fetch/beacon/WebSocket to has to be enumerated, so a new
 * integration that talks to its own API from the client (Sentry,
 * analytics pixels, …) must be added here or it fails silently.
 */
function buildContentSecurityPolicy(): string {
  const httpsOrigin = (url?: string) => (url ? url.replace(/^https?:/, 'https:') : '')

  const directusHttps = httpsOrigin(process.env.DIRECTUS_URL)
  // Pixanomy (Nextcloud) — where every user upload now lives; see
  // server/utils/pixanomy.ts. Public share links are played back directly.
  const pixanomyHttps = httpsOrigin(process.env.NUXT_PIXANOMY_URL || 'https://app.pixanomy.com')

  // Self-hosted Novu, served over https at its own host:
  // NOVU_API_HOSTNAME=https://novu.meeovicms.com/api and
  // NOVU_WEBSOCKET_HOSTNAME=https://novu.meeovicms.com (its containers listen
  // on 127.0.0.1 only). NOVU_WEBSOCKET_PATH is only for a host that serves
  // socket.io under a prefix. Novu's socket.io client polls over http(s)
  // before upgrading, so both schemes are allowed.
  const novuApi = process.env.NOVU_API_HOSTNAME || ''
  const novuWs = process.env.NOVU_WEBSOCKET_HOSTNAME || ''
  const novuWss = novuWs.replace(/^http(s?):\/\//, 'ws$1://')

  // Analytics / marketing tag endpoints. Google Tag Manager (configured
  // with a real container id) can itself load any of these downstream, and
  // the consent-gated trackers (app/plugins/cookie-consent.client.ts: GA,
  // Bing UET) beacon to them directly — without these, every one was
  // blocked with a console CSP violation on every page.
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

  // AdSense, its ad-quality pings and performance beacon (csi.gstatic.com),
  // plus Bing UET's beacon host (bat.bing.net, distinct from bat.bing.com).
  const adHosts = [
    'https://pagead2.googlesyndication.com',
    'https://csi.gstatic.com',
    'https://*.adtrafficquality.google',
    'https://bat.bing.net',
  ]

  // PayPal's checkout SDK and buttons, and the commerce backend's
  // storefront GraphQL (adapter-magento's client plugin on product/category
  // navigation).
  const paymentHosts = [
    'https://www.paypal.com',
    'https://*.paypal.com',
  ]
  const commerceGraphql = httpsOrigin(process.env.MAGENTO_GRAPHQL_URL)
    ? new URL(httpsOrigin(process.env.MAGENTO_GRAPHQL_URL)).origin
    : ''

  // Better Auth's sentinel client (layers/auth/lib/auth-client.ts) reports
  // to its identify endpoint from the browser on every page.
  const betterAuthIdentify = httpsOrigin(process.env.BETTER_AUTH_IDENTIFY_URL)
    ? new URL(httpsOrigin(process.env.BETTER_AUTH_IDENTIFY_URL)).origin
    : 'https://kv.better-auth.com'

  const connectSrc = [
    "'self'",
    'https://*.mux.com',
    // Covers every regional Sentry ingest host (o<org>.ingest.us.sentry.io,
    // .ingest.de.sentry.io, …) — without it every error report is dropped.
    'https://*.sentry.io',
    'https://challenges.cloudflare.com',
    directusHttps,
    commerceGraphql,
    novuApi,
    novuWs,
    novuWss,
    betterAuthIdentify,
    ...analyticsHosts,
    ...adHosts,
    ...paymentHosts,
  ].filter(Boolean).join(' ')

  return [
    // Videos come from Mux (streamed), Pixanomy public links (new uploads)
    // or straight from Directus assets (legacy shorts.video rows).
    `media-src 'self' blob: https://stream.mux.com ${pixanomyHttps} ${directusHttps};`,
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
    // Starting point for a stricter script/frame pass: blocks http: and
    // data: scripts, eval, and non-https frames.
    "script-src 'self' 'unsafe-inline' https: blob:;",
    "frame-src 'self' https: blob:;",
    "base-uri 'self';",
    "frame-ancestors 'self';",
    "form-action 'self' https://www.paypal.com https://www.sandbox.paypal.com;",
    'report-uri /api/csp-report;',
    'report-to csp;',
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
        // AdSense's loader is no longer here: it's advertising, so it waits
        // for cookie consent (app/plugins/cookie-consent.client.ts).
      ]
    }
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
    '@nuxtjs/leaflet',
    '@nuxtjs/mcp-toolkit',
    'nuxt-skill-hub'
  ],

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
      // og:url is set per page by Nuxt SEO from site.url + the route.
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
    // English only for launch; add locales here (and a file in
    // i18n/locales) when translations exist.
    locales: [{
        code: 'en',
        language: 'en-US',
        file: 'en.json'
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
        // The CSP itself is sent by server/plugins/content-security-policy.ts.
        'Reporting-Endpoints': 'csp="/api/csp-report"',
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
    // nuxt-security's requestSizeLimiter caps multipart bodies at 8MB by
    // default — far too small for video. Keep in step with
    // runtimeConfig.pixanomy.maxUploadMb, which the handler enforces itself.
    '/api/assets/upload': {
      security: {
        requestSizeLimiter: {
          maxUploadFileRequestInBytes: Number(process.env.NUXT_PIXANOMY_MAX_UPLOAD_MB || 200) * 1024 * 1024,
        },
      },
    },
    // Every SSR page load checks the session in-process (route middleware →
    // /api/auth/get-session), and those self-calls count against the
    // site-wide per-IP limit — fast browsing then 429s the session check,
    // which the (fail-closed) middleware turns into a 503. The check is
    // cheap (cookie cache) and read-only; sign-in / sign-up / reset keep
    // better-auth's own per-path limits.
    '/api/auth/get-session': {
      security: { rateLimiter: false },
    },
    // Browser CSP reports quote the offending snippet — nuxt-security's
    // XSS validator would reject exactly the reports we want.
    '/api/csp-report': {
      security: {
        xssValidator: false,
        requestSizeLimiter: { maxRequestSizeInBytes: 64 * 1024 },
      },
    },
    '/u/**': { isr: false },
    '/profile/**': { isr: false },
    '/notifications': { isr: false },
    '/notifications/**': { isr: false },
    '/lists/**': { isr: false },
    '/dates': { isr: false },
    '/your-friends': { isr: false },
    // Social surfaces are personalised (feed, spaces, DMs, calendar).
    '/connect/**': { isr: false },
    // Commerce: cart / checkout / account / post-purchase are per-user.
    '/checkout': { isr: false },
    '/checkout/**': { isr: false },
    '/orders': { isr: false },
    '/order/**': { isr: false },
    '/invoice/**': { isr: false },
    '/transaction/**': { isr: false },
    '/transactions': { isr: false },
    '/wishlist': { isr: false },
    '/compare': { isr: false },
    '/success': { isr: false },
    '/tracking': { isr: false },
    '/shipment/**': { isr: false },
    // Search results vary by query string; caching the first query's HTML
    // and replaying it for every later query is just wrong.
    '/results': { isr: false },
    '/search/**': { isr: false },
    // Business/admin workspace (dashboard, settings, account, security).
    '/workspace': { isr: false },
    '/workspace/**': { isr: false },
  },

  experimental: {
    viewTransition: true,
  },

  runtimeConfig: {
    // Sent by server/plugins/content-security-policy.ts. reportOnly:
    // NUXT_CSP_REPORT_ONLY=true switches it back to report-only at runtime.
    csp: {
      policy: buildContentSecurityPolicy(),
      reportOnly: false,
    },
    redisUrl: process.env.NUXT_REDIS_URL || 'redis://localhost:6379',
    googleAdClientId: process.env.NUXT_GOOGLE_ADSENSE_CLIENT_ID || '',
    googleAdSlotId: process.env.NUXT_GOOGLE_ADSENSE_SLOT_ID || '',
    mframework: {
      auth: '~/auth/authImplementation',
      user: '~/auth/currentUser'
    },
    turnstile: {
      // Server-only; read by server/utils/turnstile.ts (verifyTurnstileToken).
      // Overridden at runtime by NUXT_TURNSTILE_SECRET_KEY.
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
    // Centralized user-upload store (Nextcloud) — server/utils/pixanomy.ts.
    // Use a Nextcloud *app password* for a dedicated service account, never
    // a real login password.
    pixanomy: {
      url: process.env.NUXT_PIXANOMY_URL || 'https://app.pixanomy.com',
      username: process.env.NUXT_PIXANOMY_USERNAME || '',
      appPassword: process.env.NUXT_PIXANOMY_APP_PASSWORD || '',
      root: process.env.NUXT_PIXANOMY_ROOT || 'Meeovi',
      maxUploadMb: Number(process.env.NUXT_PIXANOMY_MAX_UPLOAD_MB || 200),
    },

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
      // socket.io path when Novu is proxied under a prefix (see novuApi above).
      novuSocketPath: process.env.NOVU_WEBSOCKET_PATH || '',
      segmentWriteKey: process.env.NUXT_PUBLIC_SEGMENT_WRITE_KEY || '',
      // Cloudflare Turnstile site key (<NuxtTurnstile>, the forms plugin);
      // NUXT_PUBLIC_TURNSTILE_SITE_KEY.
      turnstile: {
        siteKey: process.env.NUXT_PUBLIC_TURNSTILE_SITE_KEY || '',
      },
      // Consent-gated trackers, loaded by app/plugins/cookie-consent.client.ts.
      // Kept under `scripts` so the existing env vars still apply
      // (NUXT_PUBLIC_SCRIPTS_GOOGLE_TAG_MANAGER_ID, _GOOGLE_ANALYTICS_ID,
      // _BING_UET_ID); '' keeps each key in the build so those overrides work.
      scripts: {
        googleTagManager: { id: '' },
        googleAnalytics: { id: '' },
        bingUet: { id: '' },
      },
      googleAdsense: {
        id: process.env.GOOGLE_ADSENSE_ID,
        test: process.env.GOOGLE_ADSENSE_TEST_MODE === 'true',
        onPageLoad: false,
        pageLevelAds: false,
      },
      siteUrl: process.env.NUXT_PUBLIC_SITE_URL || 'https://example.com',
      siteName: process.env.NUXT_PUBLIC_SITE_NAME || 'M Framework Starter Template',
      siteDescription: process.env.NUXT_PUBLIC_SITE_DESCRIPTION || 'Welcome to my awesome site!',
      // Share image for og:image/twitter:image; empty = `${siteUrl}/og-image.png`.
      appOgImage: process.env.NUXT_PUBLIC_APP_OG_IMAGE || '',
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

  vite: {
    // Vuetify (vite-plugin-vuetify, optimizeDeps, transpile, the labs
    // VStepperVertical alias) is configured by layers/ui-shell.
    logLevel: 'info',
    resolve: {
      dedupe: ['vue', 'vue-router'],
      alias: {
        // See novuCssPath's own comment above (top of file) for why this
        // alias exists at all rather than a plain bare import.
        ...(novuCssPath ? { '@novu/js/dist/index.css': novuCssPath } : {}),
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

})