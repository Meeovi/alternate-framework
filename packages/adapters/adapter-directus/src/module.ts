// packages/adapters/adapter-directus/src/module.ts
import { defineNuxtModule, addPlugin, createResolver } from '@nuxt/kit'

export interface ModuleOptions {
  url?: string
  token?: string
}

export default defineNuxtModule<ModuleOptions>({
  meta: {
    name: 'adapter-directus',
    configKey: 'directusAdapter'
  },
  defaults: {},
  setup(options, nuxt) {
    const resolver = createResolver(import.meta.url)

    // Push the module options into public runtime config so our plugin can read them
    nuxt.options.runtimeConfig.public.directusAdapter = {
      ...nuxt.options.runtimeConfig.public.directus,
      ...options
    }

    // Register the runtime plugin that instantiates the class
    addPlugin(resolver.resolve('./runtime/plugin'))
  }
})