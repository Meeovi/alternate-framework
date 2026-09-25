import type { Product } from './product.js'

export type { Product }

export type ProductFilter = {
  search?: string
  categoryId?: string
  pageSize?: number
  currentPage?: number
}

export type Category = {
  id: string
  name: string
  slug?: string
  description?: string
}

export type Money = {
  value: number
  currencyCode: string
}

export type Price = {
  regular: Money
  current?: Money
}

export type Image = {
  url: string
  alt?: string
}

export type ProductVariant = {
  id: string
  sku: string
  price: Price
}

export type CartItemInput = {
  productId: string
  variantId?: string
  quantity: number
}

export type AddToCartInput = {
  cartId?: string
  productId: string
  quantity: number
}

export type UpdateCartInput = {
  cartId: string
  itemId: string
  quantity: number
}

export type CartItem = {
  id: string
  productId: string
  variantId?: string
  quantity: number
  price: Price
  product?: Product
}

export type Cart = {
  id: string
  items: CartItem[]
  totalPrice: Price
}

export type CheckoutInput = {
  cartId: string
  email: string
  shippingAddress?: AddressInput
  billingAddress?: AddressInput
}

export type AddressInput = {
  firstName: string
  lastName: string
  street: string
  city: string
  state?: string
  postalCode: string
  country: string
}

export interface CommerceDriver {
  getProduct(id: string): Promise<Product | null>
  getProducts(filter?: ProductFilter): Promise<Product[]>
  getCategories(): Promise<Category[]>
  getCategory(id: string): Promise<Category | null>
  getBrands(): Promise<Brand[]>
  getBrand(id: string): Promise<Brand | null>
  search(query: string, opts?: { limit?: number; offset?: number }): Promise<Product[]>
  getPrice(productId: string): Promise<Price | null>
  getCatalogPriceRules(): Promise<PriceRule[]>
}

export interface CartDriver {
  getCart(cartId?: string): Promise<Cart | null>
  addToCart(input: AddToCartInput): Promise<Cart | null>
  updateCart(input: UpdateCartInput): Promise<Cart | null>
  removeFromCart(itemId: string): Promise<Cart | null>
  clearCart(cartId: string): Promise<{ success: boolean }>
}

export interface CheckoutDriver {
  getCheckout(checkoutId: string): Promise<Checkout | null>
  createCheckout(input: CheckoutInput): Promise<Checkout | null>
  updateCheckout(input: Partial<CheckoutInput> & { checkoutId: string }): Promise<Checkout | null>
  completeCheckout(checkoutId: string): Promise<{ success: boolean }>
}

export type Brand = {
  id: string
  name: string
  slug?: string
  description?: string
}

export type PriceRule = {
  id: string
  name: string
  conditions: Record<string, unknown>
  actions: Record<string, unknown>
}

export type Order = {
  id: string
  status: string
  totalPrice: Price
  items: CartItem[]
}

export type Checkout = {
  id: string
  status: 'pending' | 'processing' | 'completed' | 'failed'
  totalPrice: Price
  items: CartItem[]
}

export interface CommerceDriverContract {
  products: CommerceDriver
  cart: CartDriver
  checkout: CheckoutDriver
  getCartRules(opts?: { cartId?: string }): Promise<PriceRule[]>
  getSuggestions(query: string, opts?: { limit?: number }): Promise<Product[]>
}

const commerceRegistry = new Map<string, CommerceDriverContract>()
let defaultCommerceDriver: CommerceDriverContract | undefined

export function registerCommerceDriver(name: string, driver: CommerceDriverContract): void {
  commerceRegistry.set(name, driver)
}

export function getCommerceDriver(name?: string): CommerceDriverContract | undefined {
  if (name) return commerceRegistry.get(name)
  return defaultCommerceDriver
}

export function setDefaultCommerceDriver(driver: CommerceDriverContract): void {
  defaultCommerceDriver = driver
}

export const CommerceDriverRegistry = {
  register: registerCommerceDriver,
  get: getCommerceDriver,
  getDefaultDriver: () => defaultCommerceDriver,
  setDefaultDriver: setDefaultCommerceDriver,
}