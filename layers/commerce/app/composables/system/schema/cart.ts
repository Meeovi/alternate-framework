export interface SfCart {
  id: string;
  customerId: number;
  isGuest: number;
  email: string;
  storeId: number;
  websiteId: number;
  quoteId: string;
  itemsCount: number;
  itemsQty: number;
  convertedAt?: string;
  createdAt: string;
  updatedAt: string;
  // Additional relations omitted
}

export interface SfCartItem {
  id: string;
  cartId: number;
  productId: number;
  qty: number;
  price: number;
  rowTotal: number;
  sku?: string;
  name?: string;
}
