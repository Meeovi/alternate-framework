
export default defineNuxtConfig({
  //modules: ['@mframework/adapter-directus'],
  devtools: { enabled: true },

  routeRules: {
    "/directus/**": { proxy: `${import.meta.env.API_URL}/**` },
  },

  compatibilityDate: 'latest',
})
