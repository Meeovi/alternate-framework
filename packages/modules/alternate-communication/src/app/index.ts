import { AlternateCommunicationOptions } from '../config';
import { CommunicationPolicyContext, defaultCommunicationPolicy } from '../domain/policy/CommunicationPolicy';
import { EventBus } from '../events/bus';

// Commands
import { createRoom, CreateRoomInput } from './commands/CreateRoom';
import { sendMessage, SendMessageInput } from './commands/SendMessage';
import { editMessage, EditMessageInput } from './commands/EditMessage';
import { deleteMessage, DeleteMessageInput } from './commands/DeleteMessage';
import { addReaction, AddReactionInput } from './commands/AddReaction';
import { removeReaction, RemoveReactionInput } from './commands/RemoveReaction';
import { updatePresence, UpdatePresenceInput } from './commands/UpdatePresence';
import { addMember, AddMemberInput } from './commands/AddMember';
import { removeMember, RemoveMemberInput } from './commands/RemoveMember';
import { muteMember, MuteMemberInput } from './commands/MuteMember';
import { unmuteMember, UnmuteMemberInput } from './commands/UnmuteMember';

// Queries
import { listMessages, ListMessagesInput } from './queries/ListMessages';
import { listRoomsForUser, ListRoomsForUserInput } from './queries/ListRoomsForUser';
import { getRoom } from './queries/GetRoom';
import { getMessage } from './queries/GetMessage';
import { listMembers } from './queries/ListMembers';
import { listReactions } from './queries/ListReactions';
import { searchMessages, SearchMessagesInput } from './queries/SearchMessages';

export function createUseCases(options: AlternateCommunicationOptions, eventBus: EventBus) {
  const policy = options.policy ?? defaultCommunicationPolicy;

  return {
    commands: {
      createRoom: (ctx: CommunicationPolicyContext, input: CreateRoomInput) =>
        createRoom({ storage: options.storage, policy, eventBus }, ctx, input),

      sendMessage: (ctx: CommunicationPolicyContext, input: SendMessageInput) =>
        sendMessage({ storage: options.storage, policy, eventBus }, ctx, input),

      editMessage: (ctx: CommunicationPolicyContext, input: EditMessageInput) =>
        editMessage({ storage: options.storage, policy, eventBus }, ctx, input),

      deleteMessage: (ctx: CommunicationPolicyContext, input: DeleteMessageInput) =>
        deleteMessage({ storage: options.storage, policy, eventBus }, ctx, input),

      addReaction: (ctx: CommunicationPolicyContext, input: AddReactionInput) =>
        addReaction({ storage: options.storage, eventBus }, ctx, input),

      removeReaction: (ctx: CommunicationPolicyContext, input: RemoveReactionInput) =>
        removeReaction({ storage: options.storage, eventBus }, ctx, input),

      updatePresence: (ctx: CommunicationPolicyContext, input: UpdatePresenceInput) =>
        updatePresence({ eventBus }, ctx, input),

      addMember: (ctx: CommunicationPolicyContext, input: AddMemberInput) =>
        addMember({ storage: options.storage, policy, eventBus }, ctx, input),

      removeMember: (ctx: CommunicationPolicyContext, input: RemoveMemberInput) =>
        removeMember({ storage: options.storage, policy, eventBus }, ctx, input),

      muteMember: (ctx: CommunicationPolicyContext, input: MuteMemberInput) =>
        muteMember({ storage: options.storage, policy, eventBus }, ctx, input),

      unmuteMember: (ctx: CommunicationPolicyContext, input: UnmuteMemberInput) =>
        unmuteMember({ storage: options.storage, policy, eventBus }, ctx, input)
    },

    queries: {
      listMessages: (ctx: CommunicationPolicyContext, input: ListMessagesInput) =>
        listMessages({ storage: options.storage }, ctx, input),

      listRoomsForUser: (ctx: CommunicationPolicyContext, input: ListRoomsForUserInput) =>
        listRoomsForUser({ storage: options.storage }, ctx, input),

      getRoom: (ctx: CommunicationPolicyContext, roomId: string) =>
        getRoom({ storage: options.storage }, ctx, roomId),

      getMessage: (ctx: CommunicationPolicyContext, messageId: string) =>
        getMessage({ storage: options.storage }, ctx, messageId),

      listMembers: (ctx: CommunicationPolicyContext, roomId: string) =>
        listMembers({ storage: options.storage }, ctx, roomId),

      listReactions: (ctx: CommunicationPolicyContext, messageId: string) =>
        listReactions({ storage: options.storage }, ctx, messageId),

      searchMessages: (ctx: CommunicationPolicyContext, input: SearchMessagesInput) =>
        searchMessages({ search: options.search! }, ctx, input)
    }
  };
}

export type UseCases = ReturnType<typeof createUseCases>;
