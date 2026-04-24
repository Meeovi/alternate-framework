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

    const optionsWithNitro = nuxt.options as typeof nuxt.options & { nitro: any }
    optionsWithNitro.nitro ||= {}
    optionsWithNitro.nitro.scanDirs ||= []

    if (!optionsWithNitro.nitro.scanDirs.includes(serverDir)) {
      optionsWithNitro.nitro.scanDirs.push(serverDir)
    }

    if (options.enableRuntimeComposables !== false) {
      addImportsDir(resolver.resolve('../../runtime/composables'))
    }
  },
})
