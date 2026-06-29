import type { InferCustom } from "../defs";
import type {
  Maybe,
  SfAddress,
  SfAttribute,
  SfAttributeSet,
  SfCategoryId,
  SfCoupon,
  SfCurrency,
  SfCustomerGroup,
  SfCustomerGroupId,
  SfDiscountablePrice,
  SfImage,
  SfId,
  SfInventorySource,
  SfProductBundledItem,
  SfProductBundledOption,
  SfProductCategoryLink,
  SfProductConfigurableOption,
  SfProductConfigurableValue,
  SfProductGroupedOption,
  SfProductLink,
  SfProductLinkId,
  SfProductLinkType,
  SfProductMediaEntry,
  SfProductOption,
  SfProductOptionValue,
  SfProductRating,
  SfProductStockItem,
  SfProductStatus,
  SfProductType,
  SfProductVariant,
  SfProductVideo,
  SfStoreViewId,
  SfTaxClass,
  SfTaxClassId,
  SfTierPrice,
} from "./shared";

export interface SfProductVariantCustom extends InferCustom<"normalizeProductVariant"> {}

export interface SfProductVariant {
  id: string;
  sku: string;
  name: Maybe<string>;
  productId: SfId;
  attributeSetId?: string;
  attributeSetName?: string;
  websiteIds: string[];
  attributes: SfAttribute[];
  status: SfProductStatus;
  visibility: SfProductVisibility;
  typeId: SfProductType;
  extensionAttributes?: {
    stockItem?: SfProductStockItem;
    downloadableProductLinks?: SfProductDownloadableLink[];
    downloadableProductSamples?: SfProductDownloadableSample[];
    bundleProductOptions?: SfProductBundledOption[];
    configurableProductOptions?: SfProductConfigurableOption[];
    configurableProductLinks?: SfProductConfigurableValue[];
    groupedProductOptions?: SfProductGroupedOption[];
    productOptions?: SfProductOption[];
    mediaGalleryEntries?: SfProductMediaEntry[];
    tierPrices?: SfTierPrice[];
    categoryLinks?: SfProductCategoryLink[];
    productLinks?: SfProductLink[];
    stockStatus?: string;
    categoryId?: SfCategoryId;
    description?: string;
    shortDescription?: string;
    urlKey?: string;
    urlPath?: string;
    metaTitle?: string;
    metaDescription?: string;
    metaKeyword?: string;
    specialPrice?: number;
    specialFromDate?: string;
    specialToDate?: string;
    newFromDate?: string;
    newToDate?: string;
    countryOfManufacture?: string;
    isFeatured?: boolean;
    giftMessageAvailable?: string;
    material?: string;
    ecoTax?: number;
    ecoTaxClassId?: string;
    updateLayoutDates?: boolean;
    weight?: number;
    containerClass?: string;
  };
  price?: SfDiscountablePrice;
  quantityLimit?: Maybe<number>;
  $custom?: SfProductVariantCustom;
}

export type SfProductVisibility = 'not_visible_individually' | 'catalog' | 'search' | 'catalog_search';

export interface SfProductReviewCustom extends InferCustom<"normalizeProductReview"> {}

export interface SfProductReview {
  id: SfId;
  title: Maybe<string>;
  text: Maybe<string>;
  rating: Maybe<number>;
  reviewer: Maybe<string>;
  createdAt: string;
  $custom?: SfProductReviewCustom;
}

export interface SfProductCustom extends InferCustom<"normalizeProduct"> {}

export interface SfProduct {
  categories?: SfProductCategoryLink[];
  id: SfId;
  sku: Maybe<string>;
  name: Maybe<string>;
  slug: string;
  description?: Maybe<string>;
  shortDescription?: Maybe<string>;
  price: Maybe<SfDiscountablePrice>;
  specialPrice?: Maybe<number>;
  specialFromDate?: Maybe<string>;
  specialToDate?: Maybe<string>;
  newFromDate?: Maybe<string>;
  newToDate?: Maybe<string>;
  metaTitle?: string;
  metaDescription?: string;
  metaKeyword?: string;
  urlKey?: string;
  urlPath?: string;
  countryOfManufacture?: string;
  weight?: number;
  material?: string;
  ecoTax?: number;
  giftMessageAvailable?: string;
  attributeSetId: string;
  attributeSetName: string;
  typeId: SfProductType;
  hasOptions: boolean;
  requiredOptions: number;
  createdAt: string;
  updatedAt: string;
  status: SfProductStatus;
  visibility: SfProductVisibility;
  taxClassId?: SfTaxClassId;
  taxClassName?: string;
  primaryImage: Maybe<SfImage>;
  gallery: SfImage[];
  rating?: Maybe<{
    average: number;
    count: number;
  }>;
  variants: SfProductVariant[];
  attributes: SfAttribute[];
  quantityLimit?: Maybe<number>;
  linkType?: SfProductLinkType;
  relatedProductIds?: string[];
  upsellProductIds?: string[];
  crosssellProductIds?: string[];
  isFeatured?: boolean;
  isNew?: boolean;
  mediaGalleryEntries?: SfProductMediaEntry[];
  productLinks?: SfProductLink[];
  extensionAttributes?: {
    stockItem?: SfProductStockItem;
    downloadableProductLinks?: SfProductDownloadableLink[];
    downloadableProductSamples?: SfProductDownloadableSample[];
    bundleProductOptions?: SfProductBundledOption[];
    configurableProductOptions?: SfProductConfigurableOption[];
    configurableProductLinks?: SfProductConfigurableValue[];
    groupedProductOptions?: SfProductGroupedOption[];
    categoryLinks?: SfProductCategoryLink[];
    tierPrices?: SfTierPrice[];
    productRating?: SfProductRating;
    reviewSummary?: SfReviewSummary;
  };
  $custom?: SfProductCustom;
}

export interface SfProductCatalogItemCustom extends InferCustom<"normalizeProductCatalogItem"> {}

export interface SfProductCatalogItem
  extends Pick<
          SfProduct,
          | "id"
          | "sku"
          | "name"
          | "slug"
          | "status"
          | "visibility"
          | "typeId"
          | "primaryImage"
          | "gallery"
          | "price"
          | "attributes"
          | "specialPrice"
          | "quantityLimit"
          | "isFeatured"
          | "isNew"
          | "productLinks"
        > {
  $custom?: SfProductCatalogItemCustom;
}

export interface SfProductSearchResult {
  items: SfProductCatalogItem[];
  totalResults: number;
  pageInfo: {
    currentPage: number;
    pageSize: number;
    totalPages: number;
    totalResults: number;
    hasPreviousPage: boolean;
    hasNextPage: boolean;
  };
  aggregations?: Array<{
    field: string;
    label: string;
    options: Array<{
      value: string;
      label: string;
      count: number;
      isSelected: boolean;
    }>;
  }>;
  suggestions?: Array<{
    value: string;
    count?: number;
  }>;
}

export interface SfPaginationCustom extends InferCustom<"normalizePagination"> {}

export interface SfPagination {
  currentPage: number;
  pageSize: Maybe<number>;
  totalResults: number;
  totalPages: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
  $custom?: SfPaginationCustom;
}

export interface SfProductDownloadableLink {
  id: string;
  title: string;
  price: number;
  numberOfDownloads: number;
  isShareable: 0 | 1 | 2;
  linkType: "file" | "url";
  linkFile?: string;
  sampleFile?: string;
  sampleType?: "file" | "url";
  sortOrder: number;
  maxDownloads: number;
  useConfigMaxDownloads: boolean;
  useConfigShareable: boolean;
  useConfigNumberOfDownloads: boolean;
  url?: string;
  fileTypes?: string;
  extensionAttributes?: Record<string, unknown>;
}

export interface SfProductDownloadableSample {
  id: string;
  title: string;
  sortOrder: number;
  numberOfDownloads: number;
  maxDownloads: number;
  useConfigMaxDownloads: boolean;
  useConfigNumberOfDownloads: boolean;
  price: number;
  linkFile?: string;
  linkType: "file" | "url";
  sampleFile?: string;
  sampleType: "file" | "url";
  url?: string;
  fileTypes?: string;
  extensionAttributes?: Record<string, unknown>;
}

export interface SfProductBundledOption {
  id: string;
  title: string;
  type: 'select' | 'radio' | 'checkbox' | 'multi_select';
  required: boolean;
  position?: number;
  productLinks: SfProductBundledItem[];
}

export interface SfProductBundledItem {
  id: string;
  sku?: string;
  name?: string;
  sortOrder: number;
  isDefault: boolean;
  qty: number;
  canChangeQty: boolean;
  priceType: 'fixed' | 'percent';
  price?: number;
  priceValue?: number;
  extensionAttributes?: {
    downloadableProductLinks?: SfProductDownloadableLink[];
    downloadableProductSamples?: SfProductDownloadableSample[];
    bundleProductOptions?: SfProductBundledOption[];
    stockItem?: SfProductStockItem;
  };
  metadata?: Record<string, unknown>;
}

export interface SfProductConfigurableOption {
  id: string;
  attributeId: string;
  label: string;
  position: number;
  values: SfProductConfigurableValue[];
  productId?: SfId;
  extensionAttributes?: Record<string, unknown>;
}

export interface SfProductConfigurableValue {
  valueIndex: number;
  label?: string;
  attributeCode?: string;
  value?: string;
  extensionAttributes?: Record<string, unknown>;
  metadata?: Record<string, unknown>;
}

export interface SfProductGroupedOption {
  id: string;
  sku: string;
  qty: number;
  position: number;
  sortOrder: number;
  extensionAttributes?: Record<string, unknown>;
}

export interface SfProductOption {
  id: string;
  title: string;
  type: 'select' | 'radio' | 'checkbox' | 'multi_select';
  required: boolean;
  sortOrder: number;
  values: SfProductOptionValue[];
}

export interface SfProductOptionValue {
  id: string;
  title: string;
  sortOrder: number;
  price: number;
  priceType: 'fixed' | 'percent';
  sku?: string;
}

export interface SfProductRating {
  entityId: SfId;
  ratingSummary: number;
  ratings: Array<{
    name: string;
    value: number;
    percent: number;
    count: number;
  }>;
}

export interface SfProductRanking {
  entityId: SfId;
  rank: number;
  position: number;
}

export interface SfReviewSummary {
  entityPkValue: SfId;
  reviewsCount: number;
  ratingSummary: number;
}

export interface SfProductMediaEntry {
  id: string;
  sku?: string;
  label?: string;
  position: number;
  disabled: boolean;
  types: ('image' | 'small_image' | 'thumbnail' | 'swatch_image' | 'media_gallery')[];
  alt?: string;
  url?: string;
  file?: string;
  contentType?: string;
  extensionAttributes?: {
    videoContent?: SfProductVideo;
  };
  createdAt?: string;
  updatedAt?: string;
}

export interface SfProductCategoryLink {
  categoryId: SfCategoryId;
  position: number;
  categoryName?: string;
}

export interface SfProductWebsiteLink {
  websiteId: SfWebsiteId;
  websiteName?: string;
}

export interface SfProductStockItem {
  itemId: string;
  productId: SfId;
  sku?: string;
  stockId: SfStockId;
  qty: number;
  minQty: number;
  isInStock: boolean;
  backorders: number;
  minSaleQty: number;
  maxSaleQty: number;
  notifyStockQty: number;
  websiteId: SfWebsiteId;
  stockStatus: 'in_stock' | 'out_of_stock' | 'backorders';
  lowStockDate?: string;
  enableQtyIncrements: boolean;
  qtyIncrements: number;
  isQtyDecimal: boolean;
  useConfigMinQty: boolean;
  useConfigNotifyStockQty: boolean;
  useConfigBackorders: boolean;
  useConfigMinSaleQty: boolean;
  useConfigMaxSaleQty: boolean;
  useConfigEnableQtyIncrements: boolean;
  extensionAttributes?: Record<string, unknown>;
  metadata?: Record<string, unknown>;
}

export interface SfProductLink {
  id: SfProductLinkId;
  linkedProductSku: string;
  linkedProductId: SfId;
  linkedProductName: string;
  productType: SfProductLinkType;
  position?: number;
  qty?: number;
}

export interface SfTierPrice {
  customerGroupId?: string;
  qty: number;
  price: number;
  websiteId?: string;
}

export interface SfProductVideo {
  url: string;
  title: string;
  description?: string;
  previewImageUrl?: string;
  metadata?: Record<string, unknown>;
}
