// packages/adapters/adapter-directus/src/module.ts
import { defineNuxtModule, addServerPlugin, createResolver } from '@nuxt/kit'

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

    // NOT registered: runtime/plugin.ts (addPlugin) — confirmed live, by
    // bisection, that simply loading it (its alternate-sdk import, not
    // anything content-adapter-specific) pulls @nuxt/kit into the client
    // bundle and fails the build: "This module cannot be imported in the
    // Vue part of your app. [importing `@nuxt/kit` from `node_modules/
    // nuxt/dist/index.js`]". A no-op stand-in plugin built and bundled
    // cleanly, isolating the cause to plugin.ts's own content, not this
    // module's setup. This module was never actually loaded by any app
    // before today (nothing in meeovi-frontend's nuxt.config.ts referenced
    // 'adapter-directus/module' until this same change), so skipping the
    // client plugin here doesn't regress anything previously working —
    // Search/Auth/Notify adapter registration for Directus was never live
    // client-side to begin with. Pre-existing bug, out of scope to fix
    // here; left as-is rather than silently working around it further.
    addServerPlugin(resolver.resolve('./runtime/server/register-content-adapter'))
  }
})