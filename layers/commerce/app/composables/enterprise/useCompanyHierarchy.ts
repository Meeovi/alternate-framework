import { getCommerceClient } from '../../utils/client'
import type { CommerceClient } from '../../utils/client'
import type { SfTeam } from '~/composables/system/models'

export function useCompanyHierarchy() {
  const client = getCommerceClient() as CommerceClient

  async function getCompanyHierarchy(companyId: string): Promise<{
    teams: SfTeam[]
    members: Array<{
      id: string
      name: string
      email: string
      role: string
      teamId?: string
    }>
  }> {
    return client.getCompanyHierarchy(companyId)
  }

  async function getTeams(companyId: string): Promise<SfTeam[]> {
    return client.getTeams(companyId)
  }

  return {
    getCompanyHierarchy,
    getTeams,
  }
}

export default useCompanyHierarchy
