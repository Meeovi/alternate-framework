import type { SfCart, SfCartCoupon, SfCartCouponCustom, SfCartLineItemCustom } from "./cart";
import type { SfCategory, SfCategoryCustom } from "./category";
import type { SfShippingMethod, SfShippingMethodCustom, SfShippingMethods } from "./checkout";
import type { SfCustomer, SfCustomerAddress, SfCustomerCustom } from "./customer";
import type { SfFacet, SfFacetCustom, SfFacetItem, SfFacetType, SfFacetTypes } from "./facets";
import type {
  SfOrder,
  SfOrderCustom,
  SfOrderLineItem,
  SfOrderLineItemCustom,
  SfOrderListItem,
  SfOrderListItemCustom,
} from "./order";
import type {
  SfPagination,
  SfPaginationCustom,
  SfProduct,
  SfProductCatalogItem,
  SfProductCatalogItemCustom,
  SfProductCustom,
  SfProductReview,
  SfProductReviewCustom,
  SfProductVariant,
} from "./product";
import type {
  SfAddress,
  SfAddressCustom,
  SfAttribute,
  SfAttributeCustom,
  SfCreateAddressBody,
  SfCurrency,
  SfDiscountablePrice,
  SfDiscountablePriceCustom,
  SfImage,
  SfImageCustom,
  SfMoney,
  SfMoneyCustom,
} from "./shared";

export type {
  SfCart,
  SfCartCoupon,
  SfCartCouponCustom,
  SfCartLineItem,
  SfCartLineItemCustom,
} from "./cart";
export type {
  SfCategory,
  SfCategoryCustom,
} from "./category";
export type {
  SfShippingMethod,
  SfShippingMethodCustom,
  SfShippingMethods,
} from "./checkout";
export type {
  SfCustomer,
  SfCustomerAddress,
  SfCustomerCustom,
} from "./customer";
export type {
  SfFacet,
  SfFacetCustom,
  SfFacetItem,
  SfFacetType,
  SfFacetTypes,
} from "./facets";
export type {
  SfPagination,
  SfPaginationCustom,
  SfProduct,
  SfProductCatalogItem,
  SfProductCatalogItemCustom,
  SfProductCustom,
  SfProductReview,
  SfProductReviewCustom,
  SfProductVariant,
} from "./product";
export type {
  SfAddress,
  SfAddressCustom,
  SfAttribute,
  SfAttributeCustom,
  SfCreateAddressBody,
  SfCurrency,
  SfDiscountablePrice,
  SfDiscountablePriceCustom,
  SfEmail,
  SfId,
  SfImage,
  SfImageCustom,
  SfLanguage,
  SfLocale,
  SfMoney,
  SfMoneyCustom,
  SfPassword,
  SfPhoneNumber,
  SfRegion,
  SfZipCode,
  Maybe,
} from "./shared";
export type {
  SfOrder,
  SfOrderCustom,
  SfOrderLineItem,
  SfOrderLineItemCustom,
  SfOrderListItem,
  SfOrderListItemCustom,
} from "./order";

export interface SfContract {
  SfCartLineItemCustom: SfCartLineItemCustom;
  SfCartCouponCustom: SfCartCouponCustom;
  SfCartCoupon: SfCartCoupon;
  SfCart: SfCart;
  SfCategoryCustom: SfCategoryCustom;
  SfCategory: SfCategory;
  SfShippingMethodCustom: SfShippingMethodCustom;
  SfShippingMethod: SfShippingMethod;
  SfShippingMethods: SfShippingMethods;
  SfCustomerCustom: SfCustomerCustom;
  SfCustomer: SfCustomer;
  SfCustomerAddress: SfCustomerAddress;
  SfFacetTypes: SfFacetTypes;
  SfFacetType: SfFacetType;
  SfFacetItem: SfFacetItem;
  SfFacetCustom: SfFacetCustom;
  SfFacet: SfFacet;
  SfOrderLineItemCustom: SfOrderLineItemCustom;
  SfOrderLineItem: SfOrderLineItem;
  SfOrderCustom: SfOrderCustom;
  SfOrder: SfOrder;
  SfOrderListItemCustom: SfOrderListItemCustom;
  SfOrderListItem: SfOrderListItem;
  SfProductVariant: SfProductVariant;
  SfProductReviewCustom: SfProductReviewCustom;
  SfProductReview: SfProductReview;
  SfProductCustom: SfProductCustom;
  SfProduct: SfProduct;
  SfProductCatalogItemCustom: SfProductCatalogItemCustom;
  SfProductCatalogItem: SfProductCatalogItem;
  SfPaginationCustom: SfPaginationCustom;
  SfPagination: SfPagination;
  SfMoneyCustom: SfMoneyCustom;
  SfMoney: SfMoney;
  SfDiscountablePriceCustom: SfDiscountablePriceCustom;
  SfDiscountablePrice: SfDiscountablePrice;
  SfImageCustom: SfImageCustom;
  SfImage: SfImage;
  SfAttributeCustom: SfAttributeCustom;
  SfAttribute: SfAttribute;
  SfCreateAddressBody: SfCreateAddressBody;
  SfAddressCustom: SfAddressCustom;
  SfAddress: SfAddress;
  SfCurrency: SfCurrency;
}
