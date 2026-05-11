
import type { Price } from '../../../types/commerce.type';

type ProductVariant = any

export interface Product {
  id: string;
  title: string;
  description: string;
  images: string[];
  price: number | Price;
  variants?: ProductVariant[];
}