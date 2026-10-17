import { CommerceBackendRegistry } from 'alternate-sdk'

export type BackendProductSnapshot = {
  /** The product's id in its backend (Magento uid): ratings and wishlists key on it. */
  backend_id: string | null
  name: string
  image: string | null
  price: number | null
  currency: string | null
}

/**
 * What a list shows for a commerce-backend product, read from the backend
 * that owns it (registered in CommerceBackendRegistry by its adapter).
 * Null when that backend isn't installed or has no such product — so only
 * real products can be saved.
 */
export async function backendProductSnapshot(backendId: string, key: string): Promise<BackendProductSnapshot | null> {
  const backend = CommerceBackendRegistry.get(backendId)
  if (!backend?.isEnabled()) return null
  const product = await backend.request({ method: 'GET', collection: 'products', key }).catch(() => null) as Record<string, any> | null
  if (!product) return null
  const price = Number(product.price)
  return {
    backend_id: product.id != null ? String(product.id).slice(0, 64) : null,
    name: String(product.name || key).slice(0, 255),
    image: typeof product.image === 'string' && /^https?:\/\//.test(product.image) ? product.image.slice(0, 1024) : null,
    price: Number.isFinite(price) ? price : null,
    currency: typeof product.currency === 'string' ? product.currency.slice(0, 8) : null,
  }
}
