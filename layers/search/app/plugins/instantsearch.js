import { h } from 'vue'
import { defineNuxtPlugin } from '#imports'
import InstantSearch from 'vue-instantsearch/vue3/es'

export default defineNuxtPlugin(nuxtApp => {
  // Register the original InstantSearch plugin (registers other components)
  nuxtApp.vueApp.use(InstantSearch)
  // Capture the original registered component (if the plugin registered it)
  const OriginalInstantSearch = nuxtApp.vueApp.component('ais-instant-search') || InstantSearch

  // Override `ais-instant-search` with a small wrapper that sets
  // future.preserveSharedStateOnUnmount = true by default to silence
  // the deprecation warning and adopt the new behavior.
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
        // helpful debug when running locally
        // eslint-disable-next-line no-console
        console.debug('[instantsearch] merged future options', mergedAttrs.future)
      }
      return () => h(OriginalInstantSearch, mergedAttrs, slots)
    }
  }

  nuxtApp.vueApp.component('ais-instant-search', AisInstantSearchWrapper)
})
