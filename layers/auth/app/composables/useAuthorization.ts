import { computed, ref } from 'vue'
import { authClient } from '../../lib/auth-client'
import { navigateTo } from 'nuxt/app'

export function useAuthorization() {
  const session = ref<any>(null)

  const user = computed(() => session.value?.user)

  const normalizeRoles = (roles: string | string[]) => (Array.isArray(roles) ? roles : [roles])

  const hasRole = (roles: string | string[]) => {
    const allowed = normalizeRoles(roles)
    const role = user.value?.role
    return Boolean(role && allowed.includes(role))
  }

  const requireRole = async (roles: string | string[], redirectTo = '/') => {
    if (!hasRole(roles)) {
      await navigateTo(redirectTo)
      return false
    }

    return true
  }

  async function loadSession() {
    const { data } = await (authClient as any).useSession()
    session.value = (data as any).value
  }

  return {
    session,
    user,
    hasRole,
    requireRole,
    loadSession,
    canAccessAdmin: computed(() => hasRole(['admin', 'superadmin'])),
  }
}
