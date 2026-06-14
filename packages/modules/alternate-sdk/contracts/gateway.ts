import type { AuthContract } from './auth.js'
import type { CommerceAdapter } from './commerce.js'

export interface Gateway {
  auth?: AuthContract | null
  commerce?: CommerceAdapter | null
  content?: Record<string, any> | null
  search?: Record<string, any> | null
  notifications?: Record<string, any> | null
  localization?: Record<string, any> | null
}