import { defineNuxtModule, createResolver, addComponent } from '@nuxt/kit'
import type { ListTypeModuleOptions, ListTypeRegistration } from './runtime/types'

export * from './runtime/types'

export type ModuleOptions = ListTypeModuleOptions

export default defineNuxtModule<ModuleOptions>({
  meta: {
    name: '@mframework/list-type-habit-tracker',
    configKey: 'listTypeHabitTracker',
    compatibility: {
      nuxt: '^4.0.0',
    },
  },

  defaults: {
    types: ['Habit Tracker'],
    collection: 'list_items',
  },

  setup(options, nuxt) {
    const resolver = createResolver(import.meta.url)

    // Global so the list page can render it by name from the registry
    // without importing this package.
    addComponent({
      name: 'ListTypeHabitTracker',
      filePath: resolver.resolve('runtime/components/HabitTracker.vue'),
      global: true,
    })

    const entry: ListTypeRegistration = {
      component: 'ListTypeHabitTracker',
      label: 'Habit Tracker',
      icon: 'fas fa-repeat',
      plugin: '@mframework/list-type-habit-tracker',
    }
    const appConfig = nuxt.options.appConfig as Record<string, any>
    appConfig.listTypes = { ...(appConfig.listTypes || {}) }
    for (const type of options.types || []) {
      appConfig.listTypes[type] = { ...entry }
    }

    nuxt.options.runtimeConfig.public.listTypeHabitTracker = {
      collection: options.collection || 'list_items',
    }
  },
})
