import { createError, defineEventHandler, readBody } from 'h3'
import { z } from 'zod'
import { requireAuth } from '#auth/server/utils/sessions'
import federation from '../../../federation'
import { federationEnabled, memberIdentifier, shopIdentifier } from '../../../utils/activitypub/config'
import { retireActor } from '../../../utils/activitypub/publisher'
import { forgetActor, readApSettings, writeApSettings } from '../../../utils/activitypub/store'
import settings from './settings.get'

/**
 * PUT /api/social/activitypub/settings — { enabled, shop }: the member's
 * profile and public notes (and, for sellers, their shop) on the fediverse.
 * Turning one on starts from now (older notes aren't sent); turning it off
 * tells its followers the account is gone and forgets them.
 */
const Body = z.object({ enabled: z.boolean(), shop: z.boolean().optional() })

export default defineEventHandler(async (event) => {
  const user = await requireAuth(event) as { id: string, username?: string | null, role?: string | null }
  const parsed = Body.safeParse(await readBody(event).catch(() => null))
  if (!parsed.success) throw createError({ statusCode: 400, statusMessage: 'Invalid settings' })
  const username = String(user.username || '').toLowerCase()
  if (parsed.data.enabled && !username) throw createError({ statusCode: 409, statusMessage: 'Choose a username first: it becomes your fediverse handle.' })
  const seller = String(user.role || '').split(',').map((r) => r.trim()).includes('seller')

  const before = await readApSettings(user.id)
  const enabled = parsed.data.enabled
  // The shop needs the profile switch on too (it's the same member).
  const shop = enabled && seller && (parsed.data.shop ?? before.shop)
  const since = enabled ? (before.enabled ? before.since ?? new Date().toISOString() : new Date().toISOString()) : null
  await writeApSettings(user.id, { enabled, shop, since })

  if (federationEnabled()) {
    const retire = async (identifier: string) => {
      await retireActor(federation, identifier).catch((error) => console.warn('[activitypub] retire', identifier, (error as Error)?.message || error))
      await forgetActor(identifier)
    }
    if (before.enabled && !enabled) await retire(memberIdentifier(user.id))
    if (before.shop && !shop && username) await retire(shopIdentifier(username))
  }
  return settings(event)
})
