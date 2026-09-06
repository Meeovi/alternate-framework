import { useNuxtApp } from "nuxt/app"

// Moved out of shared/utils/ — useNuxtApp() is a Vue-app-only composable
// (not available in Nitro), and shared/ must be safely importable from
// both the app and the server.
export default function useAppLocalePath() {
  const nuxtApp = useNuxtApp() as {
    $localePath?: (to: string) => string
  }

  return (to?: string) => {
    const path = to ?? '/'

    if (typeof nuxtApp.$localePath === 'function') {
      try {
        return nuxtApp.$localePath(path)
      } catch {
        // Fall back to raw path when i18n is not ready.
      }
    }

    return path
  }
}
