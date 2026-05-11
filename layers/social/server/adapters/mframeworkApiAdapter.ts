import type { SocialServerAdapter } from '../../app/types/social-adapter'
import { prisma } from '@mframework/adapter-prisma'
// note: prisma types may be provided by the workspace root; avoid importing missing types here

const tableFor = (entityType: any) => {
  // single table for follows
  return 'follows'
}

const adapter: SocialServerAdapter = {
  async follow(payload) {
    const { entityType, entityId, userId } = payload
    const table = tableFor(entityType)
    try {
      await (prisma as any)[table].create({ data: { entityType, entityId, userId } })
      return { ok: true }
    } catch (err: any) {
      // ignore unique constraint errors
      return { ok: false, error: err?.message }
    }
  },

  async unfollow(payload) {
    const { entityType, entityId, userId } = payload
    const table = tableFor(entityType)
    try {
      await (prisma as any)[table].deleteMany({ where: { entityType, entityId, userId } })
      return { ok: true }
    } catch (err: any) {
      return { ok: false, error: err?.message }
    }
  },

  async isFollowing(payload) {
    const { entityType, entityId, userId } = payload
    const table = tableFor(entityType)
    try {
      const count = await (prisma as any)[table].count({ where: { entityType, entityId, userId } })
      return { following: count > 0 }
    } catch (err: any) {
      return { following: false }
    }
  },

  async getFollowers({ entityType, entityId, limit = 50, offset = 0 }) {
    const table = tableFor(entityType)
    try {
      const data = await (prisma as any)[table].findMany({
        where: { entityType, entityId },
        skip: offset,
        take: limit,
        select: { userId: true }
      })
      return { total: data.length, data: data.map((d: any) => d.userId) }
    } catch (err: any) {
      return { total: 0, data: [] }
    }
  },

  async getFollowing({ userId, limit = 50, offset = 0 }) {
    try {
      const data = await (prisma as any).follows.findMany({
        where: { userId },
        skip: offset,
        take: limit,
        select: { entityType: true, entityId: true }
      })
      return { total: data.length, data: data.map((d: any) => ({ entityType: d.entityType, entityId: d.entityId })) }
    } catch (err: any) {
      return { total: 0, data: [] }
    }
  },

  // reposts
  async repost(payload) {
    const { postId, userId } = payload
    try {
      await (prisma as any).reposts.create({ data: { postId, userId } })
      return { ok: true }
    } catch (err: any) { return { ok: false, error: err?.message } }
  },

  async unrepost(payload) {
    const { postId, userId } = payload
    try {
      await (prisma as any).reposts.deleteMany({ where: { postId, userId } })
      return { ok: true }
    } catch (err: any) { return { ok: false, error: err?.message } }
  },

  async isReposted(payload) {
    const { postId, userId } = payload
    try {
      const count = await (prisma as any).reposts.count({ where: { postId, userId } })
      return { reposted: count > 0 }
    } catch (err: any) { return { reposted: false } }
  },

  async getReposts({ postId, limit = 50, offset = 0 }) {
    try {
      const data = await (prisma as any).reposts.findMany({ where: { postId }, skip: offset, take: limit, select: { userId: true } })
      return { total: data.length, data: data.map((d: any) => d.userId) }
    } catch (err: any) { return { total: 0, data: [] } }
  }
}

export default adapter
