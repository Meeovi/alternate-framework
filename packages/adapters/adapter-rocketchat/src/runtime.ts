import { RocketChatClient } from './client'
import { RocketChatRealtime } from './realtime'
import { normalizeMessage, normalizeRoom, normalizeUser } from './normalizers'
import type { ChatProvider, RCMessage, RCRoom, RCUser } from './types'

export interface RocketChatAdapterOptions {
  baseUrl: string
  token?: string
  userId?: string
}

export function createRocketChatProvider(opts: RocketChatAdapterOptions): ChatProvider {
  const client = new RocketChatClient(opts.baseUrl, opts.token, opts.userId)
  const realtime = new RocketChatRealtime(opts.baseUrl, opts.token, opts.userId)

  return {
    async connect() {
      // noop; token is provided externally or login can be used
      return
    },

    async login(username: string, password: string) {
      const res = await client.login(username, password)
      // caller can persist token
      return res
    },

    async listRooms() {
      const res = await client.request<any>('GET', '/rooms.get')
      const list = (res?.update ?? res?.rooms ?? res) as any[]
      return list.map(normalizeRoom)
    },

    async getRoom(roomId: string) {
      const res = await client.request<any>('GET', `/rooms.info?roomId=${encodeURIComponent(roomId)}`)
      return normalizeRoom(res?.room ?? res)
    },

    async createRoom(name: string) {
      const res = await client.request<any>('POST', '/rooms.create', { name })
      return normalizeRoom(res?.room ?? res)
    },

    async createDirectMessage(userId: string) {
      const res = await client.request<any>('POST', '/im.create', { userId })
      return normalizeRoom(res?.room ?? res)
    },

    async getMessages(roomId: string, params?: { count?: number; offset?: number }) {
      const count = params?.count ?? 50
      const res = await client.request<any>('GET', `/channels.messages?roomId=${encodeURIComponent(roomId)}&count=${count}`)
      const msgs = (res?.messages ?? res) as any[]
      return msgs.map(normalizeMessage)
    },

    async sendMessage(roomId: string, text: string) {
      const res = await client.request<any>('POST', '/chat.postMessage', { roomId, text })
      return normalizeMessage(res?.message ?? res)
    },

    async getUsers(query?: any) {
      const res = await client.request<any>('GET', `/users.list?query=${encodeURIComponent(JSON.stringify(query ?? {}))}`)
      const users = (res?.users ?? res?.items ?? res) as any[]
      return users.map(normalizeUser)
    },

    async getUser(idOrUsername: string) {
      const res = await client.request<any>('GET', `/users.info?userId=${encodeURIComponent(idOrUsername)}`)
      return normalizeUser(res?.user ?? res)
    },

    async subscribeToRoom(roomId: string, cb: (m: RCMessage) => void) {
      try {
        await realtime.connect()
        // start subscription; return unsubscribe function
        const unsub = await realtime.subscribe(roomId, cb)
        return unsub
      } catch (err) {
        console.warn('subscribeToRoom failed', err)
        return () => {}
      }
    },
  }
}
