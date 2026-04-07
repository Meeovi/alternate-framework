import { createHash } from 'node:crypto'
import { getCookie, getHeader, type H3Event } from 'h3'
import {
  normalizeNotification,
  type UnifiedNotification,
} from '../../../shared/notifications/schema'
import { getNotificationProviders } from '../../../shared/notifications/registry'

export interface NotificationSource {
  name: string
  fetchForUser: (userId: string, event: H3Event) => Promise<UnifiedNotification[]>
}

export interface NotificationTransport {
  name: string
  deliver: (notification: UnifiedNotification, userId: string, event: H3Event) => Promise<void>
}

const inMemoryStore = new Map<string, UnifiedNotification[]>()

function createSeedNotifications(userId: string): UnifiedNotification[] {
  const now = Date.now()
  return [
    normalizeNotification({
      id: `${userId}-welcome`,
      title: 'Welcome to your inbox',
      body: 'This in-app inbox is powered by a backend-agnostic notification gateway.',
      category: 'info',
      read: false,
      createdAt: new Date(now - 1000 * 60 * 5),
      actionUrl: '/notifications',
      source: 'system',
    }),
    normalizeNotification({
      id: `${userId}-assignment`,
      title: 'Assignment update available',
      body: 'A new assignment has been published for your workspace.',
      category: 'assignment',
      read: false,
      createdAt: new Date(now - 1000 * 60 * 60),
      actionUrl: '/notifications',
      source: 'system',
    }),
  ]
}

function ensureUserStore(userId: string): UnifiedNotification[] {
  const current = inMemoryStore.get(userId)
  if (current) return current
  const seeded = createSeedNotifications(userId)
  inMemoryStore.set(userId, seeded)
  return seeded
}

export function resolveNotificationUserId(event: H3Event): string {
  const contextUser = (event.context as any)?.user
  const contextSessionUser = (event.context as any)?.session?.user
  const idFromContext = contextUser?.id || contextSessionUser?.id
  if (idFromContext) return String(idFromContext)

  const headerUserId = getHeader(event, 'x-user-id')
  if (headerUserId) return String(headerUserId)

  const cookieUserId = getCookie(event, 'notification_user_id')
  if (cookieUserId) return String(cookieUserId)

  return 'guest'
}

class InAppSource implements NotificationSource {
  name = 'in-app-source'

  async fetchForUser(userId: string): Promise<UnifiedNotification[]> {
    return ensureUserStore(userId)
      .map((item) => normalizeNotification(item))
  }
}

class NotificationGateway {
  private sources: NotificationSource[] = []
  private transports: NotificationTransport[] = []

  registerSource(source: NotificationSource): void {
    this.sources.push(source)
  }

  registerTransport(transport: NotificationTransport): void {
    this.transports.push(transport)
  }

  async list(userId: string, event: H3Event): Promise<UnifiedNotification[]> {
    const sourceResults = await Promise.all(
      this.sources.map((source) => source.fetchForUser(userId, event).catch(() => [])),
    )

    const deduped = new Map<string, UnifiedNotification>()
    for (const result of sourceResults.flat()) {
      const normalized = normalizeNotification(result)
      deduped.set(normalized.id, normalized)
    }

    return Array.from(deduped.values())
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
  }

  async markAsRead(userId: string, id: string): Promise<void> {
    const items = ensureUserStore(userId)
    const target = items.find((item) => item.id === id)
    if (target) target.read = true
  }

  async markAllAsRead(userId: string): Promise<void> {
    const items = ensureUserStore(userId)
    for (const item of items) item.read = true
  }

  async dispatch(userId: string, event: H3Event, notification: UnifiedNotification): Promise<void> {
    const items = ensureUserStore(userId)
    items.unshift(notification)

    await Promise.allSettled(
      this.transports.map((transport) => transport.deliver(notification, userId, event)),
    )
  }
}

class InAppTransport implements NotificationTransport {
  name = 'in-app-transport'
  async deliver(): Promise<void> {
    // In-app transport is fulfilled by persisting to in-memory source.
  }
}

const gateway = new NotificationGateway()
gateway.registerSource(new InAppSource())
gateway.registerTransport(new InAppTransport())

/**
 * Register all adapter-level notification providers (registered via
 * `registerNotificationProvider()` in shared/notifications/registry.ts)
 * as NotificationSource adapters on the gateway.
 *
 * Called once at startup (server plugin or first gateway access).
 */
function syncAdapterProviders(): void {
  for (const provider of getNotificationProviders()) {
    const existing = (gateway as any).sources as NotificationSource[]
    if (existing.some((s) => s.name === provider.name)) continue
    gateway.registerSource({
      name: provider.name,
      async fetchForUser(userId: string, event: H3Event): Promise<UnifiedNotification[]> {
        const context: Record<string, unknown> = {
          userId,
          userAgent: getHeader(event, 'user-agent') ?? '',
        }
        return provider.fetchNotifications(userId, context).catch(() => [])
      },
    })
  }
}

export function getNotificationGateway(): NotificationGateway {
  syncAdapterProviders()
  return gateway
}

export function computeNotificationsEtag(notifications: UnifiedNotification[]): string {
  const payload = notifications
    .map((item) => `${item.id}:${item.read ? 1 : 0}:${item.createdAt.toISOString()}`)
    .join('|')
  return createHash('sha1').update(payload).digest('hex')
}
