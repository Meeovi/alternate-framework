import { getCommerceClient } from '../../utils/client'
import type { CommerceClient } from '../../utils/client'
import type { SfCompanyCredit } from '~/composables/system/models'

export function useCompanyCredits() {
  const client = getCommerceClient() as CommerceClient

  async function getCompanyCredits(companyId: string): Promise<SfCompanyCredit | null> {
    return client.getCompanyCredits(companyId)
  }

  async function updateCreditBalance(companyId: string, amount: number) {
    return client.updateCreditBalance({ companyId, amount })
  }

  return {
    getCompanyCredits,
    updateCreditBalance,
  }
}

export default useCompanyCredits
