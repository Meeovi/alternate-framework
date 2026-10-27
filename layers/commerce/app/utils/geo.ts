/**
 * Distance helpers for "near you" listings (Travel department). Shared by
 * the nearby product card, useNearbyProducts and
 * server/api/commerce/products/nearby.get.ts.
 *
 * A product's location is its own latitude/longitude (Directus products),
 * else its shop's, else the legacy free-text `coordinates` field ("lat, lng").
 */
export interface LatLng {
  lat: number
  lng: number
}

const EARTH_RADIUS_KM = 6371.0088
const KM_PER_MILE = 1.609344

function toNumber(value: unknown): number | null {
  if (value === null || value === undefined || value === '') return null
  const n = Number(value)
  return Number.isFinite(n) ? n : null
}

export function toLatLng(lat: unknown, lng: unknown): LatLng | null {
  const a = toNumber(lat)
  const b = toNumber(lng)
  if (a === null || b === null || Math.abs(a) > 90 || Math.abs(b) > 180) return null
  return { lat: a, lng: b }
}

function parseCoordinates(text: unknown): LatLng | null {
  if (typeof text !== 'string') return null
  const m = text.match(/^\s*(-?\d+(?:\.\d+)?)\s*[,;\s]\s*(-?\d+(?:\.\d+)?)\s*$/)
  return m ? toLatLng(m[1], m[2]) : null
}

export function productLocation(product: any): LatLng | null {
  if (!product) return null
  const shop = product.shops?.[0]?.shops_id
  return toLatLng(product.latitude, product.longitude)
    ?? toLatLng(shop?.latitude, shop?.longitude)
    ?? parseCoordinates(product.coordinates)
}

/** Great-circle distance in kilometres. */
export function distanceKm(a: LatLng, b: LatLng): number {
  const rad = Math.PI / 180
  const dLat = (b.lat - a.lat) * rad
  const dLng = (b.lng - a.lng) * rad
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(a.lat * rad) * Math.cos(b.lat * rad) * Math.sin(dLng / 2) ** 2
  return 2 * EARTH_RADIUS_KM * Math.asin(Math.min(1, Math.sqrt(h)))
}

/** Lat/lng box around a point that contains every spot within radiusKm. */
export function boundingBox(center: LatLng, radiusKm: number) {
  const dLat = radiusKm / 111.32
  const cos = Math.cos(center.lat * Math.PI / 180)
  const dLng = cos > 0.01 ? radiusKm / (111.32 * cos) : 180
  return {
    minLat: Math.max(-90, center.lat - dLat),
    maxLat: Math.min(90, center.lat + dLat),
    minLng: Math.max(-180, center.lng - dLng),
    maxLng: Math.min(180, center.lng + dLng),
  }
}

/** Rounds to 2 decimals (about 1 km) before a location leaves the browser. */
export function coarsen(point: LatLng): LatLng {
  return { lat: Math.round(point.lat * 100) / 100, lng: Math.round(point.lng * 100) / 100 }
}

/** The US, UK, Liberia and Myanmar measure road distance in miles. */
export function usesMiles(locale?: string): boolean {
  const region = (locale || '').split(/[-_]/)[1]?.toUpperCase()
  return ['US', 'GB', 'LR', 'MM'].includes(region || '')
}

export function formatDistance(km: number, locale = 'en-US', units: 'auto' | 'km' | 'mi' = 'auto'): string {
  const miles = units === 'mi' || (units === 'auto' && usesMiles(locale))
  const value = miles ? km / KM_PER_MILE : km
  const unit = miles ? 'mile' : 'kilometer'
  if (value < 0.1) return 'Right here'
  const digits = value < 10 ? 1 : 0
  try {
    return `${new Intl.NumberFormat(locale, { style: 'unit', unit, unitDisplay: 'short', maximumFractionDigits: digits }).format(value)} away`
  } catch {
    return `${value.toFixed(digits)} ${miles ? 'mi' : 'km'} away`
  }
}
