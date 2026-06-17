import { AlternateCommunicationOptions } from '../../config';
import { defaultCommunicationPolicy } from '../../domain/policy/CommunicationPolicy';
import { EventBus } from '../../events/bus';
import { createRoom } from './CreateRoom';
import { sendMessage } from './SendMessage';
import { editMessage } from './EditMessage';
import { deleteMessage } from './DeleteMessage';
import { addReaction } from './AddReaction';
import { removeReaction } from './RemoveReaction';
import { updatePresence } from './UpdatePresence';
import { listMessages } from './ListMessages';
import { listRoomsForUser } from './ListRoomsForUser';

export function createUseCases(options: AlternateCommunicationOptions, eventBus: EventBus) {
  const policy = options.policy ?? defaultCommunicationPolicy;

  return {
    createRoom: (ctx: any, input: any) =>
      createRoom({ storage: options.storage, policy, eventBus }, ctx, input),
    sendMessage: (ctx: any, input: any) =>
      sendMessage({ storage: options.storage, policy, eventBus }, ctx, input),
    editMessage: (ctx: any, input: any) =>
      editMessage({ storage: options.storage, policy, eventBus }, ctx, input),
    deleteMessage: (ctx: any, input: any) =>
      deleteMessage({ storage: options.storage, policy, eventBus }, ctx, input),
    addReaction: (ctx: any, input: any) =>
      addReaction({ storage: options.storage, eventBus }, ctx, input),
    removeReaction: (ctx: any, input: any) =>
      removeReaction({ storage: options.storage, eventBus }, ctx, input),
    updatePresence: (ctx: any, input: any) =>
      updatePresence({ eventBus }, ctx, input),
    listMessages: (ctx: any, input: any) =>
      listMessages({ storage: options.storage }, ctx, input),
    listRoomsForUser: (ctx: any, input: any) =>
      listRoomsForUser({ storage: options.storage }, ctx, input)
  };
}

export type UseCases = ReturnType<typeof createUseCases>;
