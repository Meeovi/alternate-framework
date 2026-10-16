import type { DirectiveBinding } from 'vue'
import { sanitizeUserHtml } from '../utils/sanitizeUserHtml'

/**
 * `v-dompurify-html="html"` for every app on this layer: renders HTML after
 * sanitizeUserHtml(). (The name is historical — templates across the layers
 * use it; the old app-level version was a three-regex filter that
 * `<img src=x onerror=…>` walked straight through.)
 */
export default defineNuxtPlugin((nuxtApp) => {
  const render = (el: HTMLElement, binding: DirectiveBinding) => {
    if (binding.value === binding.oldValue && el.innerHTML) return
    el.innerHTML = sanitizeUserHtml(binding.value)
  }
  nuxtApp.vueApp.directive('dompurify-html', {
    mounted: render,
    updated: render,
    getSSRProps: (binding: DirectiveBinding) => ({ innerHTML: sanitizeUserHtml(binding.value) }),
  })
})
