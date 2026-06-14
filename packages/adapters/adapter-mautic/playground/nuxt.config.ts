export default defineNuxtConfig({
  modules: ['../src/module'],
  devtools: { enabled: true },
  compatibilityDate: 'latest',
  mautic: {
    apiBaseUrl: 'https://example.com',
    apiPath: '/api',
  },
})
