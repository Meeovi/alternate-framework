// packages/sdk/auth/adapter.ts

export interface AuthAdapter {
  fetchSession?: (...args: any[]) => Promise<any>
  getSession?: (...args: any[]) => Promise<any>
  signIn?: (...args: any[]) => Promise<any>
  signOut?: (...args: any[]) => Promise<any>
  signUp?: (...args: any[]) => Promise<any>
  refresh?: (...args: any[]) => Promise<any>
  requestPasswordReset?: (...args: any[]) => Promise<any>
  confirmPasswordReset?: (...args: any[]) => Promise<any>
}

export function createAuthAdapter(
  runtimeAuth: Partial<AuthAdapter> = {},
  gatewayAuth: Partial<AuthAdapter> = {}
): AuthAdapter {
  const call = async (names: string[], ...args: any[]) => {
    for (const name of names) {
      const runtimeFn = (runtimeAuth as any)[name]
      const gatewayFn = (gatewayAuth as any)[name]
      if (typeof runtimeFn === 'function') return runtimeFn(...args)
      if (typeof gatewayFn === 'function') return gatewayFn(...args)
    }
    return null
  }

  return {
    fetchSession: (...args) => call(['fetchSession', 'getSession'], ...args),
    getSession: (...args) => call(['getSession', 'fetchSession'], ...args),
    signIn: (...args) => call(['signIn', 'login'], ...args),
    signOut: (...args) => call(['signOut', 'logout'], ...args),
    signUp: (...args) => call(['signUp', 'register'], ...args),
    refresh: (...args) => call(['refresh', 'refreshSession'], ...args),
    requestPasswordReset: (...args) => call(['requestPasswordReset', 'forgotPassword'], ...args),
    confirmPasswordReset: (...args) => call(['confirmPasswordReset', 'resetPassword'], ...args),
  }
}
