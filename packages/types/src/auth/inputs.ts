import { z } from 'zod'

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