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
