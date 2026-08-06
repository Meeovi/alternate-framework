// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  $meta: {
    name: 'shared',
    description: 'Nuxt-specific glue for alternate-* modules',
  },

  devtools: {
    enabled: true
  },

  runtimeConfig: {
    opensearch: {
      host: process.env.ALTERNATE_SEARCH_HOST || 'localhost',
      port: parseInt(process.env.ALTERNATE_SEARCH_PORT || '9200'),
      auth: process.env.ALTERNATE_SEARCH_AUTH || 'admin:admin',
      protocol: process.env.ALTERNATE_SEARCH_PROTOCOL || 'https',
      caCertsPath: process.env.ALTERNATE_SEARCH_CA_CERTS_PATH || '',
      appName: process.env.NUXT_APP_NAME || 'nuxt-app'
    },
  }
})
