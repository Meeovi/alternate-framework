import type { mastodon } from 'masto'
import type { ElkNotificationFilterType } from '../../constants'
import { NOTIFICATION_FILTER_TYPES } from '../../constants'

/**
 * Typeguard to check if an object is a valid notification filter
 * @param obj the object to be checked
 * @returns boolean and assigns type to object if true
 */
export function isNotificationFilter(obj: unknown): obj is ElkNotificationFilterType {
  return !!obj && NOTIFICATION_FILTER_TYPES.includes(obj as ElkNotificationFilterType)
}

/**
 * Typeguard to check if an object is a valid notification
 * @param obj the object to be checked
 * @returns boolean and assigns type to object if true
 */
export function isNotification(obj: unknown): obj is mastodon.v1.NotificationType {
  return !!obj && ['mention', ...NOTIFICATION_FILTER_TYPES].includes(obj as unknown as mastodon.v1.NotificationType)
}
