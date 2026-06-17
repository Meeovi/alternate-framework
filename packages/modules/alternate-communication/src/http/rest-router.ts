import { UseCases } from '../app/use-cases';
import { CommunicationPolicyContext } from '../domain/policy/CommunicationPolicy';
import { CommunicationPolicy } from '../domain/policy/CommunicationPolicy';
import { createRoomSchema, listRoomsSchema } from './validators/rooms';
import {
  sendMessageSchema,
  editMessageSchema,
  deleteMessageSchema,
  addReactionSchema,
  listMessagesSchema,
  updatePresenceSchema
} from './validators/messages';
import { roomIdSchema, messageIdSchema, parseOrThrow } from './validators/common';

export interface RestRequest {
  params: Record<string, string>;
  query: Record<string, string | string[] | undefined>;
  body: unknown;
  user: { id: string; roles: string[] };
}

export interface RestResponse {
  status(code: number): RestResponse;
  json(payload: unknown): void;
}

export type RestHandler = (req: RestRequest, res: RestResponse) => Promise<void> | void;

export interface RestRouterFactory {
  add(method: 'GET' | 'POST' | 'PATCH' | 'DELETE', path: string, handler: RestHandler): void;
}

export function createRestRouter(
  factory: RestRouterFactory,
  useCases: UseCases,
  policy?: CommunicationPolicy
) {
  const buildCtx = (req: RestRequest): CommunicationPolicyContext => ({
    userId: req.user.id,
    roles: req.user.roles ?? []
  });

  factory.add('POST', '/rooms', async (req, res) => {
    try {
      const input = parseOrThrow(createRoomSchema, req.body);
      const ctx = buildCtx(req);
      const room = await useCases.createRoom(ctx, input);
      res.status(201).json(room);
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  });

  factory.add('GET', '/rooms', async (req, res) => {
    try {
      const input = parseOrThrow(listRoomsSchema, req.query);
      const ctx = buildCtx(req);
      const result = await useCases.listRoomsForUser(ctx, input);
      res.status(200).json(result);
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  });

  factory.add('GET', '/rooms/:roomId/messages', async (req, res) => {
    try {
      const roomId = parseOrThrow(roomIdSchema, req.params.roomId);
      const query = parseOrThrow(listMessagesSchema, req.query);
      const ctx = buildCtx(req);
      const messages = await useCases.listMessages(ctx, { roomId, ...query });
      res.status(200).json(messages);
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  });

  factory.add('POST', '/rooms/:roomId/messages', async (req, res) => {
    try {
      const roomId = parseOrThrow(roomIdSchema, req.params.roomId);
      const body = parseOrThrow(sendMessageSchema, req.body);
      const ctx = buildCtx(req);
      const message = await useCases.sendMessage(ctx, { roomId, ...body });
      res.status(201).json(message);
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  });

  factory.add('PATCH', '/messages/:messageId', async (req, res) => {
    try {
      const messageId = parseOrThrow(messageIdSchema, req.params.messageId);
      const body = parseOrThrow(editMessageSchema, req.body);
      const ctx = buildCtx(req);
      const message = await useCases.editMessage(ctx, { messageId, ...body });
      res.status(200).json(message);
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  });

  factory.add('DELETE', '/messages/:messageId', async (req, res) => {
    try {
      const messageId = parseOrThrow(messageIdSchema, req.params.messageId);
      const body = parseOrThrow(deleteMessageSchema, req.body ?? {});
      const ctx = buildCtx(req);
      await useCases.deleteMessage(ctx, { messageId, ...body });
      res.status(204).json({});
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  });

  factory.add('POST', '/messages/:messageId/reactions', async (req, res) => {
    try {
      const messageId = parseOrThrow(messageIdSchema, req.params.messageId);
      const body = parseOrThrow(addReactionSchema, req.body);
      const ctx = buildCtx(req);
      const reaction = await useCases.addReaction(ctx, { messageId, ...body });
      res.status(201).json(reaction);
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  });

  factory.add('DELETE', '/messages/:messageId/reactions', async (req, res) => {
    try {
      const messageId = parseOrThrow(messageIdSchema, req.params.messageId);
      const body = parseOrThrow(addReactionSchema, req.body);
      const ctx = buildCtx(req);
      await useCases.removeReaction(ctx, { messageId, ...body });
      res.status(204).json({});
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  });

  factory.add('POST', '/presence', async (req, res) => {
    try {
      const body = parseOrThrow(updatePresenceSchema, req.body);
      const ctx = buildCtx(req);
      const presence = await useCases.updatePresence(ctx, body);
      res.status(200).json(presence);
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  });

  return factory;
}
