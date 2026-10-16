import { addTemplate, defineNuxtModule, useLogger } from '@nuxt/kit'

/**
 * Lets packages add better-auth plugins to this layer's single auth
 * instance (packages/plugins/Authentication/auth-*). Optional sign-in
 * methods (SSO, SCIM, generic OAuth, phone, anonymous) live there, so an app
 * only exposes the ones it registers.
 *
 * A package's Nuxt module contributes absolute paths to two entry files:
 *
 *   nuxt.hook('mframework:auth-plugins', (plugins) => {
 *     plugins.push({ name: 'sso', server: resolve('./runtime/server'), client: resolve('./runtime/client') })
 *   })
 *
 * - `server` default-exports `(context: AuthPluginContext) => plugin | plugin[]`
 *   (better-auth server plugins). The layer imports them through the Nitro
 *   virtual module `#auth-server-plugins` (server/utils/auth.ts).
 * - `client` default-exports `() => plugin | plugin[]` (better-auth client
 *   plugins). lib/auth-client.ts imports them through `#auth-client-plugins`.
 *
 * Both lists are built once every module has run, in registration order.
 */
export type AuthPluginEntry = {
  /** Shown in logs. */
  name: string
  server?: string
  client?: string
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

export default defineNuxtModule({
  meta: { name: 'mframework-auth-plugins' },
  setup(_, nuxt) {
    let collected: Promise<AuthPluginEntry[]> | undefined
    const collect = () => (collected ??= (async () => {
      const plugins: AuthPluginEntry[] = []
      await nuxt.callHook('mframework:auth-plugins', plugins)
      return plugins
    })())

    // Both export the factories; lib/auth-client.ts and server/utils/auth.ts
    // call them, so the server context can hold layer helpers without this
    // module importing them.
    const client = addTemplate({
      filename: 'mframework/auth-client-plugins.mjs',
      write: true,
      getContents: async () => entriesModule((await collect()).flatMap((p) => p.client ?? [])),
    })
    nuxt.options.alias['#auth-client-plugins'] = client.dst

    nuxt.hook('nitro:config', async (config) => {
      const paths = (await collect()).flatMap((p) => p.server ?? [])
      config.virtual ||= {}
      config.virtual['#auth-server-plugins'] = entriesModule(paths)
    })

    nuxt.hook('modules:done', async () => {
      const names = (await collect()).map((p) => p.name)
      if (names.length) useLogger('auth').info(`better-auth plugins from packages: ${names.join(', ')}`)
    })
  },
})
