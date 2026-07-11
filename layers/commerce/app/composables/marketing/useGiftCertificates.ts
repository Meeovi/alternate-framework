import { getCommerceClient } from '../../utils/client'
import type { CommerceClient } from '../../utils/client'

export function useGiftCertificates() {
  const client = getCommerceClient() as CommerceClient

  async function listGiftCertificates(opts: Record<string, unknown> = {}) {
    return client.listGiftCertificates(opts)
  }

  async function applyGiftCertificate(code: string, cartId?: string) {
    return client.applyGiftCertificate({ code, cartId })
  }

  return {
    listGiftCertificates,
    applyGiftCertificate,
  }
}

export default useGiftCertificates
