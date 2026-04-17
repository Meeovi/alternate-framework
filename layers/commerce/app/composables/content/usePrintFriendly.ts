export function usePrintFriendly() {
	function buildPrintUrl(path: string, params: Record<string, string | number | boolean> = {}) {
		const query = Object.entries(params)
			.filter(([, value]) => value !== undefined && value !== null)
			.map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(String(value))}`)
			.join('&')
		return query ? `${path}${path.includes('?') ? '&' : '?'}${query}` : path
	}

	function print(target?: string | Window | null) {
		if (typeof window === 'undefined') return false

		if (typeof target === 'string') {
			window.open(target, '_blank', 'noopener,noreferrer')
			return true
		}

		const w = target || window
		if (w && typeof w.print === 'function') {
			w.print()
			return true
		}

		return false
	}

	return {
		buildPrintUrl,
		print,
	}
}

export default usePrintFriendly
