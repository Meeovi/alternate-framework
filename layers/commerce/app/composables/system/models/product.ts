import type { InferCustom } from "../defs";
import type { Maybe, SfAttribute, SfDiscountablePrice, SfId, SfImage } from "./shared";

export interface SfProductVariant {
  id: SfId;
  slug: string;
  sku: Maybe<string>;
  name: Maybe<string>;
  /*
   * Maximum available quantity for variant, null if unlimited
   */
  quantityLimit: Maybe<number>;
  attributes: SfAttribute[];
}

export interface SfProductReviewCustom extends InferCustom<"normalizeProductReview"> {}

export interface SfProductReview {
  id: SfId;
  title: Maybe<string>;
  text: Maybe<string>;
  rating: Maybe<number>;
  /*
   * Name of the reviewer (Full name or nickname)
   */
  reviewer: Maybe<string>;
  /*
   * Creation date in ISO 8601 format
   */
  createdAt: string;
  $custom?: SfProductReviewCustom;
}

export interface SfProductCustom extends InferCustom<"normalizeProduct"> {}

export interface SfProduct {
  id: SfId;
  sku: Maybe<string>;
  name: Maybe<string>;
  slug: string;
  description: Maybe<string>;
  price: Maybe<SfDiscountablePrice>;
  primaryImage: Maybe<SfImage>;
  gallery: SfImage[];
  rating: Maybe<{
    average: number;
    count: number;
  }>;
  variants: SfProductVariant[];
  attributes: SfAttribute[];
  /*
   * Maximum available quantity for product, null if unlimited
   */
  quantityLimit: Maybe<number>;
  $custom?: SfProductCustom;
}

export interface SfProductCatalogItemCustom extends InferCustom<"normalizeProductCatalogItem"> {}

export interface SfProductCatalogItem
  extends Omit<SfProduct, "variants" | "gallery" | "description" | "attributes"> {
  $custom?: SfProductCatalogItemCustom;
}

export interface SfPaginationCustom extends InferCustom<"normalizePagination"> {}

export interface SfPagination {
  currentPage: number;
  pageSize: Maybe<number>;
  totalResults: number;
  totalPages: number;
  $custom?: SfPaginationCustom;
}
