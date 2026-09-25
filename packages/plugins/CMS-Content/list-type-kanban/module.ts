import { defineNuxtModule, createResolver, addComponent } from '@nuxt/kit'
import type { ListTypeModuleOptions, ListTypeRegistration } from './runtime/types'

export * from './runtime/types'

export type ModuleOptions = ListTypeModuleOptions

export default defineNuxtModule<ModuleOptions>({
  meta: {
    name: '@mframework/list-type-kanban',
    configKey: 'listTypeKanban',
    compatibility: {
      nuxt: '^4.0.0',
    },
  },

  defaults: {
    types: ['Kanban', 'Board'],
    collection: 'list_items',
  },

  setup(options, nuxt) {
    const resolver = createResolver(import.meta.url)

    // Global so the list page can render it by name from the registry
    // without importing this package.
    addComponent({
      name: 'ListTypeKanban',
      filePath: resolver.resolve('runtime/components/Kanban.vue'),
      global: true,
    })

    const entry: ListTypeRegistration = {
      component: 'ListTypeKanban',
      label: 'Kanban Board',
      icon: 'fas fa-table-columns',
      plugin: '@mframework/list-type-kanban',
    }
    const appConfig = nuxt.options.appConfig as Record<string, any>
    appConfig.listTypes = { ...(appConfig.listTypes || {}) }
    for (const type of options.types || []) {
      appConfig.listTypes[type] = { ...entry }
    }

    nuxt.options.runtimeConfig.public.listTypeKanban = {
      collection: options.collection || 'list_items',
    }
  },
})
