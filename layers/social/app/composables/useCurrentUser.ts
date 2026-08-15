// Auto-imported (layers/social/app/composables/* is scanned by Nuxt) —
// components import this from '#imports' expecting a global composable
// that never actually existed anywhere in the codebase. Wraps the real
// better-auth session client (same one FollowButton.vue uses directly)
// rather than introducing a second auth mechanism.
import { ref, onMounted } from 'vue'
import { authClient } from '#auth/lib/auth-client'

export function useCurrentUser() {
  const user = ref<Record<string, any> | null>(null)

  onMounted(async () => {
    const { data } = await authClient.useSession()
    user.value = data?.user ?? null
  })

  return user
}
