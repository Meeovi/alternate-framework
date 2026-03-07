// Minimal auth runtime shim for local typechecking and dev
export function createAuthAdapter(_transport: any) {
  return {
    async getUser(id: string) {
      return { id }
    },
  }
}

export const auth: any = {
  api: {
    async getMcpSession(_opts: any) {
      return null
    },
  },
}

export function useServerAuth() {
  return auth
}

export async function requireAuth(_event: any) {
  // permissive stub for dev: return a fake user
  return { id: 'dev' }
}

export { auth as default }
