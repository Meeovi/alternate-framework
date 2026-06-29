import type { Simplify } from '../defs/typeHelpers';
import type {
  SfCategory,
  SfFacet,
  SfId,
  SfPagination,
  SfProduct,
  SfProductCatalogItem,
  SfProductReview,
  SfProductMediaEntry,
} from "../models";
import type { ResolvedPrice } from '../../catalog/price/price';

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface SfSortBy {}

export interface SearchProductsExtendedArgs {}
export interface SearchProductsCustomArgs {}

export type SearchProductsArgs = {
  pageSize?: number;
  currentPage?: number;
  sortBy?: "relevant" | "price-low-to-high" | "price-high-to-low" | "name-asc" | "name-desc" | "newest" | (string & {});
  search?: string;
  category?: SfCategory["id"];
  categoryIds?: string[];
  facets?: {
    [name: string]: string[];
  };
  filters?: {
    priceFrom?: number;
    priceTo?: number;
    inStock?: boolean;
    newProducts?: boolean;
    saleProducts?: boolean;
    status?: SfProductStatus[];
    visibility?: SfProductVisibility[];
    attributeSetId?: string;
    typeId?: SfProductType;
  };
  aggregationFilters?: boolean;
  //$extended?: SearchProductsExtendedArgs;
  //$custom?: SearchProductsCustomArgs;
} & SfSortBy;

export type SearchProducts = (args: Simplify<SearchProductsArgs>) => Promise<{
  products: SfProductCatalogItem[];
  pagination: SfPagination;
  facets: SfFacet[];
  aggregations?: Array<{
    field: string;
    label: string;
    displayMode: string;
    options: Array<{
      value: string;
      label: string;
      count: number;
      isSelected: boolean;
    }>;
  }>;
  suggestions?: string[];
}>;

export interface SearchAutocompleteExtendedArgs {}
export interface SearchAutocompleteCustomArgs {}

export type SearchAutocompleteArgs = {
  keyword?: string;
  storeId?: string;
  customerGroupId?: string;
  currencyCode?: string;
  partialMatchLength?: number;
  //$extended?: SearchAutocompleteExtendedArgs;
  //$custom?: SearchAutocompleteCustomArgs;
};

export type SearchAutocomplete = (args: Simplify<SearchAutocompleteArgs>) => Promise<{
  products: Array<{
    id: SfId;
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
}>;

export type GetProductSearchSuggestions = (args: {
  keyword?: string;
  limit?: number;
}) => Promise<string[]>;

export interface GetProductsExtendedArgs {}
export interface GetProductsCustomArgs {}

export type GetProductsArgs = {
  ids?: string[];
  skus?: string[];
  storeId?: string;
  customerGroupId?: string;
  currencyCode?: string;
  //$extended?: GetProductsExtendedArgs;
  //$custom?: GetProductsCustomArgs;
};

export type GetProducts = (args: Simplify<GetProductsArgs>) => Promise<{
  products: SfProductCatalogItem[];
}>;

export interface GetProductDetailsExtendedArgs {}
export interface GetProductDetailsCustomArgs {}

export type GetProductDetailsArgs = {
  id: SfId;
  sku?: string;
  urlKey?: string;
  storeId?: string;
  customerGroupId?: string;
  currencyCode?: string;
  //$extended?: GetProductDetailsExtendedArgs;
  //$custom?: GetProductDetailsCustomArgs;
};

export type GetProductDetails = (args: Simplify<GetProductDetailsArgs>) => Promise<{
  product: SfProduct;
  categoryHierarchy: SfCategory[];
}>;

export interface GetProductReviewsExtendedArgs {}
export interface GetProductReviewsCustomArgs {}

export type GetProductReviewsArgs = {
  productId: SfId;
  pageSize?: number;
  currentPage?: number;
  //$extended?: GetProductReviewsExtendedArgs;
  //$custom?: GetProductReviewsCustomArgs;
};

export type GetProductReviews = (args: Simplify<GetProductReviewsArgs>) => Promise<{
  reviews: SfProductReview[];
  pagination: SfPagination;
}>;

export interface AddProductReviewExtendedArgs {}
export interface AddProductReviewCustomArgs {}

export type AddProductReviewArgs = {
  productId: SfId;
  productSku?: string;
  review: Pick<SfProductReview, "title" | "text" | "rating" | "reviewer">;
  //$extended?: AddProductReviewExtendedArgs;
  //$custom?: AddProductReviewCustomArgs;
};

export type AddProductReview = (args: Simplify<AddProductReviewArgs>) => Promise<{
  review: SfProductReview;
}>;

export interface GetProductPriceExtendedArgs {}
export interface GetProductPriceCustomArgs {}

export type GetProductPriceArgs = {
  product: Record<string, any>;
  quantity?: number;
  customerGroup?: string | number | null;
  currency?: string | null;
  //$extended?: GetProductPriceExtendedArgs;
  //$custom?: GetProductPriceCustomArgs;
};

export type GetProductPrice = (args: Simplify<GetProductPriceArgs>) => Promise<{
  pricing: ResolvedPrice;
}>;

export interface GetProductMediaGalleryEntriesExtendedArgs {}
export interface GetProductMediaGalleryEntriesCustomArgs {}

export type GetProductMediaGalleryEntriesArgs = {
  productId: SfId;
  //$extended?: GetProductMediaGalleryEntriesExtendedArgs;
  //$custom?: GetProductMediaGalleryEntriesCustomArgs;
};

export type GetProductMediaGalleryEntries = (args: Simplify<GetProductMediaGalleryEntriesArgs>) => Promise<{
  media: SfProductMediaEntry[];
}>;

export type GetCatalogPriceRules = (args?: Record<string, any>) => Promise<{
  rules: Record<string, any>[];
}>;

export type GetCartPriceRules = (args?: Record<string, any>) => Promise<{
  rules: Record<string, any>[];
}>;
