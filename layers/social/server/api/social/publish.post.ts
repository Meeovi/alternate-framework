import { z } from 'zod'
import { requireAuth } from '#auth/server/utils/sessions'
import { federationError, requireCapability, useFederationNetwork } from '../../utils/federation'

/**
 * POST /api/social/publish
 *
 * Publishes a status to the Fediverse as the deployment's ActivityPub
 * service account (@mframework/meeovi-activitypub, which needs
 * ACTIVITYPUB_ACCESS_TOKEN). Per-user Bluesky posts go through
 * /api/social/atproto/post instead.
 *
 * Requires a signed-in session: the account is shared, so an
 * unauthenticated caller could otherwise post arbitrary statuses to it.
 *
 * Request body:
 *   { payload: mastodon.v1.StatusesCreateParams }  (`status` is the text)
 *
 * Response: the published post (FederatedPost).
 */
const bodySchema = z.object({
  // Zod v4's z.record() requires an explicit key schema (v3 defaulted it
  // to string).
  payload: z.record(z.string(), z.any()),
})

export default defineEventHandler(async (event) => {
  await requireAuth(event)

  const { payload } = bodySchema.parse(await readBody(event))
  const text = String(payload.status ?? '').trim()
  if (!text) throw createError({ statusCode: 400, statusMessage: 'Nothing to publish (payload.status is empty)' })

  const network = useFederationNetwork('activitypub')
  const publish = requireCapability(network, 'publish')
  return await publish({ ...payload, text }).catch((e) => federationError(network, e))
})
