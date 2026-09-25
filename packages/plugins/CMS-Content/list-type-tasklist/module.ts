import { defineNuxtModule, createResolver, addComponent } from '@nuxt/kit'
import type { ListTypeModuleOptions, ListTypeRegistration } from './runtime/types'

export * from './runtime/types'

export interface ModuleOptions extends ListTypeModuleOptions {
  /**
   * Also render lists whose type has no plugin installed (the list page's
   * previous hard-coded default). Only one plugin should set this.
   */
  fallback?: boolean
}

export default defineNuxtModule<ModuleOptions>({
  meta: {
    name: '@mframework/list-type-tasklist',
    configKey: 'listTypeTaskList',
    compatibility: {
      nuxt: '^4.0.0',
    },
  },

  defaults: {
    types: ['Task List'],
    collection: 'list_items',
    fallback: true,
  },

  setup(options, nuxt) {
    const resolver = createResolver(import.meta.url)

    // Global so the list page can render it by name from the registry
    // without importing this package.
    addComponent({
      name: 'ListTypeTaskList',
      filePath: resolver.resolve('runtime/components/TaskList.vue'),
      global: true,
    })

    const entry: ListTypeRegistration = {
      component: 'ListTypeTaskList',
      label: 'Task List',
      icon: 'fas fa-circle-check',
      plugin: '@mframework/list-type-tasklist',
      fallback: options.fallback !== false,
    }
    const appConfig = nuxt.options.appConfig as Record<string, any>
    appConfig.listTypes = { ...(appConfig.listTypes || {}) }
    for (const type of options.types || []) {
      appConfig.listTypes[type] = { ...entry }
    }

    nuxt.options.runtimeConfig.public.listTypeTaskList = {
      collection: options.collection || 'list_items',
    }
  },
})
