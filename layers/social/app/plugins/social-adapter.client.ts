// layers/social/plugins/social-adapter.ts

import type { SocialAdapter } from '../adapter/SocialAdapter'
import { mockAdapter } from '../adapter/mockAdapter'

export default defineNuxtPlugin(() => {
  const runtimeConfig = useRuntimeConfig()

  const adapter: SocialAdapter =
    (globalThis as any).__adapter ||
    mockAdapter // fallback to mock in dev

  return {
    provide: {
      adapter
    }
  }
})
