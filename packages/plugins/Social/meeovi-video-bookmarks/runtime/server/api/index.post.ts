import { createError, defineEventHandler, readBody } from 'h3'
import { z } from 'zod'
import { addedToday, createVideoProduct, existingVideoProduct, storeCustomerId, videoBookmarksConfig, videoTarget } from '../store'
import { requireVideoSeller } from '../seller'
import { checkLink } from '../check'

/**
 * POST /api/video-bookmarks { url, name, description? } — a seller adds a
 * video by its link: a free product in Theater → Videos, created in the
 * store under them (see ../store.ts). The link is checked again here (never
 * trusted from the preview), with the seller's own title and description.
 * 409 { key } when the video is already on Meeovi; 429 past the daily limit.
 * Returns { key, sku, pendingApproval, problems }.
 */
const Body = z.object({
  url: z.string().min(1).max(2048),
  name: z.string().trim().min(1).max(255),
  description: z.string().trim().max(5000).default(''),
})

export default defineEventHandler(async (event) => {
  const seller = await requireVideoSeller(event)
  const parsed = Body.safeParse(await readBody(event).catch(() => null))
  if (!parsed.success) throw createError({ statusCode: 400, statusMessage: 'Paste a video link and give it a title' })
  const input = parsed.data
  if (!seller.admin && await addedToday(event, seller.username) >= videoBookmarksConfig(event).dailyLimit) {
    throw createError({ statusCode: 429, statusMessage: 'You\'ve added a lot of videos today. Try again tomorrow.' })
  }
  const checked = await checkLink(event, input.url, [input.name, input.description])
  const existing = await existingVideoProduct(event, `${checked.link.provider}:${checked.link.id}`)
  if (existing) throw createError({ statusCode: 409, statusMessage: 'That video is already on Meeovi', data: { key: existing } })
  const customerId = await storeCustomerId(seller.id)
  const target = await videoTarget(event)
  return await createVideoProduct(event, { ...seller, customerId }, checked, input, target)
})
