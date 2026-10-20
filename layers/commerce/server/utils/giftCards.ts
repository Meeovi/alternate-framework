import { CommerceBackendRegistry } from 'alternate-sdk'
import type { BackendGiftCard, CommerceBackendAdapter } from 'alternate-sdk'
import { backendCustomerId } from './productRef'

/**
 * Gift cards ("wishes"), backend-agnostic: every installed commerce backend
 * that sells gift cards (CommerceBackendAdapter.giftCardProducts /
 * receivedGiftCards / purchasedGiftCards — adapter-magento's Ecomteck gift
 * cards via the Meeovi_GiftCards module). A backend that fails is skipped
 * (and logged) rather than failing the page.
 */

export type AppGiftCard = BackendGiftCard & {
  /** The backend's id. */
  source: string
  /** The code with all but the last 4 characters hidden. */
  masked_code: string | null
}

type SessionUser = { id: string, email?: string | null, emailVerified?: boolean | null, [key: string]: unknown }

const backends = (method: keyof CommerceBackendAdapter) =>
  CommerceBackendRegistry.list().filter((b) => b.id !== 'directus' && b.isEnabled() && typeof b[method] === 'function')

async function settle<T>(label: string, sources: Promise<T[]>[]): Promise<T[]> {
  const out: T[] = []
  for (const result of await Promise.allSettled(sources)) {
    if (result.status === 'fulfilled') out.push(...result.value)
    else console.error(`[gift-cards] ${label}: a backend failed`, result.reason)
  }
  return out
}

export const maskCode = (code: string | null) =>
  code ? `${'•'.repeat(Math.max(4, code.length - 4))}${code.slice(-4)}` : null

const newestFirst = (a: BackendGiftCard, b: BackendGiftCard) => String(b.created_at ?? '').localeCompare(String(a.created_at ?? ''))

/** Gift card products from every backend that sells them (public). */
export function giftCardProducts(): Promise<any[]> {
  return settle('products', backends('giftCardProducts').map((b) => b.giftCardProducts!()))
}

/**
 * The signed-in user's gift cards: `received` (sent to their verified
 * email; full codes, they're theirs to spend) and `purchased` (on their
 * orders; the code is masked when the card went to someone else).
 */
export async function giftCardsFor(user: SessionUser): Promise<{ received: AppGiftCard[], purchased: AppGiftCard[] }> {
  const email = user.emailVerified && typeof user.email === 'string' ? user.email.trim().toLowerCase() : ''

  const received = email
    ? settle('received', backends('receivedGiftCards').map((b) =>
        b.receivedGiftCards!(email).then((cards) => cards.map((c) => ({ ...c, source: b.id, masked_code: maskCode(c.code) })))))
    : Promise.resolve([])

  const purchased = settle('purchased', backends('purchasedGiftCards').flatMap((b) => {
    const customerId = backendCustomerId(b.id, user)
    if (!customerId) return []
    return [b.purchasedGiftCards!(customerId).then((cards) => cards.map((c) => {
      const forSomeoneElse = !!c.recipient_email && c.recipient_email.trim().toLowerCase() !== email
      return { ...c, code: forSomeoneElse ? null : c.code, source: b.id, masked_code: maskCode(c.code) }
    }))]
  }))

  const [r, p] = await Promise.all([received, purchased])
  return { received: r.sort(newestFirst), purchased: p.sort(newestFirst) }
}
