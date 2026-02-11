// layers/search/plugins/instantsearch.client.ts
import { h } from 'vue'
import { defineNuxtPlugin } from '#imports'
import InstantSearch, { AisInstantSearch } from 'vue-instantsearch/vue3/es'

export default defineNuxtPlugin(nuxtApp => {
  // Register InstantSearch (client-only)
  nuxtApp.vueApp.use(InstantSearch)

  // Resolve the original component
  const OriginalInstantSearch =
    nuxtApp.vueApp.component('AisInstantSearch') ||
    nuxtApp.vueApp.component('ais-instant-search') ||
    AisInstantSearch

  // Wrap it to enforce future.preserveSharedStateOnUnmount
  const AisInstantSearchWrapper = {
    name: 'AisInstantSearch',
    inheritAttrs: false,
    setup(_, { attrs, slots }) {
      const mergedAttrs = {
        ...attrs,
        future: {
          preserveSharedStateOnUnmount: true,
          ...(attrs.future || {})
        }
      }

      if (process.env.NODE_ENV !== 'production') {
        console.debug('[instantsearch] merged future options', mergedAttrs.future)
      }

      return () => h(OriginalInstantSearch, mergedAttrs, slots)
    }
  }

  nuxtApp.vueApp.component('ais-instant-search', AisInstantSearchWrapper)
})
