// composables/useNovu.js
import { Novu } from '@novu/api'

export const useNovu = () => {
  const config = useRuntimeConfig()

  return new Novu({
    secretKey: config.novuSecretKey as string
  })
}