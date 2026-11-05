// Registers the "directus" federation network (server/utils/federation-directus.ts):
// this site's members and posts, next to the AT Protocol and ActivityPub
// plugins. SOCIAL_FEDERATION_DIRECTUS=false leaves it out.
import { and, eq, inArray, isNull, or } from 'drizzle-orm'
import { createDirectus, createItem, deleteItem, readItems, rest, serverPing, staticToken, updateItem } from '@directus/sdk'
import { db } from '#auth/server/utils/drizzle'
import { users } from '#auth/server/database/migrations/schema'
import { registerFederationNetwork } from '../utils/federation'
import { createDirectusNetwork, DIRECTUS_NETWORK, type MemberRow } from '../utils/federation-directus'
import { createDirectusMemberSession } from '../utils/federation-directus-member'
import { backendProductSnapshot } from '../utils/backendProducts'

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

const columns = { id: users.id, name: users.name, username: users.username, image: users.image }
const visible = and(isNull(users.deletedAt), or(isNull(users.authBanned), eq(users.authBanned, false)))

export default defineNitroPlugin(() => {
  if (process.env.SOCIAL_FEDERATION_DIRECTUS === 'false') return
  const config = useRuntimeConfig() as Record<string, any>
  const service = String(process.env.DIRECTUS_URL || config.public?.directus?.url || '').replace(/\/+$/, '')
  const token = process.env.NUXTUS_DIRECTUS_STATIC_TOKEN || config.directus?.token
  if (!service || !token) return

  const directus = createDirectus(service).with(rest()).with(staticToken(token))

  const network = createDirectusNetwork({
    service,
    siteUrl: process.env.NUXT_PUBLIC_SITE_URL,
    readItems: (collection, query) => directus.request(readItems(collection as any, query as any)) as Promise<Record<string, any>[]>,
    ping: async () => { await directus.request(serverPing()) },
    async findMember(idOrUsername) {
      const match = UUID.test(idOrUsername) ? eq(users.id, idOrUsername) : eq(users.username, idOrUsername.toLowerCase())
      const [member] = await db.select(columns).from(users).where(and(match, visible)).limit(1)
      return (member as MemberRow | undefined) ?? null
    },
    async findMembers(ids) {
      const valid = ids.filter((id) => UUID.test(id)).slice(0, 100)
      if (!valid.length) return []
      return await db.select(columns).from(users).where(and(inArray(users.id, valid), visible)) as MemberRow[]
    },
  })

  // Every member has a session here: their own lists (and, as the social
  // layer moves onto the federation, the rest of what they do on Meeovi).
  network.forMember = async (member) => {
    if (!UUID.test(member.id)) return null
    const [row] = await db.select(columns).from(users).where(and(eq(users.id, member.id), visible)).limit(1)
    if (!row) return null
    return createDirectusMemberSession({
      service,
      readItems: (collection, query) => directus.request(readItems(collection as any, query as any)) as Promise<Record<string, any>[]>,
      createItem: (collection, item) => directus.request(createItem(collection as any, item as any)) as Promise<Record<string, any>>,
      updateItem: (collection, id, item) => directus.request(updateItem(collection as any, id as any, item as any)) as Promise<Record<string, any>>,
      deleteItem: async (collection, id) => { await directus.request(deleteItem(collection as any, id as any)) },
      backendProductSnapshot: (backendId, key) => backendProductSnapshot(backendId, key) as Promise<Record<string, any> | null>,
    }, {
      id: row.id,
      network: DIRECTUS_NETWORK,
      handle: row.username || row.id,
      displayName: row.name || row.username || undefined,
      avatar: row.image || undefined,
    })
  }

  registerFederationNetwork(network)
})
