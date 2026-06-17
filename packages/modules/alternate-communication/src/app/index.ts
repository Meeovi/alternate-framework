import { AlternateCommunicationOptions } from '../config';
import { defaultCommunicationPolicy } from '../domain/policy/CommunicationPolicy';
import { EventBus } from '../events/bus';

// Commands
import { createRoom } from './commands/CreateRoom';
import { sendMessage } from './commands/SendMessage';
import { editMessage } from './commands/EditMessage';
import { deleteMessage } from './commands/DeleteMessage';
import { addReaction } from './commands/AddReaction';
import { removeReaction } from './commands/RemoveReaction';
import { updatePresence } from './commands/UpdatePresence';
import { addMember } from './commands/AddMember';
import { removeMember } from './commands/RemoveMember';
import { muteMember } from './commands/MuteMember';
import { unmuteMember } from './commands/UnmuteMember';

// Queries
import { listMessages } from './queries/ListMessages';
import { listRoomsForUser } from './queries/ListRoomsForUser';
import { getRoom } from './queries/GetRoom';
import { getMessage } from './queries/GetMessage';
import { listMembers } from './queries/ListMembers';
import { listReactions } from './queries/ListReactions';
import { searchMessages } from './queries/SearchMessages';

export function createUseCases(options: AlternateCommunicationOptions, eventBus: EventBus) {
  const policy = options.policy ?? defaultCommunicationPolicy;

  return {
    commands: {
      createRoom: (ctx, input) =>
        createRoom({ storage: options.storage, policy, eventBus }, ctx, input),

      sendMessage: (ctx, input) =>
        sendMessage({ storage: options.storage, policy, eventBus }, ctx, input),

      editMessage: (ctx, input) =>
        editMessage({ storage: options.storage, policy, eventBus }, ctx, input),

      deleteMessage: (ctx, input) =>
        deleteMessage({ storage: options.storage, policy, eventBus }, ctx, input),

      addReaction: (ctx, input) =>
        addReaction({ storage: options.storage, eventBus }, ctx, input),

      removeReaction: (ctx, input) =>
        removeReaction({ storage: options.storage, eventBus }, ctx, input),

      updatePresence: (ctx, input) =>
        updatePresence({ eventBus }, ctx, input),

      addMember: (ctx, input) =>
        addMember({ storage: options.storage, policy, eventBus }, ctx, input),

      removeMember: (ctx, input) =>
        removeMember({ storage: options.storage, policy, eventBus }, ctx, input),

      muteMember: (ctx, input) =>
        muteMember({ storage: options.storage, policy, eventBus }, ctx, input),

      unmuteMember: (ctx, input) =>
        unmuteMember({ storage: options.storage, policy, eventBus }, ctx, input)
    },

    queries: {
      listMessages: (ctx, input) =>
        listMessages({ storage: options.storage }, ctx, input),

      listRoomsForUser: (ctx, input) =>
        listRoomsForUser({ storage: options.storage }, ctx, input),

      getRoom: (ctx, roomId) =>
        getRoom({ storage: options.storage }, ctx, roomId),

      getMessage: (ctx, messageId) =>
        getMessage({ storage: options.storage }, ctx, messageId),

      listMembers: (ctx, roomId) =>
        listMembers({ storage: options.storage }, ctx, roomId),

      listReactions: (ctx, messageId) =>
        listReactions({ storage: options.storage }, ctx, messageId),

      searchMessages: (ctx, input) =>
        searchMessages({ search: options.search! }, ctx, input)
    }
  };
}

export type UseCases = ReturnType<typeof createUseCases>;
