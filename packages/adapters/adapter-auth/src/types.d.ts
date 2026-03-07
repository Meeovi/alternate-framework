// src/types.d.ts
import type { AuthClient } from 'better-auth/vue'

declare module '#app' {
  interface NuxtApp {
    $authClient: AuthClient
  }
}

declare module 'vue' {
  interface ComponentCustomProperties {
    $authClient: AuthClient
  }
}