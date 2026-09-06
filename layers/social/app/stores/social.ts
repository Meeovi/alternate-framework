// layers/social/stores/social.ts
import { defineStore } from '#imports'

export const useSocialStore = defineStore('social', () => {
  // Local cache map tracking follow states across items dynamically: { "targetId": true/false }
  const followRegistry = ref<Record<string, boolean>>({})

  // Auth session, shared by every FollowButton instance on the page instead
  // of each one firing its own GET /api/auth/get-session on mount. Grid
  // pages like connect/members and connect/friends render dozens of
  // FollowButtons at once; confirmed live (console + network trace on
  // connect/members' ~68-card grid) that firing one get-session call per
  // card serializes them into a queue roughly 600ms apart — the DB round
  // trip to the pooled Postgres instance behind better-auth appears to
  // process them essentially one at a time — so most cards sat on the
  // logged-out "Sign in to follow" state for up to a minute after a
  // genuinely valid sign-in, simply because their own copy of the request
  // hadn't reached the front of the queue yet. One memoized fetch, shared
  // by every caller via this store singleton, replaces the N redundant
  // round trips with exactly one.
  const session = ref<any>(null)
  const sessionLoaded = ref(false)
  let sessionPromise: Promise<any> | null = null

  async function fetchSession(force = false) {
    if (force) {
      sessionPromise = null
      sessionLoaded.value = false
    }
    if (sessionLoaded.value) return session.value
    if (!sessionPromise) {
      sessionPromise = (async () => {
        try {
          const res = await fetch('/api/auth/get-session', { headers: { accept: 'application/json' } })
          const body = res.ok ? await res.json().catch(() => null) : null
          session.value = body?.user ?? null
        } catch {
          session.value = null
        } finally {
          sessionLoaded.value = true
        }
        return session.value
      })()
    }
    return sessionPromise
  }

  async function toggleFollow(targetId: string, targetType: string) {
    try {
      const data = await $fetch('/api/social/follow', {
        method: 'POST',
        body: { targetId, targetType }
      })
      
      // Update store reactivity seamlessly
      followRegistry.value[targetId] = data.following
    } catch (error) {
      console.error('Failed to toggle follow status:', error)
    }
  }

  const isFollowing = (targetId: string) => computed(() => !!followRegistry.value[targetId])

  return {
    followRegistry,
    session,
    sessionLoaded,
    fetchSession,
    toggleFollow,
    isFollowing
  }
})