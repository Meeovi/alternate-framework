// in runtime/server/auth.ts
import { auth } from 'better-auth'
import { useRuntimeConfig } from '#imports'

export const createAdapterAuth = () => {
  const config = useRuntimeConfig().adapterAuth
  // use config to build auth instance
  return auth({
    // ...config.serverOptions
  })
}

export const adapterAuth = createAdapterAuth()