import { z } from 'zod';

export const roomIdSchema = z.string().min(1);
export const messageIdSchema = z.string().min(1);

export function parseOrThrow<T>(schema: z.ZodSchema<T>, data: unknown): T {
  const result = schema.safeParse(data);
  if (!result.success) {
    throw new Error(result.error.message);
  }
  return result.data;
}
