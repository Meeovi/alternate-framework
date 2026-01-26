// types/nuxt.d.ts
import type { AuthComposable } from '@meeovi/auth'

declare module '#app' {
  interface NuxtApp {
    $auth: AuthComposable
  }
}

declare module '@vue/runtime-core' {
  interface ComponentCustomProperties {
    $auth: AuthComposable
  }
}
