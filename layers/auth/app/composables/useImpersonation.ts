import type { User } from 'better-auth'

export const useImpersonation = () => {
  const { session } = useAuth()
  const toast = useToast()

  const impersonatedUser = useState<User | null>('impersonated-user', () => null)
  const isImpersonating = computed(() => !!impersonatedUser.value)

  onMounted(async () => {
    if (session.value?.impersonatedBy) {
      await stopImpersonation()
    }
  })

  async function startImpersonation(user: User) {
    try {
      await $fetch('/api/impersonate-user', {
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
      await $fetch('/api/stop-impersonation', {
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