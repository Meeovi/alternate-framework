import { computed } from 'vue'
import { useSession } from './useSession'

export function useIsAuthenticated() {
  const session = useSession()

  const isAuthenticated = computed(() => {
    return !!session.value?.user
  })

  return isAuthenticated
}
