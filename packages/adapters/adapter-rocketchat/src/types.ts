export interface RCUser {
  _id: string
  username?: string
  name?: string
  status?: 'online' | 'offline' | 'away' | 'busy'
  statusText?: string
  roles?: string[]
  active?: boolean
}

export interface RCRoom {
  _id: string
  name?: string
  fname?: string
  t?: 'c' | 'p' | 'd'
  msgs?: number
  createdAt?: string
  broadcast?: boolean
}

export interface Attachment {
  id?: string
  title?: string
  description?: string
  image_url?: string
  title_link?: string
  type?: string
}

export interface RCMessage {
  _id?: string
  rid?: string
  msg: string
  ts?: string
  u?: { _id: string; username?: string; name?: string }
  editedAt?: string
  editedBy?: { _id: string }
  reactions?: Record<string, { usernames: string[] }>
  attachments?: Attachment[]
}

export interface Subscription {
  _id?: string
  rid?: string
  name?: string
  open?: boolean
  alert?: boolean
  favorite?: boolean
  unread?: number
}

export interface ChatProvider {
  connect?: (opts?: any) => Promise<void>
  login?: (usernameOrEmail: string, password: string) => Promise<any>
  logout?: () => Promise<void>
  getUsers?: (query?: any) => Promise<RCUser[]>
  getUser?: (idOrUsername: string) => Promise<RCUser | null>
  listRooms?: (query?: any) => Promise<RCRoom[]>
  getRoom?: (roomId: string) => Promise<RCRoom | null>
  createRoom?: (name: string, opts?: any) => Promise<RCRoom>
  createDirectMessage?: (userId: string) => Promise<RCRoom>
  inviteUser?: (roomId: string, userId: string) => Promise<void>
  leaveRoom?: (roomId: string) => Promise<void>
  getMessages?: (roomId: string, params?: { count?: number; offset?: number }) => Promise<RCMessage[]>
  sendMessage?: (roomId: string, text: string, attachments?: Attachment[]) => Promise<RCMessage>
  updateMessage?: (messageId: string, text: string) => Promise<RCMessage>
  deleteMessage?: (messageId: string) => Promise<void>
  reactToMessage?: (messageId: string, reaction: string) => Promise<void>
  getSubscriptions?: () => Promise<Subscription[]>
  subscribeToRoom?: (roomId: string, cb: (message: RCMessage) => void) => Promise<() => void>
  onEvent?: (eventName: string, handler: (payload: any) => void) => void
  uploadFile?: (roomId: string, file: unknown) => Promise<any>
}
