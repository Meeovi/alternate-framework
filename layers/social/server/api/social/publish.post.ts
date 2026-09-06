import { z } from 'zod'
import { requireAuth } from '#auth/server/utils/sessions'

/**
 * POST /api/social/publish
 *
 * Publishes a draft to Mastodon (or another federated service) using the
 * server-side Mastodon client (`globalThis.__mastoClient`).
 *
 * Previously the frontend accessed `globalThis.__mastoClient` directly —
 * a server-injected global that is not available in the browser. This
 * endpoint keeps the client access on the server.
 *
 * Requires a signed-in session: the Mastodon client is a single shared
 * service account, so an unauthenticated caller here could post arbitrary
 * statuses to it.
 *
 * Request body:
 *   { payload: mastodon.v1.StatusesCreateParams }
 *
 * Response: the created status object, or { error: string } on failure.
 */
const bodySchema = z.object({
  // Zod v4's z.record() requires an explicit key schema (v3 defaulted it
  // to string).
  payload: z.record(z.string(), z.any()),
})

export default defineEventHandler(async (event) => {
  await requireAuth(event)

  const body = bodySchema.parse(await readBody(event))
  const payload = body.payload

  const client = (globalThis as any)?.__mastoClient

  if (!client) {
    throw createError({
      statusCode: 500,
      statusMessage: 'Mastodon client not initialized on the server',
    })
  }

  try {
    const status = await client.value.v1.statuses.create(payload)
    return status
  } catch (error: any) {
    throw createError({
      statusCode: error?.statusCode || 500,
      statusMessage: error?.message || 'Failed to publish to Mastodon',
      data: error?.data,
    })
  }
})
