import { ChatProvider } from '../../types/chat'
import { getChatProvider } from './registry'

export function useMessages(providerName: string) {
  const provider = getChatProvider(providerName)

  async function listRooms() {
    return provider.listRooms?.()
  }

  async function createRoom(name: string) {
    return provider.createRoom?.(name)
  }

  async function sendMessage(roomId: string, text: string) {
    return provider.sendMessage?.(roomId, text)
  }

  async function getMessages(roomId: string) {
    return provider.getMessages?.(roomId)
  }

  async function subscribeToRoom(roomId: string, cb: (m: any) => void) {
    return provider.subscribeToRoom?.(roomId, cb)
  }

  async function connect() {
    return provider.connect?.()
  }

  async function login(usernameOrEmail: string, password: string) {
    return provider.login?.(usernameOrEmail, password)
  }

  async function logout() {
    return provider.logout?.()
  }

  async function getUsers(query?: any) {
    return provider.getUsers?.(query)
  }

  async function getUser(idOrUsername: string) {
    return provider.getUser?.(idOrUsername)
  }

  async function getRoom(roomId: string) {
    return provider.getRoom?.(roomId)
  }

  async function createDirectMessage(userId: string) {
    return provider.createDirectMessage?.(userId)
  }

  async function inviteUser(roomId: string, userId: string) {
    return provider.inviteUser?.(roomId, userId)
  }

  async function leaveRoom(roomId: string) {
    return provider.leaveRoom?.(roomId)
  }

  async function updateMessage(messageId: string, text: string) {
    return provider.updateMessage?.(messageId, text)
  }

  async function deleteMessage(messageId: string) {
    return provider.deleteMessage?.(messageId)
  }

  async function reactToMessage(messageId: string, reaction: string) {
    return provider.reactToMessage?.(messageId, reaction)
  }

  async function getSubscriptions() {
    return provider.getSubscriptions?.()
  }

  return {
    listRooms,
    createRoom,
    sendMessage,
    getMessages,
    subscribeToRoom,
    connect,
    login,
    logout,
    getUsers,
    getUser,
    getRoom,
    createDirectMessage,
    inviteUser,
    leaveRoom,
    updateMessage,
    deleteMessage,
    reactToMessage,
    getSubscriptions,
  }
}

export function useChatProvider(providerName: string) {
  const provider = getChatProvider(providerName)

  async function connect() {
    return provider.connect?.()
  }

  async function login(usernameOrEmail: string, password: string) {
    return provider.login?.(usernameOrEmail, password)
  }

  async function logout() {
    return provider.logout?.()
  }

  return {
    connect,
    login,
    logout,
  }
}