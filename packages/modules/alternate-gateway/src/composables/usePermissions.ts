import { computed } from 'vue'
import { useRoles } from './useRoles'

export type PermissionCheck = (roles: readonly string[]) => boolean

export function usePermissions() {
  const roles = useRoles()

  function can(check: PermissionCheck) {
    return check(roles.value)
  }

  const hasRole = (role: string) => {
    return roles.value.includes(role)
  }

  return {
    roles,
    can,
    hasRole
  }
}
