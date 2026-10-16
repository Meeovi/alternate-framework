import { defineNuxtModule } from '@nuxt/kit'
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
    // Runs in the integrations sandbox (sandbox/ — see package.json
    // `mframework.integration.sandbox`): the list page embeds it with
    // <IntegrationFrame> and lends it CRUD on this list's items only.
    const entry: ListTypeRegistration = {
      sandbox: true,
      capabilities: ['list.items', 'list.create', 'list.update', 'list.remove'],
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
