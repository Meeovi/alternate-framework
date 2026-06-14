export interface LocaleDefinition {
  code: string
  iso?: string
  name?: string
  label?: string
  region?: string
  currency?: string
  rtl?: boolean
  default?: boolean
  [key: string]: any
}

export interface LocationInfo {
  country?: string
  countryCode?: string
  region?: string
  city?: string
  timezone?: string
  latitude?: number
  longitude?: number
  [key: string]: any
}

export interface LocalizationState {
  locale: string
  locales: LocaleDefinition[]
  location?: LocationInfo | null
  timezone?: string
  currency?: string
  source?: string
}

export interface LocalizationAdapter {
  getLocales(args?: Record<string, any>): Promise<LocaleDefinition[]>
  detectLocation(args?: Record<string, any>): Promise<LocationInfo | null>
  getCurrentLocale(args?: Record<string, any>): Promise<string>
  resolveLocalization(args?: Record<string, any>): Promise<LocalizationState>
}