import { defineEventHandler, createError } from 'h3'
import { ContentAdapterRegistry } from 'alternate-sdk'
import { requireAuth } from '#auth/server/utils/sessions'

// Requires a session and returns only the caller's own folders — see
// media.get.ts for why both the auth gate and the `user` filter are
// needed (the adapter reads with a privileged server token).
export default defineEventHandler(async (event) => {
  const user = await requireAuth(event)

  const adapter = ContentAdapterRegistry.getDefaultAdapter()
  if (!adapter) {
    throw createError({ statusCode: 501, statusMessage: 'No content backend is configured' })
  }

  const folders = await adapter.listMediaFolders()
  return (Array.isArray(folders) ? folders : []).filter(
    (folder: any) => folder?.user === user.id,
  )
})
