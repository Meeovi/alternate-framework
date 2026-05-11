import {
  computed,
  defineComponent,
  getCurrentInstance,
  nextTick,
  onMounted,
  onUnmounted,
  ref,
  watch,
} from 'vue'
import {
  onNuxtReady,
  useAppConfig,
  useAsyncData,
  useHead,
  useRoute,
  useRouter,
  useRuntimeConfig,
} from 'nuxt/app'

const hydrated = ref(false)

if (import.meta.client) {
  onNuxtReady(() => {
    hydrated.value = true
  })
}

export const isHydrated = hydrated

export function onHydrated(cb: () => void) {
  if (hydrated.value) {
    cb()
    return
  }

  const stop = watch(hydrated, (value) => {
    if (!value)
      return
    stop()
    cb()
  })
}

export function useHydratedHead(head: Parameters<typeof useHead>[0]) {
  onHydrated(() => {
    useHead(head)
  })
}

export {
  computed,
  defineComponent,
  getCurrentInstance,
  nextTick,
  onMounted,
  onUnmounted,
  ref,
  useAppConfig,
  useAsyncData,
  useHead,
  useRoute,
  useRouter,
  useRuntimeConfig,
  watch,
}
