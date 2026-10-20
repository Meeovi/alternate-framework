import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { afterEach, describe, expect, it } from 'vitest'
import { PluginSandbox, SandboxError, type SandboxHost } from '../../server/utils/plugins/runner'

// Real child processes: what a sandboxed plugin can and can't do.
const runnerSource = readFileSync(fileURLToPath(new URL('../../server/utils/plugins/sandbox-child.mjs', import.meta.url)), 'utf8')

const sandboxes: PluginSandbox[] = []
function sandbox(source: string, options: { hosts?: string[], timeoutMs?: number } = {}) {
  const kv = new Map<string, unknown>()
  const logs: string[] = []
  const audits: unknown[] = []
  const host: SandboxHost = {
    store: {
      get: async (k) => kv.get(k) ?? null,
      set: async (k, v) => { kv.set(k, v) },
      delete: async (k) => { kv.delete(k) },
      list: async (p) => [...kv.keys()].filter((k) => k.startsWith(p)),
    },
    audit: async (a, d) => { audits.push([a, d]) },
    log: (m) => logs.push(m),
  }
  const s = new PluginSandbox({ id: 'test', source, runnerSource, hosts: options.hosts ?? [], timeoutMs: options.timeoutMs ?? 3000, host })
  sandboxes.push(s)
  return { s, kv, logs, audits }
}
afterEach(() => { for (const s of sandboxes.splice(0)) s.stop() })

const probe = `export default { endpoints: { async 'GET /probe'(req) {
  const out = {}
  const t = async (name, fn) => { try { out[name] = 'ALLOWED ' + String(await fn()).slice(0, 40) } catch (e) { out[name] = 'blocked ' + (e.code || e.message).slice(0, 60) } }
  await t('fs', async () => (await import('node:fs')).readFileSync('/etc/hostname', 'utf8'))
  await t('fileImport', () => import('file:///etc/passwd'))
  await t('childProcess', async () => (await import('node:child_process')).execSync('id').toString())
  await t('worker', async () => new (await import('node:worker_threads')).Worker('1', { eval: true }))
  await t('eval', () => eval('1 + 1'))
  await t('newFunction', () => new Function('return 1')())
  await t('env', () => Object.keys(process.env).length === 0 ? (() => { throw new Error('empty') })() : 'has env')
  await t('kill', () => process.kill(process.ppid, 0))
  await t('send', () => process.send({ t: 'result', id: 1, ok: true }))
  await t('binding', () => process.binding('tcp_wrap'))
  await t('fetchOther', async () => (await fetch('https://example.org')).status)
  await t('fetchLoopback', async () => (await fetch('http://127.0.0.1:3011')).status)
  await t('netAllowedButPrivate', async () => { const net = await import('node:net'); return await new Promise((res, rej) => { const s = net.connect({ port: 80, host: 'allowed.test', lookup: (h, o, cb) => cb(null, '127.0.0.1', 4) }, () => { s.destroy(); res(s.remoteAddress) }); s.on('error', rej) }) })
  await t('dns', async () => (await import('node:dns')).promises.resolve4('example.org'))
  await t('udp', async () => (await import('node:dgram')).createSocket('udp4'))
  return out
} } }`

describe('PluginSandbox', () => {
  it('runs hooks and endpoints, with settings and the store over RPC', async () => {
    const { s, kv, audits } = sandbox(`export default {
      hooks: { async 'user.create.before'({ user }, ctx) {
        await ctx.store.set('seen', (await ctx.store.get('seen') ?? 0) + 1)
        await ctx.audit('checked', { domain: user.emailDomain })
        return user.emailDomain === ctx.settings.block ? { deny: 'nope' } : null
      } },
      endpoints: { 'GET /hello'(req) { return { hello: req.query.name } } },
    }`)
    expect(await s.call('hook', 'user.create.before', { user: { emailDomain: 'a.com' } }, { block: 'b.com' })).toBeNull()
    expect(await s.call('hook', 'user.create.before', { user: { emailDomain: 'b.com' } }, { block: 'b.com' })).toEqual({ deny: 'nope' })
    expect(kv.get('seen')).toBe(2)
    expect(audits).toHaveLength(2)
    expect(await s.call('endpoint', 'GET /hello', { query: { name: 'x' } }, {})).toEqual({ hello: 'x' })
  })

  it('can\'t reach files, processes, secrets, the app, or undeclared hosts', async () => {
    const { s } = sandbox(probe, { hosts: ['allowed.test'] })
    const out = await s.call('endpoint', 'GET /probe', {}, {}) as Record<string, string>
    for (const [name, result] of Object.entries(out)) expect(`${name}: ${result}`).toMatch(new RegExp(`^${name}: blocked`))
  }, 30_000)

  it('kills a plugin that runs too long, and starts it again on the next call', async () => {
    const { s } = sandbox(`export default { endpoints: { 'GET /spin'() { for (;;) {} }, 'GET /ok'() { return 'ok' } } }`, { timeoutMs: 300 })
    await expect(s.call('endpoint', 'GET /spin', {}, {})).rejects.toMatchObject({ reason: 'timeout' })
    expect(await s.call('endpoint', 'GET /ok', {}, {})).toBe('ok')
  })

  it('reports plugin errors, crashes and broken code', async () => {
    const { s } = sandbox(`export default { endpoints: { 'GET /throw'() { throw new Error('boom') }, 'GET /exit'() { process.exit(1) } } }`)
    await expect(s.call('endpoint', 'GET /throw', {}, {})).rejects.toMatchObject({ reason: 'plugin-error', message: 'boom' })
    await expect(s.call('endpoint', 'GET /exit', {}, {})).rejects.toBeInstanceOf(SandboxError)
    await expect(s.call('endpoint', 'GET /missing', {}, {})).rejects.toMatchObject({ reason: 'plugin-error' })
    const broken = sandbox('export default {').s
    await expect(broken.call('endpoint', 'GET /x', {}, {})).rejects.toMatchObject({ reason: 'load-error' })
  })

  it('a runaway allocation dies alone', async () => {
    const { s } = sandbox(`export default { endpoints: { 'GET /oom'() { const a = []; for (;;) a.push(new Array(1e6).fill(1)) } } }`, { timeoutMs: 8000 })
    await expect(s.call('endpoint', 'GET /oom', {}, {})).rejects.toBeInstanceOf(SandboxError)
  }, 20_000)
})
