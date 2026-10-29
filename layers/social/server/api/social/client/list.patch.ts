// PATCH /api/social/client/list?network=&id= { name?, description?, visibility? }
import { defineEventHandler, readBody } from 'h3'
import { requireAuth } from '#auth/server/utils/sessions'
import { memberError, memberSession, requireMemberCapability } from '../../../utils/federation-members'
import { listInput, listRef } from '../../../utils/federation-client-input'

export default defineEventHandler(async (event) => {
  const user = await requireAuth(event)
  const { network, id } = listRef(event)
  const input = listInput(await readBody(event), false)
  const session = await memberSession(network, String(user.id))
  const update = requireMemberCapability(session, 'updateList')
  return update(id, input).catch((e) => memberError(network, e))
})
