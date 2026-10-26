// Needs Vuetify and the auth layer's /api/auth/get-session to be useful;
// in this monorepo, try it in apps/ecosystem/meeovi-frontend instead.
export default defineNuxtConfig({
  modules: ['../src/module'],
  devtools: { enabled: true },
  compatibilityDate: 'latest',
  bookmarkit: {},
})
