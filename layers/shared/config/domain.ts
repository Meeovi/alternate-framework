export interface DomainConfig {
  enabled: boolean
  routes?: boolean
  ui?: boolean
}

export interface DomainRegistry {
  auth: DomainConfig
  commerce: DomainConfig
  social: DomainConfig
  media: DomainConfig
}

export const domainRegistry: DomainRegistry = {
  auth: { enabled: true },
  commerce: { enabled: true },
  social: { enabled: false },
  media: { enabled: false }
}
