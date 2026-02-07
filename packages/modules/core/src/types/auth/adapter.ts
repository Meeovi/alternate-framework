import { AuthSession } from "./session"

export interface AuthAdapter {
  getSession(): Promise<AuthSession | null>
  signIn(email: string, password: string): Promise<AuthSession>
  signOut(): Promise<void>
}