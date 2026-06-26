export type AccountSettingDefinition = {
  key: string
  category: string
  label: string
  description: string
  defaultValue?: boolean
}

export type AccountSettingsCategoryDefinition = {
  id: string
  label: string
  icon: string
}

export type AccountSettingsPreset = {
  categories: AccountSettingsCategoryDefinition[]
  settings: AccountSettingDefinition[]
}

export type AccountSettingsPresetKey = 'default' | 'meeovi'

export type AuthUser = Record<string, unknown> | null | undefined

export type FullOrganization = {
  id: string
  name: string
  slug: string
  logo?: string
  createdAt?: Date
  updatedAt?: Date
}

export type SocialProviderUi = {
  id: string
  label: string
  icon: string
  color: string
}

export type SocialProvider = {
  id: string
  label: string
  icon?: string
  color?: string
}

export const SHARED_ACCOUNT_SETTINGS_PRESETS = {
  default: {
    categories: [
      { id: 'accounts', label: 'Accounts', icon: 'fas fa-users' },
      { id: 'personalization', label: 'Personalization', icon: 'fas fa-palette' },
      { id: 'security', label: 'Security', icon: 'fas fa-lock' },
      { id: 'notifications', label: 'Notifications', icon: 'fas fa-bell' },
      { id: 'accessibility', label: 'Accessibility', icon: 'fas fa-universal-access' },
      { id: 'system', label: 'System', icon: 'fas fa-cog' },
    ],
    settings: [
      {
        key: 'accounts.profileVisibility',
        category: 'accounts',
        label: 'Public Profile Visibility',
        description: 'Allow others to discover your public profile.',
        defaultValue: true,
      },
      {
        key: 'personalization.darkMode',
        category: 'personalization',
        label: 'Dark Mode',
        description: 'Use a dark appearance across the application.',
        defaultValue: false,
      },
      {
        key: 'personalization.compactLayout',
        category: 'personalization',
        label: 'Compact Layout',
        description: 'Show denser lists and tighter spacing.',
        defaultValue: false,
      },
      {
        key: 'security.loginAlerts',
        category: 'security',
        label: 'Login Alerts',
        description: 'Notify you when your account signs in from a new device.',
        defaultValue: true,
      },
      {
        key: 'notifications.emailUpdates',
        category: 'notifications',
        label: 'Email Updates',
        description: 'Receive important product and account updates by email.',
        defaultValue: true,
      },
      {
        key: 'notifications.pushNotifications',
        category: 'notifications',
        label: 'Push Notifications',
        description: 'Receive real-time alerts in your browser.',
        defaultValue: true,
      },
      {
        key: 'accessibility.reduceMotion',
        category: 'accessibility',
        label: 'Reduce Motion',
        description: 'Minimize animation and transition effects.',
        defaultValue: false,
      },
      {
        key: 'system.autoUpdates',
        category: 'system',
        label: 'Automatic Feature Updates',
        description: 'Keep account features and defaults up to date automatically.',
        defaultValue: true,
      },
    ],
  },
  meeovi: {
    categories: [
      { id: 'accounts', label: 'Accounts', icon: 'fas fa-users' },
      { id: 'personalization', label: 'Personalization', icon: 'fas fa-palette' },
      { id: 'security', label: 'Security', icon: 'fas fa-lock' },
      { id: 'notifications', label: 'Notifications', icon: 'fas fa-bell' },
      { id: 'accessibility', label: 'Accessibility', icon: 'fas fa-universal-access' },
      { id: 'system', label: 'System', icon: 'fas fa-cog' },
    ],
    settings: [
      {
        key: 'accounts.profileVisibility',
        category: 'accounts',
        label: 'Public Profile Visibility',
        description: 'Allow others to discover your public profile.',
        defaultValue: true,
      },
      {
        key: 'personalization.darkMode',
        category: 'personalization',
        label: 'Dark Mode',
        description: 'Use a dark appearance across the application.',
        defaultValue: false,
      },
      {
        key: 'personalization.compactLayout',
        category: 'personalization',
        label: 'Compact Layout',
        description: 'Show denser lists and tighter spacing.',
        defaultValue: false,
      },
      {
        key: 'security.loginAlerts',
        category: 'security',
        label: 'Login Alerts',
        description: 'Notify you when your account signs in from a new device.',
        defaultValue: true,
      },
      {
        key: 'notifications.emailUpdates',
        category: 'notifications',
        label: 'Email Updates',
        description: 'Receive important product and account updates by email.',
        defaultValue: true,
      },
      {
        key: 'notifications.pushNotifications',
        category: 'notifications',
        label: 'Push Notifications',
        description: 'Receive real-time alerts in your browser.',
        defaultValue: true,
      },
      {
        key: 'accessibility.reduceMotion',
        category: 'accessibility',
        label: 'Reduce Motion',
        description: 'Minimize animation and transition effects.',
        defaultValue: false,
      },
      {
        key: 'system.autoUpdates',
        category: 'system',
        label: 'Automatic Feature Updates',
        description: 'Keep account features and defaults up to date automatically.',
        defaultValue: true,
      },
    ],
  },
} satisfies Record<string, AccountSettingsPreset>