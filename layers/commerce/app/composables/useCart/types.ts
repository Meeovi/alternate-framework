import type { Ref } from 'vue';
import type { SfCart, Maybe } from '../models';

export interface UseCartState {
  data: Maybe<SfCart>;
  loading: boolean;
}

export type FetchCard = () => Promise<Ref<Maybe<SfCart>>>;

export interface UseCart {
  data: Readonly<Ref<UseCartState['data']>>;
  loading: Readonly<Ref<boolean>>;
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