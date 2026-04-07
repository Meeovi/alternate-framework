export function encodeSalmonEnvelope(payload: Record<string, unknown>): string {
	const body = Buffer.from(JSON.stringify(payload), 'utf8').toString('base64url')
	return `<salmon><data type="application/json">${body}</data></salmon>`
}
