import type { DirectiveBinding } from 'vue'
import { sanitizeCmsHtml, sanitizeUserHtml } from '../utils/sanitizeUserHtml'

/**
 * `v-dompurify-html="html"` for every app on this layer: renders HTML after
 * sanitizeUserHtml(). (The name is historical — templates across the layers
 * use it; the old app-level version was a three-regex filter that
 * `<img src=x onerror=…>` walked straight through.)
 *
 * `v-dompurify-html:cms="html"` is for pages written in Directus: it keeps
 * all of their styling and <style> blocks (sanitizeCmsHtml). Never use it
 * for anything users write.
 */
export default defineNuxtPlugin((nuxtApp) => {
  const clean = (binding: DirectiveBinding) => (binding.arg === 'cms' ? sanitizeCmsHtml : sanitizeUserHtml)(binding.value)
  const render = (el: HTMLElement, binding: DirectiveBinding) => {
    if (binding.value === binding.oldValue && el.innerHTML) return
    el.innerHTML = clean(binding)
  }
  nuxtApp.vueApp.directive('dompurify-html', {
    mounted: render,
    updated: render,
    getSSRProps: (binding: DirectiveBinding) => ({ innerHTML: clean(binding) }),
  })
})
