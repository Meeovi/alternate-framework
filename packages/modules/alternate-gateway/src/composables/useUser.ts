import { computed, readonly } from 'vue'
import { useAuth } from './useAuth'

export function useUser() {
  const { user } = useAuth()

  const userDisplayName = computed(() => {
    const fullName = String(user.value?.name || '').trim()
    const parts = fullName.split(/\s+/).filter(Boolean)
    return {
      firstName: parts[0] || '',
      lastName: parts.slice(1).join(' '),
      fullName,
      email: String(user.value?.email || ''),
    }
  })

  return {
    user: readonly(user),
    userDisplayName,
  }
}
