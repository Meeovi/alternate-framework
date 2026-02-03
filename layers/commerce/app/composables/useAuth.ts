import { ref } from 'vue'

export function useAuth() {
  const token = ref<string | null>(process.env.MAGENTO_TOKEN || null)
  const refreshInProgress = ref(false)

  function isTokenExpired() {
    // Best-effort check: token may be JWT
    if (!token.value) return true
    try {
      const parts = token.value.split('.')
      if (parts.length !== 3) return false
      const payload = JSON.parse(atob(parts[1]))
      const exp = payload.exp as number | undefined
      if (!exp) return false
      return Date.now() / 1000 > exp - 30
    } catch {
      return false
    }
  }

  async function refreshAccessToken() {
    if (refreshInProgress.value) return
    refreshInProgress.value = true
    try {
      const resp = await fetch(`${process.env.MAGENTO_API_URL}/auth/refresh`, { method: 'POST', credentials: 'include' })
      if (resp.ok) {
        const data = await resp.json()
        token.value = data.token || token.value
      }
    } finally {
      refreshInProgress.value = false
    }
  }

  function logout() {
    token.value = null
  }

  return { token, isTokenExpired, refreshAccessToken, logout }
}

export default useAuth
