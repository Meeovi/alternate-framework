import type { SharedLocateProvider } from '../plugins/locate.client'
import type { SharedMediaProvider } from '../plugins/media.client'
import type { SharedSearchProvider } from '../plugins/search.client'

declare module '#app' {
  interface NuxtApp {
    $ui: {
      prefix: string
    }
    $media: SharedMediaProvider
    $search: SharedSearchProvider
    $locate: SharedLocateProvider
  }
}

declare module 'vue' {
  interface ComponentCustomProperties {
    $ui: {
      prefix: string
    }
    $media: SharedMediaProvider
    $search: SharedSearchProvider
    $locate: SharedLocateProvider
  }
}

export {}
