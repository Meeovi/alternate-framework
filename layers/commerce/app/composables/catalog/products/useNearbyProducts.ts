import { computed, onMounted, toValue, useId, watch } from 'vue'
import type { MaybeRefOrGetter } from 'vue'
import { useAsyncData } from '#imports'
import { useUserLocation } from '../location/useUserLocation'
import type { LatLng } from '../../../utils/geo'

export interface NearbyProductsOptions {
  /** Department slug, e.g. 'travel'. Omit for every department. */
  department?: MaybeRefOrGetter<string | undefined>
  radiusKm?: MaybeRefOrGetter<number>
  limit?: MaybeRefOrGetter<number>
  /** Ask the browser for the location (permission prompt). Default true. */
  prompt?: boolean
}

interface NearbyResponse {
  origin: LatLng | null
  source: 'query' | 'ip' | null
  products: Array<Record<string, any> & { distanceKm: number }>
}

/**
 * Products near the visitor, nearest first, each with `distanceKm` — for a
 * grid of <NearbyProductCard>s.
 *
 *   const { products, status, location } = useNearbyProducts({ department: 'travel', radiusKm: 100 })
 *
 * Client-only (the list depends on where the visitor is). Waits for the
 * location lookup, then refetches whenever the options change.
 */
export function useNearbyProducts(options: NearbyProductsOptions = {}) {
  const { location, source, status: locationStatus, error: locationError, locate } = useUserLocation()

  const query = computed(() => ({
    lat: location.value?.lat,
    lng: location.value?.lng,
    department: toValue(options.department) || undefined,
    radius: toValue(options.radiusKm) ?? 50,
    limit: toValue(options.limit) ?? 24,
  }))

  // Nothing is fetched until the location lookup has finished, so a
  // visitor who shares their location doesn't load an IP-based list first.
  const { data, status, error, execute: refresh } = useAsyncData(
    `nearby-products-${useId()}`,
    () => $fetch<NearbyResponse>('/api/commerce/products/nearby', { query: query.value }),
    { server: false, lazy: true, immediate: false },
  )

  onMounted(async () => {
    await locate({ prompt: options.prompt ?? true })
    await refresh()
    watch(query, () => refresh())
  })

  return {
    products: computed(() => data.value?.products ?? []),
    /** The point searched from (rounded), or null when no location is known. */
    origin: computed(() => data.value?.origin ?? null),
    status,
    error,
    refresh,
    location,
    locationSource: source,
    locationStatus,
    locationError,
    locate,
  }
}
