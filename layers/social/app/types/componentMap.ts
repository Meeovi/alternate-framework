// types/componentMap.ts
// Typed central place for space content component loaders
import type { DefineComponent } from 'vue'

export type AsyncComponentLoader = () => Promise<DefineComponent | { default: DefineComponent } | any>

export const componentMap: AsyncComponentLoader[] = [
  () => import('../components/features/spaceSections/defaultSpaces.vue'),
  () => import('../components/features/spaceSections/audioSpaces.vue'),
  () => import('../components/features/spaceSections/videoSpaces.vue'),
  () => import('../components/features/spaceSections/imageSpaces.vue'),
  () => import('../components/features/spaceSections/textSpaces.vue'),
]

export default componentMap
