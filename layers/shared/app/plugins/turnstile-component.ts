import NuxtTurnstile from '../components/NuxtTurnstile.vue'

// <NuxtTurnstile> for every layer and plugin (auth pages, meeovi-forms'
// DynamicForm): this layer's components aren't auto-registered.
export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.vueApp.component('NuxtTurnstile', NuxtTurnstile)
})
