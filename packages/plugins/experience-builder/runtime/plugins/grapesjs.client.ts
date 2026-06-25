import { defineNuxtPlugin } from 'nuxt/app'
import grapesjs, { Editor } from 'grapesjs'
import 'grapesjs/dist/css/grapes.min.css'

declare module 'nuxt/app' {
  interface NuxtApp {
    $grapesjs: typeof grapesjs
  }
}

declare module 'vue' {
  interface ComponentCustomProperties {
    $grapesjs: typeof grapesjs
  }
}

export default defineNuxtPlugin(() => {
  return {
    provide: {
      grapesjs
    }
  }
})
