// layers/commerce/app/types/commerce.ts

import type { Price } from "alternate-sdk/contracts";

export interface Money {
  value: number;        // e.g., 2999
  currencyCode: string; // e.g., 'GBP'
  formatted: string;    // e.g., '£29.99' - computed upstream by gateway
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
}

export interface Product {
  id: string;
  title: string;
  slug: string;
  description?: string;
  price: Money;
  images: string[];
  categoryId?: Category['id'];
  attributes?: Record<string, string>;
}

export type ProductVariant = {
  id: string;
  sku: string;
  price: Money;
  attributes?: Record<string, string>;
};

export type Country = {
  code: string;
  name: string;
};

export type Currency = {
  code: string;
  name: string;
  symbol: string;
};

export type POS = { // Point of Sale
  id: string;
  name: string;
  description?: string;
  location?: string;
};

export interface CartItem {
  id: string;
  productId: string;
  variantId: string;
  title: string;
  quantity: number;
  image: string;
  price: {
    regular: Money;
    current: Money;
  };
  description?: string;
  sku?: string;
  category?: Category['id'];
  attributes?: Record<string, string>;
}

export interface UICart {
  id: string;
  items: CartItem[];
  subtotal: Money;
  total: Money;
  itemCount: number;
}

export interface Order {
  id: string;
  items: CartItem[];
  subtotal: Money;
  total: Money;
  status: string;
  createdAt: string;
  updatedAt: string;
  customerId?: string;
  shippingAddress?: Address;
  billingAddress?: Address;
}

export interface GiftCard {
  code: string
  balance?: Price | number
  currency?: string
  raw?: any
}

export interface Subscription {
  id: string
  productId?: string
  status?: string
  schedule?: any
  raw?: any
}

export interface PaymentIntent {
  id: string
  status?: string
  amount?: Price | number
  currency?: string
  method?: string
  raw?: any
}

export interface Checkout {
  id: string;
  cartId: string;
  orderId?: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export interface Address {
  id: string;
  line1: string;
  line2?: string;
  city: string;
  state?: string;
  postalCode: string;
  country: string;
  phone?: string;
}