const providers: Record<string, MediaProvider> = {}

export function registerMediaProvider(name: string, provider: MediaProvider) {
  providers[name] = provider
}

export function getMediaProvider(name: string) {
  const provider = providers[name]
  if (!provider) throw new Error(`Media provider "${name}" not found`)
  return provider
}
