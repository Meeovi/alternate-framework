export interface PreferencesSettings {
  hideRepliesInTimeline: boolean
  hideBoostsInTimeline: boolean
}

export interface UserSettings {
  language: string
  preferences: PreferencesSettings
}

export const defaultPreferences: PreferencesSettings = {
  hideRepliesInTimeline: false,
  hideBoostsInTimeline: false,
}

export const defaultUserSettings: UserSettings = {
  language: 'en',
  preferences: defaultPreferences,
}
