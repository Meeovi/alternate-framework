import type { ChatProvider } from './types'

const providers: Record<string, ChatProvider> = {}

export function registerChatProvider(name: string, provider: ChatProvider) {
  providers[name] = provider
}

export function getChatProvider(name: string) {
  const provider = providers[name]
  if (!provider) throw new Error(`Chat provider "${name}" not found`)
  return provider
}

// Runtime helper for adapter packages to register themselves during app boot
export function registerChatProviderRuntime(name: string, provider: ChatProvider) {
  registerChatProvider(name, provider)
}
