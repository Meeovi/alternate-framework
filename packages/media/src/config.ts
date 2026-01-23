// packages/meeovi-media/src/config.ts

export interface MediaConfig {
  mediaProvider: string
  baseUrl?: string
  cdnUrl?: string
}

let config: MediaConfig = {
  mediaProvider: 'directus',
  baseUrl: '',
  cdnUrl: ''
}

export function setMediaConfig(newConfig: Partial<MediaConfig>) {
  config = { ...config, ...newConfig }
}

export function getMediaConfig(): MediaConfig {
  return config
}
