import { afterEach, describe, expect, it, vi } from 'vitest'
import { boundingBox, coarsen, distanceKm, formatDistance, productLocation, toLatLng, usesMiles } from '../../app/utils/geo'

vi.mock('#imports', () => ({
  useRuntimeConfig: () => ({ public: { directus: { url: 'https://cms.example/' } }, directus: { token: 'tok' } }),
}))

const { findNearbyProducts } = await import('../../server/utils/nearbyProducts')

const london = { lat: 51.5074, lng: -0.1278 }
const paris = { lat: 48.8566, lng: 2.3522 }

describe('geo helpers', () => {
  it('measures great-circle distance', () => {
    expect(distanceKm(london, paris)).toBeGreaterThan(340)
    expect(distanceKm(london, paris)).toBeLessThan(346)
    expect(distanceKm(london, london)).toBe(0)
  })

  it('reads a product\'s own location, then its shop\'s, then the legacy text field', () => {
    expect(productLocation({ latitude: '51.5', longitude: '-0.12', shops: [{ shops_id: { latitude: 1, longitude: 1 } }] })).toEqual({ lat: 51.5, lng: -0.12 })
    expect(productLocation({ latitude: null, shops: [{ shops_id: { latitude: '48.85', longitude: '2.35' } }] })).toEqual({ lat: 48.85, lng: 2.35 })
    expect(productLocation({ coordinates: '40.71, -74.00' })).toEqual({ lat: 40.71, lng: -74 })
    expect(productLocation({ coordinates: 'somewhere nice' })).toBeNull()
    expect(productLocation({ latitude: 95, longitude: 0 })).toBeNull()
  })

  it('rejects missing or out-of-range coordinates', () => {
    expect(toLatLng('', '1')).toBeNull()
    expect(toLatLng(10, 181)).toBeNull()
    expect(toLatLng(0, 0)).toEqual({ lat: 0, lng: 0 })
  })

  it('boxes a radius generously enough to contain it', () => {
    const box = boundingBox(london, 50)
    expect(distanceKm(london, { lat: box.maxLat, lng: london.lng })).toBeGreaterThanOrEqual(49.9)
    expect(distanceKm(london, { lat: london.lat, lng: box.minLng })).toBeGreaterThanOrEqual(49.9)
  })

  it('rounds a location to about a kilometre', () => {
    expect(coarsen({ lat: 51.507351, lng: -0.127758 })).toEqual({ lat: 51.51, lng: -0.13 })
  })

  it('uses miles in the US and UK and kilometres elsewhere', () => {
    expect(usesMiles('en-US')).toBe(true)
    expect(usesMiles('en-GB')).toBe(true)
    expect(usesMiles('fr-FR')).toBe(false)
    expect(usesMiles('en')).toBe(false)
    expect(formatDistance(3.2, 'en-GB')).toBe('2 mi away')
    expect(formatDistance(3.2, 'fr-FR')).toMatch(/^3,2\s?km away$/)
    expect(formatDistance(42, 'en-US', 'km')).toBe('42 km away')
    expect(formatDistance(0.05, 'en-US')).toBe('Right here')
  })
})

describe('findNearbyProducts', () => {
  afterEach(() => vi.unstubAllGlobals())

  function stubDirectus(rows: any[]) {
    const fetch = vi.fn(async () => ({ data: rows }))
    vi.stubGlobal('$fetch', fetch)
    return fetch
  }

  it('returns products inside the radius, nearest first, with their distance', async () => {
    stubDirectus([
      { id: 'far', latitude: 51.75, longitude: -1.25 }, // Oxford, ~80 km
      { id: 'shop', latitude: null, shops: [{ shops_id: { latitude: 51.52, longitude: -0.10 } }] },
      { id: 'here', latitude: 51.5074, longitude: -0.1278 },
      { id: 'none' },
    ])
    const found = await findNearbyProducts({ origin: london, radiusKm: 50, limit: 10 })
    expect(found.map((p) => p.id)).toEqual(['here', 'shop'])
    expect(found[0]!.distanceKm).toBe(0)
    expect(found[1]!.distanceKm).toBeGreaterThan(1)
  })

  it('asks Directus for published products in the box, by department, with the token', async () => {
    const fetch = stubDirectus([])
    await findNearbyProducts({ origin: london, radiusKm: 10, limit: 5, department: 'travel' })
    const [url, opts] = fetch.mock.calls[0] as unknown as [string, any]
    expect(url).toBe('https://cms.example/items/products')
    expect(opts.headers).toEqual({ Authorization: 'Bearer tok' })
    const filter = JSON.parse(opts.query.filter)._and
    expect(filter[0]).toEqual({ status: { _eq: 'published' } })
    expect(filter[1]._or[0].latitude._between[0]).toBeLessThan(london.lat)
    expect(filter[1]._or[1].shops.shops_id.longitude._between[1]).toBeGreaterThan(london.lng)
    expect(filter[2]).toEqual({ departments: { departments_id: { slug: { _eq: 'travel' } } } })
    expect(opts.query.fields).toContain('shops.shops_id.latitude')
  })

  it('stops at the limit', async () => {
    stubDirectus(Array.from({ length: 5 }, (_, i) => ({ id: i, latitude: 51.5 + i / 1000, longitude: -0.13 })))
    expect(await findNearbyProducts({ origin: london, radiusKm: 50, limit: 2 })).toHaveLength(2)
  })
})
