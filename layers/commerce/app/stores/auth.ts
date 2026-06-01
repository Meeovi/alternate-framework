import { defineStore } from '#imports'

export const useAuthStore = defineStore('auth', () => {
  const user = ref(null as null | { id: string; name: string; email: string; roles?: string[] })
  const token = ref<string | null>(null)
  const isAuthenticated = computed(() => !!user.value && !!token.value)
  const permissions = ref<string[]>([])

  function setUser(newUser: any) {
    user.value = newUser
  }

  function setToken(newToken: string | null) {
    token.value = newToken
  }

  function setPermissions(perms: string[]) {
    permissions.value = perms
  }

  function logout() {
    user.value = null
    token.value = null
    permissions.value = []
  }

  return { user, token, isAuthenticated, permissions, setUser, setToken, setPermissions, logout }
})
