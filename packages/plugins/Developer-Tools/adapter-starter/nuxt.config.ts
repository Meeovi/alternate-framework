// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  modules: ["@nuxt/a11y", "@nuxt/eslint"],

  runtimeConfig: {
    public: {
      adapterStarter: {
        endpoint: process.env.ADAPTER_STARTER_ENDPOINT,
        token: process.env.ADAPTER_STARTER_TOKEN
      }
    }
  }
})