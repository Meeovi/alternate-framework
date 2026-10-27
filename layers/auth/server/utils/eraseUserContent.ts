import { $fetch } from 'ofetch'
import { joinURL } from 'ufo'

/**
 * Right to erasure (UK/EU GDPR art. 17): when an account is deleted, delete
 * what that user created in the CMS too — called from
 * user.deleteUser.afterDelete in auth.ts. The auth rows (sessions, logins,
 * 2FA, passkeys, profile) already cascade in the database.
 *
 * Kept on purpose: orders and invoices (tax/accounting law requires them;
 * the user record they pointed at is gone).
 *
 * Goes through the Directus API (static token) rather than SQL so Directus
 * applies its own relation handling to the junction rows.
 */
const OWNED: Record<string, string> = {
  posts: 'creator_id',
  shorts: 'creator_id',
  radios: 'creator_id',
  reactions: 'user_id',
  content_ratings: 'user_id',
  play_history: 'user_id',
  media_folders: 'user',
  spaces: 'owner',
  websites: 'creator',
}

export async function eraseUserContent(userId: string): Promise<void> {
  const config = useRuntimeConfig()
  const url = (config.public as { directus?: { url?: string } }).directus?.url
  const token = (config as { directus?: { token?: string } }).directus?.token
  if (!url || !token) {
    console.error('[erasure] Directus is not configured — content of deleted user', userId, 'was not removed')
    return
  }
  const headers = { Authorization: `Bearer ${token}` }
  const failed: string[] = []

  for (const [collection, owner] of Object.entries(OWNED)) {
    await $fetch(joinURL(url, 'items', collection), {
      method: 'DELETE',
      headers,
      body: { query: { filter: { [owner]: { _eq: userId } }, limit: -1 } },
    }).catch(() => failed.push(collection))
  }

  // Lists are shared through the lists_directus_users junction: drop this
  // user's memberships, then delete lists nobody else is a member of.
  try {
    const memberships = await $fetch<{ data: { id: number, list_id: number | null }[] }>(
      joinURL(url, 'items', 'lists_directus_users'),
      { headers, query: { 'filter[user_id][_eq]': userId, fields: 'id,list_id', limit: -1 } },
    )
    const listIds = [...new Set(memberships.data.map((m) => m.list_id).filter((id): id is number => id != null))]
    if (memberships.data.length) {
      await $fetch(joinURL(url, 'items', 'lists_directus_users'), { method: 'DELETE', headers, body: memberships.data.map((m) => m.id) })
    }
    if (listIds.length) {
      const stillShared = await $fetch<{ data: { list_id: number }[] }>(
        joinURL(url, 'items', 'lists_directus_users'),
        { headers, query: { 'filter[list_id][_in]': listIds.join(','), fields: 'list_id', limit: -1 } },
      )
      const shared = new Set(stillShared.data.map((m) => m.list_id))
      const orphaned = listIds.filter((id) => !shared.has(id))
      if (orphaned.length) {
        await $fetch(joinURL(url, 'items', 'list_items'), {
          method: 'DELETE', headers, body: { query: { filter: { list_id: { _in: orphaned } }, limit: -1 } },
        })
        await $fetch(joinURL(url, 'items', 'lists'), { method: 'DELETE', headers, body: orphaned })
      }
    }
  } catch {
    failed.push('lists')
  }

  if (failed.length) {
    // Logged with the id only, so an admin can finish the erasure by hand.
    console.error(`[erasure] could not remove ${failed.join(', ')} for deleted user ${userId}`)
  }
}
