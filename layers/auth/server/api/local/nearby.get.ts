// server/api/local/nearby.get.ts
import { sql } from 'drizzle-orm'
import { getQuery, defineEventHandler } from 'h3'
import { db } from '../../utils/drizzle'
import { products } from '../../database/migrations/schema'

export default defineEventHandler(async (event) => {
  const { lat, lng, radiusInMeters } = getQuery(event)

  // Pure type-safe PostGIS execution directly through your Drizzle layer
  const nearbyListings = await db.select()
    .from(products)
    .where(
      sql`ST_DWithin(${products.coordinates}, ST_MakePoint(${lng}, ${lat})::geography, ${radiusInMeters})`
    )

  return nearbyListings
})