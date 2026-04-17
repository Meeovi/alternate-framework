import { getCommerceClient } from '../../utils/client'

function clientOrNull() {
	try {
		return getCommerceClient() as any
	} catch {
		return null
	}
}

export function usePolls() {
	const client = clientOrNull()

	async function listPolls(opts: Record<string, unknown> = {}) {
		if (client && typeof client.listPolls === 'function') return client.listPolls(opts)
		return []
	}

	async function getPollById(id: string) {
		if (client && typeof client.getPoll === 'function') return client.getPoll(id)
		const polls = await listPolls()
		return Array.isArray(polls) ? polls.find((poll: any) => poll?.id === id) || null : null
	}

	async function vote(pollId: string, optionId: string) {
		if (client && typeof client.votePoll === 'function') return client.votePoll({ pollId, optionId })
		return { success: false, reason: 'votePoll not implemented by provider' }
	}

	return {
		listPolls,
		getPollById,
		vote,
	}
}

export default usePolls
