import { defineNuxtModule, addPlugin, createResolver } from '@nuxt/kit'
import { vuetifyLabComponentNames } from '../vuetify/labs'

export interface AlternateUiNuxtModuleOptions {
  enableThemePlugins?: boolean
  enableVuetifyLabs?: boolean
}

export default defineNuxtModule<AlternateUiNuxtModuleOptions>({
  meta: {
    name: 'alternate-ui-theme-module',
    configKey: 'alternateUiTheme',
    compatibility: {
      nuxt: '>=4.0.0',
    },
  },
  defaults: {
    enableThemePlugins: true,
    enableVuetifyLabs: true,
  },
  setup(options, nuxt) {
    if (options.enableVuetifyLabs) {
      const nuxtAny = nuxt as any
      nuxtAny.hook('vuetify:registerModule', (register: any) => {
        register({
          vuetifyOptions: {
            labComponents: [...vuetifyLabComponentNames],
          },
        })
      })
    }

    if (!options.enableThemePlugins) return

    const resolver = createResolver(import.meta.url)

    addPlugin({
      src: resolver.resolve('../../adapters/nuxt/theme.client'),
      mode: 'client',
    })

    addPlugin({
      src: resolver.resolve('../../adapters/nuxt/theme.server'),
      mode: 'server',
    })
  },
})
