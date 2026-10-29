// GET /api/social/client/lists — the member's lists on every network
// they're connected to (Meeovi lists of things, Bluesky lists of
// accounts…). A network that fails is reported, not fatal.
import { defineEventHandler } from 'h3'
import { requireAuth } from '#auth/server/utils/sessions'
import { memberSessions } from '../../../utils/federation-members'
import { withNetworkTimeout } from '../../../utils/federation'

export default defineEventHandler(async (event) => {
  const user = await requireAuth(event)
  const networks = (await memberSessions(String(user.id))).filter((n) => n.session?.lists)
  const results = await Promise.all(networks.map(async (n) => {
    try {
      return { network: n.id, lists: await withNetworkTimeout(n.session!.lists!()) }
    } catch (error: any) {
      console.error(`[federation:${n.id}] lists failed`, error?.message || error)
      return { network: n.id, lists: [], error: `${n.label} lists are unavailable right now` }
    }
  }))
  return {
    lists: results.flatMap((r) => r.lists),
    errors: results.filter((r) => r.error).map((r) => ({ network: r.network, message: r.error })),
  }
})
