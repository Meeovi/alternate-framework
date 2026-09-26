// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',

  app: {
    head: {
      viewport: 'minimum-scale=1, initial-scale=1, width=device-width',
      templateParams: {
        separator: '·',
      },
      htmlAttrs: {
        lang: 'en',
      },
      meta: [{
        name: 'description',
        content: 'Over 7,000 characters and stories within the Eliteverse.'
      }, ],
      link: [{
          rel: 'icon',
          href: '/favicon.ico'
        },
        {
          rel: 'apple-touch-icon',
          href: '/icons/apple-touch-icon-180x180.png'
        },
      ],
      script: [{
        //src: 'https://static.elfsight.com/platform/platform.js'
      }]
    },
  },

  css: [
    'assets/web/assets/mobirise-icons2/mobirise2.css',
    'assets/bootstrap/css/bootstrap.min.css',
    'assets/bootstrap/css/bootstrap-grid.min.css',
    'assets/bootstrap/css/bootstrap-reboot.min.css',
    'assets/theme/css/style.css',
    'assets/mobirise/css/mbr-additional.css',
    '@fortawesome/fontawesome-svg-core/styles.css',
    'assets/styles/mobile.css',
    'assets/styles/styles.css',
  ],

  modules: [
    '@nuxt/image',
    '@storefront-ui/nuxt',
    'vuetify-nuxt-module',
    '@nuxtjs/leaflet',
  ],

  vuetify: {
    vuetifyOptions: {
      icons: {
        defaultSet: 'fa-svg',
        svg: {
          fa: {
            libraries: [
              [ /* default export? */ false, /* export name */ 'fas', /* library */ '@fortawesome/free-solid-svg-icons']
            ]
          }
        },
        sets: [{
          name: 'mdi',
          cdn: 'https://cdn.jsdelivr.net/npm/@mdi/font@latest/css/materialdesignicons.min.css'
        }]
      }
    }
  },

  runtimeConfig: {
    public: {
      // Directus
      directus: {
        url: process.env.DIRECTUS_URL,
        nuxtBaseUrl: process.env.NUXT_PUBLIC_SITE_URL || 'http://localhost:3011',
        auth: {
          email: process.env.NUXTUS_DIRECTUS_ADMIN_EMAIL,
          password: process.env.NUXTUS_DIRECTUS_ADMIN_PASSWORD,
          token: process.env.NUXTUS_DIRECTUS_STATIC_TOKEN,
          enabled: true,
          enableGlobalAuthMiddleware: false, // Enable auth middleware on every page
          userFields: ['*'], // Select user fields
          redirect: {
            login: '/auth/login', // Path to redirect when login is required
            logout: '/', // Path to redirect after logout
            home: '/', // Path to redirect after successful login
            resetPassword: '/auth/reset-password', // Path to redirect for password reset
            callback: '/auth/callback', // Path to redirect after login with provider
          },
        }
      },

      disqus: {
        shortname: process.env.NUXT_PUBLIC_DISQUS_SHORTNAME || 'meeovi',
        devShortname: 'meeovi-dev', // fallback (can be fake if you just want placeholder)
        devBaseUrl: 'http://localhost:3000' // used for URL in dev
      },

      meeDirectusUrl: process.env.MEE_DIRECTUS_URL || 'http://localhost:8055',
      meeNuxtBaseUrl: process.env.MEE_NUXTUS_DIRECTUS_STATIC_TOKEN || 'http://localhost:3011',
      meeToken: process.env.MEE_NUXTUS_DIRECTUS_ADMIN_EMAIL || '',
      meePassword: process.env.MEE_NUXTUS_DIRECTUS_ADMIN_PASSWORD || '',
      enabled: process.env.MEE_NUXTUS_DIRECTUS_AUTH || 'development',
    },
  },

  // Build configuration
  build: {},
  nitro: {
    preset: 'vercel',
    externals: {
      inline: [
        'vue',
        'vuetify',
        '@vueuse/core'
      ] // ⬅ Bundle these inside the serverless function
    }
  }
})
