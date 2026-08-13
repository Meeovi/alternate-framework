import {
  fileURLToPath
} from 'node:url'
import {
  defineNuxtConfig
} from 'nuxt/config'

export default defineNuxtConfig({
  $meta: {
    name: 'commerce',
    description: 'Commerce Layer provides functionalities for managing and processing e-commerce transactions.',
  },

  modules: [
    "@polar-sh/nuxt",
    '@storefront-ui/nuxt',
    'notivue/nuxt'
  ],

  css: [
    'notivue/notification.css', // Only needed if using built-in notifications
    'notivue/animations.css' // Only needed if using built-in animations
  ],

  // @ts-ignore - notivue module option
  notivue: {
    position: 'bottom-right',
    limit: 4,
    enqueue: true,
    avoidDuplicates: true,
    notifications: {
      global: {
        duration: 10000
      }
    }
  },

  runtimeConfig: {
    mframework: {
      auth: '~/auth/commerceAuth',
      user: '~/auth/currentUser'
    },
    mode: process.env.POLAR_MODE,
    stripeSecretKey: process.env.NUXT_STRIPE_SECRET_KEY,
    stripeWebhookSecret: process.env.NUXT_STRIPE_WEBHOOK_SECRET,
    stripePriceIdProMonth: process.env.NUXT_STRIPE_PRICE_ID_PRO_MONTH,
    stripePriceIdProYear: process.env.NUXT_STRIPE_PRICE_ID_PRO_YEAR,
    // Polar
    polarServer: process.env.NUXT_POLAR_SERVER,
    polarAccessToken: process.env.NUXT_POLAR_ACCESS_TOKEN,
    polarSuccessUrl: process.env.POLAR_SUCCESS_URL,
    polarWebhookSecret: process.env.NUXT_POLAR_WEBHOOK_SECRET,
    polarProductIdProMonth: process.env.NUXT_POLAR_PRODUCT_ID_PRO_MONTH,
    polarProductIdProYear: process.env.NUXT_POLAR_PRODUCT_ID_PRO_YEAR,
    // Shippo and PayPal secrets must stay out of `public` — anything under
    // `runtimeConfig.public` is serialized into the client bundle/initial
    // HTML payload and is visible to every visitor regardless of whether
    // any client-side code reads it. These were previously nested under
    // `public` below despite their own comments saying "server-side only,
    // never exposed to client" — a real secret-exposure bug, and also why
    // server/utils/shippo.ts's `useRuntimeConfig().shippoApiKey` read
    // undefined (it reads the top-level key; the value only existed at
    // `public.shippoApiKey`).
    shippoApiKey: process.env.SHIPPO_API_KEY,
    paypalClientSecret: process.env.PAYPAL_CLIENT_SECRET,
    // server/utils/paypal.ts reads these two as top-level config as well
    // (config.paypalClientId / config.paypalMode, not config.public.*) —
    // there's already a separate, genuinely-public
    // public.scripts.paypal.clientId (a different env var) for the
    // client-side PayPal SDK script, so these don't need to be public at
    // all; they were just as unreachable as the two secrets above.
    paypalClientId: process.env.PAYPAL_CLIENT_ID,
    paypalMode: process.env.PAYPAL_MODE || 'sandbox',
    public: {
      payment: process.env.NUXT_PAYMENT || 'stripe',
      currencies: process.env.NUXT_PUBLIC_CURRENCIES || 'USD,EUR,GBP',
      // Stripe publishable key (pk_live_... in prod, pk_test_... in dev)
      stripePublishableKey: process.env.NUXT_PUBLIC_STRIPE_PUBLISHABLE_KEY,
      stripePricingTableId: process.env.NUXT_PUBLIC_STRIPE_PRICING_TABLE_ID,
      scripts: {
        paypal: {
          clientId: `${process.env.NUXT_PUBLIC_SCRIPTS_PAYPAL_CLIENT_ID}`, // NUXT_PUBLIC_SCRIPTS_PAYPAL_CLIENT_ID
        },
      },
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
            login: '/login', // Path to redirect when login is required
            logout: '/', // Path to redirect after logout
            home: '/', // Path to redirect after successful login
            resetPassword: '/reset-password', // Path to redirect for password reset
            callback: '/callback', // Path to redirect after login with provider
          },
        }
      },
    },
  },
})