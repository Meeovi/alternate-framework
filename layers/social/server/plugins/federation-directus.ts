// Registers the "directus" federation network (server/utils/federation-directus.ts):
// this site's members and posts, next to the AT Protocol and ActivityPub
// plugins. SOCIAL_FEDERATION_DIRECTUS=false leaves it out.
import { and, eq, inArray, isNull, or } from 'drizzle-orm'
import { createDirectus, readItems, rest, serverPing, staticToken } from '@directus/sdk'
import { db } from '#auth/server/utils/drizzle'
import { users } from '#auth/server/database/migrations/schema'
import { registerFederationNetwork } from '../utils/federation'
import { createDirectusNetwork, type MemberRow } from '../utils/federation-directus'

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

  registerFederationNetwork(createDirectusNetwork({
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
  }))
})
