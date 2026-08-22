export default defineNuxtPlugin((nuxtApp) => {
  const runtimeConfig = useRuntimeConfig()
  const config = (runtimeConfig.public as any)?.meeoviForms as
    | { apiBase: string; apis: any[] }
    | undefined

  const api: any = {
    config,
    getApi (name: string) {
      return config?.apis?.find((api: any) => api.name === name) || null
    },
    getApis () {
      return config?.apis || []
    }
  }

  nuxtApp.provide('meeoviForms', api)
})
