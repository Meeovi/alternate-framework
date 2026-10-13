import { createError, defineEventHandler, getRouterParam, readMultipartFormData } from 'h3'
import { sniffMedia } from '../../../../../utils/mediaSniff'
import { requireSpaceMember, SPACE_MEDIA_LIMITS, spaceRoom, type SpaceMediaKind } from '../../../../../utils/spaceMedia'

/**
 * POST /api/social/spaces/:id/media (multipart `file`) — post a voice or
 * video message. The file's bytes decide what it is, not the declared type:
 * an Audio space takes files with sound and no picture, a Video space files
 * with a video track. It's posted to Rocket.Chat as the member, under the
 * type that was found.
 */
export default defineEventHandler(async (event) => {
  const access = await requireSpaceMember(event, String(getRouterParam(event, 'id') ?? ''))
  const parts = await readMultipartFormData(event)
  const file = parts?.find((p) => p.name === 'file' && p.data?.length)
  if (!file) throw createError({ statusCode: 400, statusMessage: 'Choose a recording or file to post' })

  const media = sniffMedia(file.data)
  if (!media) throw createError({ statusCode: 415, statusMessage: "That file isn't an audio or video format we can play" })
  const kind: SpaceMediaKind = media.hasVideo ? 'video' : 'audio'
  if (!access.space.kinds.includes(kind)) {
    throw createError({
      statusCode: 415,
      statusMessage: kind === 'video'
        ? 'That file has video. This space only takes voice messages.'
        : 'That file has no picture. This space only takes video messages.',
    })
  }
  if (file.data.length > SPACE_MEDIA_LIMITS[kind]) {
    throw createError({ statusCode: 413, statusMessage: `That ${kind} file is too large (max ${Math.round(SPACE_MEDIA_LIMITS[kind] / 1024 / 1024)} MB)` })
  }

  const type = media.type
  const sub = type.split('/')[1]!
  const ext = ({ 'x-matroska': 'mkv', quicktime: 'mov', mpeg: 'mp3', mp4: kind === 'audio' ? 'm4a' : 'mp4' } as Record<string, string>)[sub] ?? sub
  const name = (file.filename || `${kind}-message.${ext}`).replace(/[^\w.\- ]+/g, '_').slice(0, 120)
  const { group, me } = await spaceRoom(event, access)
  const form = new FormData()
  form.append('file', new Blob([new Uint8Array(file.data)], { type }), name)
  const uploaded = await me.call<{ file: { _id: string } }>(`rooms.media/${group._id}`, { method: 'POST', body: form, timeout: 120000 })
  await me.call(`rooms.mediaConfirm/${group._id}/${uploaded.file._id}`, { method: 'POST', body: { msg: '' } })
  return { ok: true }
})
