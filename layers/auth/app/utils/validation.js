import { z } from 'zod';
export const loginSchema = z.object({
    email: z.string().email(),
    password: z.string().min(8)
});
export const registerSchema = z.object({
    email: z.string().email(),
    password: z.string().min(8),
    confirmPassword: z.string().min(8)
}).refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword']
});
export const forgotPasswordSchema = z.object({
    email: z.string().email()
});
export const resetPasswordSchema = z.object({
    token: z.string(),
    password: z.string().min(8),
    confirmPassword: z.string().min(8)
});
