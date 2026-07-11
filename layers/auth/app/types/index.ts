import { z } from 'zod'

export interface User {
  id?: string
  first_name?: string
  last_name?: string
  email?: string
  [key: string]: any
}

export interface AuthUser {
  id: string
  email: string
  name?: string
  avatarUrl?: string
  emailVerified: boolean
  createdAt: string
  updatedAt: string
}

export interface AuthSession {
  user: AuthUser | null
  accessToken: string | null
  refreshToken?: string | null
  expiresAt?: number
}

export interface UserLogin {
  server?: string
  token?: string
  vapidKey?: string
  account?: any
}

export const LoginInputSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8)
})

export type LoginInput = z.infer<typeof LoginInputSchema>

export const RegisterInputSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  confirmPassword: z.string().min(8)
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword']
})

export type RegisterInput = z.infer<typeof RegisterInputSchema>

export const ForgotPasswordInputSchema = z.object({
  email: z.string().email()
})

export type ForgotPasswordInput = z.infer<typeof ForgotPasswordInputSchema>

export const ResetPasswordInputSchema = z.object({
  token: z.string(),
  password: z.string().min(8),
  confirmPassword: z.string().min(8)
})

export type ResetPasswordInput = z.infer<typeof ResetPasswordInputSchema>

export interface OAuthProvider {
  id: string
  label: string
  icon?: string
  authUrl: string
}

export interface AuthAdapter {
  getSession(): Promise<AuthSession | null>
  signIn(email: string, password: string): Promise<AuthSession>
  signOut(): Promise<void>
}
