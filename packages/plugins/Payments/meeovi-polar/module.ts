import { addImportsDir, addServerHandler, createResolver, defineNuxtModule } from '@nuxt/kit'
import type { MeeoviPolarModuleOptions } from './runtime/types'

export type { MeeoviPolarModuleOptions } from './runtime/types'
export * from './runtime/types'

const env = process.env

export default defineNuxtModule<MeeoviPolarModuleOptions>({
  meta: {
    name: 'meeovi-polar',
    configKey: 'meeoviPolar',
    compatibility: {
      nuxt: '^4.0.0',
    },
  },

  // Every value can also be set at runtime with NUXT_MEEOVI_POLAR_* (see README).
  defaults: {
    enabled: true,
    accessToken: env.NUXT_POLAR_ACCESS_TOKEN || '',
    server: env.NUXT_POLAR_SERVER === 'production' ? 'production' : 'sandbox',
    webhookSecret: env.NUXT_POLAR_WEBHOOK_SECRET || '',
    successUrl: env.POLAR_SUCCESS_URL || '/',
    returnUrl: '/',
    products: {},
    apiBase: '/api/polar',
    webhookPath: '/webhook/polar',
    sessionEndpoint: '/api/auth/get-session',
  },

  setup(options, nuxt) {
    if (options.enabled === false) return
    const resolver = createResolver(import.meta.url)
    const apiBase = (options.apiBase || '/api/polar').replace(/\/+$/, '')

    nuxt.options.alias['#meeovi-polar'] = resolver.resolve('runtime')
    addImportsDir(resolver.resolve('runtime/composables'))

    const route = (path: string, method: 'get' | 'post', file: string) =>
      addServerHandler({ route: path, method, handler: resolver.resolve(`server/api/${file}`) })
    route(`${apiBase}/checkout`, 'get', 'checkout.get')
    route(`${apiBase}/checkout/:id`, 'get', 'checkout-status.get')
    route(`${apiBase}/products`, 'get', 'products.get')
    route(`${apiBase}/portal`, 'get', 'portal.get')
    route(options.webhookPath || '/webhook/polar', 'post', 'webhook.post')

    // Private config: credentials never reach the client bundle. Every key
    // gets a string default, or a NUXT_MEEOVI_POLAR_* override is ignored.
    const runtimeConfig = nuxt.options.runtimeConfig as Record<string, any>
    runtimeConfig.meeoviPolar = {
      ...(runtimeConfig.meeoviPolar as Record<string, unknown> || {}),
      accessToken: options.accessToken || '',
      server: options.server || 'sandbox',
      webhookSecret: options.webhookSecret || '',
      successUrl: options.successUrl || '/',
      returnUrl: options.returnUrl || '/',
      products: { ...options.products },
      sessionEndpoint: options.sessionEndpoint || '/api/auth/get-session',
    }

    nuxt.options.runtimeConfig.public.meeoviPolar = {
      ...(nuxt.options.runtimeConfig.public.meeoviPolar as Record<string, unknown> || {}),
      apiBase,
    }
  },
})
