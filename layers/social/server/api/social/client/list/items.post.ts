// POST /api/social/client/list/items?network=&id= — add to one of the
// member's lists: { kind: 'account', actor } (Bluesky lists),
// { kind: 'note', post }, or { kind: 'product' | 'vibe' | 'space', id }.
import { defineEventHandler, readBody } from 'h3'
import { requireAuth } from '#auth/server/utils/sessions'
import { memberError, memberSession, requireMemberCapability } from '../../../../utils/federation-members'
import { listItemInput, listRef } from '../../../../utils/federation-client-input'

export default defineEventHandler(async (event) => {
  const user = await requireAuth(event)
  const { network, id } = listRef(event)
  const item = listItemInput(await readBody(event))
  const session = await memberSession(network, String(user.id))
  const add = requireMemberCapability(session, 'addToList')
  return add(id, item).catch((e) => memberError(network, e))
})
