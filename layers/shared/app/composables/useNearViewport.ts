import { onBeforeUnmount, onMounted, ref, watch, type Ref } from 'vue'

/**
 * `near` turns true (once) when the element comes within `margin` of the
 * screen, so a page section can load its data only when the visitor scrolls
 * towards it instead of with the page. Without IntersectionObserver (old
 * browsers) it turns true straight away. Always false while rendering on
 * the server.
 */
export function useNearViewport(target: Ref<Element | { $el?: Element } | null | undefined>, margin = '600px') {
  const near = ref(false)
  let observer: IntersectionObserver | null = null

  const element = () => {
    const value = target.value as any
    return (value?.$el ?? value) as Element | null | undefined
  }

  const observe = () => {
    observer?.disconnect()
    const el = element()
    if (near.value || !el || !(el instanceof Element)) return
    observer = new IntersectionObserver((entries) => {
      if (entries.some((entry) => entry.isIntersecting)) {
        near.value = true
        observer?.disconnect()
        observer = null
      }
    }, { rootMargin: margin })
    observer.observe(el)
  }

  onMounted(() => {
    if (typeof IntersectionObserver === 'undefined') {
      near.value = true
      return
    }
    observe()
    // The element may only appear later (v-if).
    watch(target, observe, { flush: 'post' })
  })
  onBeforeUnmount(() => observer?.disconnect())

  return near
}
