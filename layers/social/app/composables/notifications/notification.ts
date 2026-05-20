import type { mastodon } from 'masto'
import type { ElkNotificationFilterType } from '../../constants'

const FILTERS: ElkNotificationFilterType[] = [
  'all',
  'mention',
  'status',
  'update',
  'quote',
  'reblog',
  'poll',
  'favourite',
  'quoted_update',
  'follow',
  'follow_request',
  'admin.sign_up',
  'admin.report',
  'severed_relationships',
  'moderation_warning',
]

const NOTIFICATIONS: mastodon.v1.NotificationType[] = [
  'mention',
  'status',
  'update',
  'quote',
  'reblog',
  'poll',
  'favourite',
  'quoted_update',
  'follow',
  'follow_request',
  'admin.sign_up',
  'admin.report',
  'severed_relationships',
  'moderation_warning',
]

export function isNotificationFilter(filter: string): filter is ElkNotificationFilterType {
  return FILTERS.includes(filter as ElkNotificationFilterType)
}

export function isNotification(value: string | undefined): value is mastodon.v1.NotificationType {
  if (!value) return false
  return NOTIFICATIONS.includes(value as mastodon.v1.NotificationType)
}
