import { createError, defineEventHandler, getRouterParam, sendRedirect } from 'h3'
import { actorByIdentifier } from '../../../utils/activitypub/actors'

/**
 * A browser opening a fediverse account's id (/ap/actors/…) goes to its page
 * on Meeovi. Fediverse apps asking for JSON never get here: Fedify answers
 * them first (server/federation.ts).
 */
export default defineEventHandler(async (event) => {
  const info = await actorByIdentifier(String(getRouterParam(event, 'identifier') ?? ''))
  if (!info) throw createError({ statusCode: 404, statusMessage: 'Not found' })
  return sendRedirect(event, info.url, 302)
})
