import { toPlainText } from '../federation-directus'
import { SITE_IDENTIFIER, isPublicStatus, listIdentifier, memberIdentifier, parseIdentifier, shopIdentifier, sitePaths, siteLink, spaceIdentifier, type ActorKind } from './config'
import { imageUrl, read } from './content'
import { federatedMember, readApSettings } from './store'

/**
 * Who a Meeovi fediverse account is, from its identifier or handle. An
 * account exists only while its owner allows it: a member who turned it on,
 * a seller's shop they turned on, a public space with federation enabled,
 * a public list whose owner turned it on, and the site itself.
 */
export type ActorInfo = {
  kind: ActorKind
  identifier: string
  handle: string
  name: string
  summary: string
  url: string
  icon: string | null
  image: string | null
  published: string | null
  /** The member behind it (member, shop and list accounts). */
  ownerId: string | null
  /** Directus id for spaces and lists. */
  key: string
}

const hasRole = (role: string | null | undefined, wanted: string) => String(role || '').split(',').map((r) => r.trim()).includes(wanted)

async function profileOf(userId: string): Promise<{ description: string | null, avatar: string | null }> {
  const [row] = await read('profiles', { fields: ['description', 'avatar'], filter: { id: { _eq: userId } }, limit: 1 }).catch(() => [])
  return { description: row?.description ?? null, avatar: typeof row?.avatar === 'string' && row.avatar.startsWith('https://') ? row.avatar : null }
}

export async function memberActor(userId: string): Promise<ActorInfo | null> {
  const member = await federatedMember({ id: userId })
  if (!member) return null
  const profile = await profileOf(member.id)
  return {
    kind: 'member',
    identifier: memberIdentifier(member.id),
    handle: member.username,
    name: member.name || member.username,
    summary: toPlainText(profile.description).slice(0, 500),
    url: siteLink(sitePaths.profile(member.username)),
    icon: member.image?.startsWith('https://') ? member.image : profile.avatar,
    image: null,
    published: member.createdAt?.toISOString() ?? null,
    ownerId: member.id,
    key: member.id,
  }
}

export async function shopActor(username: string): Promise<ActorInfo | null> {
  const member = await federatedMember({ username })
  if (!member || !member.shop || !hasRole(member.role, 'seller')) return null
  const [latest] = await read('products', {
    fields: ['seller_name'], filter: { _and: [{ seller_username: { _eq: member.username } }, { status: { _eq: 'published' } }] },
    sort: ['-created_at'], limit: 1,
  }).catch(() => [])
  const shopName = String(latest?.seller_name || `${member.name || member.username}'s shop`)
  return {
    kind: 'shop',
    identifier: shopIdentifier(member.username),
    handle: shopIdentifier(member.username),
    name: shopName,
    summary: `New products from ${shopName} on Meeovi.`,
    url: siteLink(`${sitePaths.profile(member.username)}?tab=shop`),
    icon: member.image?.startsWith('https://') ? member.image : null,
    image: null,
    published: member.createdAt?.toISOString() ?? null,
    ownerId: member.id,
    key: member.username,
  }
}

export function siteActor(): ActorInfo {
  return {
    kind: 'site',
    identifier: SITE_IDENTIFIER,
    handle: SITE_IDENTIFIER,
    name: 'Meeovi',
    summary: 'The latest products from the Meeovi community, the decentralized social shopping network.',
    url: siteLink('/'),
    icon: siteLink('/icons/icon-512x512.png'),
    image: null,
    published: '2026-11-01T00:00:00Z',
    ownerId: null,
    key: SITE_IDENTIFIER,
  }
}

const SPACE_FIELDS = ['id', 'slug', 'name', 'description', 'status', 'federation_enabled', 'invite_only', 'image', 'image_url', 'cover_image', 'cover_image_url', 'owner', 'date_created']

const spaceInfo = (space: Record<string, any>): ActorInfo | null => {
  if (!isPublicStatus(space.status) || space.federation_enabled !== true || space.invite_only === true) return null
  return {
    kind: 'space',
    identifier: spaceIdentifier(space.id),
    handle: `space-${space.slug && /^[a-z0-9_.-]{1,60}$/i.test(space.slug) ? String(space.slug).toLowerCase() : space.id}`,
    name: String(space.name || 'A Meeovi space'),
    summary: toPlainText(space.description).slice(0, 500),
    url: siteLink(sitePaths.space(space as any)),
    icon: imageUrl({ image_url: space.image_url, image: space.image }),
    image: imageUrl({ image_url: space.cover_image_url, image: space.cover_image }),
    published: space.date_created ?? null,
    ownerId: typeof space.owner === 'string' ? space.owner : null,
    key: String(space.id),
  }
}

export async function spaceActor(by: { id?: string, slug?: string }): Promise<ActorInfo | null> {
  const filter = by.id ? { id: { _eq: by.id } } : { slug: { _eq: by.slug } }
  const [space] = await read('spaces', { fields: SPACE_FIELDS, filter, limit: 1 }).catch(() => [])
  return space ? spaceInfo(space) : null
}

export async function listActor(id: string): Promise<ActorInfo | null> {
  const [list] = await read('lists', {
    fields: ['id', 'slug', 'name', 'description', 'status', 'image', 'date_created', 'user.user_id'], filter: { id: { _eq: id } }, limit: 1,
  }).catch(() => [])
  if (!list || !isPublicStatus(list.status)) return null
  const ownerId = list.user?.[0]?.user_id
  if (typeof ownerId !== 'string' || !(await readApSettings(ownerId)).enabled) return null
  const owner = await federatedMember({ id: ownerId })
  if (!owner) return null
  return {
    kind: 'list',
    identifier: listIdentifier(list.id),
    handle: listIdentifier(list.id),
    name: String(list.name || 'A Meeovi list'),
    summary: `${toPlainText(list.description).slice(0, 400)}${list.description ? ' ' : ''}A list by @${owner.username} on Meeovi.`.trim(),
    url: siteLink(sitePaths.list(list as any)),
    icon: imageUrl(list),
    image: null,
    published: list.date_created ?? null,
    ownerId,
    key: String(list.id),
  }
}

/** The account behind an identifier ('u-…', 'shop-…', 'meeovi', 'space-…', 'list-…'), if it exists. */
export async function actorByIdentifier(identifier: string): Promise<ActorInfo | null> {
  const parsed = parseIdentifier(identifier)
  if (!parsed) return null
  switch (parsed.kind) {
    case 'member': return memberActor(parsed.key)
    case 'shop': return shopActor(parsed.key)
    case 'site': return siteActor()
    case 'space': return spaceActor({ id: parsed.key })
    case 'list': return listActor(parsed.key)
  }
}

/** WebFinger: '@name@meeovi.com' → its identifier. */
export async function identifierForHandle(handle: string): Promise<string | null> {
  const h = handle.toLowerCase()
  if (h === SITE_IDENTIFIER) return SITE_IDENTIFIER
  if (h.startsWith('shop-')) return (await shopActor(h.slice(5)))?.identifier ?? null
  if (h.startsWith('list-')) return /^\d+$/.test(h.slice(5)) ? (await listActor(h.slice(5)))?.identifier ?? null : null
  if (h.startsWith('space-')) {
    const key = h.slice(6)
    return (await spaceActor({ slug: key }) ?? (/^\d+$/.test(key) ? await spaceActor({ id: key }) : null))?.identifier ?? null
  }
  if (!/^[a-z0-9_.]{1,64}$/.test(h)) return null
  const member = await federatedMember({ username: h })
  return member ? memberIdentifier(member.id) : null
}
