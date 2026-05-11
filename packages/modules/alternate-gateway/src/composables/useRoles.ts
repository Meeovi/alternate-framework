import { computed } from 'vue'
import { useUser } from './useUser'

export function useRoles() {
  const user = useUser()

  const roles = computed(() => {
    return user.user.value?.roles ?? []
  })

  return roles
}
