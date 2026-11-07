import { defineEventHandler } from 'h3'
import { requireAuth } from '#auth/server/utils/sessions'
import { federationEnabled, memberIdentifier, shopIdentifier, siteHost } from '../../../utils/activitypub/config'
import { countFollowers, readApSettings } from '../../../utils/activitypub/store'

/**
 * GET /api/social/activitypub/settings — the member's fediverse switches
 * (utils/activitypub/store.ts): { available, enabled, shop, seller, handle,
 * shopHandle, followers, shopFollowers }.
 */
export default defineEventHandler(async (event) => {
  const user = await requireAuth(event) as { id: string, username?: string | null, role?: string | null }
  const settings = await readApSettings(user.id)
  const username = String(user.username || '').toLowerCase()
  const seller = String(user.role || '').split(',').map((r) => r.trim()).includes('seller')
  return {
    available: federationEnabled(),
    enabled: settings.enabled,
    shop: settings.shop,
    seller,
    handle: username ? `@${username}@${siteHost()}` : null,
    shopHandle: username && seller ? `@${shopIdentifier(username)}@${siteHost()}` : null,
    followers: settings.enabled ? await countFollowers(memberIdentifier(user.id)) : 0,
    shopFollowers: settings.shop && username ? await countFollowers(shopIdentifier(username)) : 0,
  }
})
