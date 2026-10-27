import { useRuntimeConfig } from '#imports'
import { boundingBox, distanceKm, productLocation } from '../../app/utils/geo'
import type { LatLng } from '../../app/utils/geo'

export interface NearbyOptions {
  origin: LatLng
  radiusKm: number
  limit: number
  /** Department slug, e.g. "travel". */
  department?: string
}

// What productCard shows, plus the location fields.
const FIELDS = [
  '*',
  'image.*',
  'shops.shops_id.id',
  'shops.shops_id.name',
  'shops.shops_id.address',
  'shops.shops_id.latitude',
  'shops.shops_id.longitude',
]

// Directus can't sort by distance, so it returns everything inside the
// bounding box (up to this many rows) and the exact distance is worked
// out here.
const CANDIDATES = 300

const between = (min: number, max: number) => ({ _between: [min, max] })

/**
 * Published products within radiusKm of origin, nearest first, each with
 * `distanceKm`. Reads Directus directly: the store's Mage-OS products are
 * mirrored there, and the commerce backend has no location fields to filter on.
 */
export async function findNearbyProducts({ origin, radiusKm, limit, department }: NearbyOptions) {
  const config = useRuntimeConfig()
  const url = (config.public as { directus?: { url?: string } }).directus?.url
  const token = (config as { directus?: { token?: string } }).directus?.token
  if (!url) return []

  const box = boundingBox(origin, radiusKm)
  const inBox = { latitude: between(box.minLat, box.maxLat), longitude: between(box.minLng, box.maxLng) }
  const filter: Record<string, unknown>[] = [
    { status: { _eq: 'published' } },
    { _or: [inBox, { shops: { shops_id: inBox } }] },
  ]
  if (department) filter.push({ departments: { departments_id: { slug: { _eq: department } } } })

  const res = await $fetch<{ data?: any[] }>(`${url.replace(/\/+$/, '')}/items/products`, {
    query: { fields: FIELDS.join(','), filter: JSON.stringify({ _and: filter }), limit: CANDIDATES },
    headers: token ? { Authorization: `Bearer ${token}` } : {},
    timeout: 8000,
  })

  return (res?.data ?? [])
    .map((product) => {
      const at = productLocation(product)
      return at ? { ...product, distanceKm: Math.round(distanceKm(origin, at) * 100) / 100 } : null
    })
    .filter((p): p is NonNullable<typeof p> => !!p && p.distanceKm <= radiusKm)
    .sort((a, b) => a.distanceKm - b.distanceKm)
    .slice(0, limit)
}
