/**
 * Frontend auth composable.
 *
 * Previously this composable imported `AuthAdapterRegistry` from
 * `alternate-sdk` and accessed `globalThis.useGateway` directly — both are
 * server-side concepts that should not be imported by browser code.
 *
 * This version delegates all auth operations to the server-side endpoint
 * `POST /api/gateway/auth`, which resolves the default auth adapter on
 * the server and forwards the call. The frontend only depends on HTTP +
 * the `AuthAdapter` method contract, making it backend-agnostic.
 */

type AnyRecord = Record<string, any>

const callAuthDriver = (method: string, ...args: unknown[]): Promise<any> => {
  if (!method) return Promise.resolve(undefined)

  return $fetch('/api/gateway/auth', {
    method: 'POST',
    body: { method, args: args.length > 0 ? args : undefined },
  }).catch(() => undefined)
}

export function useAuth() {
  return {
    login: (payload: AnyRecord): Promise<any> =>
      callAuthDriver('login', payload).then((result) => {
        if (result !== undefined) return result
        return callAuthDriver('signIn', payload)
      }),

    logout: (): Promise<void> =>
      callAuthDriver('logout').then(() => {}),

    getSession: (): Promise<any> =>
      callAuthDriver('getSession').then((result) => result ?? callAuthDriver('fetchSession')),

    getProfile: (): Promise<any> =>
      callAuthDriver('getProfile').then((result) => result ?? null),

    updateProfile: (payload: AnyRecord): Promise<any> =>
      callAuthDriver('updateProfile', payload),

    register: (payload: AnyRecord): Promise<any> =>
      callAuthDriver('register', payload).then((result) => {
        if (result !== undefined) return result
        return callAuthDriver('signUp', payload)
      }),

    getAdapter: (): any => ({}),
  }
}

export default useAuth
