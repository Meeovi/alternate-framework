// packages/alternate-sdk/types/nuxt.d.ts
import type { AlternateSDK } from './sdk'

declare module '#app' {
  interface NuxtApp {
    $sdk: AlternateSDK
  }
}

declare module 'vue' {
  interface ComponentCustomProperties {
    $sdk: AlternateSDK
  }
}

export {}
