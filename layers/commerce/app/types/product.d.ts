export interface Price { amount: number; currency: string }

export interface ProductVariant { id: string; sku: string; price: Price; attributes?: Record<string, any> }

export interface Product { id: string; sku: string; name: string; variants?: ProductVariant[]; price?: Price }
