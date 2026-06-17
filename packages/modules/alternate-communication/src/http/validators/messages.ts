import { z } from 'zod';

export const sendMessageSchema = z.object({
  body: z.string().min(1),
  parentId: z.string().optional(),
  metadata: z.record(z.string(), z.any()).optional()
});

export const editMessageSchema = z.object({
  body: z.string().min(1)
});

export const deleteMessageSchema = z.object({
  hard: z.coerce.boolean().optional()
});

export const addReactionSchema = z.object({
  emoji: z.string().min(1)
});

export const listMessagesSchema = z.object({
  limit: z.coerce.number().int().min(1).max(100).optional(),
  before: z.string().optional(),
  after: z.string().optional(),
  threadParentId: z.string().optional()
});

export const updatePresenceSchema = z.object({
  status: z.enum(['online', 'offline', 'away', 'busy'])
});
