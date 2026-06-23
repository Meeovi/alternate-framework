export type AnyRecord = Record<string, any>

export interface GatewayDomainOptions extends AnyRecord {
  provider?: string
}

export interface GatewayFactoryOptions {
  content?: GatewayDomainOptions | null
  auth?: GatewayDomainOptions | null
  commerce?: GatewayDomainOptions | null
  search?: GatewayDomainOptions | null
  notifications?: GatewayDomainOptions | null
  localization?: GatewayDomainOptions | null
  federation?: GatewayDomainOptions | null
  media?: GatewayDomainOptions | null
}

export interface GatewayProviders {
  content: AnyRecord | null
  auth: AnyRecord | null
  commerce: AnyRecord | null
  search: AnyRecord | null
  notifications: AnyRecord | null
  localization: AnyRecord | null
  federation: AnyRecord | null
  media: AnyRecord | null
}

export interface SdkGateway extends GatewayProviders {}
