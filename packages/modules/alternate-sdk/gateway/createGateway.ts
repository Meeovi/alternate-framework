import type { GatewayFactoryOptions, SdkGateway } from './types.js'
import type { GatewayRegistry } from './registry.js'

function bindGlobalGateway(gateway: SdkGateway) {
  const runtime = globalThis as Record<string, any>

  runtime.gateway = gateway
  runtime.useGateway = () => gateway
}

function resolveDomain(
  domain: 'content' | 'auth' | 'commerce' | 'search' | 'notifications' | 'localization',
  options: GatewayFactoryOptions,
  registry?: GatewayRegistry
) {
  const domainOptions = options[domain]

  if (!domainOptions || typeof domainOptions !== 'object') {
    return domainOptions ?? null
  }

  const provider = domainOptions.provider
  const factory = provider ? registry?.resolve(domain, provider) : null

  if (typeof factory === 'function') {
    return factory(domainOptions)
  }

  return domainOptions
}

export function createGateway(options: GatewayFactoryOptions = {}, registry?: GatewayRegistry): SdkGateway {
  const gateway: SdkGateway = {
    content: resolveDomain('content', options, registry),
    auth: resolveDomain('auth', options, registry),
    commerce: resolveDomain('commerce', options, registry),
    search: resolveDomain('search', options, registry),
    notifications: resolveDomain('notifications', options, registry),
    localization: resolveDomain('localization', options, registry),
  }

  bindGlobalGateway(gateway)
  return gateway
}
