import { createError, defineEventHandler, getRouterParam } from 'h3'
import { deleteMessage, rcUsername } from '@mframework/meeovi-discussions/server'
import { requireSpaceMember, spaceRoom } from '../../../../../utils/spaceMedia'

/**
 * DELETE /api/social/spaces/:id/media/:msgId — remove a message: your own,
 * or anyone's if you're a space admin (site admin or the space's owner).
 */
export default defineEventHandler(async (event) => {
  const access = await requireSpaceMember(event, String(getRouterParam(event, 'id') ?? ''))
  const msgId = String(getRouterParam(event, 'msgId') ?? '')
  if (!/^[A-Za-z0-9]{1,40}$/.test(msgId)) throw createError({ statusCode: 404, statusMessage: 'Message not found' })

  const { group, me } = await spaceRoom(event, access)
  const res = await me.call<{ message: any }>('chat.getMessage', { query: { msgId } }).catch(() => null)
  const message = res?.message
  if (!message || message.rid !== group._id) throw createError({ statusCode: 404, statusMessage: 'Message not found' })
  const mine = message.u?.username === rcUsername(access.user)
  if (!mine && !access.admin) throw createError({ statusCode: 403, statusMessage: 'Only space admins can remove other people’s messages' })

  await deleteMessage(event, group._id, msgId)
  return { ok: true }
})
