// Local user composable stub for lists layer
import { ref, computed } from 'vue'

// This is a stub implementation. Parent app should provide actual user data
const user = ref<any>(null)

export function useUser() {
  const userDisplayName = computed(() => ({
    firstName: user.value?.first_name || user.value?.firstName || '',
    lastName: user.value?.last_name || user.value?.lastName || ''
  }))

  return {
    user,
    userDisplayName
  }
}

// Allow parent app to set user data
export function setUser(userData: any) {
  user.value = userData
}
