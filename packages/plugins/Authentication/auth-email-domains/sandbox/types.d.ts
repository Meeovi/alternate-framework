// What a sandboxed auth plugin's server entry exports, and what it's handed.
// Structural copy of the auth layer's contract (layers/auth/server/utils/
// plugins/host.ts and sandbox-child.mjs) — plugins can't import from a
// layer. Keep in step with those files.

/** The fields of a user a sandboxed plugin is given. */
export interface PluginUser {
  id: string | null
  name: string | null
  /** The part of the email after the @. */
  emailDomain: string | null
  /** Only with the `user:email` permission. */
  email?: string | null
  emailVerified: boolean
  createdAt: string | null
}

/** The second argument of every hook and endpoint. */
export interface PluginContext {
  /** This site's settings for the plugin (declared in the manifest, defaults filled in). */
  settings: Readonly<Record<string, unknown>>
  /** The plugin's own key-value store (JSON values up to 16 KB, 1000 keys). */
  store: {
    get(key: string): Promise<unknown>
    set(key: string, value: unknown): Promise<void>
    delete(key: string): Promise<void>
    list(prefix?: string): Promise<string[]>
  }
  /** A line in the server log. */
  log(...parts: unknown[]): void
  /** An entry in the auth audit log (category auth-plugin). */
  audit(action: string, details?: unknown): Promise<void>
}

/** `*.before` hooks may refuse; the message is shown to the user. */
export type HookResult = { deny: string } | void | null | undefined

export interface EndpointRequest {
  method: 'GET' | 'POST'
  path: string
  query: Record<string, string>
  body: Record<string, unknown> | null
  /** Signed-in user (null for anonymous calls to public endpoints). */
  user: PluginUser | null
  admin: boolean
}

/** A JSON body (status 200), or { status, body }. */
export type EndpointResult = unknown | { status?: number, body?: unknown }

export interface SandboxedAuthPlugin {
  hooks?: {
    'user.create.before'?: (input: { user: PluginUser }, ctx: PluginContext) => Promise<HookResult> | HookResult
    'user.create.after'?: (input: { user: PluginUser }, ctx: PluginContext) => unknown
    'session.create.before'?: (input: { user: PluginUser }, ctx: PluginContext) => Promise<HookResult> | HookResult
    'session.create.after'?: (input: { user: PluginUser }, ctx: PluginContext) => unknown
    'request.before'?: (input: { path: string, method: string | null, emailDomain: string | null }, ctx: PluginContext) => Promise<HookResult> | HookResult
    'request.after'?: (input: { path: string, method: string | null, status: number, user: PluginUser | null }, ctx: PluginContext) => unknown
  }
  /** Keyed "GET /path" / "POST /path", as declared in the manifest. */
  endpoints?: Record<string, (request: EndpointRequest, ctx: PluginContext) => Promise<EndpointResult> | EndpointResult>
}

/** One entry in the auth layer's `mframework:auth-plugins` hook. */
export type AuthPluginEntry = {
  name: string
  server?: string
  client?: string
  /** A sandboxed plugin's server entry (self-contained ES module). */
  sandbox?: string
}

declare module '@nuxt/schema' {
  interface NuxtHooks {
    'mframework:auth-plugins': (plugins: AuthPluginEntry[]) => void | Promise<void>
  }
}
