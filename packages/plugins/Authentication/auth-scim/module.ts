import { createResolver, defineNuxtModule } from '@nuxt/kit'
import type {} from './runtime/types'

/**
 * @mframework/auth-scim: the better-auth `scim` plugin for the auth
 * layer (layers/auth/modules/auth-plugins.ts). Register it in an app's
 * nuxt.config: `modules: ['@mframework/auth-scim']`.
 */
export default defineNuxtModule({
  meta: {
    name: '@mframework/auth-scim',
    compatibility: { nuxt: '^4.0.0' },
  },
  setup(_, nuxt) {
    const { resolve } = createResolver(import.meta.url)
    nuxt.hook('mframework:auth-plugins', (plugins) => {
      plugins.push({ name: 'scim', server: resolve('./runtime/server.ts') })
    })
  },
})
