export function buildWebsubSubscribeRequest(input: {
	callback: string
	topic: string
	leaseSeconds?: number
}): URLSearchParams {
	const form = new URLSearchParams()
	form.set('hub.mode', 'subscribe')
	form.set('hub.callback', input.callback)
	form.set('hub.topic', input.topic)
	form.set('hub.lease_seconds', String(input.leaseSeconds ?? 86400))
	return form
}
