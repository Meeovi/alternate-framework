import { getCommerceClient } from '../../utils/client'

function clientOrNull() {
	try {
		return getCommerceClient() as any
	} catch {
		return null
	}
}

export function useRewards() {
	const client = clientOrNull()

	async function getRewardBalance(customerId: string) {
		if (client && typeof client.getRewardBalance === 'function') return client.getRewardBalance(customerId)
		if (client && typeof client.getRewards === 'function') {
			const rewards = await client.getRewards({ customerId })
			return Array.isArray(rewards) ? rewards.reduce((sum: number, r: any) => sum + Number(r?.points || 0), 0) : 0
		}
		return 0
	}

	async function listRewards(opts: Record<string, unknown> = {}) {
		if (client && typeof client.getRewards === 'function') return client.getRewards(opts)
		if (client && typeof client.listRewards === 'function') return client.listRewards(opts)
		return []
	}

	async function redeemReward(payload: Record<string, unknown>) {
		if (client && typeof client.redeemReward === 'function') return client.redeemReward(payload)
		return { success: false, reason: 'redeemReward not implemented by provider' }
	}

	return {
		getRewardBalance,
		listRewards,
		redeemReward,
	}
}

export default useRewards
