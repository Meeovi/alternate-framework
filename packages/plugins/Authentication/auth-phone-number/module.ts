import { createResolver, defineNuxtModule } from '@nuxt/kit'
import type {} from './runtime/types'

/**
 * @mframework/auth-phone-number: the better-auth `phone-number` plugin for the auth
 * layer (layers/auth/modules/auth-plugins.ts). Register it in an app's
 * nuxt.config: `modules: ['@mframework/auth-phone-number']`.
 */
export default defineNuxtModule({
  meta: {
    name: '@mframework/auth-phone-number',
    compatibility: { nuxt: '^4.0.0' },
  },
  setup(_, nuxt) {
    const { resolve } = createResolver(import.meta.url)
    nuxt.hook('mframework:auth-plugins', (plugins) => {
      plugins.push({ name: 'phone-number', server: resolve('./runtime/server.ts'), client: resolve('./runtime/client.ts') })
    })
  },
})
