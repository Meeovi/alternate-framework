import type { InferCustom } from "../defs";
import type { Maybe } from "./shared";

export enum SfFacetTypes {
  MULTI_SELECT = "MULTI_SELECT",
  SINGLE_SELECT = "SINGLE_SELECT",
  PRICE_RANGE = "PRICE_RANGE",
  BOOLEAN = "BOOLEAN",
  NUMERIC_RANGE = "NUMERIC_RANGE",
  TEXT = "TEXT",
}

export type SfFacetType = `${SfFacetTypes}`;

export interface SfFacetItem {
  label: string;
  value: string;
  productCount: Maybe<number>;
}

export interface SfFacetCustom extends InferCustom<"normalizeFacet"> {}

export interface SfFacet {
  label: string;
  name: string;
  values: SfFacetItem[];
  type: Maybe<SfFacetType | (string & Record<never, never>)>;
  position?: number;
  code?: string;
  $custom?: SfFacetCustom;
}

export interface SfFacetedSearchRequest {
  keyword?: string;
  categoryIds?: string[];
  filters?: Record<string, string[]>;
  priceFrom?: number;
  priceTo?: number;
  pageSize?: number;
  currentPage?: number;
  sort?: {
    field: string;
    direction: "ASC" | "DESC";
  };
  storeId?: string;
  customerGroupId?: string;
  currencyCode?: string;
}

export interface SfFacetedSearchResponse {
  items: Array<{
    id: string;
    sku: string;
    name: string;
    price: {
      regular: number;
      final: number;
      currency: string;
    };
    image?: {
      url: string;
      alt: string;
    };
    urlKey: string;
    stockStatus: "in_stock" | "out_of_stock" | "backorders";
  }>;
  pagination: {
    currentPage: number;
    totalPages: number;
    totalResults: number;
    pageSize: number;
    hasPreviousPage: boolean;
    hasNextPage: boolean;
  };
  aggregations: Array<{
    field: string;
    label: string;
    type: SfFacetType;
    values: SfFacetItem[];
  }>;
  suggestions?: Array<{
    value: string;
    count?: number;
  }>;
}

export interface SfAggregationOption {
  value: string;
  label: string;
  count?: number;
  min?: number;
  max?: number;
  isSelected?: boolean;
}

export interface SfSearchAutocompleteResponse {
  products: Array<{
    id: string;
    sku: string;
    name: string;
    price: number;
    urlKey: string;
    image?: {
      url: string;
      alt: string;
    };
  }>;
  suggestions: string[];
}
