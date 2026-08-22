// vue-instantsearch ships no types for its ESM subpath export.
// @ts-expect-error - no declaration file for 'vue-instantsearch/vue3/es'
import InstantSearch from "vue-instantsearch/vue3/es";

export default defineNuxtPlugin((nuxtApp) => {
  (nuxtApp.vueApp as any).use(InstantSearch)
})