import type { InferCustom } from "../defs";
import type { Maybe, SfId, SfImage } from "./shared";

export interface SfCategoryCustom extends InferCustom<"normalizeCartCoupon"> {}

export interface SfCategory {
  id: SfId;
  name: string;
  slug: string;
  description?: Maybe<string>;
  shortDescription?: Maybe<string>;
  path: string;
  position: number;
  level: number;
  childrenCount: number;
  parentId: Maybe<SfId> | null;
  parentCategoryName?: string;
  includeInMenu?: boolean;
  isActive: boolean;
  image: Maybe<SfImage>;
  landingPage?: string;
  metaTitle?: string;
  metaDescription?: string;
  metaKeyword?: string;
  urlKey?: string;
  urlPath?: string;
  customLayoutUpdateXml?: string;
  pageLayout: string;
  customTheme: string;
  customRootTemplate: string;
  availableSortBy?: string[];
  defaultSortBy?: string;
  filterPriceRange?: {
    min: number;
    max: number;
  };
  thumbnail?: Maybe<SfImage>;
  banner?: Maybe<SfImage>;
  subcategories?: Maybe<SfCategory[]>;
  productCount?: number;
  children?: Maybe<SfCategory[]>;
  createdAt?: string;
  updatedAt?: string;
  $custom?: SfCategoryCustom;
}

export interface SfCategoryTree {
  id: SfId;
  name: string;
  slug: string;
  path: string;
  level: number;
  parentId: Maybe<SfId> | null;
  isActive: boolean;
  productCount: number;
  children?: SfCategoryTree[];
  metadata?: Record<string, unknown>;
}
