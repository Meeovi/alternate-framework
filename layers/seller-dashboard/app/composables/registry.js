let runtimeProvider = null;
export function registerSellerProviderRuntime(name, provider) {
    // simple registration; future: support multiple named providers
    runtimeProvider = provider;
}
export function getSellerProvider() {
    return runtimeProvider ?? memoryProvider;
}
// Minimal in-memory provider useful for development and tests
const memoryState = {
    products: [],
    orders: [],
    reviews: [],
    shops: [],
    spaces: [],
    shipments: [],
};
const memoryProvider = {
    // Products
    async listProducts(params, ctx) {
        const sellerId = ctx?.sellerId;
        if (sellerId)
            return memoryState.products.filter(p => p.ownerId === sellerId);
        return [...memoryState.products];
    },
    async getProduct(id, ctx) {
        const sellerId = ctx?.sellerId;
        const p = memoryState.products.find(p => p.id === id) ?? null;
        if (p && sellerId && p.ownerId !== sellerId)
            return null;
        return p;
    },
    async createProduct(payload, ctx) {
        const item = { id: String(Date.now()), ownerId: ctx?.sellerId ?? 'unknown', ...payload };
        memoryState.products.push(item);
        return item;
    },
    async updateProduct(id, payload, ctx) {
        const idx = memoryState.products.findIndex(p => p.id === id);
        if (idx === -1)
            return null;
        if (ctx?.sellerId && memoryState.products[idx].ownerId !== ctx.sellerId)
            return null;
        memoryState.products[idx] = { ...memoryState.products[idx], ...payload };
        return memoryState.products[idx];
    },
    async deleteProduct(id, ctx) {
        memoryState.products = memoryState.products.filter(p => p.id !== id || (ctx?.sellerId && p.ownerId !== ctx.sellerId));
    },
    // Orders
    async listOrders(params, ctx) {
        const sellerId = ctx?.sellerId;
        if (sellerId)
            return memoryState.orders.filter(o => o.sellerId === sellerId);
        return [...memoryState.orders];
    },
    async getOrder(id, ctx) {
        const sellerId = ctx?.sellerId;
        const o = memoryState.orders.find(o => o.id === id) ?? null;
        if (o && sellerId && o.sellerId !== sellerId)
            return null;
        return o;
    },
    async updateOrderStatus(id, status, ctx) {
        const o = memoryState.orders.find(o => o.id === id);
        if (!o)
            return null;
        if (ctx?.sellerId && o.sellerId !== ctx.sellerId)
            return null;
        o.status = status;
        return o;
    },
    // Reviews
    async listReviews(params, ctx) {
        const sellerId = ctx?.sellerId;
        if (sellerId)
            return memoryState.reviews.filter(r => r.sellerId === sellerId);
        return [...memoryState.reviews];
    },
    async moderateReview(id, action, ctx) {
        const r = memoryState.reviews.find(r => r.id === id);
        if (!r)
            return null;
        if (ctx?.sellerId && r.sellerId !== ctx.sellerId)
            return null;
        r.moderation = action;
        return r;
    },
    // Shops
    async listShops(params, ctx) {
        const sellerId = ctx?.sellerId;
        if (sellerId)
            return memoryState.shops.filter(s => s.ownerId === sellerId);
        return [...memoryState.shops];
    },
    async getShop(id, ctx) {
        const sellerId = ctx?.sellerId;
        const s = memoryState.shops.find(s => s.id === id) ?? null;
        if (s && sellerId && s.ownerId !== sellerId)
            return null;
        return s;
    },
    async updateShop(id, payload, ctx) {
        const idx = memoryState.shops.findIndex(s => s.id === id);
        if (idx === -1)
            return null;
        if (ctx?.sellerId && memoryState.shops[idx].ownerId !== ctx.sellerId)
            return null;
        memoryState.shops[idx] = { ...memoryState.shops[idx], ...payload };
        return memoryState.shops[idx];
    },
    // Spaces
    async listSpaces(params, ctx) {
        const sellerId = ctx?.sellerId;
        if (sellerId)
            return memoryState.spaces.filter(sp => sp.ownerId === sellerId);
        return [...memoryState.spaces];
    },
    // Shipments
    async listShipments(params, ctx) {
        const sellerId = ctx?.sellerId;
        if (sellerId)
            return memoryState.shipments.filter(s => s.sellerId === sellerId);
        return [...memoryState.shipments];
    },
    async updateShipment(id, payload, ctx) {
        const s = memoryState.shipments.find(s => s.id === id);
        if (!s)
            return null;
        if (ctx?.sellerId && s.sellerId !== ctx.sellerId)
            return null;
        Object.assign(s, payload);
        return s;
    }
};
export default {
    registerSellerProviderRuntime,
    getSellerProvider,
};
