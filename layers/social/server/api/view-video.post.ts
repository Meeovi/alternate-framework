import { createDirectus, rest, staticToken, readItem, updateItem } from '@directus/sdk'

// Matches what vibez.vue and vibe/[...id].vue already post here. Simple
// read-then-write increment — not atomic, but a view counter doesn't need
// to be (a lost increment under concurrent views is an acceptable
// imprecision the same way most simple view counters accept it).
const directus = createDirectus(process.env.DIRECTUS_URL!)
  .with(rest())
  .with(staticToken(process.env.NUXTUS_DIRECTUS_STATIC_TOKEN!))

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const videoId = body?.videoId

  if (!videoId) {
    throw createError({ statusCode: 400, statusMessage: 'videoId is required' })
  }

  const short = await directus.request(readItem('shorts', videoId, { fields: ['id', 'views'] })).catch(() => null)
  if (!short) {
    // Don't fail view tracking loudly — it's a non-critical side effect.
    return { success: false }
  }

  await directus.request(updateItem('shorts', videoId, { views: ((short as any).views || 0) + 1 }))
  return { success: true }
})
