import type { mastodon } from 'masto'

export const APP_NAME = 'Elk'

export const DEFAULT_POST_CHARS_LIMIT = 500
export const DEFAULT_FONT_SIZE = '15px'

export const ELK_PAGE_LIFECYCLE_FROZEN = 'mframework-frozen'

export const STORAGE_KEY_DRAFTS = 'mframework-drafts'
export const STORAGE_KEY_USERS = 'mframework-users'
export const STORAGE_KEY_SERVERS = 'mframework-servers'
export const STORAGE_KEY_NODES = 'mframework-nodes'
export const STORAGE_KEY_CURRENT_USER_HANDLE = 'mframework-current-user-handle'
export const STORAGE_KEY_NOTIFY_TAB = 'mframework-notify-tab'
export const STORAGE_KEY_SETTINGS = 'mframework-settings'
export const STORAGE_KEY_CUSTOM_EMOJIS = 'mframework-custom-emojis'
export const STORAGE_KEY_HIDE_EXPLORE_POSTS_TIPS = 'mframework-hide-explore-posts-tips'
export const STORAGE_KEY_HIDE_EXPLORE_NEWS_TIPS = 'mframework-hide-explore-news-tips'
export const STORAGE_KEY_HIDE_EXPLORE_TAGS_TIPS = 'mframework-hide-explore-tags-tips'
export const STORAGE_KEY_NOTIFICATION = 'mframework-notification'
export const STORAGE_KEY_NOTIFICATION_POLICY = 'mframework-notification-policy'
export const STORAGE_KEY_PWA_HIDE_INSTALL = 'mframework-pwa-hide-install'
export const STORAGE_KEY_LAST_ACCESSED_NOTIFICATION_ROUTE = 'mframework-last-accessed-notification-route'
export const STORAGE_KEY_LAST_ACCESSED_EXPLORE_ROUTE = 'mframework-last-accessed-explore-route'
export const STORAGE_KEY_BOTTOM_NAV_BUTTONS = 'mframework-bottom-nav-buttons'

export const HANDLED_MASTO_URLS = /^(https?:\/\/)?([\w\-]+\.)+\w+\/(@[@\w\-.]+)(\/objects)?(\/\d+)?$/

export const NOTIFICATION_FILTER_TYPES: mastodon.v1.NotificationType[] = [
  'status',
  'reblog',
  'quote',
  'follow',
  'follow_request',
  'favourite',
  'poll',
  'update',
  'admin.sign_up',
  'admin.report',
]

export const THEME_COLORS = {
  defaultTheme: '#cc7d24',
  themeDark: '#111111',
  themeLight: '#fafafa',
  backgroundDark: '#fafafa',
  backgroundLight: '#111111',
} as const
