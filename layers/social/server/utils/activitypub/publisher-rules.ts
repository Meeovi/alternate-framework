import { SITE_IDENTIFIER, shopIdentifier } from './config'
import { shopActor } from './actors'

/**
 * Who posts a product on the fediverse: the seller's shop account when they
 * turned it on (and the site account boosts it), otherwise the site
 * account itself.
 */
export async function productPublisher(product: { seller_username?: string | null }): Promise<{ author: string, boostedBySite: boolean }> {
  const seller = typeof product.seller_username === 'string' ? product.seller_username.trim().toLowerCase() : ''
  if (seller && (await shopActor(seller))) return { author: shopIdentifier(seller), boostedBySite: true }
  return { author: SITE_IDENTIFIER, boostedBySite: false }
}
