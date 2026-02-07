import { defineNuxtModule, addPlugin, createResolver } from 'nuxt/kit'

export default defineNuxtModule({
  meta: { name: '@mframework/layer-shared' },
  setup(_, nuxt) {
    const { resolve } = createResolver(import.meta.url)

    nuxt.options.css ||= []
    nuxt.options.css.push('vuetify/styles')

    nuxt.options.build ||= {}
    nuxt.options.build.transpile ||= []
    nuxt.options.build.transpile.push('vuetify')

    addPlugin(resolve('./runtime/plugins/vuetify'))
  }
})
