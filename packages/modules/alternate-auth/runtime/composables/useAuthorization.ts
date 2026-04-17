import { useCurrentUser } from './useCurrentUser'

export function useAuthorization() {
  const user = useCurrentUser()

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

  return {
    user,
    hasRole,
    requireRole,
    canAccessAdmin: computed(() => hasRole(['admin', 'superadmin'])),
  }
}
