import { existsSync, readFileSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { addTemplate, defineNuxtModule, useLogger } from '@nuxt/kit'
import { parseAuthManifest } from '../server/utils/plugins/manifest'

/**
 * Lets packages add to this layer's single better-auth instance
 * (packages/plugins/Authentication/auth-*), in two tiers — see
 * server/utils/plugins/host.ts. Apps register the packages by name in
 * `modules`; admins then switch each one on or off at run time.
 *
 * A package's Nuxt module contributes absolute paths:
 *
 *   nuxt.hook('mframework:auth-plugins', (plugins) => {
 *     // trusted (first-party): real better-auth plugins
 *     plugins.push({ name: 'sso', server: resolve('./runtime/server'), client: resolve('./runtime/client') })
 *     // sandboxed: a self-contained ES module, run in its own locked-down process
 *     plugins.push({ name: 'email-domains', sandbox: resolve('./sandbox/server.mjs') })
 *   })
 *
 * - `server` default-exports `(context: AuthPluginContext) => plugin | plugin[]`
 *   (better-auth server plugins), imported through the Nitro virtual module
 *   `#auth-server-plugins` (server/utils/auth.ts).
 * - `client` default-exports `() => plugin | plugin[]` (better-auth client
 *   plugins), imported by lib/auth-client.ts through `#auth-client-plugins`.
 * - `sandbox` is read as text and embedded in the server build; it never
 *   runs in the app's process. Its package.json must declare
 *   `mframework.auth` (server/utils/plugins/manifest.ts) — what it may do.
 *
 * `#auth-plugin-registry` lists every package (trusted ones in the same
 * order as `#auth-server-plugins`) with its manifest and sandbox source.
 */
export type AuthPluginEntry = {
  /** Shown in logs; a trusted plugin's id. */
  name: string
  server?: string
  client?: string
  /** Sandboxed server entry (self-contained ES module). */
  sandbox?: string
}

declare module '@nuxt/schema' {
  interface NuxtHooks {
    'mframework:auth-plugins': (plugins: AuthPluginEntry[]) => void | Promise<void>
  }
}

/** `import plugin0 from '…'` lines plus `export default [plugin0, …]`. */
function entriesModule(paths: string[]): string {
  return [
    ...paths.map((path, i) => `import plugin${i} from ${JSON.stringify(path)}`),
    `export default [${paths.map((_, i) => `plugin${i}`).join(', ')}]`,
  ].join('\n')
}

/** The package.json at or above `file`. */
function packageOf(file: string): { dir: string, pkg: Record<string, any> } {
  let dir = dirname(resolve(file))
  for (;;) {
    const candidate = join(dir, 'package.json')
    if (existsSync(candidate)) return { dir, pkg: JSON.parse(readFileSync(candidate, 'utf8')) }
    const parent = dirname(dir)
    if (parent === dir) throw new Error(`No package.json above ${file}`)
    dir = parent
  }
}

const withExt = (path: string) => [path, `${path}.ts`, `${path}.mjs`, `${path}.js`].find((p) => existsSync(p)) ?? path

export default defineNuxtModule({
  meta: { name: 'mframework-auth-plugins' },
  setup(_, nuxt) {
    const logger = useLogger('auth')
    let collected: Promise<AuthPluginEntry[]> | undefined
    const collect = () => (collected ??= (async () => {
      const plugins: AuthPluginEntry[] = []
      await nuxt.callHook('mframework:auth-plugins', plugins)
      return plugins
    })())

    /** Trusted and sandboxed entries, validated. A broken sandboxed plugin fails the build. */
    const registry = async () => {
      const all = await collect()
      const trusted = all.filter((p) => p.server).map((p) => {
        const { pkg } = packageOf(withExt(p.server!))
        return { id: p.name, package: String(pkg.name), title: String(pkg.mframework?.integration?.name || pkg.name) }
      })
      const sandboxed = all.filter((p) => p.sandbox).map((p) => {
        const file = resolve(p.sandbox!)
        const { pkg } = packageOf(file)
        const manifest = parseAuthManifest(pkg.mframework?.auth, { id: p.name, hosts: pkg.mframework?.integration?.hosts })
        return { id: manifest.id, package: String(pkg.name), title: String(pkg.mframework?.integration?.name || pkg.name), manifest, source: readFileSync(file, 'utf8') }
      })
      const ids = [...trusted.map((t) => t.id), ...sandboxed.map((s) => s.id)]
      const dupe = ids.find((id, i) => ids.indexOf(id) !== i)
      if (dupe) throw new Error(`Two auth plugins use the id "${dupe}"`)
      return { trusted, sandboxed }
    }

    // Both export the factories; lib/auth-client.ts and server/utils/auth.ts
    // call them, so the server context can hold layer helpers without this
    // module importing them.
    const client = addTemplate({
      filename: 'mframework/auth-client-plugins.mjs',
      write: true,
      getContents: async () => entriesModule((await collect()).flatMap((p) => p.client ?? [])),
    })
    nuxt.options.alias['#auth-client-plugins'] = client.dst

    const runnerFile = fileURLToPath(new URL('../server/utils/plugins/sandbox-child.mjs', import.meta.url))
    nuxt.hook('nitro:config', async (config) => {
      const paths = (await collect()).flatMap((p) => p.server ?? [])
      const { trusted, sandboxed } = await registry()
      config.virtual ||= {}
      config.virtual['#auth-server-plugins'] = entriesModule(paths)
      config.virtual['#auth-plugin-registry'] = `export default ${JSON.stringify({ trusted, sandboxed, runnerSource: readFileSync(runnerFile, 'utf8') })}`
    })

    nuxt.hook('modules:done', async () => {
      const { trusted, sandboxed } = await registry()
      if (trusted.length) logger.info(`better-auth plugins from packages: ${trusted.map((t) => t.id).join(', ')}`)
      if (sandboxed.length) logger.info(`sandboxed auth plugins: ${sandboxed.map((s) => s.id).join(', ')}`)
    })
  },
})
