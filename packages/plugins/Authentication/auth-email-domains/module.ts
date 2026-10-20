import { createResolver, defineNuxtModule } from '@nuxt/kit'
import type {} from './sandbox/types'

/**
 * @mframework/auth-email-domains: a sandboxed auth plugin (see the auth
 * layer's server/utils/plugins). Register it in an app's nuxt.config:
 * `modules: ['@mframework/auth-email-domains']`; an admin then switches it
 * on and sets its domains on the integrations page.
 *
 * Its code (sandbox/server.mjs) never runs in the app: the auth layer reads
 * it at build time and runs it in its own locked-down process. What it may
 * do is declared in package.json (`mframework.auth`).
 */
export default defineNuxtModule({
  meta: {
    name: '@mframework/auth-email-domains',
    compatibility: { nuxt: '^4.0.0' },
  },
  setup(_, nuxt) {
    const { resolve } = createResolver(import.meta.url)
    nuxt.hook('mframework:auth-plugins', (plugins) => {
      plugins.push({ name: 'email-domains', sandbox: resolve('./sandbox/server.mjs') })
    })
  },
})
