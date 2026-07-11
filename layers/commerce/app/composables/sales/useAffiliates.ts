import { getCommerceClient } from '../../utils/client'
import type { CommerceClient } from '../../utils/client'

export function useAffiliates() {
  const client = getCommerceClient() as CommerceClient

  async function listAffiliates(opts: Record<string, unknown> = {}) {
    return client.listAffiliates(opts)
  }

  async function getAffiliateSummary(affiliateId: string) {
    return client.getAffiliateSummary(affiliateId)
  }

  async function trackReferral(payload: Record<string, unknown>) {
    return client.trackReferral(payload)
  }

  return {
    listAffiliates,
    getAffiliateSummary,
    trackReferral,
  }
}

export default useAffiliates
