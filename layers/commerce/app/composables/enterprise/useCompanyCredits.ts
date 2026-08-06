import { createEnterpriseResource } from './useEnterpriseResource'

export const useCompanyCredits = () =>
  createEnterpriseResource({
    getCompanyCredits: (client, companyId: string) => client.getCompanyCredits(companyId),
    updateCreditBalance: (client, companyId: string, amount: number) =>
      client.updateCreditBalance({ companyId, amount }),
  })
export default useCompanyCredits
