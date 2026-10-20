import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { afterEach, describe, expect, it } from 'vitest'
import type { BetterAuthPlugin } from 'better-auth'
import { createAuthPluginHost, pathMatcher, type AuthPluginRegistry } from '../../server/utils/plugins/host'
import { parseAuthManifest } from '../../server/utils/plugins/manifest'
import { MemoryPluginStateStore } from '../../server/utils/plugins/state'

// The host end to end with real sandbox processes, using the real
// @mframework/auth-email-domains plugin.
const read = (rel: string) => readFileSync(fileURLToPath(new URL(rel, import.meta.url)), 'utf8')
const pluginDir = '../../../../packages/plugins/Authentication/auth-email-domains/'
const pkg = JSON.parse(read(`${pluginDir}package.json`))

function registry(overrides: Partial<{ source: string, failMode: 'open' | 'closed' }> = {}): AuthPluginRegistry {
  const manifest = parseAuthManifest({ ...pkg.mframework.auth, ...(overrides.failMode ? { failMode: overrides.failMode } : {}) }, { id: 'email-domains' })
  return {
    trusted: [{ id: 'sso', package: '@mframework/auth-sso', title: 'SSO' }],
    sandboxed: [{ id: 'email-domains', package: pkg.name, title: 'Sign-up email domains', manifest, source: overrides.source ?? read(`${pluginDir}sandbox/server.mjs`) }],
    runnerSource: read('../../server/utils/plugins/sandbox-child.mjs'),
  }
}

const hosts: Array<ReturnType<typeof createAuthPluginHost>> = []
function setup(overrides?: Parameters<typeof registry>[0]) {
  const store = new MemoryPluginStateStore()
  const audits: Array<{ action: string, targetId: string }> = []
  const host = createAuthPluginHost({ registry: registry(overrides), store, audit: async (e) => { audits.push(e) }, log: () => {}, cacheMs: 0 })
  hosts.push(host)
  return { host, store, audits }
}
afterEach(() => { for (const h of hosts.splice(0)) h.stopAll() })

/** The bridge plugin's user.create.before database hook. */
async function userCreateBefore(plugin: BetterAuthPlugin) {
  const init = await plugin.init!({} as any) as { options: { databaseHooks: any } }
  return init.options.databaseHooks.user.create.before as (user: Record<string, unknown>) => Promise<void>
}

describe('auth plugin host', () => {
  it('trusted plugins start on, sandboxed plugins off', async () => {
    const { host } = setup()
    expect(await host.enabled('@mframework/auth-sso')).toBe(true)
    expect(await host.enabled(pkg.name)).toBe(false)
    expect(await host.enabledIds()).toEqual(['sso'])
  })

  it('a sandboxed plugin only runs once an admin turns it on, with its settings', async () => {
    const { host, store, audits } = setup()
    const before = await userCreateBefore(host.betterAuthPlugin())
    await host.saveSettings(pkg.name, { mode: 'block', domains: ['spam.io'], message: 'No spam here.' }, 'admin-1')

    await expect(before({ email: 'x@spam.io' })).resolves.toBeUndefined() // still off

    await host.setEnabled(pkg.name, true, 'admin-1')
    await expect(before({ email: 'x@spam.io', name: 'X' })).rejects.toMatchObject({ statusCode: 403, body: { message: 'No spam here.', code: 'PLUGIN_DENIED' } })
    await expect(before({ email: 'x@ok.io' })).resolves.toBeUndefined()
    expect([...(store.kv.get(pkg.name)?.values() ?? [])]).toEqual([1])
    expect(audits.map((a) => a.action)).toEqual(['plugin_settings_saved', 'plugin_enabled', 'email-domains:sign_up_refused'])

    await host.setEnabled(pkg.name, false, 'admin-1')
    await expect(before({ email: 'x@spam.io' })).resolves.toBeUndefined()
  }, 30_000)

  it('refuses invalid settings with a readable message', async () => {
    const { host } = setup()
    await expect(host.saveSettings(pkg.name, { mode: 'sometimes' }, 'a')).rejects.toThrow('Mode: must be one of block, allow')
    await expect(host.saveSettings('@mframework/auth-sso', {}, 'a')).rejects.toThrow('This plugin has no settings')
  })

  it('a broken plugin refuses (fail closed) or is skipped (fail open)', async () => {
    const closed = setup({ source: 'export default { hooks: { "user.create.before"() { throw new Error("bug") } } }' })
    await closed.host.setEnabled(pkg.name, true, 'a')
    await expect((await userCreateBefore(closed.host.betterAuthPlugin()))({ email: 'x@ok.io' })).rejects.toMatchObject({ statusCode: 403 })

    const open = setup({ source: 'export default { hooks: { "user.create.before"() { throw new Error("bug") } } }', failMode: 'open' })
    await open.host.setEnabled(pkg.name, true, 'a')
    await expect((await userCreateBefore(open.host.betterAuthPlugin()))({ email: 'x@ok.io' })).resolves.toBeUndefined()
  }, 30_000)

  it('a sandboxed plugin only sees the email domain without the user:email permission', async () => {
    const { host } = setup({ source: 'export default { hooks: { "user.create.before"({ user }) { return { deny: JSON.stringify(user) } } } }' })
    await host.setEnabled(pkg.name, true, 'a')
    const error = await (await userCreateBefore(host.betterAuthPlugin()))({ id: 'u1', email: 'Person@Example.com', name: 'P', emailVerified: false, password: 'secret', role: 'admin' }).catch((e) => e)
    expect(JSON.parse(error.body.message)).toEqual({ id: 'u1', name: 'P', emailDomain: 'example.com', emailVerified: false, createdAt: null })
  }, 30_000)

  it('turning a trusted plugin off answers 404 on its endpoints and skips its hooks', async () => {
    const { host } = setup()
    let hookRuns = 0
    const sso: BetterAuthPlugin = {
      id: 'sso',
      endpoints: { signInSSO: Object.assign(() => null, { path: '/sign-in/sso' }) as any, callback: Object.assign(() => null, { path: '/sso/callback/:providerId' }) as any },
      hooks: { before: [{ matcher: () => true, handler: (async () => { hookRuns++ }) as any }] },
    }
    const [gated] = host.gateTrusted(host.registry.trusted[0]!, [sso])
    const bridge = host.betterAuthPlugin()
    const request = (path: string) => bridge.onRequest!(new Request(`https://x.test/api/auth${path}`), {} as any)

    expect(gated!.hooks!.before![0]!.matcher({} as any)).toBe(true)
    expect(await request('/sso/callback/okta')).toBeUndefined()

    await host.setEnabled('@mframework/auth-sso', false, 'a')
    expect(gated!.hooks!.before![0]!.matcher({} as any)).toBe(false)
    const off = await request('/sso/callback/okta') as { response: Response }
    expect(off.response.status).toBe(404)
    expect(await request('/sign-in/email')).toBeUndefined()
    expect(hookRuns).toBe(0)
  })
})

describe('pathMatcher', () => {
  it('matches parameters and wildcards, nothing else', () => {
    expect(pathMatcher('/sso/callback/:providerId')('/sso/callback/okta')).toBe(true)
    expect(pathMatcher('/sso/callback/:providerId')('/sso/callback/okta/x')).toBe(false)
    expect(pathMatcher('/scim/v2/**')('/scim/v2/Users/1')).toBe(true)
    expect(pathMatcher('/sign-in/sso')('/sign-in/ssox')).toBe(false)
  })
})
