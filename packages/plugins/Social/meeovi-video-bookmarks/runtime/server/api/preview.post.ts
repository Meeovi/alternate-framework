import { createError, defineEventHandler, readBody } from 'h3'
import { z } from 'zod'
import { PROVIDER_LABELS } from '../providers'
import { existingVideoProduct } from '../store'
import { requireVideoSeller } from '../seller'
import { checkLink } from '../check'

/**
 * POST /api/video-bookmarks/preview { url } — checks a link without adding
 * it and returns what would be added (title, channel, thumbnail), or where
 * it already is (`existing`: its product key). Adult links, unsupported
 * sites and unplayable videos are refused here.
 */
const Body = z.object({ url: z.string().min(1).max(2048) })

export default defineEventHandler(async (event) => {
  await requireVideoSeller(event)
  const parsed = Body.safeParse(await readBody(event).catch(() => null))
  if (!parsed.success) throw createError({ statusCode: 400, statusMessage: 'Paste a video link' })
  const { link, meta } = await checkLink(event, parsed.data.url)
  return {
    provider: link.provider,
    providerLabel: PROVIDER_LABELS[link.provider],
    url: link.url,
    embedUrl: link.embedUrl,
    title: meta.title,
    description: meta.description ?? '',
    author: meta.author ?? null,
    thumbnail: meta.thumbnail ?? null,
    existing: await existingVideoProduct(event, `${link.provider}:${link.id}`),
  }
})
