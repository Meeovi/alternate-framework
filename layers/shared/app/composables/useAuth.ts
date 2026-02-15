// src/composables/useAuth.ts
import { ref, computed } from 'vue'
import { useAdapter } from '../lib/sdk'

const userState = ref<any | null>(null)
const loadingState = ref(false)

export function useAuth() {
  const adapter = useAdapter()

  const user = computed(() => userState.value)
  const isAuthenticated = computed(() => !!userState.value)
  const loading = computed(() => loadingState.value)

  async function login(credentials: Record<string, any>) {
    loadingState.value = true
    try {
      const me = await adapter.auth.login(credentials)
      userState.value = me
      return me
    } finally {
      loadingState.value = false
    }
  }

  async function logout() {
    loadingState.value = true
    try {
      await adapter.auth.logout()
      userState.value = null
    } finally {
      loadingState.value = false
    }
  }

  async function fetchUser() {
    loadingState.value = true
    try {
      const me = await adapter.auth.me()
      userState.value = me
      return me
    } finally {
      loadingState.value = false
    }
  }

  return {
    user,
    isAuthenticated,
    loading,
    login,
    logout,
    fetchUser
  }
}