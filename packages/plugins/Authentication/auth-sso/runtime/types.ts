// Structural copy of the auth layer's plugin contract
// (layers/auth/modules/auth-plugins.ts and server/utils/auth.ts) — plugins
// can't import from a layer. Keep in step with those files.

/** One entry in the auth layer's `mframework:auth-plugins` hook. */
export type AuthPluginEntry = {
  name: string
  /** Default-exports `(context: AuthPluginContext) => plugin | plugin[]`. */
  server?: string
  /** Default-exports `() => plugin | plugin[]`. */
  client?: string
}

/** What the auth layer lends a package's server plugin. */
export type AuthPluginContext = {
  logAuditEvent: (entry: {
    userId?: string
    id: string
    category: string
    action: string
    targetType: string
    targetId: string
    status: string
    details?: string
  }) => Promise<unknown>
  sendAuthEmail: (params: { to: string, subject: string, html: string, text: string }) => Promise<{ error: string | null }>
}

declare module '@nuxt/schema' {
  interface NuxtHooks {
    'mframework:auth-plugins': (plugins: AuthPluginEntry[]) => void | Promise<void>
  }
}
