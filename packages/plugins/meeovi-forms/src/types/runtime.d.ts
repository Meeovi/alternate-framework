declare module '#app' {
  interface NuxtApp {
    $meeoviForms: {
      config: { apiBase: string; apis: any[] } | undefined
      getApi: (name: string) => any | null
      getApis: () => any[]
    }
  }
}

declare module 'vue' {
  interface ComponentCustomProperties {
    $meeoviForms: {
      config: { apiBase: string; apis: any[] } | undefined
      getApi: (name: string) => any | null
      getApis: () => any[]
    }
  }
}

declare global {
  const defineNuxtPlugin: (callback: (nuxtApp: any) => void | (() => void)) => void
  function useRuntimeConfig(): any
  function useNuxtApp(): any
}

export {}
