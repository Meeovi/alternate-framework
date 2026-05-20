export interface BackendConfig {
  name: string
  adapters: {
    auth?: any
    commerce?: any
    social?: any
    media?: any
  }
}

export const backendRegistry: Record<string, BackendConfig> = {}
