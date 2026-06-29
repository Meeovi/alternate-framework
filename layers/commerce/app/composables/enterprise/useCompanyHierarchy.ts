import { getCommerceClient } from '../../utils/client'
import type { SfTeam } from '~/composables/system/models'

export function useCompanyHierarchy() {
	const client = getCommerceClient()

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
		if (client && typeof client.getCompanyHierarchy === 'function') {
			return client.getCompanyHierarchy(companyId)
		}
		return { teams: [], members: [] }
	}

	async function getTeams(companyId: string): Promise<SfTeam[]> {
		if (client && typeof client.getTeams === 'function') {
			return client.getTeams(companyId) as Promise<SfTeam[]>
		}
		return []
	}

	return {
		getCompanyHierarchy,
		getTeams,
	}
}

export default useCompanyHierarchy
