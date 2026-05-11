import type { ElkNotificationFilterType } from '~/constants'
import type { mastodon } from 'masto'

export interface Notification {
  id: string
  type: ElkNotificationFilterType
  message: string
  read: boolean
  createdAt: string
  [key: string]: any
}

export function isNotificationFilter(filter: string): filter is ElkNotificationFilterType {
  return [
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
  ].includes(filter)
}

export function isNotification(value: string | undefined): value is mastodon.v1.NotificationType {
  if (!value)
    return false

  return [
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
  ].includes(value)
}
