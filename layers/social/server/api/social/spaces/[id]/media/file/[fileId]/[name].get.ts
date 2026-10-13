import { createError, defineEventHandler, getRouterParam, proxyRequest } from 'h3'
import { requireSpaceMember, spaceRoom } from '../../../../../../../utils/spaceMedia'

/**
 * GET /api/social/spaces/:id/media/file/:fileId/:name — stream a voice or
 * video message to a member. Rocket.Chat protects files, so this fetches it
 * with the member's own Rocket.Chat credentials (Range requests pass through,
 * so players can seek).
 */
export default defineEventHandler(async (event) => {
  const access = await requireSpaceMember(event, String(getRouterParam(event, 'id') ?? ''))
  const fileId = String(getRouterParam(event, 'fileId') ?? '')
  const name = String(getRouterParam(event, 'name') ?? 'media')
  if (!/^[A-Za-z0-9]{1,40}$/.test(fileId)) throw createError({ statusCode: 404, statusMessage: 'File not found' })

  const { me } = await spaceRoom(event, access)
  return proxyRequest(event, `${me.url}/file-upload/${fileId}/${encodeURIComponent(name)}`, {
    headers: { ...me.headers, cookie: '' },
  })
})
