export default defineNuxtConfig({
  //modules: ['adapter-starter'],
  devtools: { enabled: true },
  compatibilityDate: 'latest',
  runtimeConfig: {
    public: {
      adapterStarter: {
        endpoint: process.env.ADAPTER_STARTER_ENDPOINT,
        token: process.env.ADAPTER_STARTER_TOKEN
      }
    }
  }
})
