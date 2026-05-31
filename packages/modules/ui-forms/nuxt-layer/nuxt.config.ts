export default defineNuxtConfig({
  components: [
    {
      path: '../src/components',
      pathPrefix: false,
    },
  ],
  plugins: ['../nuxt-layer/plugins/jsonforms.client'],
})
