import { computed, inject, readonly, ref } from 'vue'
import { AuthKey } from '../injection/keys'
import type { AuthContract, AuthSession } from '../contracts/auth'
import type { User } from '../contracts/user'

const sessionRef = ref<AuthSession | null>(null)
const userRef = ref<User | null>(null)
const initialized = ref(false)

async function ensureSession(auth: AuthContract) {
  if (initialized.value) return
  initialized.value = true

  try {
    const session = await auth.getSession()
    sessionRef.value = session
    userRef.value = session?.user ?? null
  } catch {
    sessionRef.value = null
    userRef.value = null
  }
}

export function useAuth() {
  // TS sees this as AuthContract | undefined
  const injected = inject(AuthKey)

  // Narrow it once — now TS knows it's AuthContract
  if (!injected) {
    throw new Error(
      '[@mframework/core] Auth not provided. ' +
      'Provide AuthKey with an AuthContract implementation in your Nuxt layer.'
    )
  }

  const auth = injected as AuthContract

  void ensureSession(auth)

  async function login(credentials: Parameters<AuthContract['login']>[0]) {
    const session = await auth.login(credentials)
    sessionRef.value = session
    userRef.value = session.user ?? null
    return session
  }

  async function logout() {
    await auth.logout()
    sessionRef.value = null
    userRef.value = null
  }

  async function refresh() {
    if (!auth.refresh) return sessionRef.value
    const session = await auth.refresh()
    sessionRef.value = session
    userRef.value = session?.user ?? null
    return session
  }

  async function fetchSession() {
    const session = await auth.getSession()
    sessionRef.value = session
    userRef.value = session?.user ?? null
    return session
  }

  async function signOut({ redirectTo }: { redirectTo?: string } = {}) {
    await logout()
    // if (redirectTo && typeof navigateTo === 'function') {
    //   await navigateTo(redirectTo)
    // }
  }

  return {
    auth,
    session: readonly(sessionRef),
    user: readonly(userRef),
    initialized: readonly(initialized),
    loggedIn: computed(() => Boolean(sessionRef.value?.user)),
    login,
    signIn: login,
    logout,
    signOut,
    fetchSession,
    refresh
  }
}
