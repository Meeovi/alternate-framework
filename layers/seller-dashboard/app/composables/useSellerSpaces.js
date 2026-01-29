import { getSellerProvider } from './registry';
import { getCurrentSellerId } from './_auth';
export function useSellerSpaces() {
    const provider = getSellerProvider();
    async function listSpaces(params) {
        const sellerId = getCurrentSellerId();
        return provider.listSpaces?.(params, { sellerId }) ?? [];
    }
    return { listSpaces };
}
