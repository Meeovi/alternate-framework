import MyModule from '../../../src/module'

export default defineNuxtConfig({
  modules: [
    MyModule,
  ],
  mautic: {
    apiBaseUrl: 'https://example.com',
    apiPath: '/api',
  },
})
