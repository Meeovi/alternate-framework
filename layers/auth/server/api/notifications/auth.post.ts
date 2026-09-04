import { createClient } from '@betternotify/core'
import { createDirectus, rest, readItems, staticToken } from '@directus/sdk'
import { notificationService } from '#shared/server/notifications/notify'
import { directusTransport } from '#shared/server/notifications/transports/directus'
import { requireAuth } from '#auth/server/utils/sessions'
import { z } from 'zod'

/**
 * POST /api/notifications/auth
 *
 * Server-side delivery of auth-event notifications (login, password
 * changed, …). Replaces the old client-side `useAlert()` composable, which
 * built a Directus transport in the browser using the static token — the
 * token is now server-only and never reaches the client.
 *
 * Mirrors layers/search's /api/notifications/search: authenticated, and a
 * user may only trigger notifications addressed to their own account.
 *
 * Body: { userId: string, route: string, input: Record<string, unknown> }
 */
const bodySchema = z.object({
  userId: z.string().min(1, 'userId is required'),
  route: z.enum(['login', 'passwordReset', 'twoFactorCode', 'passwordChanged']),
  input: z.record(z.string(), z.unknown()),
})

export default defineEventHandler(async (event) => {
  const currentUser = await requireAuth(event)
  const { userId, route, input } = bodySchema.parse(await readBody(event))

  if (userId !== currentUser.id) {
    throw createError({ statusCode: 403, statusMessage: 'Cannot send notifications for another user' })
  }

  const runtimeConfig = useRuntimeConfig()
  const directusUrl = (runtimeConfig.public as any).directus?.url as string | undefined
  // Server-only key — the token is no longer exposed under public.* .
  const directusToken = (runtimeConfig as any).directus?.token as string | undefined

  if (!directusUrl || !directusToken) {
    throw createError({ statusCode: 500, statusMessage: 'Directus configuration is not available' })
  }

  const directus = createDirectus(directusUrl).with(rest()).with(staticToken(directusToken))

  const users = await directus.request(
    readItems('directus_users', {
      filter: { id: { _eq: userId } },
      fields: ['email'],
      limit: 1,
    }),
  )
  const userList = Array.isArray(users) ? users as Array<{ email: string }> : []
  const email = userList[0]?.email ?? ''

  if (!email) {
    throw createError({ statusCode: 404, statusMessage: 'User not found or has no email address' })
  }

  const transport = directusTransport({ url: directusUrl, token: directusToken })
  const client = createClient({
    catalog: notificationService,
    transportsByChannel: { email: transport },
  })

  const authCatalog = (client as any).auth as Record<string, { send: (args: any) => Promise<any> }>
  const routeFn = authCatalog[route]

  if (!routeFn || typeof routeFn.send !== 'function') {
    throw createError({ statusCode: 400, statusMessage: `Unknown auth notification route: ${route}` })
  }

  await routeFn.send({ to: email, input })

  return { success: true }
})
