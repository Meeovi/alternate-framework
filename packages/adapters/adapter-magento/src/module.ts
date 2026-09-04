// packages/adapters/adapter-magento/src/module.ts
import { defineNuxtModule, addPlugin, addServerPlugin, createResolver } from '@nuxt/kit'

export interface ModuleOptions {
  /** The endpoint URL for your Magento instance or Hive Gateway endpoint */
  endpoint?: string
  /** Optional store view code identifier (e.g., 'default', 'fr') */
  storeCode?: string
  /** Optional customer/admin token for authenticated graph requests */
  token?: string
}

export default defineNuxtModule<ModuleOptions>({
  meta: {
    name: '@mframework/adapter-magento',
    configKey: 'magento'
  },
  defaults: {
    endpoint: '',
    storeCode: undefined,
    token: undefined
  },
  setup(options, nuxt) {
    const resolver = createResolver(import.meta.url)

    // 1. Publish only non-secret fields to `public` runtime config (it is
    //    serialized into the client payload). `token` is deliberately kept
    //    out of `public` — the adapter never attaches it anyway (GQL_KEY is
    //    not a valid Magento customer JWT and breaks every request), and a
    //    real token must stay server-side. Strip any `token` an app config
    //    may already have placed under `public.magento`.
    const existingPublic = { ...(nuxt.options.runtimeConfig.public.magento as Record<string, unknown> | undefined) }
    delete existingPublic.token
    nuxt.options.runtimeConfig.public.magento = {
      ...existingPublic,
      endpoint: options.endpoint ?? existingPublic.endpoint ?? '',
      storeCode: options.storeCode ?? existingPublic.storeCode,
    }

    // A token, if ever configured, lives in private runtime config only.
    if (options.token) {
      nuxt.options.runtimeConfig.magento = {
        ...(nuxt.options.runtimeConfig.magento as Record<string, unknown> | undefined),
        token: options.token,
      }
    }

    // 2. Register the local runtime plugin that exposes the $magentoAdapter global context
    addPlugin(resolver.resolve('./runtime/plugin'))

    // 3. Register a Nitro-only server plugin that links better-auth users to
    // Magento customer records (see runtime/server/commerce-link.ts) —
    // separate from #2 above since better-auth signup runs in Nitro, not
    // through the Vue app's plugin lifecycle.
    addServerPlugin(resolver.resolve('./runtime/server/commerce-link'))
  }
})