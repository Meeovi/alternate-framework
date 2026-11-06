import { createError, defineEventHandler, readBody } from 'h3'
import { z } from 'zod'
import { requireAuth } from '#auth/server/utils/sessions'
import { federationError, requireCapability, useFederationNetwork, withNetworkTimeout } from '../../../utils/federation'

/**
 * POST /api/social/moderation/report — a member reports a note or account
 * from Bluesky (or another network that supports reports) to Meeovi's
 * moderators. For Bluesky this files a report in Meeovi's Ozone
 * (ozone.meeovicms.com), where moderators can label or take it down; the
 * labels then apply across Meeovi (meeovi-atproto runtime/moderation.ts).
 *
 * Body: { network: 'atproto', subject: { kind: 'note' | 'account', id },
 *         reasonType: 'spam' | 'violation' | 'misleading' | 'sexual' | 'rude' | 'other',
 *         details? }
 * Behind Turnstile (shared/formProtection.ts); at most 20 reports an hour
 * per member.
 */

const Body = z.object({
  network: z.string().regex(/^[a-z][a-z0-9-]{1,31}$/),
  subject: z.object({
    kind: z.enum(['note', 'account']),
    id: z.string().min(3).max(512),
  }),
  reasonType: z.enum(['spam', 'violation', 'misleading', 'sexual', 'rude', 'other']),
  details: z.string().trim().max(1500).optional(),
})

const LIMIT = 20
const WINDOW_MS = 60 * 60 * 1000
const recent = new Map<string, number[]>()

export default defineEventHandler(async (event) => {
  const user = await requireAuth(event)
  const parsed = Body.safeParse(await readBody(event).catch(() => null))
  if (!parsed.success) throw createError({ statusCode: 400, statusMessage: 'Choose what is wrong with it' })
  const { network: networkId, subject, reasonType, details } = parsed.data

  const now = Date.now()
  const times = (recent.get(user.id) ?? []).filter((t) => now - t < WINDOW_MS)
  if (times.length >= LIMIT) throw createError({ statusCode: 429, statusMessage: "You've sent a lot of reports. Please try again later." })

  const network = useFederationNetwork(networkId)
  const report = requireCapability(network, 'report')
  // Moderators see which member reported it (the report itself comes from
  // Meeovi's service account).
  const reason = [details, `Reported on Meeovi by member ${user.id}${(user as { username?: string }).username ? ` (@${(user as { username?: string }).username})` : ''}`]
    .filter(Boolean).join('\n\n')
  try {
    const result = await withNetworkTimeout(report({ subject, reasonType, reason }), 15_000)
    times.push(now)
    recent.set(user.id, times)
    if (recent.size > 10_000) for (const [id, list] of recent) if (!list.some((t) => now - t < WINDOW_MS)) recent.delete(id)
    return { ok: true, id: result.id }
  } catch (error) {
    console.error('[moderation/report]', networkId, subject.kind, (error as Error)?.message || error)
    federationError(network, error)
  }
})
