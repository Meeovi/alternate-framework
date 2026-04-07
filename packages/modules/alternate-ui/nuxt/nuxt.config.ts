export default defineNuxtConfig({
  css: ['@storefront-ui/nuxt/style.css'],

  components: [{
    path: '../src/components',
    prefix: 'Sf'
  }],

  modules: [
    'vuetify-nuxt-module',
  ],

  plugins: ['~/plugins/ui.client'],

  vuetify: {
    icons: {
      defaultSet: 'fa',
      sets: [{
        name: 'fa',
        cdn: 'https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@latest/css/all.min.css',
      }],
    },
    theme: {
      defaultTheme: 'light',
      themes: {
        light: {},
        dark: {},
      },
    },
  },
})