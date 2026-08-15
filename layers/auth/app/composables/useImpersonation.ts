import type { User } from 'better-auth'
import { useAuth } from './useAuth'
import { useToast } from './useSnackbar'
import { useState } from 'nuxt/app'
import { computed, onMounted } from 'vue'

export const useImpersonation = () => {
  useAuth()
  const toast = useToast()

  const impersonatedUser = useState<User | null>('impersonated-user', () => null)
  const isImpersonating = computed(() => !!impersonatedUser.value)

  onMounted(async () => {
    // 'impersonatedBy' does not exist on session type, so nothing to do here for now
  })

  async function startImpersonation(user: User) {
    try {
      // The admin plugin's real server endpoint — mounted under
      // /api/auth/[...all] like every other better-auth route. There is no
      // custom /api/impersonate-user route in this app.
      await $fetch('/api/auth/admin/impersonate-user', {
        method: 'POST',
        body: { userId: user.id },
      })
      impersonatedUser.value = user
      toast.add({
        title: 'Success',
        description: 'Impersonation started successfully',
        color: 'success',
      })
    } catch (error) {
      toast.add({
        title: 'Error',
        description: 'Failed to start impersonation',
        color: 'error',
      })
    }
  }

  async function stopImpersonation() {
    try {
      await $fetch('/api/auth/admin/stop-impersonating', {
        method: 'POST',
      })
      impersonatedUser.value = null
      toast.add({
        title: 'Success',
        description: 'Impersonation stopped successfully',
        color: 'success',
      })
    } catch (error) {
      toast.add({
        title: 'Error',
        description: 'Failed to stop impersonation',
        color: 'error',
      })
    }
  }

  return {
    isImpersonating,
    impersonatedUser,
    startImpersonation,
    stopImpersonation,
  }
}
