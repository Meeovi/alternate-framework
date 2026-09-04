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
    'notivue/animations.css', // Only needed if using built-in animations
    // Corrections for the vendored Mobirise stylesheet: a Vuetify
    // colour-utility guard (both themes) + dark-mode section overrides
    // so Mobirise-built commerce pages follow the light/dark toggle.
    // See the file header for details.
    fileURLToPath(new URL('./app/assets/styles/mobirise-overrides.css', import.meta.url)),
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
    // Server-only. The Directus static token — injected into outgoing
    // Directus requests by the /api/cms proxy (layers/shared) so it is
    // never serialized into the client payload. Was previously exposed at
    // `public.directus.auth.token`.
    directus: {
      token: process.env.NUXTUS_DIRECTUS_STATIC_TOKEN,
    },
    public: {
      payment: process.env.NUXT_PAYMENT || 'stripe',
      // Selects which CommerceBackendRegistry adapter (see alternate-sdk)
      // the layers/commerce Directus facade routes product/category/order
      // reads to. 'directus' (default) means every request passes straight
      // through to the real Directus client, unmodified.
      commerceBackend: process.env.NUXT_PUBLIC_COMMERCE_BACKEND || 'directus',
      currencies: process.env.NUXT_PUBLIC_CURRENCIES || 'USD,EUR,GBP',
      // Stripe publishable key (pk_live_... in prod, pk_test_... in dev)
      stripePublishableKey: process.env.NUXT_PUBLIC_STRIPE_PUBLISHABLE_KEY,
      stripePricingTableId: process.env.NUXT_PUBLIC_STRIPE_PRICING_TABLE_ID,
      scripts: {
        paypal: {
          clientId: `${process.env.NUXT_PUBLIC_SCRIPTS_PAYPAL_CLIENT_ID}`, // NUXT_PUBLIC_SCRIPTS_PAYPAL_CLIENT_ID
        },
      },
      // Directus — URL only. This object is serialized into the client
      // payload, so it must never carry credentials. The static token now
      // lives in the server-only `runtimeConfig.directus.token` above and
      // the client reaches Directus through the same-origin /api/cms proxy.
      directus: {
        url: process.env.DIRECTUS_URL,
        nuxtBaseUrl: process.env.NUXT_PUBLIC_SITE_URL || 'http://localhost:3011',
      },
    },
  },
})