// DELETE /api/social/client/list/items?network=&id=&item= — take an item
// (by the id the list gave it) out of one of the member's lists.
import { createError, defineEventHandler, getQuery } from 'h3'
import { requireAuth } from '#auth/server/utils/sessions'
import { memberError, memberSession, requireMemberCapability } from '../../../../utils/federation-members'
import { listRef } from '../../../../utils/federation-client-input'

export default defineEventHandler(async (event) => {
  const user = await requireAuth(event)
  const { network, id } = listRef(event)
  const item = String(getQuery(event).item ?? '').trim()
  if (!item || item.length > 512) throw createError({ statusCode: 400, statusMessage: 'Which item?' })
  const session = await memberSession(network, String(user.id))
  const remove = requireMemberCapability(session, 'removeFromList')
  await remove(id, item).catch((e) => memberError(network, e))
  return { ok: true }
})
