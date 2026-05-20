import type gateway from '../../gateway/commerceGateway'

export function useGateway(): typeof gateway {
	return (globalThis as any).useNuxtApp?.()?.$gateway || (globalThis as any).gateway || ({ content: null, commerce: null } as any)
}
