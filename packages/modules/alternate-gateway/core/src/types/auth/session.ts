import type {
    AuthUser
} from "./user";

export interface AuthSession {
  user: AuthUser | null
  accessToken: string | null
  refreshToken?: string | null
  expiresAt?: number
}