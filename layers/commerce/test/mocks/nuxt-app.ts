import { ref, type Ref } from 'vue'

const stateStore = new Map<string, Ref<unknown>>()

export const useState = <T>(key: string, init?: () => T): Ref<T> => {
  if (!stateStore.has(key)) {
    stateStore.set(key, ref(init ? init() : undefined) as Ref<unknown>)
  }

  return stateStore.get(key) as Ref<T>
}

export const useAsyncData = async <T>(handler: () => Promise<T> | T) => {
  try {
    const value = await handler()
    return {
      data: ref(value) as Ref<T>,
      error: ref(null) as Ref<Error | null>,
    }
  } catch (error) {
    return {
      data: ref(null) as Ref<T | null>,
      error: ref(error as Error),
    }
  }
}

export const useRuntimeConfig = () => ({ public: {} })

export const __resetNuxtState = () => {
  stateStore.clear()
}
