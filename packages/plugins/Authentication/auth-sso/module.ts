import { addComponent, createResolver, defineNuxtModule } from '@nuxt/kit'
import type {} from './runtime/types'

/**
 * @mframework/auth-sso: the better-auth `sso` plugin (OIDC and SAML) for
 * the auth layer (layers/auth/modules/auth-plugins.ts). Register it in an
 * app's nuxt.config: `modules: ['@mframework/auth-sso']`.
 *
 * Also adds <AuthSsoSignIn> (global) and sets `appConfig.mframeworkAuth.sso`,
 * so pages can show it only when the package is installed.
 */
export default defineNuxtModule({
  meta: {
    name: '@mframework/auth-sso',
    compatibility: { nuxt: '^4.0.0' },
  },
  setup(_, nuxt) {
    const { resolve } = createResolver(import.meta.url)
    nuxt.hook('mframework:auth-plugins', (plugins) => {
      plugins.push({ name: 'sso', server: resolve('./runtime/server.ts'), client: resolve('./runtime/client.ts') })
    })

    addComponent({ name: 'AuthSsoSignIn', filePath: resolve('./runtime/components/AuthSsoSignIn.vue'), global: true })
    const appConfig = nuxt.options.appConfig as Record<string, any>
    appConfig.mframeworkAuth = { ...appConfig.mframeworkAuth, sso: true }
  },
})
