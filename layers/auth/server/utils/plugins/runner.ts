/**
 * Host side of the auth plugin sandbox: one child process per sandboxed
 * plugin (sandbox-child.mjs), started on first use and restarted after a
 * crash or a timeout. A call that takes longer than the plugin's timeout
 * kills the process — a stuck plugin can't keep a CPU — and fails; the
 * caller applies the plugin's fail mode.
 *
 * Requires a long-running Node server (the node-server preset): serverless
 * functions can't keep child processes, so there every call fails and each
 * plugin's fail mode decides.
 */
import { spawn, type ChildProcess } from 'node:child_process'

/** What the host lends the plugin, through RPC from its process. */
export interface SandboxHost {
  store: {
    get(key: string): Promise<unknown>
    set(key: string, value: unknown): Promise<void>
    delete(key: string): Promise<void>
    list(prefix: string): Promise<string[]>
  }
  audit(action: string, details: unknown): Promise<void>
  log(message: string): void
}

export interface SandboxOptions {
  /** Plugin id, for logs. */
  id: string
  /** The plugin's server entry (self-contained ES module source). */
  source: string
  /** sandbox-child.mjs source. */
  runnerSource: string
  hosts: string[]
  timeoutMs: number
  host: SandboxHost
}

export class SandboxError extends Error {
  constructor(message: string, readonly reason: 'timeout' | 'crashed' | 'unavailable' | 'plugin-error' | 'load-error') {
    super(message)
  }
}

/** Node flags for the plugin's process. No --allow-* flags: no files, no
 *  child processes, workers, addons, WASI or inspector. */
export const SANDBOX_EXEC_ARGV = [
  '--permission',
  '--disallow-code-generation-from-strings',
  '--max-old-space-size=64',
  '--input-type=module',
]

const RPC_METHODS = new Set(['store.get', 'store.set', 'store.delete', 'store.list', 'audit', 'log'])
const MAX_PENDING = 100
const CRASH_WINDOW_MS = 60_000
const MAX_CRASHES = 5
const COOLDOWN_MS = 30_000

type Pending = { resolve: (v: unknown) => void, reject: (e: Error) => void, timer: ReturnType<typeof setTimeout> }
type Ready = { hooks: string[], endpoints: string[] }

export class PluginSandbox {
  private child: ChildProcess | null = null
  private ready: Promise<Ready> | null = null
  private seq = 0
  private readonly pending = new Map<number, Pending>()
  private crashes: number[] = []
  private coolUntil = 0

  constructor(private readonly options: SandboxOptions) {}

  /** Runs `kind`/`name` in the sandbox. Rejects with SandboxError. */
  async call(kind: 'hook' | 'endpoint', name: string, input: unknown, settings: Record<string, unknown>): Promise<unknown> {
    const ready = await this.start()
    const declared = kind === 'hook' ? ready.hooks : ready.endpoints
    if (!declared.includes(name)) throw new SandboxError(`${this.options.id} has no ${kind} "${name}"`, 'plugin-error')
    if (this.pending.size >= MAX_PENDING) throw new SandboxError(`${this.options.id} is busy`, 'unavailable')
    const child = this.child!
    const id = ++this.seq
    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => {
        this.pending.delete(id)
        reject(new SandboxError(`${this.options.id} took longer than ${this.options.timeoutMs}ms`, 'timeout'))
        // A stuck plugin may be spinning: stop it; the next call restarts it.
        this.fail(`timed out on ${kind} ${name}`)
      }, this.options.timeoutMs)
      this.pending.set(id, { resolve, reject, timer })
      child.send({ t: 'call', id, kind, name, input, settings })
    })
  }

  /** Stops the process (plugin turned off, or the server is shutting down). */
  stop() {
    this.kill(new SandboxError(`${this.options.id} was stopped`, 'unavailable'))
  }

  private start(): Promise<Ready> {
    if (this.ready) return this.ready
    if (Date.now() < this.coolUntil) {
      return Promise.reject(new SandboxError(`${this.options.id} keeps failing; paused briefly`, 'unavailable'))
    }
    const child = spawn(process.execPath, [...SANDBOX_EXEC_ARGV, '--eval', this.options.runnerSource], {
      env: {},
      cwd: '/',
      stdio: ['ignore', 'pipe', 'pipe', 'ipc'],
      serialization: 'json',
    })
    this.child = child
    const forward = (chunk: Buffer) => this.options.host.log(chunk.toString('utf8').trim().slice(0, 2000))
    child.stdout?.on('data', forward)
    child.stderr?.on('data', forward)

    this.ready = new Promise<Ready>((resolve, reject) => {
      const loadTimer = setTimeout(() => {
        reject(new SandboxError(`${this.options.id} didn't start in time`, 'load-error'))
        this.fail('did not start')
      }, Math.max(5000, this.options.timeoutMs))
      child.on('message', (raw: unknown) => {
        const message = raw as Record<string, any>
        if (!message || typeof message !== 'object' || child !== this.child) return
        switch (message.t) {
          case 'ready':
            clearTimeout(loadTimer)
            resolve({
              hooks: Array.isArray(message.hooks) ? message.hooks.map(String) : [],
              endpoints: Array.isArray(message.endpoints) ? message.endpoints.map(String) : [],
            })
            return
          case 'init-error':
            clearTimeout(loadTimer)
            reject(new SandboxError(`${this.options.id} failed to load: ${String(message.error)}`, 'load-error'))
            this.fail('failed to load')
            return
          case 'result': {
            const pending = this.pending.get(message.id)
            if (!pending) return
            this.pending.delete(message.id)
            clearTimeout(pending.timer)
            if (message.ok) pending.resolve(message.value)
            else pending.reject(new SandboxError(String(message.error ?? 'failed'), 'plugin-error'))
            return
          }
          case 'rpc':
            void this.answerRpc(child, message)
        }
      })
      child.on('exit', (code, signal) => {
        clearTimeout(loadTimer)
        if (child !== this.child) return
        reject(new SandboxError(`${this.options.id} exited`, 'crashed'))
        this.fail(`exited (${signal ?? code})`)
      })
      child.on('error', (error) => {
        clearTimeout(loadTimer)
        if (child !== this.child) return
        reject(new SandboxError(`${this.options.id} couldn't start: ${error.message}`, 'load-error'))
        this.fail('could not start')
      })
    })
    child.send({ t: 'init', source: this.options.source, hosts: this.options.hosts })
    // Don't leave an unhandled rejection when nobody awaits a failed start.
    this.ready.catch(() => {})
    return this.ready
  }

  private async answerRpc(child: ChildProcess, message: Record<string, any>) {
    const reply = (body: Record<string, unknown>) => {
      if (child === this.child && child.connected) child.send({ t: 'rpc-result', id: message.id, ...body })
    }
    const method = String(message.method)
    const args = Array.isArray(message.args) ? message.args : []
    if (!RPC_METHODS.has(method)) return reply({ ok: false, error: `unknown method ${method}` })
    try {
      const { store, audit, log } = this.options.host
      let value: unknown = null
      if (method === 'store.get') value = await store.get(String(args[0]))
      else if (method === 'store.set') await store.set(String(args[0]), args[1])
      else if (method === 'store.delete') await store.delete(String(args[0]))
      else if (method === 'store.list') value = await store.list(String(args[0] ?? ''))
      else if (method === 'audit') await audit(String(args[0]).slice(0, 100), args[1] ?? null)
      else if (method === 'log') log(String(args[0]).slice(0, 2000))
      reply({ ok: true, value: value ?? null })
    } catch (error) {
      reply({ ok: false, error: String((error as Error)?.message ?? error).slice(0, 500) })
    }
  }

  private fail(why: string) {
    this.options.host.log(`sandbox ${why}`)
    const now = Date.now()
    this.crashes = [...this.crashes.filter((t) => now - t < CRASH_WINDOW_MS), now]
    if (this.crashes.length >= MAX_CRASHES) {
      this.coolUntil = now + COOLDOWN_MS
      this.crashes = []
    }
    this.kill(new SandboxError(`${this.options.id} stopped: ${why}`, 'crashed'))
  }

  private kill(error: SandboxError) {
    const child = this.child
    this.child = null
    this.ready = null
    for (const [id, pending] of this.pending) {
      clearTimeout(pending.timer)
      pending.reject(error)
      this.pending.delete(id)
    }
    if (child && child.exitCode === null && child.signalCode === null) child.kill('SIGKILL')
  }
}
