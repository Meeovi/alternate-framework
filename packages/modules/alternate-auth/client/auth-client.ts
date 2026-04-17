import { createAuthClient } from 'better-auth/vue'

export const authClient = createAuthClient()

export const {
  signIn,
  signOut,
  signUp,
  useSession,
} = authClient

// better-auth client method names vary by version/plugins, so keep a guarded bridge.
export const forgotPassword = (...args: any[]) => (authClient as any).forgotPassword?.(...args)
export const forgetPassword = (...args: any[]) => (authClient as any).forgotPassword?.(...args)
export const resetPassword = (...args: any[]) => (authClient as any).resetPassword?.(...args)
