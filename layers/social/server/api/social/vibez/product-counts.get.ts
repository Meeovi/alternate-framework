import { defineEventHandler, getQuery } from 'h3'
import { countVibeProducts } from '../../../utils/vibeProducts'

/**
 * GET /api/social/vibez/product-counts?ids=1,2,3 — how many products are
 * tagged on each vibe, for the "🛍 N" chip on feed cards: { "1": 2, … }.
 */
export default defineEventHandler(async (event) => {
  const ids = String(getQuery(event).ids ?? '')
    .split(',').map((id) => id.trim()).filter((id) => /^\d{1,12}$/.test(id)).slice(0, 60).map(Number)
  return countVibeProducts([...new Set(ids)])
})
