export interface SocialConfig {
  provider: string
  baseUrl?: string
  apiKey?: string
  [key: string]: any
}

let config: SocialConfig = {
  provider: 'atproto',
  baseUrl: '',
  apiKey: ''
}

export function setSocialConfig(newConfig: Partial<SocialConfig>) {
  config = { ...config, ...newConfig }
}

export function getSocialConfig(): SocialConfig {
  return config
}
