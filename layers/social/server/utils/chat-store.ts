// Server-side in-memory DM store — module-level state, so it's shared by
// every client hitting this Nitro process (unlike the pre-existing
// createMemoryChatProvider(), which was designed for client-side use;
// registering that in a browser plugin would have given each browser tab
// its own isolated, disconnected copy of "rooms"/"messages", meaning two
// different users could never actually see each other's messages at all —
// the opposite of what DMs need). This still resets on every server
// restart and isn't shared across multiple server instances in a scaled
// deployment — a real persistent backend (e.g. Directus collections) is
// what this should be swapped for; this makes two real users able to
// actually exchange messages within a single server's uptime, rather than
// the feature being entirely non-functional.

export interface ChatRoom {
  id: string
  memberIds: string[]
  createdAt: string
}

export interface ChatMessage {
  id: string
  roomId: string
  userId: string
  username: string
  text: string
  createdAt: string
}

const rooms = new Map<string, ChatRoom>()
const messages = new Map<string, ChatMessage[]>()

export function listRoomsForUser(userId: string): ChatRoom[] {
  return Array.from(rooms.values()).filter((r) => r.memberIds.includes(userId))
}

export function findDirectRoom(userId: string, otherUserId: string): ChatRoom | undefined {
  return Array.from(rooms.values()).find(
    (r) => r.memberIds.length === 2 && r.memberIds.includes(userId) && r.memberIds.includes(otherUserId),
  )
}

export function createRoom(memberIds: string[]): ChatRoom {
  const room: ChatRoom = { id: `room_${rooms.size + 1}_${Date.now()}`, memberIds, createdAt: new Date().toISOString() }
  rooms.set(room.id, room)
  messages.set(room.id, [])
  return room
}

export function getRoom(roomId: string): ChatRoom | undefined {
  return rooms.get(roomId)
}

export function getMessages(roomId: string): ChatMessage[] {
  return messages.get(roomId) || []
}

export function addMessage(roomId: string, userId: string, username: string, text: string): ChatMessage {
  const message: ChatMessage = {
    id: `msg_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    roomId,
    userId,
    username,
    text,
    createdAt: new Date().toISOString(),
  }
  const list = messages.get(roomId) || []
  list.push(message)
  messages.set(roomId, list)
  return message
}
