// @mframework/ui/module.ts
import {
  defineNuxtModule,
  addPlugin,
  addComponentsDir,
  createResolver,
  installModule,
  resolveModule
} from '@nuxt/kit'

export interface MFrameworkUiOptions {
  image ? : Record < string, any >
    fonts ? : Record < string, any >
    vuetify ? : {
      vuetifyOptions ? : Record < string,
      any >
    }
  tailwind ? : {
    enable ? : boolean
  }
}

export default defineNuxtModule < MFrameworkUiOptions > ({
  meta: {
    name: '@mframework/ui',
    configKey: 'mframeworkUi'
  },
  defaults: {
    image: {},
    fonts: {},
    vuetify: {
      vuetifyOptions: {
        icons: {
          defaultSet: 'mdi'
        }
      }
    },
    tailwind: {
      enable: true
    }
  },

  async setup(options, nuxt) {
    const {
      resolve
    } = createResolver(import.meta.url)

    //
    // 1. Expose options to runtime
    //
    nuxt.options.runtimeConfig.public.mframeworkUi = options

    //
    // 2. Install @nuxt/fonts
    //
    await installModule('@nuxt/fonts', options.fonts || {})

    //
    // 3. Install Vuetify via vuetify-nuxt-module (optional).
    //    First check whether the consuming project actually has `vuetify`
    //    installed to avoid Nuxt failing during module resolution.
    //
    await installModule(resolveModule('vuetify-nuxt-module'), {
      vuetifyOptions: options.vuetify?.vuetifyOptions || {}
    })
  }
})