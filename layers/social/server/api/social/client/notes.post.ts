// POST /api/social/client/notes { network, text, replyTo? } — a note (or a
// reply) as the member on that network.
import { createError, defineEventHandler, readBody } from 'h3'
import { requireAuth } from '#auth/server/utils/sessions'
import { memberError, memberSession, requireMemberCapability } from '../../../utils/federation-members'

export default defineEventHandler(async (event) => {
  const user = await requireAuth(event)
  const body = await readBody(event) as Record<string, unknown> | null
  const network = String(body?.network ?? '')
  const text = String(body?.text ?? '').trim()
  const replyTo = body?.replyTo ? String(body.replyTo).slice(0, 512) : undefined
  // Bluesky's limit (300 graphemes) is the tightest; each network checks its own too.
  if (!network || !text || text.length > 3000) throw createError({ statusCode: 400, statusMessage: 'A note needs some text' })
  const session = await memberSession(network, String(user.id))
  const publish = requireMemberCapability(session, 'publish')
  return publish({ text, replyTo }).catch((e) => memberError(network, e))
})
