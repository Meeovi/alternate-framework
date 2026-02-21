import { ref, computed } from 'vue'

export type UserLogin = any

export const users = ref<UserLogin[]>([])
export const currentUser = ref<UserLogin | undefined>(undefined)
export const currentUserHandle = ref('')
export const publicServer = ref('')
export const currentServer = computed(() => currentUser.value?.server || publicServer.value)

export function useUsers() {
  return users
}

export async function loginTo(masto: any, user: any) {
  // If no token provided, treat as public server selection
  if (!user?.token) {
    publicServer.value = user.server
    return null
  }

  // Try to verify the token via the server-side Mastodon proxy
  try {
    const res = await fetch(`/api/masto/api/v1/accounts/verify_credentials`, { headers: { Authorization: `Bearer ${user.token}` } })
    if (!res.ok) throw new Error('Invalid token')
    const account = await res.json()

    // Persist mapping in database via server endpoint (uses Prisma from @mframework/core)
    try {
      await fetch(`/api/auth/link-mastodon`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ server: user.server, token: user.token, account }),
      })
    } catch (e) {
      // best-effort persistence — do not block login flow on DB errors
      console.warn('Failed to persist user to DB', e)
    }

    const existing = users.value.find(u => u.server === user.server && u.token === user.token)
    if (existing) {
      existing.account = account
    } else {
      users.value.push({ ...user, account })
    }

    currentUserHandle.value = account.acct
    // Best-effort: request server to create BetterAuth session cookie
    try {
      await fetch(`/api/auth/create-session`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ account }),
      })
    } catch (e) {
      console.warn('create-session request failed', e)
    }

    return { ...user, account }
  } catch (err) {
    console.warn('loginTo failed', err)
    return null
  }
}

export default useUsers
