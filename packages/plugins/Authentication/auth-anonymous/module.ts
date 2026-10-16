import { createResolver, defineNuxtModule } from '@nuxt/kit'
import type {} from './runtime/types'

/**
 * @mframework/auth-anonymous: the better-auth `anonymous` plugin for the auth
 * layer (layers/auth/modules/auth-plugins.ts). Register it in an app's
 * nuxt.config: `modules: ['@mframework/auth-anonymous']`.
 */
export default defineNuxtModule({
  meta: {
    name: '@mframework/auth-anonymous',
    compatibility: { nuxt: '^4.0.0' },
  },
  setup(_, nuxt) {
    const { resolve } = createResolver(import.meta.url)
    nuxt.hook('mframework:auth-plugins', (plugins) => {
      plugins.push({ name: 'anonymous', server: resolve('./runtime/server.ts'), client: resolve('./runtime/client.ts') })
    })
  },
})
