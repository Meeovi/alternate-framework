import { beforeEach, vi } from 'vitest';
import { __resetNuxtState } from './mocks/nuxt-app';
vi.mock('~/utils/client', () => ({
    getCommerceClient: () => ({
        getCustomer: async () => ({ id: 'customer-1', email: 'test@example.com' }),
        getCart: async () => ({ id: 'cart-1', items: [] }),
        listProducts: async () => [{ id: 'product-1' }],
        listProductReviews: async () => [{ id: 'review-1' }],
        listReviews: async () => [{ id: 'review-1' }],
    }),
}));
vi.mock('~/composables/useCart/registry', () => ({
    getCartProvider: () => ({
        getCart: async () => ({ id: 'cart-1', items: [], total: 0 }),
        addItem: async () => ({ id: 'cart-1', items: [], total: 0 }),
        removeItem: async () => ({ id: 'cart-1', items: [], total: 0 }),
        clearCart: async () => ({ id: 'cart-1', items: [], total: 0 }),
    }),
    registerCartProvider: vi.fn(),
    registerCartProviderRuntime: vi.fn(),
}));
beforeEach(() => {
    __resetNuxtState();
});
