// types/index.ts - Main type definitions for commerce layer

// Re-export Order types
export * from './Order.type'
export type Money = string | number;

export interface VariationNode {
  databaseId: number;
  salePrice: Money;
  regularPrice: Money;
  stockQuantity?: number;
  image?: { sourceUrl: string };
}

export interface Variation {
  node: VariationNode;
  attributes: Array<{ value: string }>;
}

export interface ProductNode {
  sku: string;
  slug: string;
  name: string;
}

export interface Product {
  id: string;
  sku?: string;
  slug?: string;
  name?: string;
  description?: string;
  images?: Array<{ sourceUrl?: string }>;
  price?: number;
  regularPrice?: number;
  salePrice?: number;
  attributes?: Array<{ name: string; value: string }>;
  variations?: ProductVariant[];
}

export interface ProductVariant {
  id: string;
  sku?: string;
  price?: number;
  regularPrice?: number;
  salePrice?: number;
  stockQuantity?: number;
  image?: { sourceUrl?: string };
  attributes?: Array<{ name: string; value: string }>;
}

export interface CartItemNode {
  key: string;
  quantity: number;
  product: { node: ProductNode };
  variation: Variation;
}

export interface AddToCartResponse {
  addToCart: { cartItem: CartItemNode };
}

export type AddBtnStatus = 'add' | 'loading' | 'added';

export type RemoveBtnStatus = 'remove' | 'loading';

// Customer types
export interface Customer {
  id: string
  first_name: string
  last_name: string
  email: string
  phone?: string
  date_of_birth?: string
  preferred_currency?: string
  company_id?: string
  created_at: string
  updated_at: string
}

// Company types (B2B)
export interface Company {
  id: string
  name: string
  email: string
  phone?: string
  tax_id?: string
  industry?: string
  owner_id: string
  status: 'active' | 'inactive' | 'pending'
  created_at: string
  updated_at: string
}

// Return types
export interface Refund {
  id: string
  refund_number?: string
  order_id?: string
  return_id?: string
  transaction_id?: string
  amount: number
  currency: string
  reason?: string
  status: 'pending' | 'processed' | 'refunded' | 'failed' | 'cancelled'
  metadata?: Record<string, any>
  created_at: string
  updated_at: string
}

export interface Return {
  id: string
  return_number: string
  order_id: string
  customer_id: string
  status: 'requested' | 'approved' | 'rejected' | 'processed' | 'refunded'
  reason: string
  description?: string
  return_items: ReturnItem[]
  refunds?: Refund[]
  created_at: string
  updated_at: string
}

export interface ReturnItem {
  id: string
  return_id: string
  order_item_id: string
  product_id: string
  quantity: number
  reason: string
  condition?: 'new' | 'used' | 'damaged'
}

// Transaction types
export interface Transaction {
  id: string
  transaction_id: string
  order_id?: string
  customer_id?: string
  type: 'payment' | 'refund' | 'authorization' | 'capture'
  amount: number
  currency: string
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled'
  payment_method: string
  gateway_response?: Record<string, any>
  created_at: string
  updated_at: string
}

// Invoice types
export interface Invoice {
  id: string
  invoice_number: string
  order_id: string
  customer_id: string
  amount: number
  tax_amount: number
  currency: string
  due_date: string
  status: 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled'
  invoice_items: InvoiceItem[]
  payments?: Payment[]
  created_at: string
  updated_at: string
}

export interface InvoiceItem {
  id: string
  invoice_id: string
  product_id: string
  description: string
  quantity: number
  unit_price: number
  total: number
}

export interface Payment {
  id: string
  payment_number?: string
  invoice_id?: string
  order_id?: string
  customer_id?: string
  amount: number
  currency: string
  method: string
  transaction_id?: string
  status: 'pending' | 'completed' | 'failed' | 'refunded' | 'cancelled'
  gateway_response?: Record<string, any>
  created_at: string
  updated_at: string
}

// Credit Memo types
export interface CreditMemo {
  id: string
  memo_number: string
  order_id: string
  return_id?: string
  customer_id: string
  amount: number
  currency: string
  reason: string
  status: 'pending' | 'approved' | 'processed' | 'refunded' | 'cancelled'
  memo_items: CreditMemoItem[]
  created_at: string
  updated_at: string
}

export interface CreditMemoItem {
  id: string
  memo_id: string
  product_id: string
  description: string
  quantity: number
  unit_price: number
  total: number
}

// Cart types
export interface Cart {
  id: string
  customer_id?: string
  session_id?: string
  items: CartItem[]
  subtotal: number
  tax_amount: number
  shipping_amount: number
  discount_amount: number
  total: number
  currency: string
  coupon_code?: string
  created_at: string
  updated_at: string
}

export interface CartItem {
  id: string
  cart_id: string
  product_id: string
  variant_id?: string
  quantity: number
  price: number
  total: number
  product?: Product
  variant?: ProductVariant
}

// Coupon types
export interface Coupon {
  id: string
  code: string
  name: string
  description?: string
  discount_type: 'percentage' | 'fixed_amount'
  discount_value: number
  minimum_amount?: number
  maximum_discount?: number
  usage_limit?: number
  usage_count: number
  usage_limit_per_customer?: number
  valid_from?: string
  valid_until?: string
  status: 'active' | 'inactive' | 'expired'
  created_at: string
}

// Common utility types
export interface PaginationMeta {
  current_page: number
  per_page: number
  total: number
  total_pages: number
}

export interface ApiResponse<T> {
  data: T
  meta?: PaginationMeta
  message?: string
}

export interface ApiError {
  message: string
  code?: string
  details?: Record<string, any>
}