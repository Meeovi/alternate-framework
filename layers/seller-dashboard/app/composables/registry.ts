export type RequestContext = { sellerId?: string }

export type SellerDashboardProvider = {
	// Products
	listProducts?: (params?: any, ctx?: RequestContext) => Promise<any[]>;
	getProduct?: (id: string, ctx?: RequestContext) => Promise<any>;
	createProduct?: (payload: any, ctx?: RequestContext) => Promise<any>;
	updateProduct?: (id: string, payload: any, ctx?: RequestContext) => Promise<any>;
	deleteProduct?: (id: string, ctx?: RequestContext) => Promise<void>;

	// Orders
	listOrders?: (params?: any, ctx?: RequestContext) => Promise<any[]>;
	getOrder?: (id: string, ctx?: RequestContext) => Promise<any>;
	updateOrderStatus?: (id: string, status: string, ctx?: RequestContext) => Promise<any>;

	// Reviews
	listReviews?: (params?: any, ctx?: RequestContext) => Promise<any[]>;
	moderateReview?: (id: string, action: 'approve' | 'reject' | 'hide', ctx?: RequestContext) => Promise<any>;

	// Shops
	listShops?: (params?: any, ctx?: RequestContext) => Promise<any[]>;
	getShop?: (id: string, ctx?: RequestContext) => Promise<any>;
	updateShop?: (id: string, payload: any, ctx?: RequestContext) => Promise<any>;

	// Spaces
	listSpaces?: (params?: any, ctx?: RequestContext) => Promise<any[]>;

	// Shipments
	listShipments?: (params?: any, ctx?: RequestContext) => Promise<any[]>;
	updateShipment?: (id: string, payload: any, ctx?: RequestContext) => Promise<any>;
}

let runtimeProvider: SellerDashboardProvider | null = null;

export function registerSellerProviderRuntime(name: string, provider: SellerDashboardProvider) {
	// simple registration; future: support multiple named providers
	runtimeProvider = provider;
}

export function getSellerProvider(): SellerDashboardProvider {
	return runtimeProvider ?? memoryProvider;
}

// Minimal in-memory provider useful for development and tests
const memoryState = {
	products: [] as any[],
	orders: [] as any[],
	reviews: [] as any[],
	shops: [] as any[],
	spaces: [] as any[],
	shipments: [] as any[],
};

const memoryProvider: SellerDashboardProvider = {
	// Products
	async listProducts(params?: any, ctx?: RequestContext) {
		const sellerId = ctx?.sellerId
		if (sellerId) return memoryState.products.filter(p => p.ownerId === sellerId)
		return [...memoryState.products]
	},
	async getProduct(id: string, ctx?: RequestContext) {
		const sellerId = ctx?.sellerId
		const p = memoryState.products.find(p => p.id === id) ?? null
		if (p && sellerId && p.ownerId !== sellerId) return null
		return p
	},
	async createProduct(payload: any, ctx?: RequestContext) {
		const item = { id: String(Date.now()), ownerId: ctx?.sellerId ?? 'unknown', ...payload };
		memoryState.products.push(item);
		return item;
	},
	async updateProduct(id: string, payload: any, ctx?: RequestContext) {
		const idx = memoryState.products.findIndex(p => p.id === id);
		if (idx === -1) return null;
		if (ctx?.sellerId && memoryState.products[idx].ownerId !== ctx.sellerId) return null;
		memoryState.products[idx] = { ...memoryState.products[idx], ...payload };
		return memoryState.products[idx];
	},
	async deleteProduct(id: string, ctx?: RequestContext) {
		memoryState.products = memoryState.products.filter(p => p.id !== id || (ctx?.sellerId && p.ownerId !== ctx.sellerId));
	},

	// Orders
	async listOrders(params?: any, ctx?: RequestContext) {
		const sellerId = ctx?.sellerId
		if (sellerId) return memoryState.orders.filter(o => o.sellerId === sellerId)
		return [...memoryState.orders]
	},
	async getOrder(id: string, ctx?: RequestContext) {
		const sellerId = ctx?.sellerId
		const o = memoryState.orders.find(o => o.id === id) ?? null
		if (o && sellerId && o.sellerId !== sellerId) return null
		return o
	},
	async updateOrderStatus(id: string, status: string, ctx?: RequestContext) {
		const o = memoryState.orders.find(o => o.id === id);
		if (!o) return null;
		if (ctx?.sellerId && o.sellerId !== ctx.sellerId) return null;
		o.status = status;
		return o;
	},

	// Reviews
	async listReviews(params?: any, ctx?: RequestContext) {
		const sellerId = ctx?.sellerId
		if (sellerId) return memoryState.reviews.filter(r => r.sellerId === sellerId)
		return [...memoryState.reviews]
	},
	async moderateReview(id: string, action: 'approve' | 'reject' | 'hide', ctx?: RequestContext) {
		const r = memoryState.reviews.find(r => r.id === id);
		if (!r) return null;
		if (ctx?.sellerId && r.sellerId !== ctx.sellerId) return null;
		r.moderation = action;
		return r;
	},

	// Shops
	async listShops(params?: any, ctx?: RequestContext) {
		const sellerId = ctx?.sellerId
		if (sellerId) return memoryState.shops.filter(s => s.ownerId === sellerId)
		return [...memoryState.shops]
	},
	async getShop(id: string, ctx?: RequestContext) {
		const sellerId = ctx?.sellerId
		const s = memoryState.shops.find(s => s.id === id) ?? null
		if (s && sellerId && s.ownerId !== sellerId) return null
		return s
	},
	async updateShop(id: string, payload: any, ctx?: RequestContext) {
		const idx = memoryState.shops.findIndex(s => s.id === id);
		if (idx === -1) return null;
		if (ctx?.sellerId && memoryState.shops[idx].ownerId !== ctx.sellerId) return null;
		memoryState.shops[idx] = { ...memoryState.shops[idx], ...payload };
		return memoryState.shops[idx];
	},

	// Spaces
	async listSpaces(params?: any, ctx?: RequestContext) {
		const sellerId = ctx?.sellerId
		if (sellerId) return memoryState.spaces.filter(sp => sp.ownerId === sellerId)
		return [...memoryState.spaces]
	},

	// Shipments
	async listShipments(params?: any, ctx?: RequestContext) {
		const sellerId = ctx?.sellerId
		if (sellerId) return memoryState.shipments.filter(s => s.sellerId === sellerId)
		return [...memoryState.shipments]
	},
	async updateShipment(id: string, payload: any, ctx?: RequestContext) {
		const s = memoryState.shipments.find(s => s.id === id);
		if (!s) return null;
		if (ctx?.sellerId && s.sellerId !== ctx.sellerId) return null;
		Object.assign(s, payload);
		return s;
	}
}

export default {
	registerSellerProviderRuntime,
	getSellerProvider,
}
