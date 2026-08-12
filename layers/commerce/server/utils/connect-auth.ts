import { createError } from 'h3'
import { stripe } from './stripe'

// Stripe Connect accounts created by this app are tagged with the internal
// user id that owns them (see account.post.ts). Every route that acts on an
// existing accountId must verify this tag before doing anything with it —
// otherwise any authenticated user could pass any other seller's accountId
// and manage their Connect account.
export const CONNECT_OWNER_METADATA_KEY = 'internal_user_id'

export async function assertOwnsConnectAccount(accountId: string, userId: string) {
  let account: Awaited<ReturnType<typeof stripe.accounts.retrieve>>

  try {
    account = await stripe.accounts.retrieve(accountId)
  } catch (error: any) {
    throw createError({
      statusCode: error?.statusCode || 404,
      statusMessage: error?.message || 'Connect account not found',
    })
  }

  if (account.metadata?.[CONNECT_OWNER_METADATA_KEY] !== userId) {
    throw createError({ statusCode: 403, statusMessage: 'You do not have access to this Connect account' })
  }

  return account
}
