import { unwrap } from './utils';
export const createStarterCommerceAdapter = (transport) => ({
    async getProduct(id) {
        const res = await transport.request('GET', `/products/${id}`);
        return unwrap(res);
    },
    async listProducts() {
        const res = await transport.request('GET', '/products');
        return unwrap(res);
    },
    async getCart() {
        const res = await transport.request('GET', '/cart');
        return unwrap(res);
    },
    async addToCart(item) {
        const res = await transport.request('POST', '/cart/items', {
            body: item
        });
        return unwrap(res);
    },
    async updateCartItem(id, quantity) {
        const res = await transport.request('PATCH', `/cart/items/${id}`, {
            body: { quantity }
        });
        return unwrap(res);
    },
    async removeCartItem(id) {
        const res = await transport.request('DELETE', `/cart/items/${id}`);
        return unwrap(res);
    },
    async clearCart() {
        const res = await transport.request('DELETE', '/cart');
        return unwrap(res);
    }
});
