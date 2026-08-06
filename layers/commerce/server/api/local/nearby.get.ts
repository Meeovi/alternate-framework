// server/api/local/nearby.get.ts
import { sql } from 'drizzle-orm'
import { getQuery, defineEventHandler, createError } from 'h3'
import { db } from '#auth/server/utils/drizzle'

interface NearbyResponse {
  id: string
  name: string
  address: string | null
  distance_m: number
  lat: number
  lng: number
}

export default defineEventHandler(async (event): Promise<NearbyResponse[]> => {
  const query = getQuery(event)
  const lat = Number(query.lat)
  const lng = Number(query.lng)
  const radiusInMeters = Number(query.radiusInMeters ?? 5000)

  if (!Number.isFinite(lat) || !Number.isFinite(lng) || !Number.isFinite(radiusInMeters)) {
    throw createError({
      statusCode: 400,
      statusMessage: 'lat, lng, and radiusInMeters must be valid numbers',
    })
  }

  // Clamp radius to sane bounds to prevent expensive queries
  const radius = Math.max(100, Math.min(radiusInMeters, 50000))

  const results = await db.execute(sql`
    SELECT
      id,
      name,
      address,
      ST_Distance(location, ST_MakePoint(${lng}, ${lat})::geography) AS distance_m,
      ST_Y(location::geometry) AS lat,
      ST_X(location::geometry) AS lng
    FROM listings
    WHERE ST_DWithin(
      location::geography,
      ST_MakePoint(${lng}, ${lat})::geography,
      ${radius}
    )
    ORDER BY distance_m ASC
    LIMIT 100
  `)

  return results as unknown as NearbyResponse[]
})
