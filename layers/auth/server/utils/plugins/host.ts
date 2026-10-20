/**
 * Auth plugins: the layer's single better-auth instance, extended by
 * plugin packages (packages/plugins/Authentication/*) in two tiers.
 *
 *  - Trusted: a package hands the layer real better-auth plugins (SSO,
 *    SCIM, …). First-party code with full access; admin-only.
 *  - Sandboxed: a package ships a self-contained server module that runs in
 *    its own locked-down process (runner.ts, sandbox-child.mjs). It never
 *    sees better-auth, the database, sessions or secrets — only the hooks
 *    and endpoints its manifest declares, with the data the host hands it:
 *    a few user fields, its own settings and key-value store, the audit
 *    log, and the outside hosts it declared.
 *
 * Admins switch either kind on or off for the whole site at run time (no
 * rebuild): trusted plugins start on, sandboxed ones off. A plugin that's
 * off is gone — its endpoints answer 404 and its hooks don't run.
 */
import type { BetterAuthPlugin } from 'better-auth'
import { APIError, createAuthEndpoint, createAuthMiddleware, getSessionFromCtx } from 'better-auth/api'
import {
  describeAuthManifest, resolveSettings, validateSettings,
  type AuthHookPoint, type AuthPluginSetting, type SandboxedAuthManifest,
} from './manifest'
import { PluginSandbox, SandboxError, type SandboxHost } from './runner'
import type { PluginStateStore } from './state'

export interface TrustedAuthPluginEntry {
  id: string
  package: string
  title: string
}

export interface SandboxedAuthPluginEntry {
  id: string
  package: string
  title: string
  manifest: SandboxedAuthManifest
  /** The server entry's source (self-contained ES module). */
  source: string
}

/** Built by modules/auth-plugins.ts (Nitro virtual `#auth-plugin-registry`). */
export interface AuthPluginRegistry {
  trusted: TrustedAuthPluginEntry[]
  sandboxed: SandboxedAuthPluginEntry[]
  /** sandbox-child.mjs source. */
  runnerSource: string
}

/** What the integrations catalog shows admins about an auth plugin. */
export interface AuthPluginInfo {
  id: string
  package: string
  title: string
  tier: 'trusted' | 'sandboxed'
  enabled: boolean
  updatedAt: string | null
  /** Plain-language list of what it can do (sandboxed plugins). */
  permissions: string[]
  settings: Record<string, AuthPluginSetting>
}

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

type SandboxLike = Pick<PluginSandbox, 'call' | 'stop'>

export interface AuthPluginHostOptions {
  registry: AuthPluginRegistry
  store: PluginStateStore
  audit: (entry: { userId?: string, action: string, targetId: string, status: string, details?: string }) => Promise<void>
  log?: (message: string) => void
  /** Tests swap the process sandbox out. */
  sandboxFactory?: (entry: SandboxedAuthPluginEntry, host: SandboxHost) => SandboxLike
  /** How long the switches are cached (other server processes see a change after this). */
  cacheMs?: number
}

/** The auth API's base path, which request paths are relative to. */
const BASE_PATH = '/api/auth'
const PLUGIN_PREFIX = '/plugin'
const MAX_DENY_MESSAGE = 200
const MAX_BODY_BYTES = 64 * 1024
const MAX_RESPONSE_BYTES = 256 * 1024
const AUDITS_PER_MINUTE = 60
const UNAVAILABLE = 'This can\'t be done right now. Please try again later.'

const emailDomain = (email: unknown) => (typeof email === 'string' && email.includes('@') ? email.split('@').pop()!.toLowerCase() : null)
const iso = (value: unknown) => (value instanceof Date ? value.toISOString() : typeof value === 'string' ? value : null)
const hasRole = (role: unknown, name: string) => String(role ?? '').split(',').map((r) => r.trim()).includes(name)

/** `/sso/callback/:providerId` → a matcher for request paths. */
export function pathMatcher(pattern: string): (path: string) => boolean {
  const re = new RegExp(`^${pattern.split('/').map((part) => (part.startsWith(':') ? '[^/]+' : part === '**' ? '.*' : part.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'))).join('/')}/?$`)
  return (path) => re.test(path)
}

export function createAuthPluginHost(options: AuthPluginHostOptions) {
  const { registry, store } = options
  const log = options.log ?? ((m: string) => console.info(m))
  const cacheMs = options.cacheMs ?? 10_000
  const byPackage = new Map<string, TrustedAuthPluginEntry | SandboxedAuthPluginEntry>()
  for (const e of [...registry.trusted, ...registry.sandboxed]) byPackage.set(e.package, e)
  const isSandboxed = (pkg: string) => registry.sandboxed.some((e) => e.package === pkg)

  // ---- switches and settings (cached) -------------------------------------

  let states = new Map<string, { enabled: boolean, settings: Record<string, unknown>, updatedAt: Date | null }>()
  let loadedAt = 0
  let loading: Promise<void> | null = null

  async function refresh(): Promise<void> {
    loading ??= (async () => {
      try {
        const rows = await store.states()
        states = new Map(rows.map((r) => [r.package, { enabled: r.enabled, settings: r.settings ?? {}, updatedAt: r.updatedAt ?? null }]))
        loadedAt = Date.now()
      } catch (error) {
        // Keep the last known state; try again on the next request.
        log(`[auth-plugins] couldn't load plugin state: ${(error as Error).message}`)
      } finally {
        loading = null
      }
    })()
    return loading
  }

  const stale = () => Date.now() - loadedAt > cacheMs
  /** Synchronous (hook matchers are sync): the cached switch, refreshed in the background. */
  function enabledNow(pkg: string): boolean {
    if (stale()) void refresh()
    const row = states.get(pkg)
    return row ? row.enabled : !isSandboxed(pkg)
  }
  async function enabled(pkg: string): Promise<boolean> {
    if (stale()) await refresh()
    return enabledNow(pkg)
  }

  function settingsOf(entry: SandboxedAuthPluginEntry): Record<string, unknown> {
    return resolveSettings(entry.manifest.settings, states.get(entry.package)?.settings)
  }

  // ---- sandboxes ------------------------------------------------------------

  const sandboxes = new Map<string, SandboxLike>()
  const auditCounts = new Map<string, { minute: number, n: number }>()

  function sandboxFor(entry: SandboxedAuthPluginEntry): SandboxLike {
    let sandbox = sandboxes.get(entry.package)
    if (sandbox) return sandbox
    const host: SandboxHost = {
      store: {
        get: (key) => store.kvGet(entry.package, key),
        set: (key, value) => store.kvSet(entry.package, key, value),
        delete: (key) => store.kvDelete(entry.package, key),
        list: (prefix) => store.kvList(entry.package, prefix),
      },
      audit: async (action, details) => {
        const minute = Math.floor(Date.now() / 60_000)
        const count = auditCounts.get(entry.package)
        const n = count?.minute === minute ? count.n + 1 : 1
        auditCounts.set(entry.package, { minute, n })
        if (n > AUDITS_PER_MINUTE) throw new Error('Too many audit entries')
        await options.audit({ action: `${entry.manifest.id}:${action}`, targetId: entry.package, status: 'success', details: JSON.stringify(details ?? null).slice(0, 4000) })
      },
      log: (message) => log(`[auth-plugin ${entry.manifest.id}] ${message}`),
    }
    sandbox = options.sandboxFactory?.(entry, host) ?? new PluginSandbox({
      id: entry.manifest.id,
      source: entry.source,
      runnerSource: registry.runnerSource,
      hosts: entry.manifest.hosts,
      timeoutMs: entry.manifest.timeoutMs,
      host,
    })
    sandboxes.set(entry.package, sandbox)
    return sandbox
  }

  function stopSandbox(pkg: string) {
    sandboxes.get(pkg)?.stop()
    sandboxes.delete(pkg)
  }

  function pluginUser(entry: SandboxedAuthPluginEntry, user: Record<string, unknown> | null | undefined): PluginUser | null {
    if (!user) return null
    return {
      id: typeof user.id === 'string' ? user.id : null,
      name: typeof user.name === 'string' ? user.name : null,
      emailDomain: emailDomain(user.email),
      ...(entry.manifest.permissions.includes('user:email') ? { email: typeof user.email === 'string' ? user.email : null } : {}),
      emailVerified: user.emailVerified === true,
      createdAt: iso(user.createdAt),
    }
  }

  /**
   * Runs a `*.before` hook in every enabled plugin that declares it; the
   * first refusal throws 403 with the plugin's message. A plugin that fails
   * or times out refuses (fail closed) or is skipped (fail open).
   */
  async function runBefore(point: AuthHookPoint, input: (entry: SandboxedAuthPluginEntry) => unknown, path?: string) {
    for (const entry of registry.sandboxed) {
      if (!entry.manifest.hooks.includes(point)) continue
      if (path && !entry.manifest.paths.includes(path)) continue
      if (!(await enabled(entry.package))) continue
      let result: unknown
      try {
        result = await sandboxFor(entry).call('hook', point, input(entry), settingsOf(entry))
      } catch (error) {
        log(`[auth-plugin ${entry.manifest.id}] ${point} failed: ${(error as Error).message}`)
        if (entry.manifest.failMode === 'closed') throw new APIError('FORBIDDEN', { message: UNAVAILABLE })
        continue
      }
      const deny = (result as { deny?: unknown } | null)?.deny
      if (deny) {
        const message = typeof deny === 'string' && deny.trim() ? deny.trim().slice(0, MAX_DENY_MESSAGE) : 'Not allowed.'
        throw new APIError('FORBIDDEN', { message, code: 'PLUGIN_DENIED' })
      }
    }
  }

  /** `*.after` hooks: told, never in the way — failures are only logged. */
  function runAfter(point: AuthHookPoint, input: (entry: SandboxedAuthPluginEntry) => unknown, path?: string) {
    for (const entry of registry.sandboxed) {
      if (!entry.manifest.hooks.includes(point)) continue
      if (path && !entry.manifest.paths.includes(path)) continue
      void enabled(entry.package).then((on) => (on ? sandboxFor(entry).call('hook', point, input(entry), settingsOf(entry)) : null))
        .catch((error) => log(`[auth-plugin ${entry.manifest.id}] ${point} failed: ${(error as Error).message}`))
    }
  }

  const declares = (point: AuthHookPoint, path?: string) => registry.sandboxed.some((e) =>
    e.manifest.hooks.includes(point) && (!path || e.manifest.paths.includes(path)) && enabledNow(e.package))

  // ---- the better-auth plugin ----------------------------------------------

  /** Sandboxed plugins' endpoints, under /api/auth/plugin/<id>/…. */
  function sandboxEndpoints() {
    // Endpoint types are per-path generics; the record only needs the values.
    const endpoints: Record<string, any> = {}
    for (const entry of registry.sandboxed) {
      for (const decl of entry.manifest.endpoints) {
        const key = `plugin_${entry.manifest.id}_${decl.method}_${decl.path}`.replace(/[^a-zA-Z0-9]+(.)?/g, (_, c: string | undefined) => (c ? c.toUpperCase() : ''))
        endpoints[key] = createAuthEndpoint(`${PLUGIN_PREFIX}/${entry.manifest.id}${decl.path}`, { method: decl.method }, async (ctx) => {
          if (!(await enabled(entry.package))) throw new APIError('NOT_FOUND')
          const session = decl.access === 'public' ? await getSessionFromCtx(ctx).catch(() => null) : await getSessionFromCtx(ctx)
          if (decl.access !== 'public' && !session) throw new APIError('UNAUTHORIZED')
          const admin = hasRole((session?.user as { role?: unknown } | undefined)?.role, 'admin')
          if (decl.access === 'admin' && !admin) throw new APIError('NOT_FOUND')
          const body = decl.method === 'POST' ? (ctx.body ?? null) : null
          if (body !== null && (typeof body !== 'object' || Buffer.byteLength(JSON.stringify(body)) > MAX_BODY_BYTES)) {
            throw new APIError('BAD_REQUEST', { message: 'Request body must be a JSON object up to 64 KB' })
          }
          const query = Object.fromEntries(Object.entries((ctx.query ?? {}) as Record<string, unknown>)
            .filter(([, v]) => typeof v === 'string').map(([k, v]) => [k, String(v).slice(0, 2000)]))
          let result: unknown
          try {
            result = await sandboxFor(entry).call('endpoint', `${decl.method} ${decl.path}`, {
              method: decl.method, path: decl.path, query, body, user: pluginUser(entry, session?.user), admin,
            }, settingsOf(entry))
          } catch (error) {
            log(`[auth-plugin ${entry.manifest.id}] ${decl.method} ${decl.path} failed: ${(error as Error).message}`)
            throw new APIError(error instanceof SandboxError && error.reason === 'plugin-error' ? 'INTERNAL_SERVER_ERROR' : 'SERVICE_UNAVAILABLE', { message: UNAVAILABLE })
          }
          const shaped = result && typeof result === 'object' && ('status' in result || 'body' in result)
            ? result as { status?: unknown, body?: unknown }
            : { status: 200, body: result }
          const status = Number.isInteger(shaped.status) && Number(shaped.status) >= 200 && Number(shaped.status) < 500 ? Number(shaped.status) : 200
          if (Buffer.byteLength(JSON.stringify(shaped.body ?? null)) > MAX_RESPONSE_BYTES) {
            throw new APIError('INTERNAL_SERVER_ERROR', { message: UNAVAILABLE })
          }
          // better-call takes the status from setStatus (json()'s own is overridden).
          ctx.setStatus(status as Parameters<typeof ctx.setStatus>[0])
          return ctx.json(shaped.body ?? null)
        })
      }
    }
    return endpoints
  }

  /** Request paths of each trusted plugin's endpoints, to turn them off. */
  let trustedPaths: Array<{ pkg: string, match: (path: string) => boolean }> = []

  /** The layer's bridge plugin: sandboxed hooks and endpoints, and the off switch for trusted plugins. */
  function betterAuthPlugin(): BetterAuthPlugin {
    const userCreate = registry.sandboxed.some((e) => e.manifest.hooks.some((h) => h.startsWith('user.create.')))
    const sessionCreate = registry.sandboxed.some((e) => e.manifest.hooks.some((h) => h.startsWith('session.create.')))
    return {
      id: 'mframework-plugins',
      endpoints: {
        ...sandboxEndpoints(),
        /** GET /api/auth/plugin/enabled: ids of the plugins that are on. */
        authPluginsEnabled: createAuthEndpoint(`${PLUGIN_PREFIX}/enabled`, { method: 'GET' }, async (ctx) => {
          const ids = await (async () => {
            await refresh()
            return [...byPackage.values()].filter((e) => enabledNow(e.package)).map((e) => ('manifest' in e ? e.manifest.id : e.id))
          })()
          return ctx.json({ plugins: ids })
        }),
      },
      rateLimit: [{ pathMatcher: (path: string) => path.startsWith(`${PLUGIN_PREFIX}/`), window: 60, max: 60 }],
      init: () => ({
        options: {
          databaseHooks: {
            ...(userCreate ? {
              user: {
                create: {
                  before: async (user: Record<string, unknown>) => {
                    await runBefore('user.create.before', (entry) => ({ user: pluginUser(entry, user) }))
                  },
                  after: async (user: Record<string, unknown>) => {
                    runAfter('user.create.after', (entry) => ({ user: pluginUser(entry, user) }))
                  },
                },
              },
            } : {}),
            ...(sessionCreate ? {
              session: {
                create: {
                  before: async (session: Record<string, unknown>, ctx: any) => {
                    if (!declares('session.create.before')) return
                    const user = await ctx?.context?.internalAdapter?.findUserById?.(String(session.userId)).catch(() => null)
                    await runBefore('session.create.before', (entry) => ({ user: pluginUser(entry, user ?? { id: session.userId }) }))
                  },
                  after: async (session: Record<string, unknown>, ctx: any) => {
                    if (!declares('session.create.after')) return
                    const user = await ctx?.context?.internalAdapter?.findUserById?.(String(session.userId)).catch(() => null)
                    runAfter('session.create.after', (entry) => ({ user: pluginUser(entry, user ?? { id: session.userId }) }))
                  },
                },
              },
            } : {}),
          },
        },
      }),
      hooks: {
        before: [{
          matcher: (ctx) => !!ctx.path && declares('request.before', ctx.path),
          handler: createAuthMiddleware(async (ctx) => {
            const email = (ctx.body as Record<string, unknown> | undefined)?.email
            await runBefore('request.before', () => ({ path: ctx.path, method: ctx.request?.method ?? null, emailDomain: emailDomain(email) }), ctx.path)
          }),
        }],
        after: [{
          matcher: (ctx) => !!ctx.path && declares('request.after', ctx.path),
          handler: createAuthMiddleware(async (ctx) => {
            const returned = ctx.context.returned
            const status = returned instanceof APIError ? returned.statusCode : 200
            const user = ctx.context.newSession?.user as Record<string, unknown> | undefined
            runAfter('request.after', (entry) => ({ path: ctx.path, method: ctx.request?.method ?? null, status, user: pluginUser(entry, user) }), ctx.path)
          }),
        }],
      },
      onRequest: async (request) => {
        if (!trustedPaths.length) return
        let path: string
        try {
          path = new URL(request.url).pathname
        } catch {
          return
        }
        if (!path.startsWith(BASE_PATH)) return
        const rel = path.slice(BASE_PATH.length) || '/'
        for (const t of trustedPaths) {
          if (t.match(rel) && !(await enabled(t.pkg))) {
            return { response: new Response(JSON.stringify({ code: 'NOT_FOUND', message: 'Not found' }), { status: 404, headers: { 'content-type': 'application/json' } }) }
          }
        }
      },
    }
  }

  /**
   * A trusted package's better-auth plugins, behind its switch: request
   * hooks, onRequest/onResponse and database hooks only run while it's on,
   * and its endpoints answer 404 while it's off (via the bridge's onRequest).
   */
  function gateTrusted(entry: TrustedAuthPluginEntry, plugins: BetterAuthPlugin[]): BetterAuthPlugin[] {
    const on = () => enabledNow(entry.package)
    return plugins.map((plugin) => {
      for (const endpoint of Object.values(plugin.endpoints ?? {})) {
        const path = (endpoint as { path?: unknown }).path
        if (typeof path === 'string') trustedPaths.push({ pkg: entry.package, match: pathMatcher(path) })
      }
      const gateHooks = (list?: NonNullable<BetterAuthPlugin['hooks']>['before']) =>
        list?.map((h) => ({ ...h, matcher: (ctx: Parameters<typeof h.matcher>[0]) => on() && h.matcher(ctx) }))
      const gated: BetterAuthPlugin = { ...plugin }
      if (plugin.hooks) gated.hooks = { before: gateHooks(plugin.hooks.before), after: gateHooks(plugin.hooks.after) }
      if (plugin.onRequest) gated.onRequest = async (req, ctx) => (on() ? plugin.onRequest!(req, ctx) : undefined)
      if (plugin.onResponse) gated.onResponse = async (res, ctx) => (on() ? plugin.onResponse!(res, ctx) : undefined)
      if (plugin.init) {
        gated.init = (async (ctx: Parameters<NonNullable<BetterAuthPlugin['init']>>[0]) => {
          const result = await plugin.init!(ctx)
          const hooks = (result as { options?: { databaseHooks?: Record<string, any> } } | void)?.options?.databaseHooks
          if (!hooks) return result
          const wrap = (node: any): any => (typeof node === 'function'
            ? (...args: unknown[]) => (on() ? node(...args) : undefined)
            : node && typeof node === 'object' ? Object.fromEntries(Object.entries(node).map(([k, v]) => [k, wrap(v)])) : node)
          return { ...result, options: { ...(result as any).options, databaseHooks: wrap(hooks) } }
        }) as BetterAuthPlugin['init']
      }
      return gated
    })
  }

  // ---- admin ------------------------------------------------------------------

  function info(pkg: string): AuthPluginInfo | null {
    const entry = byPackage.get(pkg)
    if (!entry) return null
    const sandboxed = 'manifest' in entry
    const row = states.get(pkg)
    return {
      id: sandboxed ? entry.manifest.id : entry.id,
      package: pkg,
      title: entry.title,
      tier: sandboxed ? 'sandboxed' : 'trusted',
      enabled: row ? row.enabled : !sandboxed,
      updatedAt: row?.updatedAt ? row.updatedAt.toISOString() : null,
      permissions: sandboxed ? describeAuthManifest(entry.manifest) : ['Runs inside the sign-in system with full access (first-party).'],
      settings: sandboxed ? entry.manifest.settings : {},
    }
  }

  return {
    registry,
    refresh,
    enabled,
    enabledNow,
    betterAuthPlugin,
    gateTrusted,
    handles: (pkg: string) => byPackage.has(pkg),
    async list(): Promise<AuthPluginInfo[]> {
      await refresh()
      return [...byPackage.keys()].map((pkg) => info(pkg)!)
    },
    async info(pkg: string) {
      await refresh()
      return info(pkg)
    },
    async setEnabled(pkg: string, on: boolean, by: string | null) {
      if (!byPackage.has(pkg)) throw new Error(`Unknown auth plugin ${pkg}`)
      await store.saveState(pkg, { enabled: on }, { enabled: !isSandboxed(pkg) }, by)
      if (!on) stopSandbox(pkg)
      await options.audit({ userId: by ?? undefined, action: on ? 'plugin_enabled' : 'plugin_disabled', targetId: pkg, status: 'success' })
      loadedAt = 0
      await refresh()
    },
    async settings(pkg: string): Promise<Record<string, unknown>> {
      await refresh()
      const entry = byPackage.get(pkg)
      return entry && 'manifest' in entry ? settingsOf(entry) : {}
    },
    async saveSettings(pkg: string, input: unknown, by: string | null): Promise<Record<string, unknown>> {
      const entry = byPackage.get(pkg)
      if (!entry || !('manifest' in entry)) throw new Error('This plugin has no settings')
      const clean = validateSettings(entry.manifest.settings, input)
      await refresh()
      const next = { ...(states.get(pkg)?.settings ?? {}), ...clean }
      await store.saveState(pkg, { settings: next }, { enabled: !isSandboxed(pkg) }, by)
      await options.audit({ userId: by ?? undefined, action: 'plugin_settings_saved', targetId: pkg, status: 'success', details: JSON.stringify(Object.keys(clean)) })
      loadedAt = 0
      await refresh()
      return settingsOf(entry)
    },
    /** Public: ids of the plugins that are on (sign-in pages show their buttons by it). */
    async enabledIds(): Promise<string[]> {
      await refresh()
      return [...byPackage.values()].filter((e) => enabledNow(e.package)).map((e) => ('manifest' in e ? e.manifest.id : e.id))
    },
    stopAll() {
      for (const pkg of [...sandboxes.keys()]) stopSandbox(pkg)
    },
  }
}

export type AuthPluginHost = ReturnType<typeof createAuthPluginHost>
