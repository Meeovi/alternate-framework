import type { Ref } from 'vue';
import type { SfCart, Maybe } from '../composables/sales/models';

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
  quantity: number
  product: any
}

export interface Cart {
  id: string
  items: CartItem[]
  total: number
}

export interface CartProvider {
  getCart(): Promise<Cart>
  addItem(productId: string, quantity?: number): Promise<Cart>
  removeItem(productId: string): Promise<Cart>
  clearCart(): Promise<Cart>
}