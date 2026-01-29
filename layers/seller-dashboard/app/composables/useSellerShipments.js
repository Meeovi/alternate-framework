import { getSellerProvider } from './registry';
import { getCurrentSellerId } from './_auth';
export function useSellerShipments() {
    const provider = getSellerProvider();
    async function listShipments(params) {
        const sellerId = getCurrentSellerId();
        return provider.listShipments?.(params, { sellerId }) ?? [];
    }
    async function updateShipment(id, payload) {
        const sellerId = getCurrentSellerId();
        return provider.updateShipment?.(id, payload, { sellerId });
    }
    return { listShipments, updateShipment };
}
