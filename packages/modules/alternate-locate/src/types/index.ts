export type LocaleCode = string

export type LocaleObject = {
  code: LocaleCode
  name?: string
  language?: string
  dir?: 'ltr' | 'rtl'
}

export type LocateDetectionSource =
  | 'query'
  | 'cookie'
  | 'header'
  | 'browser'
  | 'geo'
  | 'default'

export type LocateContext = {
  query?: Record<string, string | undefined>
  cookies?: Record<string, string | undefined>
  headers?: Record<string, string | undefined>
  browserLanguages?: string[]
  geoCountry?: string
}

export type LocateDetection = {
  locale: LocaleCode
  source: LocateDetectionSource
}

export type LocateDetector = (context: LocateContext) => LocateDetection | null

export type CreateLocateOptions = {
  locales: Array<LocaleCode | LocaleObject>
  defaultLocale: LocaleCode
  cookieKey?: string
  queryKey?: string
  geoToLocale?: Record<string, LocaleCode>
  customDetectors?: LocateDetector[]
}

export type LocateRuntime = {
  locales: LocaleObject[]
  localeCodes: LocaleCode[]
  defaultLocale: LocaleCode
  detect: (context: LocateContext) => LocateDetection
  isSupportedLocale: (value: string | null | undefined) => value is LocaleCode
  resolveLocale: (value: string | null | undefined) => LocaleCode
}
