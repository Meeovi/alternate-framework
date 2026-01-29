import { z } from 'zod';
export const LoginInputSchema = z.object({
    email: z.string().email(),
    password: z.string().min(8)
});
export const RegisterInputSchema = z.object({
    email: z.string().email(),
    password: z.string().min(8),
    confirmPassword: z.string().min(8)
}).refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword']
});
export const ForgotPasswordInputSchema = z.object({
    email: z.string().email()
});
export const ResetPasswordInputSchema = z.object({
    token: z.string(),
    password: z.string().min(8),
    confirmPassword: z.string().min(8)
});
