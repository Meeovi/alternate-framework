import { createClient } from '@betternotify/core'
import { createDirectus, rest, readItems, staticToken } from '@directus/sdk'
import { notificationService } from '#shared/server/notifications/notify'
import { directusTransport } from '#shared/server/notifications/transports/directus'
import { requireAuth } from '#auth/server/utils/sessions'
import { z } from 'zod'

/**
 * POST /api/notifications/commerce
 *
 * Accepts a commerce-notification request from the frontend and delivers it
 * through the Directus transport (stored as a Directus notification item)
 * instead of sending an email. Mirrors layers/search's
 * /api/notifications/search route for the notificationService.commerce
 * catalog (cartItemAdded, orderConfirmed, orderShipped, paymentSucceeded,
 * paymentFailed, checkoutCompleted).
 *
 * Body: { userId: string, route: string, input: Record<string, unknown> }
 */
const bodySchema = z.object({
  userId: z.string().min(1, 'userId is required'),
  route: z.enum([
    'cartItemAdded',
    'orderConfirmed',
    'orderShipped',
    'paymentSucceeded',
    'paymentFailed',
    'checkoutCompleted',
  ]),
  input: z.record(z.string(), z.unknown()),
})

export default defineEventHandler(async (event) => {
  // Only letting a user trigger notifications for themselves — same
  // ownership check as the search notifications route.
  const currentUser = await requireAuth(event)
  const body = bodySchema.parse(await readBody(event))
  const { userId, route, input } = body

  if (userId !== currentUser.id) {
    throw createError({ statusCode: 403, statusMessage: 'Cannot send notifications for another user' })
  }

  const runtimeConfig = useRuntimeConfig()
  const directusUrl = (runtimeConfig.public as any).directus?.url as string | undefined
  const directusToken = (runtimeConfig.public as any).directus?.auth?.token as string | undefined

  if (!directusUrl || !directusToken) {
    throw createError({
      statusCode: 500,
      statusMessage: 'Directus configuration is not available',
    })
  }

  // Resolve the user's email by userId — server-side Directus lookup
  const directus = createDirectus(directusUrl)
    .with(rest())
    .with(staticToken(directusToken))

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
    throw createError({
      statusCode: 404,
      statusMessage: 'User not found or has no email address',
    })
  }

  // Build a better-notify client with the Directus transport
  const transport = directusTransport({ url: directusUrl, token: directusToken })

  const client = createClient({
    catalog: notificationService,
    transportsByChannel: { email: transport },
  })

  const commerceCatalog = (client as any).commerce as Record<string, { send: (args: any) => Promise<any> }>
  const routeFn = commerceCatalog[route]

  if (!routeFn || typeof routeFn.send !== 'function') {
    throw createError({
      statusCode: 400,
      statusMessage: `Unknown commerce notification route: ${route}`,
    })
  }

  await routeFn.send({
    to: email,
    input,
  })

  return { success: true }
})
