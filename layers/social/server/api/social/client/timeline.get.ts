// GET /api/social/client/timeline?limit= — notes from the accounts the
// member follows, on every network that has a timeline for them, newest
// first. A network that fails is reported, not fatal.
import { defineEventHandler, getQuery } from 'h3'
import { requireAuth } from '#auth/server/utils/sessions'
import { memberSessions } from '../../../utils/federation-members'
import { withNetworkTimeout } from '../../../utils/federation'

export default defineEventHandler(async (event) => {
  const user = await requireAuth(event)
  const limit = Math.min(Math.max(Number(getQuery(event).limit) || 30, 1), 50)
  const networks = (await memberSessions(String(user.id))).filter((n) => n.session?.timeline)
  const results = await Promise.all(networks.map(async (n) => {
    try {
      return { network: n.id, notes: await withNetworkTimeout(n.session!.timeline!({ limit })) }
    } catch (error: any) {
      console.error(`[federation:${n.id}] timeline failed`, error?.message || error)
      return { network: n.id, notes: [], error: `${n.label} is unavailable right now` }
    }
  }))
  return {
    notes: results.flatMap((r) => r.notes)
      .sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt))
      .slice(0, limit),
    errors: results.filter((r) => r.error).map((r) => ({ network: r.network, message: r.error })),
  }
})
