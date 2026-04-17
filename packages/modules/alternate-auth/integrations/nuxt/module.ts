import { addImportsDir, createResolver, defineNuxtModule } from '@nuxt/kit'

export interface AlternateAuthNuxtModuleOptions {
  enableRuntimeComposables?: boolean
}

export default defineNuxtModule<AlternateAuthNuxtModuleOptions>({
  meta: {
    name: 'alternate-auth-module',
    configKey: 'alternateAuth',
    compatibility: {
      nuxt: '>=4.0.0',
    },
  },
  defaults: {
    enableRuntimeComposables: true,
  },
  setup(options) {
    if (!options.enableRuntimeComposables) return

    const resolver = createResolver(import.meta.url)
    addImportsDir(resolver.resolve('../../runtime/composables'))
  },
})
