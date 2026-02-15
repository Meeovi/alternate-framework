// src/types/meeovi.d.ts
import type { MeeoviAdapter } from '@/lib/sdk'

declare module '#app' {
  interface NuxtApp {
    $meeoviAdapter: MeeoviAdapter
  }
}

export {}