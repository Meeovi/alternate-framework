import { createEnterpriseResource } from './useEnterpriseResource'
import { getCommerceClient } from '../../utils/client'
import type { CommerceClient } from '../../utils/client'
import type { SfTeam } from '~/composables/system/models'

export function useCompanyHierarchy() {
  const client = getCommerceClient() as CommerceClient
  return createEnterpriseResource({
    getCompanyHierarchy: (c, companyId: string) => c.getCompanyHierarchy(companyId),
    getTeams: (c, companyId: string) => c.getTeams(companyId),
  } as Record<string, (client: CommerceClient, ...args: any[]) => Promise<any>>)
}
export default useCompanyHierarchy
