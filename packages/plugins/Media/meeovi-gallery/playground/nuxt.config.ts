// Needs Vuetify, the auth layer's /api/auth/get-session and the app's
// Pixanomy settings to be useful; in this monorepo, try it in
// apps/ecosystem/meeovi-frontend instead.
export default defineNuxtConfig({
  modules: ['../src/module'],
  devtools: { enabled: true },
  compatibilityDate: 'latest',
  meeoviGallery: {},
})
