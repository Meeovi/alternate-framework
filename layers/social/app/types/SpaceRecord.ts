import { z as zod } from 'zod'

export interface SpaceMember {
  user: any
}

export interface SpaceRecord {
  id: string
  name: string
  slug: string
  status?: string
  numberOfMembers?: number
  image?: any
  owner?: any
  members: SpaceMember[]
  posts?: any[]
  products?: any[]
  lists?: any[]
  media?: any[]
  [key: string]: any
}

export function normalizeSpaceRecord(record: any): SpaceRecord | null {
  if (!record) return null

  return {
    id: record.id,
    name: record.name,
    slug: record.slug,
    status: record.status,
    numberOfMembers: record.numberOfMembers,
    image: record.image,
    owner: record.owner,
    members: (record.members || []).map((member: any) => ({
      user: member.user
    })),
    posts: record.posts || [],
    products: record.products || [],
    lists: record.lists || [],
    media: record.media || []
  }
}

export const SpaceRecordSchema = zod.object({
  id: zod.string(),
  name: zod.string(),
  slug: zod.string(),
  status: zod.string().optional(),
  numberOfMembers: zod.number().optional(),
  image: zod.any().optional(),
  owner: zod.any().optional(),
  members: zod.array(
    zod.object({
      user: zod.any()
    })
  ),
  posts: zod.array(zod.any()).optional(),
  products: zod.array(zod.any()).optional(),
  lists: zod.array(zod.any()).optional(),
  media: zod.array(zod.any()).optional()
})
