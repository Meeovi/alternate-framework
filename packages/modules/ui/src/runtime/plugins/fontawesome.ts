import { defineNuxtPlugin } from 'nuxt/app'
import { library } from '@fortawesome/fontawesome-svg-core'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import { fas } from '@fortawesome/free-solid-svg-icons'
import '@fortawesome/fontawesome-free/css/all.min.css'

export default defineNuxtPlugin((nuxtApp) => {
  library.add(fas)

  nuxtApp.vueApp.component('Fa', FontAwesomeIcon)
})