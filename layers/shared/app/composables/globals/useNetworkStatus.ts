import { computed } from 'vue'

export type NetworkStatus = 'online' | 'offline' | 'slow'

/**
 * Shared network connectivity composable.
 *
 * - `isOnline` tracks browser online/offline state
 * - `networkStatus` adds a "slow" state when Network Information API reports
 *   a low-quality connection
 */
export function useNetworkStatus() {
  const isOnline = useState<boolean>('network:isOnline', () => {
    if (process.server) return true
    if (typeof navigator === 'undefined') return true
    return navigator.onLine
  })

  const effectiveType = useState<string>('network:effectiveType', () => {
    if (process.server) return 'unknown'
    const nav = navigator as Navigator & {
      connection?: {
        effectiveType?: string
      }
    }
    return nav.connection?.effectiveType || 'unknown'
  })

  const updateOnlineStatus = () => {
    if (typeof navigator === 'undefined') return
    isOnline.value = navigator.onLine
  }

  const updateConnectionType = () => {
    const nav = navigator as Navigator & {
      connection?: {
        effectiveType?: string
      }
    }
    effectiveType.value = nav.connection?.effectiveType || 'unknown'
  }

  if (process.client) {
    const onlineHandler = () => updateOnlineStatus()
    const offlineHandler = () => updateOnlineStatus()

    window.addEventListener('online', onlineHandler)
    window.addEventListener('offline', offlineHandler)

    const nav = navigator as Navigator & {
      connection?: EventTarget
    }

    if (nav.connection?.addEventListener) {
      nav.connection.addEventListener('change', updateConnectionType)
    }

    onUnmounted(() => {
      window.removeEventListener('online', onlineHandler)
      window.removeEventListener('offline', offlineHandler)
      if (nav.connection?.removeEventListener) {
        nav.connection.removeEventListener('change', updateConnectionType)
      }
    })
  }

  const networkStatus = computed<NetworkStatus>(() => {
    if (!isOnline.value) return 'offline'

    // Treat 2g / slow-2g as slow for UI hints.
    if (effectiveType.value === '2g' || effectiveType.value === 'slow-2g') {
      return 'slow'
    }

    return 'online'
  })

  return {
    isOnline,
    networkStatus,
    effectiveType,
  }
}
