// Order-specific types for the commerce layer
export interface Order {
  id: string
  order_number: string
  customer_id: string
  company_id?: string
  status: OrderStatusType
  order_type?: 'standard' | 'purchase_order' | 'subscription'
  
  // Financial details
  subtotal: number
  tax_amount: number
  shipping_amount: number
  discount_amount: number
  total: number
  currency: string
  
  // Customer information
  customer_name: string
  customer_email: string
  customer_phone?: string
  
  // Order items
  order_items: OrderItem[]
  
  // Addresses
  shipping_address?: Address
  billing_address?: Address
  
  // Coupon/discount information
  coupon_code?: string
  coupon_id?: string
  reward_points_used?: number
  reward_discount_amount?: number
  
  // Purchase order details (B2B)
  po_number?: string
  po_reference?: string
  
  // Timestamps
  created_at: string
  updated_at: string
  shipped_at?: string
  delivered_at?: string
  cancelled_at?: string
}

export interface OrderItem {
  id: string
  order_id: string
  product_id: string
  variant_id?: string
  product_name: string
  product_sku: string
  quantity: number
  price: number
  total: number
  product?: Product
  variant?: ProductVariant
}

export interface Address {
  id?: string
  type?: 'shipping' | 'billing'
  first_name: string
  last_name: string
  company?: string
  street: string
  street_2?: string
  city: string
  state: string
  postal_code: string
  country: string
  phone?: string
}

export interface Product {
  id: string
  name: string
  sku: string
  price: number
  sale_price?: number
  description?: string
  images?: ProductImage[]
  inventory?: ProductInventory
}

export interface ProductVariant {
  id: string
  product_id: string
  name: string
  sku: string
  price: number
  attributes: Record<string, any>
}

export interface ProductImage {
  id: string
  url: string
  alt_text?: string
  sort_order?: number
}

export interface ProductInventory {
  id: string
  product_id: string
  quantity: number
  reserved_quantity?: number
  available_quantity?: number
}

export type OrderStatusType = 
  | 'draft'
  | 'pending' 
  | 'processing' 
  | 'shipped' 
  | 'delivered' 
  | 'cancelled'
  | 'refunded'
  | 'on_hold'

export interface OrderStatus {
  status: 'success' | 'error' | 'partial'
  message?: string
  quantityAvailable?: number
}

export interface OrderMutationResult {
  status: 'success' | 'error' | 'partial'
  message?: string
  order?: Order
  quantityAvailable?: number
}

// Legacy types for backward compatibility
export interface ActiveOrder extends Order {}

// Order creation/update payloads
export interface CreateOrderPayload {
  customer_id?: string
  company_id?: string
  order_type?: 'standard' | 'purchase_order' | 'subscription'
  shipping_address?: Partial<Address>
  billing_address?: Partial<Address>
  po_number?: string
  notes?: string
}

export interface UpdateOrderPayload {
  status?: OrderStatusType
  shipping_address?: Partial<Address>
  billing_address?: Partial<Address>
  notes?: string
  tracking_number?: string
}

// Order filters for queries
export interface OrderFilters {
  status?: OrderStatusType | OrderStatusType[]
  customer_id?: string
  company_id?: string
  order_type?: string
  date_from?: string
  date_to?: string
  search?: string
  limit?: number
  page?: number
}

// Order statistics
export interface OrderStats {
  total_orders: number
  total_revenue: number
  average_order_value: number
  orders_by_status: Record<OrderStatusType, number>
  revenue_by_period: Array<{
    period: string
    revenue: number
    orders: number
  }>
}