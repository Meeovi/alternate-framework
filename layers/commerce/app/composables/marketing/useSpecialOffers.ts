import { getCommerceClient } from '../../utils/client'
import type { CommerceClient } from '../../utils/client'

export function useSpecialOffers() {
  const client = getCommerceClient() as CommerceClient

  async function listSpecialOffers(opts: Record<string, unknown> = {}) {
    return client.listSpecialOffers(opts)
  }

  async function getSpecialOfferById(id: string) {
    return client.getSpecialOffer(id)
  }

  return {
    listSpecialOffers,
    getSpecialOfferById,
  }
}

export default useSpecialOffers
