// GET /api/social/client/networks — the member's networks: which they're
// connected to, as whom, and what they can do there.
import { defineEventHandler } from 'h3'
import { requireAuth } from '#auth/server/utils/sessions'
import { memberCapabilities, memberSessions } from '../../../utils/federation-members'

export default defineEventHandler(async (event) => {
  const user = await requireAuth(event)
  const networks = await memberSessions(String(user.id))
  return {
    networks: networks.map((n) => ({
      id: n.id,
      label: n.label,
      connected: n.connected,
      account: n.session?.account ?? null,
      can: memberCapabilities(n.session),
      ...(n.error ? { error: n.error } : {}),
    })),
  }
})
