import {
  defineNuxtModule,
  addPlugin,
  createResolver,
  addComponentsDir,
  addImportsDir
} from 'nuxt/kit'

export interface MFrameworkUiOptions {
  theme ? : 'light' | 'dark'
  builder ? : boolean | {
    enabled ? : boolean
  }
}

export default defineNuxtModule < MFrameworkUiOptions > ({
  meta: {
    name: '@mframework/ui',
    configKey: 'mframeworkUi'
  },

  defaults: {
    theme: 'light',
    builder: true
  },

  setup(options, nuxt) {
    const resolver = createResolver(import.meta.url)

    //
    // 1. Ensure Vuetify loads FIRST
    //
    addPlugin({
      src: resolver.resolve('./runtime/plugins/vuetify'),
      mode: 'all'
    })

    //
    // 2. Global styles (Tailwind, Vuetify overrides, tokens)
    //
    nuxt.options.css = nuxt.options.css || []
    nuxt.options.css.push(resolver.resolve('./runtime/styles/index.css'))

    //
    // 3. Register core UI plugins
    //
    const plugins = [
      'formkit',
      'fontawesome',
      'lightgallery',
      'motion',
      'theme'
    ]

    plugins.forEach((name) => {
      addPlugin({
        src: resolver.resolve(`./runtime/plugins/${name}`),
        mode: 'all'
      })
    })

    //
    // 4. Register GrapesJS builder (client‑only)
    //
    if (options.builder) {
      addPlugin({
        src: resolver.resolve('./runtime/plugins/builder'),
        mode: 'client'
      })
    }

    //
    // 5. Auto‑import components & composables
    //
    addComponentsDir({
      path: resolver.resolve('./runtime/components'),
      prefix: 'M'
    })

    addImportsDir(resolver.resolve('./runtime/composables'))

    //
    // 6. Expose runtime config
    //
    // Normalize builder option
    const normalizedBuilder =
      typeof options.builder === 'boolean' ? {
        enabled: options.builder
      } :
      options.builder || {
        enabled: true
      }

    nuxt.options.runtimeConfig.public.mframeworkUi = {
      theme: options.theme,
      builder: normalizedBuilder
    }

    // Safe assignment without TS errors
    ;(nuxt.options as any).tailwindcss = (nuxt.options as any).tailwindcss || {}
    ;(nuxt.options as any).tailwindcss.configPath = resolver.resolve(
      './runtime/assets/config/tailwind.config.js'
    )
  }
})