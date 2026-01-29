import { normalizeMessage } from './normalizers'
import type { RCMessage } from './types'

function makeId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
}

export class RocketChatRealtime {
  ws?: WebSocket
  baseUrl: string
  token?: string
  userId?: string
  connected = false
  pending: Array<() => void> = []
  subs: Record<string, (m: RCMessage) => void> = {}
  lastId = 0

  constructor(baseUrl: string, token?: string, userId?: string) {
    this.baseUrl = baseUrl.replace(/\/$/, '')
    this.token = token
    this.userId = userId
  }

  private wsUrl() {
    return this.baseUrl.replace(/^http/, 'ws') + '/websocket'
  }

  connect(): Promise<void> {
    if (this.connected) return Promise.resolve()
    return new Promise((resolve, reject) => {
      try {
        this.ws = new WebSocket(this.wsUrl())
      } catch (err) {
        return reject(err)
      }

      const onOpen = () => {
        // send connect frame
        this.send({ msg: 'connect', version: '1', support: ['1'] })
      }

      const onMessage = (ev: MessageEvent) => {
        try {
          const data = JSON.parse(ev.data as string)
          // handle connected confirmation
          if (data.msg === 'connected') {
            this.connected = true
            // if token provided, attempt resume login
            if (this.token) {
              const id = makeId()
              this.send({ msg: 'method', method: 'login', id, params: [{ resume: this.token }] })
            }
            while (this.pending.length) this.pending.shift()?.()
            resolve()
            return
          }

          // handle publication messages (stream-room-messages)
          if (data.collection === 'stream-room-messages' && data.msg === 'added') {
            const args = data.fields?.args ?? []
            const m = args[0]
            if (m && m._id) {
              const rid = data._id || m.rid || m.roomId
              // call all subs for this room
              Object.values(this.subs).forEach((cb) => cb(normalizeMessage(m)))
            }
          }
        } catch (err) {
          // ignore parse errors
        }
      }

      const onClose = () => {
        this.connected = false
      }

      const onError = (e: any) => {
        // propagate error
        reject(e)
      }

      this.ws.addEventListener('open', onOpen)
      this.ws.addEventListener('message', onMessage)
      this.ws.addEventListener('close', onClose)
      this.ws.addEventListener('error', onError)
    })
  }

  send(payload: any) {
    if (!this.ws) return
    try {
      this.ws.send(JSON.stringify(payload))
    } catch (err) {
      // swallow
    }
  }

  async subscribe(roomId: string, cb: (m: RCMessage) => void) {
    if (!this.connected) {
      await new Promise<void>((res) => this.pending.push(res))
    }
    const id = `sub-${++this.lastId}`
    this.subs[id] = cb
    // send sub frame
    this.send({ msg: 'sub', id, name: 'stream-room-messages', params: [roomId, false] })
    return () => {
      delete this.subs[id]
      this.send({ msg: 'unsub', id })
    }
  }

  disconnect() {
    if (this.ws) this.ws.close()
    this.connected = false
  }
}
