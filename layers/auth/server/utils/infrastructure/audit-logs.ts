import type { EventHandler, H3Event } from "h3";
import { authClient } from '../../../lib/auth-client'

// Moved out of shared/utils/infrastructure/ — this is a Nitro EventHandler
// that imports the `better-auth/vue` client (see lib/auth-client.ts), both
// of which are only valid server-side / app-side respectively, and
// shared/ must be safely importable from both. It also isn't wired up as
// a route anywhere yet and duplicates server/utils/audits.ts's
// (actually-used) logAuditEvent — kept as-is, relocation only, since
// fixing its own logic isn't this change's job.
export const fetchAuditLogs: EventHandler = async (_event: H3Event) => {
  const session = await authClient.getSession()
  const user = session.data?.user

  const filters: Record<string, any> = {
    session: session.data,
    limit: 50,
    offset: 0,
    identifier: user?.id,
    userId: user?.id,
  }

  if ('eventType' in (user ?? {})) {
    filters.eventType = (user as any).eventType
  }

  if ('organizationId' in (user ?? {})) {
    filters.organizationId = (user as any).organizationId
  }

  const logs = await (authClient as any).dash.getAuditLogs(filters)

  return {
    events: logs.data?.events,
    total: logs.data?.total,
    limit: logs.data?.limit,
    offset: logs.data?.offset,
  }
}
