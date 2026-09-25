import { defineNuxtModule } from '@nuxt/kit'

export interface AlternateSdkModuleOptions {
  gatewayAdapter?: any
}

export default defineNuxtModule<AlternateSdkModuleOptions>({
  meta: {
    name: 'alternate-sdk',
    configKey: 'alternateSdk',
    compatibility: {
      nuxt: '>=4.0.0',
    },
  },
  setup(options) {
    const gateway = options.gatewayAdapter

    if (gateway) {
      try {
        const { setGatewayAdapter } = require('./runtime/backend.js')
        setGatewayAdapter(gateway)
      } catch {
        // Best-effort
      }
    }
  },
})
