import type { ChatProvider, RCMessage, RCRoom } from '../../../types/chat'

export function createMemoryChatProvider(): ChatProvider {
  const rooms: Record<string, RCRoom> = {}
  const messages: Record<string, RCMessage[]> = {}
  const listeners: Record<string, Array<(m: RCMessage) => void>> = {}

  return {
    async connect() {
      // no-op for memory
      return Promise.resolve()
    },
    async listRooms() {
      return Object.values(rooms)
    },
    async createRoom(name: string) {
      const id = `room_${Object.keys(rooms).length + 1}`
      const room: RCRoom = { _id: id, name, createdAt: new Date().toISOString(), t: 'c' }
      rooms[id] = room
      messages[id] = []
      listeners[id] = []
      return room
    },
    async sendMessage(roomId: string, text: string) {
      const msg: RCMessage = { _id: `m_${Date.now()}`, rid: roomId, msg: text, ts: new Date().toISOString(), u: { _id: 'system', username: 'system' } }
      messages[roomId] = messages[roomId] || []
      messages[roomId].push(msg)
      ;(listeners[roomId] || []).forEach((cb) => cb(msg))
      return msg
    },
    async getMessages(roomId: string) {
      return messages[roomId] || []
    },
    async subscribeToRoom(roomId: string, cb: (m: RCMessage) => void) {
      listeners[roomId] = listeners[roomId] || []
      listeners[roomId].push(cb)
      return () => {
        listeners[roomId] = (listeners[roomId] || []).filter((f) => f !== cb)
      }
    },
  }
}
