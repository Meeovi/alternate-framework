// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  modules: ["@nuxt/a11y", "@nuxt/eslint"],

  runtimeConfig: {
    mybackend: {
      endpoint: process.env.MYBACKEND_ENDPOINT,
      token: process.env.MYBACKEND_TOKEN
    }
  }
})