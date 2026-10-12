import { defineEventHandler, getRouterParam } from 'h3'
import type { DiscussionInfo } from '../../runtime/types'
import { discussionUser, findRoom, roomName } from '../utils/rocketchat'

/** GET {apiBase}/:type/:id — room name, message count, signed in? Never
 *  creates the room (guests only see a count). */
export default defineEventHandler(async (event): Promise<DiscussionInfo> => {
  const room = roomName(event, getRouterParam(event, 'type') ?? '', getRouterParam(event, 'id') ?? '')
  const [user, found] = await Promise.all([
    discussionUser(event),
    findRoom(event, room).catch(() => null),
  ])
  return { room, messages: found?.msgs ?? 0, signedIn: Boolean(user), exists: Boolean(found) }
})
