import { sdk, initGateway } from 'alternate-sdk'

export default defineNuxtPlugin((nuxtApp) => {
  initGateway(nuxtApp)
  return {
    provide: {
      sdk
    }
  }
})
