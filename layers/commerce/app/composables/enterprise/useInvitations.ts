import { getCommerceClient } from '../../utils/client'
import type { SfCompanyContact, SfTeam } from '~/composables/system/models'

export interface InvitationPayload {
  email: string
  companyId: string
  roleId: string
  teamId?: string
  firstName?: string
  lastName?: string
  jobTitle?: string
  message?: string
}

export interface InvitationResult {
  success: boolean
  invitationId?: string
  message?: string
  error?: string
}

export function useInvitations() {
	const client = getCommerceClient()

	async function sendInvitation(payload: InvitationPayload): Promise<InvitationResult> {
		if (client && typeof client.sendInvitation === 'function') {
			return client.sendInvitation(payload) as Promise<InvitationResult>
		}
		return { success: false, error: 'Not implemented' }
	}

	async function getInvitations(companyId: string): Promise<SfCompanyContact[]> {
		if (client && typeof client.getInvitations === 'function') {
			return client.getInvitations(companyId) as Promise<SfCompanyContact[]>
		}
		return []
	}

	async function cancelInvitation(invitationId: string) {
		if (client && typeof client.cancelInvitation === 'function') {
			return client.cancelInvitation(invitationId)
		}
		return { success: false, reason: 'Not implemented' }
	}

	async function resendInvitation(invitationId: string) {
		if (client && typeof client.resendInvitation === 'function') {
			return client.resendInvitation(invitationId)
		}
		return { success: false, reason: 'Not implemented' }
	}

	return {
		sendInvitation,
		getInvitations,
		cancelInvitation,
		resendInvitation,
	}
}

export default useInvitations
