import type { MauticClient } from './client'

declare module '@nuxt/schema' {
  interface NuxtApp {
    $mautic: MauticClient
  }

  interface ComponentCustomProperties {
    $mautic: MauticClient
  }
}

export {}