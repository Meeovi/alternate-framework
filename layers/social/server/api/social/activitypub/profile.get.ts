import { defineEventHandler, getQuery } from 'h3'
import { federationEnabled, memberIdentifier, siteHost } from '../../../utils/activitypub/config'
import { countFollowers, federatedMember } from '../../../utils/activitypub/store'

/**
 * GET /api/social/activitypub/profile?username= — a member's fediverse
 * handle and follower count, when they turned it on: { handle, followers },
 * else { handle: null }.
 */
export default defineEventHandler(async (event) => {
  const username = String(getQuery(event).username ?? '').toLowerCase()
  if (!federationEnabled() || !/^[a-z0-9_.]{1,64}$/.test(username)) return { handle: null, followers: 0 }
  const member = await federatedMember({ username })
  if (!member) return { handle: null, followers: 0 }
  return { handle: `@${member.username}@${siteHost()}`, followers: await countFollowers(memberIdentifier(member.id)) }
})
