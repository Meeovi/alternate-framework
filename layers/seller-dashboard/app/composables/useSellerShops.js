import { getSellerProvider } from './registry';
import { getCurrentSellerId } from './_auth';
export function useSellerShops() {
    const provider = getSellerProvider();
    async function listShops(params) {
        const sellerId = getCurrentSellerId();
        return provider.listShops?.(params, { sellerId }) ?? [];
    }
    async function getShop(id) {
        const sellerId = getCurrentSellerId();
        return provider.getShop?.(id, { sellerId }) ?? null;
    }
    async function updateShop(id, payload) {
        const sellerId = getCurrentSellerId();
        return provider.updateShop?.(id, payload, { sellerId });
    }
    return { listShops, getShop, updateShop };
}
