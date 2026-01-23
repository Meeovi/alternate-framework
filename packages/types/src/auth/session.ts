import { User } from "./user"

export interface Session {
  user: User | null
  accessToken: string | null
  refreshToken?: string | null
  expiresAt?: number
}