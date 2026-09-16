import { requireAuth } from '#auth/server/utils/sessions'
import { ensureNovuSubscriber, getNovuSubscriberHash } from '../../utils/novu'

/**
 * What the client's NovuUI instance needs to mount an authenticated inbox
 * (see useNovuSession.ts). subscriberId is the app's own better-auth user
 * id — same identity the old notifications.recipient column used — kept as
 * a stable id across the migration even though the notification data
 * itself now lives in Novu's own Mongo instead of Directus.
 */
export default defineEventHandler(async (event) => {
  const user = await requireAuth(event)
  const config = useRuntimeConfig()

  await ensureNovuSubscriber({ id: user.id, email: user.email, name: user.name })

  return {
    applicationIdentifier: (config.public as { novuAppId?: string }).novuAppId || '',
    subscriberId: user.id,
    subscriberHash: getNovuSubscriberHash(user.id),
  }
})
