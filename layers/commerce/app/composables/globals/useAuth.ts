import { ref } from 'vue'

export function useAuth() {
  const token = ref<string | null>(process.env.COMMERCE_TOKEN || null)
  const refreshInProgress = ref(false)

  function isTokenExpired() {
    // Best-effort check: token may be JWT
    if (!token.value) return true
    try {
      const parts = token.value.split('.')
      const payloadPart = parts[1]
      if (parts.length !== 3 || !payloadPart) return false
      const payload = JSON.parse(atob(payloadPart))
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
      const resp = await fetch(`${process.env.COMMERCE_API_URL}/auth/refresh`, { method: 'POST', credentials: 'include' })
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
