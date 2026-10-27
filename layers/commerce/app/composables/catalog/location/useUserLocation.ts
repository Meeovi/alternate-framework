import { computed } from 'vue'
import { useState } from '#imports'
import { coarsen, toLatLng } from '../../../utils/geo'
import type { LatLng } from '../../../utils/geo'

export type UserLocationSource = 'browser' | 'ip'
export type UserLocationStatus = 'idle' | 'locating' | 'ready' | 'unavailable'

interface UserLocationState {
  point: LatLng | null
  source: UserLocationSource | null
  status: UserLocationStatus
  /** Why the browser location wasn't used (denied, timed out, unsupported). */
  error: string | null
}

// One lookup per page load, however many cards ask.
let pending: Promise<void> | null = null

/**
 * The visitor's location for "near you" lists, shared by every component
 * on the page and rounded to about 1 km.
 *
 *   const { location, locate } = useUserLocation()
 *   onMounted(() => locate())            // asks the browser
 *   onMounted(() => locate({ prompt: false }))  // never shows a permission prompt
 *
 * Uses the browser's location when allowed, otherwise the approximate
 * city-level one from /api/commerce/location. Client-only: nothing is
 * looked up during SSR, so `location` is null until mounted.
 */
export function useUserLocation() {
  const state = useState<UserLocationState>('meeovi-user-location', () => ({
    point: null, source: null, status: 'idle', error: null,
  }))

  async function fromIp() {
    try {
      const res = await $fetch<{ location: LatLng | null }>('/api/commerce/location')
      const point = toLatLng(res?.location?.lat, res?.location?.lng)
      if (point) state.value = { ...state.value, point, source: 'ip' }
    } catch {
      // No approximate location either; leave point null.
    }
  }

  function fromBrowser(): Promise<LatLng> {
    return new Promise((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(
        (pos) => resolve(coarsen({ lat: pos.coords.latitude, lng: pos.coords.longitude })),
        (err) => reject(new Error(err.code === err.PERMISSION_DENIED ? 'Location permission denied' : err.message || 'Location unavailable')),
        // City-level accuracy is enough and much faster than GPS.
        { enableHighAccuracy: false, timeout: 10000, maximumAge: 10 * 60 * 1000 },
      )
    })
  }

  async function browserAllowed(prompt: boolean): Promise<boolean> {
    if (!('geolocation' in navigator)) return false
    if (prompt) return true
    try {
      return (await navigator.permissions?.query({ name: 'geolocation' }))?.state === 'granted'
    } catch {
      return false
    }
  }

  /**
   * Finds the location once (later calls reuse it). With prompt: false the
   * browser is only asked if the visitor already allowed this site.
   * A browser location replaces an earlier IP one.
   */
  function locate({ prompt = true }: { prompt?: boolean } = {}): Promise<void> {
    if (import.meta.server) return Promise.resolve()
    if (state.value.source === 'browser') return Promise.resolve()
    if (pending) return pending
    // Already tried the browser (denied or failed), or no need to ask it.
    if (state.value.status !== 'idle' && (state.value.error || !prompt)) return Promise.resolve()

    state.value = { ...state.value, status: 'locating' }
    pending = (async () => {
      if (await browserAllowed(prompt)) {
        try {
          state.value = { ...state.value, point: await fromBrowser(), source: 'browser', error: null }
        } catch (error) {
          state.value = { ...state.value, error: (error as Error).message }
        }
      } else if (!('geolocation' in navigator)) {
        state.value = { ...state.value, error: 'Location isn\'t supported by this browser' }
      }
      if (!state.value.point) await fromIp()
      state.value = { ...state.value, status: state.value.point ? 'ready' : 'unavailable' }
    })().finally(() => { pending = null })
    return pending
  }

  return {
    location: computed(() => state.value.point),
    source: computed(() => state.value.source),
    status: computed(() => state.value.status),
    error: computed(() => state.value.error),
    locate,
  }
}
