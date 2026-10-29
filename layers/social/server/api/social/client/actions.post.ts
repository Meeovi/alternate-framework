// POST /api/social/client/actions { network, action, target } — like,
// unlike, repost, unrepost (target: a note id), follow, unfollow (target:
// an account handle or id), as the member on that network.
import { createError, defineEventHandler, readBody } from 'h3'
import { requireAuth } from '#auth/server/utils/sessions'
import { memberError, memberSession, requireMemberCapability } from '../../../utils/federation-members'

const ACTIONS = new Set(['like', 'unlike', 'repost', 'unrepost', 'follow', 'unfollow'] as const)
type Action = 'like' | 'unlike' | 'repost' | 'unrepost' | 'follow' | 'unfollow'

export default defineEventHandler(async (event) => {
  const user = await requireAuth(event)
  const body = await readBody(event) as Record<string, unknown> | null
  const network = String(body?.network ?? '')
  const action = String(body?.action ?? '') as Action
  const target = String(body?.target ?? '').trim()
  if (!network || !ACTIONS.has(action) || !target || target.length > 512) {
    throw createError({ statusCode: 400, statusMessage: 'network, action and target are required' })
  }
  const session = await memberSession(network, String(user.id))
  const act = requireMemberCapability(session, action)
  await act(target).catch((e) => memberError(network, e))
  return { ok: true }
})
