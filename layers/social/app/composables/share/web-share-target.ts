import { useNuxtApp } from "nuxt/app"
import { onBeforeMount, onBeforeUnmount } from "vue"

export function useWebShareTarget(listener?: (message: MessageEvent) => void) {
  if (import.meta.server)
    return

  onBeforeMount(() => {
    const pwa = useNuxtApp().$pwa as { isInstalled?: boolean } | undefined

    // PWA must be installed to use share target
    if (pwa?.isInstalled && 'serviceWorker' in navigator) {
      if (listener)
        navigator.serviceWorker.addEventListener('message', listener)

      navigator.serviceWorker.getRegistration()
        .then((registration) => {
          if (registration && registration.active) {
            // we need to signal the service worker that we are ready to receive data
            registration.active.postMessage({ action: 'ready-to-receive' })
          }
        })
        .catch(err => console.error('Could not get registration', err))

      if (listener)
        onBeforeUnmount(() => navigator.serviceWorker.removeEventListener('message', listener))
    }
  })
}
