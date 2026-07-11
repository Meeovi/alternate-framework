export type ElkNotificationFilterType =
  | 'all'
  | 'mention'
  | 'status'
  | 'update'
  | 'quote'
  | 'reblog'
  | 'poll'
  | 'favourite'
  | 'quoted_update'
  | 'follow'
  | 'follow_request'
  | 'admin.sign_up'
  | 'admin.report'
  | 'severed_relationships'
  | 'moderation_warning'

export const NOTIFICATION_FILTER_TYPES: ElkNotificationFilterType[] = [
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

export const STORAGE_KEY_DRAFTS = 'meeovi_drafts'
export const STORAGE_KEY_NOTIFICATION = 'meeovi_notification'
export const STORAGE_KEY_NOTIFICATION_POLICY = 'meeovi_notification_policy'
export const APP_NAME = 'Meeovi Social'
