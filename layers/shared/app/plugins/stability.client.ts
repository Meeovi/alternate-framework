/**
 * Stability and accessibility styles plugin
 * Loads global CSS from alternate-ui, which is now the source of truth
 * for framework-level UI primitives and stability helpers.
 */
import 'alternate-ui/styles.css'

export default defineNuxtPlugin(() => {
  if (import.meta.dev) {
    console.info('[stability] Global stability and accessibility styles loaded')
  }
})
