export default defineNuxtConfig({
  modules: [
    '@mframework/adapter-magento',
  ],

  magento: {
    url: process.env.MAGENTO_URL,
    token: process.env.MAGENTO_ADMIN_TOKEN,
    provider: 'rest'
  },

  devtools: { enabled: true },
  compatibilityDate: 'latest',
})
