import type { EventHandler, H3Event } from "h3";
import { authClient } from '../../../lib/auth-client'

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
