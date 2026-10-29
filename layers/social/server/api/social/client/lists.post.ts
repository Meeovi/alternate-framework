// POST /api/social/client/lists { network, name, description?, visibility?, type? }
// — a new list on that network, owned by the member.
import { createError, defineEventHandler, readBody } from 'h3'
import { requireAuth } from '#auth/server/utils/sessions'
import { memberError, memberSession, requireMemberCapability } from '../../../utils/federation-members'
import { listInput } from '../../../utils/federation-client-input'

export default defineEventHandler(async (event) => {
  const user = await requireAuth(event)
  const body = await readBody(event) as Record<string, unknown> | null
  const network = String(body?.network ?? 'directus')
  const input = listInput(body, true)
  if (!input.name) throw createError({ statusCode: 400, statusMessage: 'A list needs a name' })
  const session = await memberSession(network, String(user.id))
  const create = requireMemberCapability(session, 'createList')
  return create(input as { name: string }).catch((e) => memberError(network, e))
})
