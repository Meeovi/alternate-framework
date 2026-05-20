// Gateway contract for backend-agnostic Nuxt architecture
import type { AuthAdapter } from './auth'

export interface Gateway {
  auth: AuthAdapter
  // Add other domains: commerce, content, search, etc.
}
