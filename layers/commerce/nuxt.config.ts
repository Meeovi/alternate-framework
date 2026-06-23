import { fileURLToPath } from 'node:url'
import { defineNuxtConfig } from 'nuxt/config'

export default defineNuxtConfig({
  $meta: {
    name: 'commerce',
    description: 'Commerce Layer provides functionalities for managing and processing e-commerce transactions.',
  },

  modules: ["@polar-sh/nuxt"],

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
    polarWebhookSecret: process.env.NUXT_POLAR_WEBHOOK_SECRET,
    polarProductIdProMonth: process.env.NUXT_POLAR_PRODUCT_ID_PRO_MONTH,
    polarProductIdProYear: process.env.NUXT_POLAR_PRODUCT_ID_PRO_YEAR,
    public: {
      payment: process.env.NUXT_PAYMENT || 'stripe',
      currencies: process.env.NUXT_PUBLIC_CURRENCIES || 'USD,EUR,GBP',
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