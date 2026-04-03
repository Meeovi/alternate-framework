import type { SocialProvider } from './types'

const providers: Record<string, SocialProvider> = {}

export function registerSocialProvider(name: string, provider: SocialProvider) {
  providers[name] = provider
}

// Runtime helper for adapter packages to register themselves when the
// app boots. Adapter packages can import this and call it from their
// plugin entry to wire into the social layer at runtime.
export function registerSocialProviderRuntime(name: string, provider: SocialProvider) {
  registerSocialProvider(name, provider)
}

export function getSocialProvider(name: string): SocialProvider {
  const provider = providers[name]
  if (!provider) throw new Error(`Social provider "${name}" not found`)
  return provider
}
