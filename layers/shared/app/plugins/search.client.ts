import { createSearch, type SearchConfig } from 'alternate-search'

export type SharedSearchProvider = {
  create: (config: SearchConfig) => ReturnType<typeof createSearch>
}

export default defineNuxtPlugin(() => {
  const search: SharedSearchProvider = {
    create: (config) => createSearch(config),
  }

  return {
    provide: {
      search,
    },
  }
})
