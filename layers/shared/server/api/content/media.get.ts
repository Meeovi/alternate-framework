import { defineEventHandler, createError, getQuery } from 'h3'
import { ContentAdapterRegistry } from 'alternate-sdk'
import { requireAuth } from '#auth/server/utils/sessions'

// Backend-agnostic — routes to whichever adapter (Directus, Magento,
// Vendure, ...) registered itself into ContentAdapterRegistry, so
// useMediaCenter.ts never imports a specific backend's SDK.
//
// Requires a session and returns only the caller's own uploads. The
// underlying adapter reads with a privileged server token (no per-user
// scoping of its own), so without both the auth gate and the `user`
// filter below this leaked every user's media library to anonymous
// callers — the same collection the app's own /api/media/list.get.ts
// already scopes by `user`.
export default defineEventHandler(async (event) => {
  const user = await requireAuth(event)

  const adapter = ContentAdapterRegistry.getDefaultAdapter()
  if (!adapter) {
    throw createError({ statusCode: 501, statusMessage: 'No content backend is configured' })
  }

  const query = getQuery(event)
  const sort = typeof query.sort === 'string' ? query.sort.split(',') : undefined

  const media = await adapter.listMedia({ sort })
  return (Array.isArray(media) ? media : []).filter(
    (item: any) => item?.user === user.id,
  )
})
