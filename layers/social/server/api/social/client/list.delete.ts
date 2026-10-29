// DELETE /api/social/client/list?network=&id=
import { defineEventHandler } from 'h3'
import { requireAuth } from '#auth/server/utils/sessions'
import { memberError, memberSession, requireMemberCapability } from '../../../utils/federation-members'
import { listRef } from '../../../utils/federation-client-input'

export default defineEventHandler(async (event) => {
  const user = await requireAuth(event)
  const { network, id } = listRef(event)
  const session = await memberSession(network, String(user.id))
  const remove = requireMemberCapability(session, 'deleteList')
  await remove(id).catch((e) => memberError(network, e))
  return { ok: true }
})
