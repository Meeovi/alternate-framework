import { getCommerceClient } from '../../utils/client'

export function useInvitations() {
	const client = getCommerceClient()

	async function sendInvitation(email: string, companyId: string) {
		if (client && typeof client.sendInvitation === 'function') {
			return client.sendInvitation(email, companyId)
		}
		return { success: false, reason: 'Not implemented' }
	}

	return { sendInvitation }
}

export default useInvitations
