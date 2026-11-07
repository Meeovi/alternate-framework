import { createError, defineEventHandler, getRouterParam, sendRedirect } from 'h3'
import { publishedVibe } from '../../../utils/activitypub/content'
import { sitePaths } from '../../../utils/activitypub/config'

/** A browser opening a vibe's fediverse id goes to its page on Meeovi. */
export default defineEventHandler(async (event) => {
  const vibe = await publishedVibe(String(getRouterParam(event, 'id') ?? ''))
  if (!vibe) throw createError({ statusCode: 404, statusMessage: 'Not found' })
  return sendRedirect(event, sitePaths.vibe(vibe.id), 302)
})
