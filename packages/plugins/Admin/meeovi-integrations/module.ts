import { existsSync, readdirSync, readFileSync } from 'node:fs'
import { basename, dirname, join, resolve, sep } from 'node:path'
import {
  defineNuxtModule,
  createResolver,
  addComponentsDir,
  addImportsDir,
  addRouteMiddleware,
  addServerHandler,
  useLogger,
} from '@nuxt/kit'
import type { IntegrationManifest, IntegrationPlugin, MeeoviIntegrationsModuleOptions } from './runtime/types'

export type { MeeoviIntegrationsModuleOptions } from './runtime/types'
export * from './runtime/types'

const env = process.env
const logger = useLogger('meeovi-integrations')

/** An outside host a plugin may declare: "api.example.com" or "*.example.com". */
const HOST_RE = /^(\*\.)?([a-z0-9-]+\.)+[a-z]{2,}$/

/** The store SKU that sells a plugin. */
const SKU_RE = /^[A-Za-z0-9][A-Za-z0-9._-]{0,63}$/

/** Nitro server-asset name for a plugin's sandbox folder. */
export const sandboxAssetName = (slug: string) => `meeovi-sandbox-${slug.replace(/[^a-z0-9-]/gi, '-')}`

/** The nearest `packages/plugins` folder at or above `from`. */
function findPluginsDir(from: string): string | null {
  let dir = resolve(from)
  for (;;) {
    const candidate = join(dir, 'packages', 'plugins')
    if (existsSync(candidate)) return candidate
    const parent = dirname(dir)
    if (parent === dir) return null
    dir = parent
  }
}

const readJson = (file: string): Record<string, any> | null => {
  try {
    return JSON.parse(readFileSync(file, 'utf8'))
  } catch {
    return null
  }
}

const authorName = (author: unknown) =>
  typeof author === 'string' ? author.replace(/\s*[<(].*$/, '').trim() || null
    : author && typeof author === 'object' && 'name' in author ? String((author as { name: unknown }).name) : null

/**
 * Every plugin in `<pluginsDir>/<Category>/<plugin>` whose package.json
 * declares `mframework.integration`. `inBuild`: registered in this app,
 * by package name or by path.
 */
function discoverPlugins(pluginsDir: string, registered: string[]): IntegrationPlugin[] {
  const found: IntegrationPlugin[] = []
  for (const category of readdirSync(pluginsDir, { withFileTypes: true })) {
    if (!category.isDirectory()) continue
    const categoryDir = join(pluginsDir, category.name)
    for (const entry of readdirSync(categoryDir, { withFileTypes: true })) {
      if (!entry.isDirectory()) continue
      const dir = join(categoryDir, entry.name)
      const pkg = readJson(join(dir, 'package.json'))
      const manifest = pkg?.mframework?.integration as IntegrationManifest | undefined
      if (!pkg?.name || !manifest || typeof manifest !== 'object') continue

      const plugin = String(pkg.name)
      // The sandboxed UI: an entry file inside the plugin, whose folder is
      // what gets served (must stay inside the plugin).
      let sandbox: IntegrationPlugin['sandbox'] = null
      if (typeof manifest.sandbox === 'string' && manifest.sandbox.trim()) {
        const entryPath = resolve(dir, manifest.sandbox.trim())
        if (entryPath.startsWith(dir + sep) && existsSync(entryPath)) {
          sandbox = { dir: dirname(entryPath), entry: basename(entryPath) }
        } else {
          logger.warn(`${plugin}: sandbox entry "${manifest.sandbox}" not found inside the plugin — ignored`)
        }
      }
      const hosts = (Array.isArray(manifest.hosts) ? manifest.hosts : [])
        .map((h) => String(h).trim().toLowerCase())
        .filter((h) => HOST_RE.test(h))
      const sku = typeof manifest.sku === 'string' && SKU_RE.test(manifest.sku.trim()) ? manifest.sku.trim() : null
      if (manifest.sku && !sku) logger.warn(`${plugin}: sku "${manifest.sku}" isn't a valid SKU — ignored`)

      found.push({
        plugin,
        slug: plugin.replace(/^@[^/]+\//, ''),
        name: manifest.name?.trim() || plugin,
        description: manifest.description?.trim() || pkg.description || null,
        category: manifest.category?.trim() || category.name,
        icon: manifest.icon?.trim() || null,
        developer: authorName(pkg.author),
        version: pkg.version ? String(pkg.version) : null,
        admin: manifest.admin === true || category.name.toLowerCase() === 'admin',
        inBuild: registered.some((m) => m === plugin || m.startsWith(`${plugin}/`) || m === dir || m.startsWith(dir + sep)),
        sandbox,
        hosts,
        sku,
      })
    }
  }
  return found.sort((a, b) => a.name.localeCompare(b.name))
}

/** Module names / paths this app (and its layers) registers. */
function registeredModules(nuxt: { options: { modules: unknown[], _layers?: Array<{ config?: { modules?: unknown[] } }> } }): string[] {
  const all = [
    ...nuxt.options.modules,
    ...(nuxt.options._layers ?? []).flatMap((layer) => layer.config?.modules ?? []),
  ]
  return all
    .map((m) => (Array.isArray(m) ? m[0] : m))
    .filter((m): m is string => typeof m === 'string')
    .map((m) => (m.startsWith('/') ? resolve(m) : m))
}

export default defineNuxtModule<MeeoviIntegrationsModuleOptions>({
  meta: {
    name: 'meeovi-integrations',
    configKey: 'meeoviIntegrations',
    compatibility: {
      nuxt: '^4.0.0',
    },
  },

  defaults: {
    apiBase: '/api/integrations',
    sessionEndpoint: '/api/auth/get-session',
    installsCollection: 'integration_installs',
    catalogPath: '/workspace/integration',
    directus: {
      url: env.MEEOVI_INTEGRATIONS_DIRECTUS_URL || env.DIRECTUS_URL,
      token: env.MEEOVI_INTEGRATIONS_DIRECTUS_TOKEN || env.NUXTUS_DIRECTUS_STATIC_TOKEN,
    },
  },

  setup(options, nuxt) {
    const resolver = createResolver(import.meta.url)
    const apiBase = (options.apiBase || '/api/integrations').replace(/\/+$/, '')

    nuxt.options.alias['#meeovi-integrations'] = resolver.resolve('runtime')
    nuxt.options.alias['#meeovi-integrations/'] = resolver.resolve('runtime') + '/'

    // <IntegrationGate>, useIntegrations(), useIntegrationData() and the `integration` middleware
    addComponentsDir({ path: resolver.resolve('runtime/components'), pathPrefix: false })
    addImportsDir(resolver.resolve('runtime/composables'))
    addRouteMiddleware({ name: 'integration', path: resolver.resolve('runtime/middleware/integration') })

    // Static routes first; `:slug` routes after.
    addServerHandler({ route: apiBase, method: 'get', handler: resolver.resolve('server/api/catalog.get') })
    addServerHandler({ route: `${apiBase}/installed`, method: 'get', handler: resolver.resolve('server/api/installed.get') })
    addServerHandler({ route: `${apiBase}/:slug`, method: 'get', handler: resolver.resolve('server/api/item.get') })
    addServerHandler({ route: `${apiBase}/:slug/install`, method: 'post', handler: resolver.resolve('server/api/install.post') })
    addServerHandler({ route: `${apiBase}/:slug/install`, method: 'delete', handler: resolver.resolve('server/api/install.delete') })
    addServerHandler({ route: `${apiBase}/:slug/data`, handler: resolver.resolve('server/api/data') })
    addServerHandler({ route: `${apiBase}/:slug/settings`, handler: resolver.resolve('server/api/settings') })

    // Sandboxed plugin UIs: `<sandboxBase>/<slug>/<file>`, served with an
    // enforced CSP of their own (see server/sandbox.get.ts).
    const sandboxBase = (options.sandboxBase || '/integration-sandbox').replace(/\/+$/, '')
    addServerHandler({ route: `${sandboxBase}/**`, method: 'get', handler: resolver.resolve('server/sandbox.get') })

    // Installable plugins, discovered from the plugins folder at build time.
    const pluginsDir = options.pluginsDir ? resolve(nuxt.options.rootDir, options.pluginsDir) : findPluginsDir(nuxt.options.rootDir)
    const registry = pluginsDir && existsSync(pluginsDir) ? discoverPlugins(pluginsDir, registeredModules(nuxt as any)) : []
    if (!pluginsDir) logger.warn('No plugins folder found — the integrations catalog will only list Directus entries.')
    else logger.info(`${registry.length} installable plugin(s) in ${pluginsDir} (${registry.filter((p) => p.sandbox).length} sandboxed)`)

    // Ship each sandbox folder (and the bridge SDK) inside the server build,
    // so production serves them without the plugins folder on disk.
    const nitro = nuxt.options.nitro as { serverAssets?: Array<{ baseName: string, dir: string }> }
    nitro.serverAssets ||= []
    nitro.serverAssets.push({ baseName: 'meeovi-sandbox-sdk', dir: resolver.resolve('runtime/sandbox') })
    for (const plugin of registry) {
      if (plugin.sandbox) nitro.serverAssets.push({ baseName: sandboxAssetName(plugin.slug), dir: plugin.sandbox.dir })
    }

    // Sandbox responses are static and carry their own headers: never ISR-
    // cache them with a page's headers.
    nuxt.options.routeRules ||= {}
    nuxt.options.routeRules[`${sandboxBase}/**`] = { ...nuxt.options.routeRules[`${sandboxBase}/**`], isr: false }

    // Private — the Directus token never reaches the client bundle.
    const runtimeConfig = nuxt.options.runtimeConfig as Record<string, any>
    runtimeConfig.meeoviIntegrations = {
      ...(runtimeConfig.meeoviIntegrations as Record<string, unknown> || {}),
      sessionEndpoint: options.sessionEndpoint || '/api/auth/get-session',
      installsCollection: options.installsCollection || 'integration_installs',
      directus: { ...options.directus },
      registry,
      requireSandbox: options.requireSandbox !== false,
    }

    nuxt.options.runtimeConfig.public.meeoviIntegrations = {
      ...(nuxt.options.runtimeConfig.public.meeoviIntegrations as Record<string, unknown> || {}),
      apiBase,
      catalogPath: options.catalogPath || '/workspace/integration',
      catalogUrl: options.catalogUrl || '',
      sandboxBase,
    }
  },
})
