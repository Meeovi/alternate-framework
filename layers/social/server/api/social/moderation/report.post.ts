import { createError, defineEventHandler, readBody } from 'h3'
import { z } from 'zod'
import { createDirectus, createItem, readItems, rest, staticToken } from '@directus/sdk'
import { requireAuth } from '#auth/server/utils/sessions'
import { requireCapability, useFederationNetwork, withNetworkTimeout } from '../../../utils/federation'

/**
 * POST /api/social/moderation/report — the one way members report content.
 * Every report is stored in the Directus `report` collection: the reason as
 * the title, the member's details as the content, plus network,
 * content_type, content_id and reporter_email filled in here (never taken
 * from the browser), and a link to the item where Directus has one
 * (report_posts, report_products, report_spaces, report_comments).
 * Admins review them in the workspace (reports → manage feedback).
 *
 * Bluesky content (network 'atproto') is also filed in Meeovi's Ozone
 * (ozone.meeovicms.com), where moderators can label or take it down; the
 * labels then apply across Meeovi (meeovi-atproto runtime/moderation.ts).
 *
 * Body: { network: 'meeovi' | 'atproto' | …, subject: { kind, id },
 *         reasonType: 'spam' | 'violation' | 'misleading' | 'sexual' | 'rude' | 'other',
 *         details? }
 * Meeovi kinds: note, product, space, comment (id = the Directus id; a
 * store product may be `magento:<sku>`).
 * Bluesky kinds: note (at:// URI), account (DID).
 * Behind Turnstile (shared/formProtection.ts); at most 20 reports an hour
 * per member.
 */

const Body = z.object({
  network: z.string().regex(/^[a-z][a-z0-9-]{1,31}$/),
  subject: z.object({
    kind: z.enum(['note', 'account', 'product', 'space', 'comment']),
    id: z.string().min(1).max(512),
  }),
  reasonType: z.enum(['spam', 'violation', 'misleading', 'sexual', 'rude', 'other']),
  details: z.string().trim().max(1500).optional(),
})

const REASON_TITLES: Record<string, string> = {
  spam: 'Spam or unwanted promotion',
  misleading: 'Misleading, a scam or impersonation',
  sexual: 'Unlabelled adult content',
  rude: 'Harassment, hate or abuse',
  violation: 'Illegal or against the rules',
  other: 'Something else',
}

/** Meeovi content: the Directus collection it lives in and the report's link field. */
const MEEOVI_KINDS: Record<string, { collection: string, link: string, linkKey: string }> = {
  note: { collection: 'posts', link: 'posts', linkKey: 'posts_id' },
  product: { collection: 'products', link: 'products', linkKey: 'products_id' },
  space: { collection: 'spaces', link: 'spaces', linkKey: 'spaces_id' },
  comment: { collection: 'comments', link: 'comments', linkKey: 'comments_id' },
}

const directus = () => createDirectus(process.env.DIRECTUS_URL!)
  .with(rest())
  .with(staticToken(process.env.NUXTUS_DIRECTUS_STATIC_TOKEN!))

const notFound = () => createError({ statusCode: 404, statusMessage: "That content wasn't found" })

/** Stores the report in Directus; returns the report's id. */
async function storeReport(input: {
  network: string, kind: string, id: string, reasonType: string, details?: string, email: string,
}): Promise<string> {
  const client = directus()
  const row: Record<string, unknown> = {
    title: `${input.kind[0]!.toUpperCase()}${input.kind.slice(1)} reported: ${REASON_TITLES[input.reasonType] ?? input.reasonType}`,
    content: input.details || null,
    network: input.network,
    content_type: input.kind,
    content_id: input.id,
    reporter_email: input.email,
  }
  if (input.network === 'meeovi') {
    const target = MEEOVI_KINDS[input.kind]
    if (!target) throw notFound()
    // A store product (`magento:<sku>`, app/utils/productKey.ts) is linked
    // through its Directus mirror when it has one; the key is kept either way.
    const store = input.kind === 'product' ? /^magento:([\w.\-]{1,64})$/.exec(input.id) : null
    if (!store && !/^[\w-]{1,64}$/.test(input.id)) throw notFound()
    const filter = store ? { mageos_sku: { _eq: store[1] } } : { id: { _eq: input.id } }
    const found = await client.request(readItems(target.collection as never, { filter, fields: ['id'], limit: 1 } as never)) as Array<{ id: string | number }>
    if (found[0]) row[target.link] = [{ [target.linkKey]: found[0].id }]
    else if (!store) throw notFound()
  }
  const created = await client.request(createItem('report' as never, row as never, { fields: ['id'] } as never)) as { id: string | number }
  return String(created.id)
}

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

  const remember = () => {
    times.push(now)
    recent.set(user.id, times)
    if (recent.size > 10_000) for (const [id, list] of recent) if (!list.some((t) => now - t < WINDOW_MS)) recent.delete(id)
  }

  // Bluesky reports also go to Ozone; check the network can take them first.
  const network = networkId === 'meeovi' ? null : useFederationNetwork(networkId)
  const ozone = network ? requireCapability(network, 'report') : null
  if (networkId === 'meeovi' && subject.kind === 'account') throw createError({ statusCode: 400, statusMessage: "That can't be reported here" })
  if (network && !['note', 'account'].includes(subject.kind)) throw createError({ statusCode: 400, statusMessage: 'Only notes and accounts can be reported there' })

  const email = String((user as { email?: string }).email || '')
  let id: string
  try {
    id = await storeReport({ network: networkId, kind: subject.kind, id: subject.id, reasonType, details, email })
  } catch (error: any) {
    if (error?.statusCode) throw error
    console.error('[moderation/report] store', networkId, subject.kind, error?.errors?.[0]?.message || error?.message || error)
    throw createError({ statusCode: 502, statusMessage: "Your report couldn't be sent. Please try again." })
  }
  remember()

  if (network && ozone) {
    // Ozone moderators see which member reported it (the report itself
    // comes from Meeovi's service account). It's already stored in
    // Directus, so a failure here is logged, not shown.
    const username = (user as { username?: string }).username
    const reason = [details, `Reported on Meeovi by member ${user.id}${username ? ` (@${username})` : ''}, Directus report ${id}`]
      .filter(Boolean).join('\n\n')
    try {
      await withNetworkTimeout(ozone({ subject: subject as { kind: 'note' | 'account', id: string }, reasonType, reason }), 15_000)
    } catch (error) {
      console.error('[moderation/report] ozone', networkId, subject.kind, (error as Error)?.message || error)
    }
  }
  return { ok: true, id }
})
