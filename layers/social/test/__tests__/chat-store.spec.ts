import { describe, it, expect } from 'vitest'
import {
  createRoom,
  findDirectRoom,
  listRoomsForUser,
  getRoom,
  getMessages,
  addMessage,
} from '../../server/utils/chat-store'

// chat-store.ts holds module-level state shared across the whole test
// file (matching its real, intentional design — see the file's own
// header comment) — each test below uses its own unique user ids so
// tests can't interfere with each other via shared rooms.
function uniqueUserId(label: string) {
  return `${label}-${Math.random().toString(36).slice(2)}`
}

describe('chat-store', () => {
  it('creates a room and lists it for both members', () => {
    const userA = uniqueUserId('a')
    const userB = uniqueUserId('b')

    const room = createRoom([userA, userB])

    expect(listRoomsForUser(userA)).toContainEqual(room)
    expect(listRoomsForUser(userB)).toContainEqual(room)
  })

  it('does not list a room for someone who is not a member', () => {
    const userA = uniqueUserId('a')
    const userB = uniqueUserId('b')
    const outsider = uniqueUserId('outsider')

    createRoom([userA, userB])

    expect(listRoomsForUser(outsider)).toEqual([])
  })

  it('findDirectRoom finds an existing two-person room regardless of argument order', () => {
    const userA = uniqueUserId('a')
    const userB = uniqueUserId('b')
    const room = createRoom([userA, userB])

    expect(findDirectRoom(userA, userB)?.id).toBe(room.id)
    expect(findDirectRoom(userB, userA)?.id).toBe(room.id)
  })

  it('findDirectRoom returns undefined when no room exists between two users', () => {
    const userA = uniqueUserId('a')
    const userB = uniqueUserId('b')

    expect(findDirectRoom(userA, userB)).toBeUndefined()
  })

  it('getRoom returns undefined for an id that was never created', () => {
    expect(getRoom('room_does_not_exist')).toBeUndefined()
  })

  it('addMessage appends to the room and getMessages returns them in insertion order', () => {
    const userA = uniqueUserId('a')
    const userB = uniqueUserId('b')
    const room = createRoom([userA, userB])

    const first = addMessage(room.id, userA, 'Alice', 'first message')
    const second = addMessage(room.id, userB, 'Bob', 'second message')

    const messages = getMessages(room.id)
    expect(messages).toHaveLength(2)
    expect(messages[0]).toEqual(first)
    expect(messages[1]).toEqual(second)
    expect(messages[0]!.text).toBe('first message')
    expect(messages[1]!.userId).toBe(userB)
  })

  it('getMessages returns an empty array for a room with no messages yet', () => {
    const userA = uniqueUserId('a')
    const userB = uniqueUserId('b')
    const room = createRoom([userA, userB])

    expect(getMessages(room.id)).toEqual([])
  })

  it('a second createRoom call for the same pair produces a distinct room (no implicit dedup at this layer)', () => {
    // Dedup is the caller's responsibility (server/api/social/chat/rooms.post.ts
    // calls findDirectRoom first and only creates if none exists) — the
    // store itself always creates a new room on request.
    const userA = uniqueUserId('a')
    const userB = uniqueUserId('b')

    const first = createRoom([userA, userB])
    const second = createRoom([userA, userB])

    expect(first.id).not.toBe(second.id)
  })
})
