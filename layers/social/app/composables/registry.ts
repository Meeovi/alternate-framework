import type { SocialProvider } from './types'

const providers: Record<string, SocialProvider> = {}

export function registerSocialProvider(name: string, provider: SocialProvider) {
  providers[name] = provider
}

export function getSocialProvider(name: string): SocialProvider {
  const provider = providers[name]
  if (!provider) throw new Error(`Social provider "${name}" not found`)
  return provider
}
