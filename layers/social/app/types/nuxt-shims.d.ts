declare module '*.vue' {
  import type { DefineComponent } from 'vue'
  const component: DefineComponent<{}, {}, any>
  export default component
}

declare module '#imports' {
  export * from 'vue'
  export * from 'nuxt/app'
  export * from 'vue-router'
  export * from '@vueuse/core'
}

declare module '#shared/types' {
  export * from '../../../../shared/shared/types'
}
