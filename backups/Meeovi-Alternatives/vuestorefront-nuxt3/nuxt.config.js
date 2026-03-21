import middleware from './middleware.config';
import { getRoutes } from './routes';
import { defineNuxtConfig} from 'nuxt'

//import { probeGoogleFontsApi, GOOGLE_FONT_API_URL } from './modules/core/GoogleFontsAPI/probeGoogleFontsApi.ts';

const {
  integrations: {
    magento: {
      configuration: {
        cookies,
        cookiesDefaultOpts,
        externalCheckout,
        defaultStore,
        magentoBaseUrl,
        imageProvider,
        magentoApiEndpoint,
        customApolloHttpLinkOptions,
        customer,
      },
    },
  },
} = middleware;

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
    dev: process.env.VSF_NUXT_APP_ENV !== 'production',
    publicRuntimeConfig: {
      middlewareUrl: process.env.API_BASE_URL || 'http://localhost:8181',
      ssrMiddlewareUrl: process.env.API_SSR_BASE_URL || 'http://localhost:8181'
    },
    server: {
      port: process.env.VSF_NUXT_APP_PORT,
      host: process.env.VSF_NUXT_APP_HOST || '0.0.0.0',
    },
    devtools: { enabled: true },
    typescript: {
      typeCheck: true,
    },
    app: {
      head: {
        viewport: 'minimum-scale=1, initial-scale=1, width=device-width',
        htmlAttrs: {
          lang: 'en',
        },
        meta: [
          { name: 'description', content: 'VSF x Nuxt3 (Boilerplate)' },
          { name: 'theme-color', content: '#018937' },
        ],
        link: [
          { rel: 'icon', href: '/favicon.ico' },
          { rel: 'apple-touch-icon', href: '/icons/apple-touch-icon-180x180.png' },
        ],
      },
    },
  appConfig: {
    titleSuffix: 'Vue Storefront Nuxt3 Boilerplate',
  },
  imports: {
    dirs: ['composables/**', 'utils/**'],
  },
  css: ['~/assets/style.scss'],
    loading: { color: '#fff' },
    device: {
      refreshOnResize: true,
    },

    modules: [
      '@vite-pwa/nuxt',
      '@nuxtjs/style-resources',
      '@nuxtjs/device',
      '@vue-storefront/nuxt',
      '@nuxt/image',
      '@pinia/nuxt',
      ['nuxt-i18n', {
        baseUrl: process.env.VSF_STORE_URL || 'http://localhost:3000',
      }],
      'cookie-universal-nuxt',
      'vue-scrollto/nuxt',
      '@vue-storefront/middleware/nuxt',
      '@nuxt/image',
      ['@vue-storefront/cache/nuxt', {
        enabled: process.env.VSF_REDIS_ENABLED === 'true',
        invalidation: {
          endpoint: process.env.VSF_REDIS_CACHE_INVALIDATE_URL,
          key: process.env.VSF_REDIS_CACHE_INVALIDATE_KEY,
          handlers: [
            '@vue-storefront/cache/defaultHandler',
          ],
        },
        driver: [
          '@vue-storefront/redis-cache',
          {
            defaultTimeout: 86_400,
            // docs: https://github.com/luin/ioredis/blob/master/API.md#new-redisport-host-options
            redis: {
              keyPrefix: process.env.VSF_REDIS_KEY_PREFIX,
              host: process.env.VSF_REDIS_HOST,
              port: process.env.VSF_REDIS_PORT,
            },
          },
        ],
      }],
      ['@vue-storefront/http-cache/nuxt', {
        default: 'max-age=300, s-maxage=3600, stale-while-revalidate=86400',
        matchRoute: {
          '/': 'max-age=1800, s-maxage=86400, stale-while-revalidate=86400',
          '*/customer*': 'none',
          '*/checkout*': 'none',
        },
      }],
    ],
    i18n: {
      country: 'US',
      baseUrl: process.env.VSF_STORE_URL,
      strategy: 'prefix',
      locales: [
        {
          code: 'default',
          file: 'en.js',
          iso: 'en_US',
          defaultCurrency: 'USD',
        },
        {
          code: 'german',
          file: 'de.js',
          iso: 'de_DE',
          defaultCurrency: 'EUR',
        },
      ],
      defaultLocale: 'default',
      lazy: true,
      seo: true,
      langDir: 'lang/',
      vueI18n: {
        fallbackLocale: 'default',
        numberFormats: {
          default: {
            currency: {
              style: 'currency',
              currency: 'USD',
              currencyDisplay: 'symbol',
            },
          },
          german: {
            currency: {
              style: 'currency',
              currency: 'EUR',
              currencyDisplay: 'symbol',
            },
          },
        },
      },
      detectBrowserLanguage: false,
    },

    routeRules: {
      '/_ipx/**': { headers: { 'cache-control': `public, max-age=31536000, immutable` } },
      '/icons/**': { headers: { 'cache-control': `public, max-age=31536000, immutable` } },
      '/favicon.ico': { headers: { 'cache-control': `public, max-age=31536000, immutable` } },
    },

    pwa: {
      registerType: 'autoUpdate',
      workbox: {
        navigateFallback: null,
        globPatterns: ['**/*.{js,json,css,html,ico,svg,png,webp,ico,woff,woff2,ttf,eit,otf}', 'icons/*'],
        globIgnores: ['manifest**.webmanifest'],
        additionalManifestEntries: [
          {
            url: '/offline',
            revision: Math.random().toString(32),
          },
        ],
        navigationPreload: true,
        runtimeCaching: [
          {
            urlPattern: ({ request }) => request.mode === 'navigate',
            handler: 'NetworkOnly',
            options: {
              precacheFallback: {
                fallbackURL: '/offline',
              },
            },
          },
        ],
        cleanupOutdatedCaches: true,
      },
      manifest: {
        name: 'VSF x Nuxt3 (Boilerplate)',
        short_name: 'VSFNuxt3Boilerplate',
        theme_color: '#018937',
        icons: [
          {
            src: 'icons/icon-192x192.png',
            sizes: '192x192',
            type: 'image/png',
          },
          {
            src: 'icons/icon-512x512.png',
            sizes: '512x512',
            type: 'image/png',
          },
          {
            src: 'icons/icon-512x512.maskable.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable',
          },
        ],
      },
      registerWebManifestInRouteRules: true,
    },

    styleResources: {
      scss: [require.resolve('@storefront-ui/shared/styles/_helpers.scss', { paths: [process.cwd()] })],
    },

    build: {
      extractCSS: true,
      optimizeCSS: true,
      parallel: true,
      extend(cfg) {
        // eslint-disable-next-line no-param-reassign
        cfg.devtool = 'source-map';
        cfg.module.rules.push({
          test: /\.mjs$/,
          include: /node_modules/,
          type: 'javascript/auto',
        })
      },
      transpile: [
        'vee-validate',
        'lodash-es',
        /^@storefront-ui/,
        '@glidejs/glide',
        'axios'
      ],
    },


    hooks: {
      prefetchLinks: false,
      'pages:extend'(routes) {
        getRoutes()
          .forEach((route) => routes.unshift(route));
      },
    },
    image: {
      provider: process.env.NUXT_IMAGE_PROVIDER,
    },
    env: {
      VSF_MAGENTO_GRAPHQL_URL: process.env.VSF_MAGENTO_GRAPHQL_URL,
    },

  /*if (_process.env.NUXT_IMAGE_PROVIDER === 'cloudinary') {
    baseConfig.image.cloudinary = {
      baseURL: process.env.NUXT_IMAGE_PROVIDER_BASE_URL,
    };

    if (process.env.NUXT_IMAGE_PROVIDER_DOMAIN) {
      const preconnectConfig = [
        {
          rel: 'preconnect',
          href: process.env.NUXT_IMAGE_PROVIDER_DOMAIN,
          crossorigin: true,
        },
        {
          rel: 'dns-prefetch',
          href: process.env.NUXT_IMAGE_PROVIDER_DOMAIN,
        },
      ];

      baseConfig.head.link.push(...preconnectConfig);
    }
  }

  if (process.env.VSF_RECAPTCHA_ENABLED === 'true') {
    baseConfig.modules.push('@nuxtjs/recaptcha');

    baseConfig.recaptcha = {
      hideBadge: Boolean(process.env.VSF_RECAPTCHA_HIDE_BADGE), // Hide badge element (v3 & v2 via size=invisible)
      siteKey: process.env.VSF_RECAPTCHA_SITE_KEY, // Site key for requests
      version: Number(process.env.VSF_RECAPTCHA_VERSION), // Version 2 or 3
      size: process.env.VSF_RECAPTCHA_SIZE, // Size: 'compact', 'normal', 'invisible' (v2)
    };

    baseConfig.publicRuntimeConfig = {
      ...baseConfig.publicRuntimeConfig,
      isRecaptcha: process.env.VSF_RECAPTCHA_ENABLED === 'true',
    };
  }

  if (await probeGoogleFontsApi()) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    baseConfig.build.plugins.push(new GoogleFontsPlugin({
      fonts: [
        { family: 'Raleway', variants: ['300', '400', '500', '600', '700', '400italic'], display: 'swap' },
        { family: 'Roboto', variants: ['300', '400', '500', '700', '300italic', '400italic'], display: 'swap' },
      ],
      name: 'fonts',
      filename: 'fonts.css',
      path: 'assets/fonts/',
      local: true,
      formats: ['eot', 'woff', 'woff2', 'ttf', 'svg'],
      apiUrl: GOOGLE_FONT_API_URL,
    }));
  }

  return baseConfig;*/
});
