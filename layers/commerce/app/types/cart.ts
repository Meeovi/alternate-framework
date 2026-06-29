import type { Ref } from 'vue';
import type { SfCart, SfCartLineItem, SfShippingMethod, Maybe } from '../composables/system/models';

export interface UseCartState {
  data: Maybe<SfCart>;
  loading: boolean;
}

export type FetchCart = () => Promise<Ref<Maybe<SfCart>>>;
export type FetchCard = FetchCart;

export interface UseCart {
  data: Readonly<Ref<UseCartState['data']>>;
  loading: Readonly<Ref<boolean>>;
  fetchCart: FetchCart;
  fetchCard: FetchCard;
}

export type UseCartReturn = () => UseCart;

export interface CartItem {
  id: string
  itemId: string
  sku: string
  quoteId: string
  productId: string
  productType: string
  quantity: number
  currency: string
  productOption?: {
    id: string
    title: string
    type: string
    values: Array<{
      id: string
      title: string
      price: number
      priceType: string
    }>
  }
  extensionAttributes?: Record<string, unknown>
}

export interface Cart {
  id: string
  quoteId: string
  items: CartItem[]
  total: number
  subtotal: number
  grandTotal: number
  taxAmount: number
  shippingAmount: number
  discountAmount: number
  currency: string
  couponCode?: string
  customerEmail?: string
  shippingMethod?: SfShippingMethod
  itemsCount: number
  customerIsGuest: boolean
  extensionAttributes?: Record<string, unknown>
}

export interface CartProvider {
  getCart(filters?: Record<string, any>): Promise<SfCart>
  getGuestCart(guestId: string, storeId: string): Promise<SfCart>
  createEmptyCart(storeId: string, websiteId: string): Promise<SfCart>
  addCartLineItem(payload: {
    cartId?: string
    productId: string
    sku?: string
    qty: number
    quoteId?: string
    productOption?: any
    extensionAttributes?: Record<string, unknown>
  }): Promise<SfCart>
  updateCartLineItem(payload: {
    cartId?: string
    cartItemId: string
    qty: number
    extensionAttributes?: Record<string, unknown>
  }): Promise<SfCart>
  removeCartLineItem(payload: {
    cartId?: string
    cartItemId: string
  }): Promise<SfCart>
  clearCart(cartId?: string): Promise<SfCart>
  estimateShippingMethods(payload: {
    address: Record<string, any>
    items: Array<Record<string, any>>
  }): Promise<{ methods: SfShippingMethod[] }>
  selectShippingMethod(payload: {
    cartId?: string
    shippingMethodCode: string
    shippingCarrierCode: string
  }): Promise<SfCart>
  selectPaymentMethod(payload: {
    cartId?: string
    paymentMethod: Record<string, any>
  }): Promise<SfCart>
  applyCoupon(cartId: string, couponCode: string): Promise<SfCart>
  removeCoupon(cartId: string, couponId: string): Promise<SfCart>
}
