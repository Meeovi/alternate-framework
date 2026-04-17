import { defineNuxtPlugin } from 'nuxt/app'
import { h, render } from 'vue'
import DotdigitalChatLauncher from '../components/content/chat/DotdigitalChatLauncher.client.vue'

const CONTAINER_ID = 'commerce-dotdigital-chat-launcher'

export default defineNuxtPlugin((nuxtApp) => {
  if (typeof document === 'undefined') return

  const existing = document.getElementById(CONTAINER_ID)
  if (existing) return

  const container = document.createElement('div')
  container.id = CONTAINER_ID
  document.body.appendChild(container)

  const vnode = h(DotdigitalChatLauncher)
  vnode.appContext = nuxtApp.vueApp._context
  render(vnode, container)
})