// GET /api/social/client/list?network=&id= — one of the member's lists and
// what's in it.
import { createError, defineEventHandler } from 'h3'
import { requireAuth } from '#auth/server/utils/sessions'
import { memberError, memberSession, requireMemberCapability } from '../../../utils/federation-members'
import { listRef } from '../../../utils/federation-client-input'

export default defineEventHandler(async (event) => {
  const user = await requireAuth(event)
  const { network, id } = listRef(event)
  const session = await memberSession(network, String(user.id))
  const read = requireMemberCapability(session, 'list')
  const found = await read(id).catch((e) => memberError(network, e))
  if (!found) throw createError({ statusCode: 404, statusMessage: 'List not found' })
  return found
})
