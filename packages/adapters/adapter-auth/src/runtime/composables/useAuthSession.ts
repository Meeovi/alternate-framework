// src/runtime/composables/useAuthSession.ts
import { useAdapterAuthClient } from './useAuthClient'

export const useAdapterAuthSession = () => {
  const authClient = useAdapterAuthClient()
  // Better Auth Vue client usually exposes useSession
  const session = authClient.useSession()
  return session
}