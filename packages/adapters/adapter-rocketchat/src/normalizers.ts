import type { RCUser, RCRoom, RCMessage } from './types'

export function normalizeUser(apiUser: any): RCUser {
  return {
    _id: apiUser._id || apiUser.id || apiUser.userId,
    username: apiUser.username || apiUser.name,
    name: apiUser.name,
    status: apiUser.status,
    statusText: apiUser.statusText,
    roles: apiUser.roles,
    active: apiUser.active ?? true,
  }
}

export function normalizeRoom(apiRoom: any): RCRoom {
  return {
    _id: apiRoom._id || apiRoom.rid || apiRoom.id,
    name: apiRoom.name || apiRoom.fname || apiRoom._id,
    fname: apiRoom.fname,
    t: apiRoom.t,
    msgs: apiRoom.msgs ?? apiRoom.messagesCount,
    createdAt: apiRoom.ts || apiRoom.createdAt,
    broadcast: apiRoom.broadcast ?? false,
  }
}

export function normalizeMessage(apiMsg: any): RCMessage {
  return {
    _id: apiMsg._id || apiMsg.id,
    rid: apiMsg.rid || apiMsg.roomId,
    msg: apiMsg.msg || apiMsg.msg || apiMsg.message || '',
    ts: apiMsg.ts || apiMsg.timestamp,
    u: apiMsg.u || apiMsg.user || (apiMsg.u && { _id: apiMsg.u._id }),
    editedAt: apiMsg.editedAt,
    editedBy: apiMsg.editedBy,
    reactions: apiMsg.reactions,
    attachments: apiMsg.attachments,
  }
}
