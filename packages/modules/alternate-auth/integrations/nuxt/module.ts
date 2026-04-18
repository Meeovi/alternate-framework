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
  setup(options, nuxt) {
    const resolver = createResolver(import.meta.url)
    const serverDir = resolver.resolve('../../server')

    nuxt.options.nitro ||= {}
    nuxt.options.nitro.scanDirs ||= []

    if (!nuxt.options.nitro.scanDirs.includes(serverDir)) {
      nuxt.options.nitro.scanDirs.push(serverDir)
    }

    if (options.enableRuntimeComposables !== false) {
      addImportsDir(resolver.resolve('../../runtime/composables'))
    }
  },
})
