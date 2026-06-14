import { defineNuxtModule, addImportsDir, addPlugin, createResolver } from '@nuxt/kit'

export interface ModuleOptions {
  apiBaseUrl?: string
  apiPath?: string
  enabled?: boolean
}

export default defineNuxtModule<ModuleOptions>({
  meta: {
    name: '@mframework/adapter-mautic',
    configKey: 'mautic',
    compatibility: {
      nuxt: '>=4.0.0',
    },
  },
  defaults: {
    enabled: true,
    apiPath: '/api',
  },
  setup(options, nuxt) {
    if (options.enabled === false) {
      return
    }

    const resolver = createResolver(import.meta.url)
    const runtimeConfig = nuxt.options.runtimeConfig.public as Record<string, unknown>

    runtimeConfig.mautic = {
      apiBaseUrl: options.apiBaseUrl,
      apiPath: options.apiPath,
    }

    nuxt.options.build.transpile.push(resolver.resolve('./runtime'))
    addImportsDir(resolver.resolve('./runtime/composables'))
    addPlugin(resolver.resolve('./runtime/plugin'))
  },
})

declare module '@nuxt/schema' {
  interface PublicRuntimeConfig {
    mautic?: ModuleOptions
  }
}
