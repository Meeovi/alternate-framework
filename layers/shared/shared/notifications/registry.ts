/**
 * Notification provider registry.
 *
 * Each `adapter-*` package (or any server plugin) can call
 * `registerNotificationProvider()` to contribute a source of
 * `UnifiedNotification` objects.  The shared notification gateway
 * (`server/utils/notifications/hub.ts`) queries every registered
 * provider when building a user's notification list.
 *
 * This file has no server-only imports so it can live in the `shared/`
 * directory and be consumed by both server and (future) client code.
 */
import type { UnifiedNotification } from './schema'

export interface AdapterNotificationProvider {
  /** Unique name used for deduplication / logging */
  name: string
  /**
   * Fetch notifications for a given user.
   * `context` is an optional bag of request-level metadata (user-agent,
   * session data …) that the gateway passes through from the H3 event.
   */
  fetchNotifications(
    userId: string,
    context?: Record<string, unknown>,
  ): Promise<UnifiedNotification[]>
}

const _providers: AdapterNotificationProvider[] = []

/**
 * Register a notification provider.
 * Calling this multiple times with the same `name` is a no-op (idempotent).
 */
export function registerNotificationProvider(
  provider: AdapterNotificationProvider,
): void {
  if (_providers.some((p) => p.name === provider.name)) return
  _providers.push(provider)
}

/** Return a snapshot of all registered providers (read-only copy). */
export function getNotificationProviders(): AdapterNotificationProvider[] {
  return [..._providers]
}
