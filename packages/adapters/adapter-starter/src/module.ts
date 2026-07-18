import { defineNuxtModule, addPlugin, createResolver } from '@nuxt/kit'
import { loadEnv } from './env'

// Module options TypeScript interface definition
export interface ModuleOptions {
  endpoint?: string
  token?: string
}

export default defineNuxtModule<ModuleOptions>({
  meta: {
    name: 'adapter-starter',
    configKey: 'adapterStarter'
  },
  // Default configuration options of the Nuxt module
  defaults: {
    endpoint: '',
    token: ''
  },
  setup(options, nuxt) {
    const resolver = createResolver(import.meta.url)
    const env = loadEnv(nuxt.options.runtimeConfig)

    // Push module options into public runtime config so the runtime plugin can read them
    nuxt.options.runtimeConfig.public.adapterStarter = {
      ...nuxt.options.runtimeConfig.public.adapterStarter,
      ...env,
      ...options
    }

    // Register the runtime plugin that exposes the adapter via $sdk
    addPlugin(resolver.resolve('./runtime/plugin'))
  },
})
