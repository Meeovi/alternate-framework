import { getSellerProvider } from './registry';
import { getCurrentSellerId } from './_auth';
export function useSellerOrders() {
    const provider = getSellerProvider();
    async function listOrders(params) {
        const sellerId = getCurrentSellerId();
        return provider.listOrders?.(params, { sellerId }) ?? [];
    }
    async function getOrder(id) {
        const sellerId = getCurrentSellerId();
        return provider.getOrder?.(id, { sellerId }) ?? null;
    }
    async function updateOrderStatus(id, status) {
        const sellerId = getCurrentSellerId();
        return provider.updateOrderStatus?.(id, status, { sellerId });
    }
    return { listOrders, getOrder, updateOrderStatus };
}
