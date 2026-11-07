import { defineEventHandler } from 'h3'
import { requireAuth } from '#auth/server/utils/sessions'
import { federationNetworks } from '../../../../utils/federation'
import { listConnections } from '../../../../utils/federation-connections'

/**
 * GET /api/social/federation/connections — every installed network a member
 * can connect (Zot, OStatus, WebTorrent…), with how to connect it and
 * whether they have. Never returns stored credentials.
 */
export default defineEventHandler(async (event) => {
  const user = await requireAuth(event) as { id: string }
  const mine = new Map((await listConnections(user.id)).map((c) => [c.network, c]))
  return {
    networks: federationNetworks()
      .filter((n) => n.connection)
      .map((n) => {
        const c = mine.get(n.id)
        return {
          id: n.id,
          label: n.label,
          kind: n.connection!.kind,
          description: n.connection!.description,
          notice: n.connection!.notice ?? null,
          fields: (n.connection!.fields ?? []).map((f) => ({ ...f, required: f.required !== false })),
          connected: !!c,
          account: c?.account ?? null,
          service: c?.service ?? null,
          connectedAt: c?.createdAt?.toISOString() ?? null,
        }
      }),
  }
})
