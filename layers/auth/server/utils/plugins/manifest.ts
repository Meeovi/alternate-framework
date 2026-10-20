/**
 * The manifest a sandboxed auth plugin declares in its package.json, under
 * `mframework.auth`. It is the trust anchor: the sandbox only runs the hooks
 * and endpoints listed here, the plugin only reaches the hosts its
 * integration manifest lists, and admins see all of it before turning the
 * plugin on. Pure: used at build time (modules/auth-plugins.ts) and at run
 * time.
 *
 *   "mframework": {
 *     "integration": { "name": "...", "category": "Authentication", "admin": true, "hosts": ["api.example.com"] },
 *     "auth": {
 *       "hooks": ["user.create.before"],
 *       "paths": ["/sign-up/email"],          // for request.before / request.after
 *       "endpoints": [{ "method": "GET", "path": "/check", "access": "public" }],
 *       "permissions": ["user:email"],
 *       "failMode": "closed",                 // a broken plugin blocks (closed) or is skipped (open)
 *       "timeoutMs": 2000,
 *       "settings": { "domains": { "type": "list", "label": "Domains" } }
 *     }
 *   }
 */

/** Points in the auth flow a sandboxed plugin can hook. `*.before` hooks may refuse. */
export const AUTH_HOOK_POINTS = [
  'user.create.before',
  'user.create.after',
  'session.create.before',
  'session.create.after',
  'request.before',
  'request.after',
] as const
export type AuthHookPoint = typeof AUTH_HOOK_POINTS[number]

/** Extra data a plugin may ask for; admins see each one before enabling it. */
export const AUTH_PLUGIN_PERMISSIONS = {
  'user:email': 'Sees users\' full email addresses (otherwise only the part after the @).',
} as const
export type AuthPluginPermission = keyof typeof AUTH_PLUGIN_PERMISSIONS

export type EndpointAccess = 'public' | 'user' | 'admin'
export interface AuthPluginEndpoint {
  method: 'GET' | 'POST'
  /** Below the plugin's prefix: `/api/auth/plugin/<id><path>`. */
  path: string
  access: EndpointAccess
}

export type SettingType = 'text' | 'textarea' | 'boolean' | 'number' | 'select' | 'list'
export interface AuthPluginSetting {
  type: SettingType
  label: string
  help?: string
  default?: unknown
  /** For `select`. */
  options?: string[]
}

export interface SandboxedAuthManifest {
  /** Endpoint prefix and log name, e.g. 'email-domains'. */
  id: string
  hooks: AuthHookPoint[]
  /** Auth paths the request.* hooks run on, e.g. '/sign-up/email'. */
  paths: string[]
  endpoints: AuthPluginEndpoint[]
  permissions: AuthPluginPermission[]
  failMode: 'open' | 'closed'
  timeoutMs: number
  settings: Record<string, AuthPluginSetting>
  /** Outside hosts it may reach (from `mframework.integration.hosts`). */
  hosts: string[]
}

export const PLUGIN_ID_RE = /^[a-z][a-z0-9-]{1,39}$/
/** Taken by the layer's own routes under /api/auth/plugin/. */
export const RESERVED_PLUGIN_IDS = ['enabled']
const ENDPOINT_PATH_RE = /^(\/[a-z0-9][a-z0-9-]{0,39}){1,4}$/
const AUTH_PATH_RE = /^(\/[a-z0-9][a-z0-9-]{0,39}){1,4}$/
const SETTING_KEY_RE = /^[a-zA-Z][a-zA-Z0-9_]{0,39}$/
const HOST_RE = /^(\*\.)?([a-z0-9-]+\.)+[a-z]{2,}$/
const SETTING_TYPES: SettingType[] = ['text', 'textarea', 'boolean', 'number', 'select', 'list']

export const DEFAULT_TIMEOUT_MS = 2000
export const MAX_TIMEOUT_MS = 10_000

const asArray = (value: unknown): unknown[] => (Array.isArray(value) ? value : [])
const str = (value: unknown) => (typeof value === 'string' ? value.trim() : '')

/**
 * Validates `mframework.auth` (and the integration manifest's hosts).
 * Throws with every problem listed: a plugin with a broken manifest isn't
 * built in, rather than run with a guess.
 */
export function parseAuthManifest(raw: unknown, options: { id: string, hosts?: unknown }): SandboxedAuthManifest {
  const m = (raw && typeof raw === 'object' ? raw : {}) as Record<string, unknown>
  const problems: string[] = []

  const id = str(m.id) || options.id
  if (!PLUGIN_ID_RE.test(id)) problems.push(`id "${id}" must be 2-40 lowercase letters, digits or dashes`)
  if (RESERVED_PLUGIN_IDS.includes(id)) problems.push(`id "${id}" is reserved`)

  const hooks = asArray(m.hooks).map(str)
  for (const h of hooks) if (!(AUTH_HOOK_POINTS as readonly string[]).includes(h)) problems.push(`unknown hook "${h}"`)

  const paths = asArray(m.paths).map(str)
  for (const p of paths) {
    if (!AUTH_PATH_RE.test(p) || p.startsWith('/plugin/')) problems.push(`path "${p}" isn't an auth path like "/sign-up/email"`)
  }
  if (hooks.some((h) => h.startsWith('request.')) && !paths.length) problems.push('request.* hooks need "paths"')

  const endpoints: AuthPluginEndpoint[] = []
  for (const e of asArray(m.endpoints)) {
    const o = (e && typeof e === 'object' ? e : {}) as Record<string, unknown>
    const method = str(o.method).toUpperCase() || 'GET'
    const path = str(o.path)
    const access = (str(o.access) || 'user') as EndpointAccess
    if (method !== 'GET' && method !== 'POST') problems.push(`endpoint ${path}: method must be GET or POST`)
    if (!ENDPOINT_PATH_RE.test(path)) problems.push(`endpoint path "${path}" must look like "/status" (lowercase, no parameters)`)
    if (!['public', 'user', 'admin'].includes(access)) problems.push(`endpoint ${path}: access must be public, user or admin`)
    if (endpoints.some((x) => x.path === path && x.method === method)) problems.push(`endpoint ${method} ${path} is declared twice`)
    endpoints.push({ method: method as 'GET' | 'POST', path, access })
  }

  const permissions = asArray(m.permissions).map(str)
  for (const p of permissions) if (!(p in AUTH_PLUGIN_PERMISSIONS)) problems.push(`unknown permission "${p}"`)

  const failMode = str(m.failMode) || 'open'
  if (failMode !== 'open' && failMode !== 'closed') problems.push('failMode must be "open" or "closed"')

  const timeoutMs = m.timeoutMs === undefined ? DEFAULT_TIMEOUT_MS : Number(m.timeoutMs)
  if (!Number.isInteger(timeoutMs) || timeoutMs < 100 || timeoutMs > MAX_TIMEOUT_MS) problems.push(`timeoutMs must be 100-${MAX_TIMEOUT_MS}`)

  const settings: Record<string, AuthPluginSetting> = {}
  const rawSettings = m.settings && typeof m.settings === 'object' ? m.settings as Record<string, unknown> : {}
  for (const [key, value] of Object.entries(rawSettings)) {
    const s = (value && typeof value === 'object' ? value : {}) as Record<string, unknown>
    const type = str(s.type) as SettingType
    if (!SETTING_KEY_RE.test(key)) problems.push(`setting key "${key}" must be a simple identifier`)
    if (!SETTING_TYPES.includes(type)) problems.push(`setting ${key}: type must be one of ${SETTING_TYPES.join(', ')}`)
    const opts = asArray(s.options).map(str).filter(Boolean)
    if (type === 'select' && !opts.length) problems.push(`setting ${key}: a select needs options`)
    settings[key] = {
      type,
      label: str(s.label) || key,
      ...(str(s.help) ? { help: str(s.help) } : {}),
      ...(s.default !== undefined ? { default: s.default } : {}),
      ...(type === 'select' ? { options: opts } : {}),
    }
  }

  const hosts = asArray(options.hosts).map((h) => str(h).toLowerCase())
  for (const h of hosts) if (!HOST_RE.test(h)) problems.push(`host "${h}" must be a domain like "api.example.com" or "*.example.com"`)

  if (!hooks.length && !endpoints.length) problems.push('declares no hooks and no endpoints, so it would do nothing')

  if (problems.length) throw new Error(`Invalid mframework.auth manifest: ${problems.join('; ')}`)
  const parsedSettings = Object.fromEntries(Object.entries(settings).map(([k, s]) => {
    // Defaults must pass their own validation.
    if (s.default !== undefined) validateSetting(k, s, s.default)
    return [k, s]
  }))
  return {
    id,
    hooks: [...new Set(hooks)] as AuthHookPoint[],
    paths: [...new Set(paths)],
    endpoints,
    permissions: [...new Set(permissions)] as AuthPluginPermission[],
    failMode,
    timeoutMs,
    settings: parsedSettings,
    hosts: [...new Set(hosts)],
  } as SandboxedAuthManifest
}

const HOOK_DESCRIPTIONS: Record<AuthHookPoint, string> = {
  'user.create.before': 'Checks every new account before it is created, and may refuse it.',
  'user.create.after': 'Is told when an account is created.',
  'session.create.before': 'Checks every sign-in before it completes, and may refuse it.',
  'session.create.after': 'Is told when someone signs in.',
  'request.before': 'Checks some auth requests before they run, and may refuse them',
  'request.after': 'Is told after some auth requests',
}

/** What admins are shown before turning a sandboxed plugin on. */
export function describeAuthManifest(m: SandboxedAuthManifest): string[] {
  const lines = m.hooks.map((h) => (h.startsWith('request.') ? `${HOOK_DESCRIPTIONS[h]}: ${m.paths.join(', ')}.` : HOOK_DESCRIPTIONS[h]))
  for (const e of m.endpoints) {
    lines.push(`Adds ${e.method} /api/auth/plugin/${m.id}${e.path} (${e.access === 'public' ? 'anyone' : e.access === 'admin' ? 'admins only' : 'signed-in users'}).`)
  }
  for (const p of m.permissions) lines.push(AUTH_PLUGIN_PERMISSIONS[p])
  lines.push(m.hosts.length ? `Connects only to: ${m.hosts.join(', ')}.` : 'Makes no outside connections.')
  if (m.hooks.some((h) => h.endsWith('.before'))) {
    lines.push(m.failMode === 'closed'
      ? 'If it fails or is too slow, the action it checks is refused (fails closed).'
      : 'If it fails or is too slow, it is skipped (fails open).')
  }
  return lines
}

/** One setting's value, checked against its declaration. Throws a readable message. */
export function validateSetting(key: string, s: AuthPluginSetting, value: unknown): unknown {
  const fail = (why: string): never => { throw new Error(`${s.label}: ${why}`) }
  switch (s.type) {
    case 'text':
    case 'textarea': {
      if (typeof value !== 'string') fail('must be text')
      const v = (value as string).trim()
      if (v.length > (s.type === 'text' ? 500 : 10_000)) fail('is too long')
      return v
    }
    case 'boolean':
      if (typeof value !== 'boolean') fail('must be on or off')
      return value
    case 'number':
      if (typeof value !== 'number' || !Number.isFinite(value)) fail('must be a number')
      return value
    case 'select':
      if (typeof value !== 'string' || !s.options?.includes(value)) fail(`must be one of ${s.options?.join(', ')}`)
      return value
    case 'list': {
      if (!Array.isArray(value) || value.some((v) => typeof v !== 'string')) fail('must be a list of text')
      const list = [...new Set((value as string[]).map((v) => v.trim()).filter(Boolean))]
      if (list.length > 1000 || list.some((v) => v.length > 300)) fail('is too long')
      return list
    }
  }
  return fail(`unknown setting "${key}"`)
}

/** A full settings object: declared keys only, defaults filled in. */
export function resolveSettings(fields: Record<string, AuthPluginSetting>, stored: Record<string, unknown> | null | undefined): Record<string, unknown> {
  const out: Record<string, unknown> = {}
  for (const [key, s] of Object.entries(fields)) {
    const value = stored?.[key]
    if (value === undefined) {
      if (s.default !== undefined) out[key] = s.default
      continue
    }
    try {
      out[key] = validateSetting(key, s, value)
    } catch {
      if (s.default !== undefined) out[key] = s.default
    }
  }
  return out
}

/** Settings an admin submitted: unknown keys refused, each value validated. */
export function validateSettings(fields: Record<string, AuthPluginSetting>, input: unknown): Record<string, unknown> {
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Settings must be an object')
  const out: Record<string, unknown> = {}
  for (const [key, value] of Object.entries(input as Record<string, unknown>)) {
    const s = fields[key]
    if (!s) throw new Error(`Unknown setting "${key}"`)
    out[key] = validateSetting(key, s, value)
  }
  return out
}
