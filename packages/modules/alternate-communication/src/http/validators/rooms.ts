import { z } from 'zod';
import { RoomType } from '../../domain/entities/Room';

export const createRoomSchema = z.object({
  type: z.enum(['dm', 'group', 'channel', 'support', 'system'] as RoomType[]),
  title: z.string().min(1).optional(),
  slug: z.string().min(1).optional(),
  isPrivate: z.boolean().optional(),
  isReadOnly: z.boolean().optional(),
  metadata: z.record(z.string(), z.any()).optional()
});

export const listRoomsSchema = z.object({
  limit: z.coerce.number().int().min(1).max(100).optional(),
  cursor: z.string().optional()
});
