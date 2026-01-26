export interface AuthUser {
  id: string
  email: string
  name?: string
  avatarUrl?: string
  emailVerified: boolean
  createdAt: string
  updatedAt: string
}