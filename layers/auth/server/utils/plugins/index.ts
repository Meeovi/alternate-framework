/**
 * The app's auth plugin host (see host.ts): the registry built from the
 * registered packages, Postgres for switches, settings and plugin data, and
 * the layer's audit log.
 */
import registry from '#auth-plugin-registry'
import { db } from '../drizzle'
import { logAuditEvent } from '../audits'
import { createAuthPluginHost } from './host'
import { PostgresPluginStateStore } from './state'

export const authPluginHost = createAuthPluginHost({
  registry,
  store: new PostgresPluginStateStore(db),
  audit: (entry) => logAuditEvent({
    id: '',
    userId: entry.userId,
    category: 'auth-plugin',
    action: entry.action,
    targetType: 'plugin',
    targetId: entry.targetId,
    status: entry.status,
    details: entry.details,
  }),
})

