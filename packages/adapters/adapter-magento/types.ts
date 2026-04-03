export type Product = {
  id: string;
  name: string;
  price: number;
  image: string | null;
};

export type ProductFilter = {
  search?: string;
  categoryId?: string;
  pageSize?: number;
  currentPage?: number;
};

export type Category = {
  id: string;
  name: string;
};

export type AddToCartInput = {
  cartId?: string;
  productId: string;
  quantity: number;
};

export type UpdateCartInput = {
  cartId: string;
  itemId: string;
  quantity: number;
};

export type CartItem = {
  id: string;
  productId: string;
  quantity: number;
  price: number;
};

export type Cart = {
  id: string;
  items: CartItem[];
};

export interface MagentoCommerceAdapter {
  getProduct(id: string): Promise<Product | null>;
  getProducts(filter: ProductFilter): Promise<Product[]>;
  getCategories(): Promise<Category[]>;
  addToCart(input: AddToCartInput): Promise<Cart | null>;
  updateCart(input: UpdateCartInput): Promise<Cart | null>;
  removeFromCart(itemId: string): Promise<Cart | null>;
}