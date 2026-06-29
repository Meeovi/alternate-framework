import type { InferCustom } from "../defs";

export type Maybe<TType> = TType | null;
export type Nullable<TType> = TType | null | undefined;

export type SfId = string;

export type SfEntityId = string | number;

export type SfStoreId = string;
export type SfWebsiteId = string;
export type SfStoreViewId = string;
export type SfCustomerGroupId = string;
export type SfTaxClassId = string;
export type SfAttributeId = string;
export type SfAttributeSetId = string;
export type SfStockId = string;
export type SfSourceId = string;
export type SfReservationId = string;
export type SfProductLinkId = string;
export type SfCustomerAddressId = string;
export type SfPaymentMethodId = string;
export type SfShippingMethodId = string;
export type SfInvoiceId = string;
export type SfShipmentId = string;
export type SfCreditMemoId = string;
export type SfQuoteId = string;
export type SfOrderId = string;
export type SfReturnId = string;
export type SfGiftCardId = string;
export type SfWishlistId = string;
export type SfGiftRegistryId = string;
export type SfCompanyId = string;
export type SfTeamId = string;
export type SfRoleId = string;

export type SfProductStatus = 'enabled' | 'disabled';
export type SfProductVisibility = 'not_visible_individually' | 'catalog' | 'search' | 'catalog_search';
export type SfProductType = 'simple' | 'configurable' | 'bundle' | 'grouped' | 'virtual' | 'downloadable';
export type SfProductLinkType = 'related' | 'upsell' | 'crosssell';

export type SfCartStatus = 'active' | 'abandoned' | 'converted';
export type SfOrderState = 'new' | 'processing' | 'complete' | 'closed' | 'canceled' | 'hold';
export type SfOrderStatus = 'pending' | 'pending_payment' | 'processing' | 'completed' | 'closed' | 'canceled' | 'holded' | 'payment_review';
export type SfInvoiceState = 'paid' | 'open' | 'canceled';
export type SfShipmentState = 'shipped' | 'partial' | 'backorder';
export type SfCreditMemoState = 'refunded' | 'canceled' | 'open';
export type SfPaymentOperation = 'authorize' | 'capture' | 'void' | 'refund' | 'cancel';
export type SfPaymentState = 'pending' | 'processing' | 'approved' | 'denied' | 'canceled' | 'refunded';
export type SfShipmentStatus = 'pending' | 'ready' | 'shipped' | 'canceled';
export type SfReturnStatus = 'pending' | 'authorized' | 'rejected' | 'received' | 'completed';

export type SfAddressType = 'shipping' | 'billing' | 'both';
export type SfGender = 'male' | 'female' | 'not_specified';

export type SfSortDirection = 'ASC' | 'DESC';
export type SfYesNo = 0 | 1;

export interface SfMoneyCustom extends InferCustom<"normalizeMoney"> {}

export interface SfMoney {
  currency: string;
  amount: number;
  precisionAmount: string;
  $custom?: SfMoneyCustom;
}

export interface SfDiscountablePriceCustom extends InferCustom<"normalizeDiscountablePrice"> {}

export interface SfDiscountablePrice {
  isDiscounted: boolean;
  regularPrice: SfMoney;
  value: SfMoney;
  $custom?: SfDiscountablePriceCustom;
}

export interface SfImageCustom extends InferCustom<"normalizeImage"> {}

export interface SfImage {
  alt: Maybe<string>;
  url: string;
  disabled: boolean;
  $custom?: SfImageCustom;
}

export interface SfAttributeCustom extends InferCustom<"normalizeAttribute"> {}

export interface SfAttribute {
  label: string;
  name: string;
  value: string;
  valueLabel: string;
  $custom?: SfAttributeCustom;
}

export interface SfAttributeSet {
  id: SfAttributeSetId;
  code: string;
  name: string;
  entityTypeId: string;
  sortOrder: number;
}

export interface SfAttributeGroup {
  id: string;
  code: string;
  name: string;
  attributeSetId: SfAttributeSetId;
  sortOrder: number;
}

export interface SfAttributeType {
  code: string;
  name: string;
  backendType: 'varchar' | 'int' | 'decimal' | 'text' | 'datetime' | 'static';
  frontendInput: 'text' | 'textarea' | 'date' | 'boolean' | 'multiselect' | 'select' | 'price' | 'media_image' | 'weee' | 'swatch_visual' | 'swatch_text';
  sourceModel?: string;
  backendModel?: string;
  isRequired: boolean;
  isUnique: boolean;
  isGlobal: boolean;
  isVisible: boolean;
  isSearchable: boolean;
  isFilterable: boolean;
  isComparable: boolean;
  isVisibleOnFront: boolean;
  isUsedInProductListing: boolean;
  isHtmlAllowedOnFront: boolean;
  isConfigurable: boolean;
  applyTo: SfProductType[];
  sortOrder: number;
}

export interface SfAddressCustom extends InferCustom<"normalizeAddress"> {}

export interface SfAddress {
  address1: Maybe<string>;
  address2?: Maybe<string>;
  city: Maybe<string>;
  country: Maybe<string>;
  firstName: Maybe<string>;
  lastName: Maybe<string>;
  phoneNumber: Maybe<string>;
  postalCode: Maybe<string>;
  state: Maybe<string>;
  titleCode: Maybe<string>;
  type?: SfAddressType;
  isDefaultBilling?: boolean;
  isDefaultShipping?: boolean;
  $custom?: SfAddressCustom;
}

export interface SfCustomerGroup {
  id: SfCustomerGroupId;
  code: string;
  taxClassId?: SfTaxClassId;
  taxClassName?: string;
}

export interface SfTaxClass {
  id: SfTaxClassId;
  code: string;
  name: string;
  type: 'customer' | 'product';
}

export interface SfTaxRate {
  id: SfId;
  code: string;
  taxCountryId: string;
  taxRegionId: string;
  rate: number;
  taxPostcode?: string;
  taxCalculationRateId?: string;
}

export interface SfTaxRule {
  id: SfId;
  code: string;
  priority: number;
  position: number;
  customerTaxClassIds: SfTaxClassId[];
  productTaxClassIds: SfTaxClassId[];
  taxRateIds: string[];
  calculateSubtotal?: boolean;
}

export interface SfWebsite {
  id: SfWebsiteId;
  code: string;
  name: string;
  sortOrder: number;
  defaultGroupId: SfCustomerGroupId;
  isDefault: boolean;
}

export interface SfStoreGroup {
  id: string;
  code: string;
  name: string;
  websiteId: SfWebsiteId;
  rootCategoryId: SfCategoryId | SfId;
  defaultStoreId: SfStoreId | SfId;
}

export interface SfStore {
  id: SfStoreId;
  code: string;
  name: string;
  groupId: string;
  websiteId: SfWebsiteId;
  rootCategoryId: SfCategoryId | SfId;
  defaultStoreGroupId: string;
  isActive: boolean;
}

export interface SfStoreView {
  id: SfStoreViewId;
  code: string;
  name: string;
  storeId: SfStoreId;
  websiteId: SfWebsiteId;
  locale: SfLocale;
  sortOrder: number;
  isDefault: boolean;
  status: 'enabled' | 'disabled';
}

export interface SfInventorySource {
  id: SfSourceId;
  code: string;
  name: string;
  enabled: boolean;
  type: 'default' | 'shipping' | 'pickup_location' | 'warehouse';
  contactName?: string;
  contactEmail?: string;
  contactPhone?: string;
  latitude?: number;
  longitude?: number;
  countryId?: string;
  regionId?: string;
  region?: string;
  city?: string;
  street?: string;
  postcode?: string;
  description?: string;
  sortOrder?: number;
}

export interface SfStockItem {
  id?: string;
  productId: SfId;
  sku?: string;
  stockId?: SfStockId;
  sourceId?: SfSourceId;
  qty: number;
  minQty: number;
  useConfigMinQty: boolean;
  isQtyDecimal: boolean;
  backorders: number;
  minSaleQty: number;
  maxSaleQty: number;
  isInStock: boolean;
  notifyStockQty: number;
  useConfigNotifyStockQty: boolean;
  useConfigBackorders: boolean;
  useConfigMinSaleQty: boolean;
  useConfigMaxSaleQty: boolean;
  enableQtyIncrements: boolean;
  qtyIncrements: number;
  useConfigEnableQtyIncrements: boolean;
  websiteId?: SfWebsiteId;
  stockStatus?: 'in_stock' | 'out_of_stock' | 'backorders';
  lowStockDate?: string;
  isDecimalDivided?: boolean;
  metadata?: Record<string, unknown>;
}

export interface SfInventoryReservation {
  id: SfReservationId;
  stockId?: SfStockId;
  sourceId?: SfSourceId;
  productId: SfId;
  sku: string;
  qty: number;
  status: 'open' | 'committed' | 'released' | 'cancelled';
  metadata?: Record<string, unknown>;
  expiresAt?: string;
  createdAt?: string;
  updatedAt?: string;
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

export interface SfPriceRule {
  id: string;
  name: string;
  description?: string;
  status: 'active' | 'inactive';
  customerGroupIds: string[];
  couponType: 'no_coupon' | 'specific_coupon' | 'auto';
  couponCode?: string;
  usesPerCoupon?: number;
  usesPerCustomer?: number;
  uses?: number;
  priority: number;
  sortOrder: number;
  fromDate?: string;
  toDate?: string;
  timeFormat?: '0' | '1';
  isAdvanced?: boolean;
  stopRulesProcessing?: boolean;
  websiteIds: string[];
  actionType: 'by_percent' | 'by_fixed' | 'by_specific' | 'cart_fixed' | 'buy_x_get_y';
  discountAmount: number;
  discountQty?: number;
  applyToShipping?: boolean;
  simpleAction?:
    | 'by_percent'
    | 'by_fixed'
    | 'by_specific'
    | 'cart_fixed'
    | 'buy_x_get_y'
    | 'buy_x_get_y_free'
    | 'buy_x_get_y_percent';
  freeShipping?: boolean;
  pager?:
    | '0' | '1'
    | '2' | '3'
    | '4' | '5'
    | '6' | '7'
    | '8' | '9';
  simpleFreeShipping?: number;
  conditions?: string;
  actions?: string;
  conditionType?: string;
  productIds?: string[];
  categoryIds?: string[];
  discountDescription?: string;
  purchasingFlow?: 'checkout_cart' | 'checkout_onepage' | 'onepage_checkout';
}

export interface SfCartPriceRule extends SfPriceRule {
  scope: 'cart';
}

export interface SfCatalogPriceRule extends SfPriceRule {
  scope: 'catalog';
}

export interface SfCoupon {
  id: string;
  code: string;
  description?: string;
  discountType: 'percentage' | 'fixed' | 'buy_x_get_y';
  discountAmount: number;
  currency?: string;
  expiresAt?: string;
  maxDiscountAmount?: number;
  autoGenerate?: boolean;
  usageLimit?: number;
  usagePerCustomer?: number;
  isActive?: boolean;
  metadata?: Record<string, unknown>;
}

export interface SfShippingMethod {
  id: string;
  carrierCode: string;
  carrierTitle: string;
  methodCode: string;
  methodTitle: string;
  price: SfMoney;
  priceExclTax?: SfMoney;
  includeTax?: boolean;
  taxAmount?: SfMoney;
  available?: boolean;
  errorMessage?: string;
  deliveryTime?: {
    min: number;
    max: number;
    unit: 'day' | 'week' | 'month';
  };
  trackingAvailable?: boolean;
  extensionAttributes?: Record<string, unknown>;
  metadata?: Record<string, unknown>;
}

export interface SfCarrier {
  carrierCode: string;
  carrierName: string;
  methods: SfShippingMethod[];
}

export interface SfPaymentMethod {
  id: string;
  code: string;
  title: string;
  isGateway?: boolean;
  canAuthorize?: boolean;
  canCapture?: boolean;
  canRefund?: boolean;
  canVoid?: boolean;
  canUseInternal?: boolean;
  canUseCheckout?: boolean;
  isOffline?: boolean;
  sortOrder?: number;
  availability?: {
    countries?: string[];
    currencies?: string[];
  };
  extensionAttributes?: Record<string, unknown>;
  metadata?: Record<string, unknown>;
}

export interface SfPaymentTransaction {
  id: string;
  orderId: SfOrderId;
  paymentMethodId?: SfPaymentMethodId;
  parentTransactionId?: string;
  transactionType: 'authorization' | 'capture' | 'void' | 'refund' | 'order';
  amount: SfMoney;
  status: SfPaymentState;
  createdAt: string;
  updatedAt: string;
  additionalInformation?: Record<string, unknown>;
  metadata?: Record<string, unknown>;
}

export type SfCurrency = string;

export type SfLocale = string;

export type SfLanguage = string;

export type SfCountry = string;

export type SfRegion = string;

export type SfZipCode = string;

export type SfPhoneNumber = string;

export type SfEmail = string;

export type SfPassword = string;

export type SfSlug = string;

export type SfName = string;

export type SfCategoryId = SfId;

export interface SfProductVideo {
  url: string;
  title: string;
  description?: string;
  previewImageUrl?: string;
  metadata?: Record<string, unknown>;
}

export interface SfTierPrice {
  customerGroupId?: string;
  qty: number;
  price: number;
  websiteId?: string;
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
  categoryId: SfCategoryId | SfId;
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

export interface SfProductDownloadableLink {
  id: string;
  title: string;
  price: number;
  numberOfDownloads: number;
  isShareable: 0 | 1 | 2;
  linkType: 'file' | 'url';
  linkFile?: string;
  sampleFile?: string;
  sampleType?: 'file' | 'url';
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
  linkType: 'file' | 'url';
  sampleFile?: string;
  sampleType?: 'file' | 'url';
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

export interface SfRating {
  ratingId: string;
  entityId: string;
  ratingCode: string;
  ratingSummary: number;
  reviewIds: string[];
  entityName?: string;
}

export interface SfRatingOption {
  optionId: string;
  ratingId: string;
  code: string;
  value: number;
}

export interface SfRatingOptionVote {
  voteId: string;
  optionId: string;
  remoteIp: string;
  remoteIp2?: string;
  customerId?: number;
  entityPkValue: SfId;
  ratingId: string;
  status: number;
  percent: number;
}

export interface SfWishlist {
  id: SfWishlistId;
  customerId?: string;
  customerEmail?: string;
  name?: string;
  sharingCode: string;
  isShared: boolean;
  items: SfWishlistItem[];
  createdAt: string;
  updatedAt: string;
  metadata?: Record<string, unknown>;
}

export interface SfWishlistItem {
  wishlistItemId: string;
  wishlistId: string;
  productId: SfId;
  sku: string;
  description?: string;
  addedAt: string;
  qty?: number;
  metadata?: Record<string, unknown>;
}

export interface SfGiftRegistry {
  id: SfGiftRegistryId;
  type: string;
  ownerId?: string;
  registrantName?: string;
  registrantEmail?: string;
  eventDate?: string;
  eventName?: string;
  eventLocation?: string;
  isActive: boolean;
  items: SfGiftRegistryItem[];
  metadata?: Record<string, unknown>;
}

export interface SfGiftRegistryItem {
  id: string;
  giftRegistryId: SfGiftRegistryId;
  productId: SfId;
  sku: string;
  qty: number;
  qtyAdded?: number;
  qtyFulfilled?: number;
  metadata?: Record<string, unknown>;
}

export interface SfGiftCard {
  id: SfGiftCardId;
  code: string;
  balance: number;
  currency: string;
  expiresAt?: string;
  isActive: boolean;
  customerId?: string;
  email?: string;
  orderId?: SfOrderId;
  createdAt: string;
  updatedAt: string;
  metadata?: Record<string, unknown>;
}

export interface SfSubscription {
  id: string;
  customerId: string;
  productId: SfId;
  productSku: string;
  productName: string;
  status: 'active' | 'suspended' | 'canceled' | 'expired';
  schedule: {
    interval: 'day' | 'week' | 'month' | 'year';
    frequency: number;
    startDate: string;
    endDate?: string;
    nextBillingDate?: string;
  };
  referenceNumber?: string;
  createdAt: string;
  updatedAt: string;
  metadata?: Record<string, unknown>;
}

export interface SfRMARequest {
  id: SfReturnId;
  orderId: SfOrderId;
  customerId?: string;
  status: SfReturnStatus;
  items: SfRMAItem[];
  reason?: string;
  shippingMethod?: string;
  trackingNumber?: string;
  createdAt: string;
  updatedAt: string;
  metadata?: Record<string, unknown>;
}

export interface SfRMAItem {
  id: string;
  returnId: string;
  orderItemId: string;
  productId: SfId;
  sku: string;
  qtyReturned: number;
  qtyReceived?: number;
  qtyRefunded?: number;
  reason?: string;
  condition?: 'received' | 'damaged' | 'rejected';
  metadata?: Record<string, unknown>;
}

export interface SfRewardPoint {
  id: string;
  customerId: string;
  points: number;
  balance: number;
  expiresAt?: string;
  createdAt: string;
  updatedAt: string;
  metadata?: Record<string, unknown>;
}

export interface SfRewardPointHistory {
  id: string;
  customerId: string;
  points: number;
  action: 'added' | 'subtracted' | 'expired' | 'redeemed';
  balance: number;
  referenceId?: string;
  createdAt: string;
  metadata?: Record<string, unknown>;
}

export interface SfCompanyAccount {
  id: SfCompanyId;
  name: string;
  email: string;
  telephone: string;
  companyName: string;
  resellerId?: string;
  vatTaxId?: string;
  status: 'active' | 'inactive' | 'pending_approval' | 'rejected';
  creditLimit: number;
  availableCredit: number;
  balance: number;
  salesRepresentativeId?: string;
  websiteId: SfWebsiteId;
  groupId?: string;
  companyRoles: string[];
  contacts: SfCompanyContact[];
  addresses: SfAddress[];
  createdAt: string;
  updatedAt: string;
  metadata?: Record<string, unknown>;
}

export interface SfCompanyContact {
  id: string;
  companyId: SfCompanyId;
  userId?: string;
  firstName: string;
  lastName: string;
  email: string;
  telephone?: string;
  jobTitle?: string;
  status: 'active' | 'inactive';
  createdAt: string;
  updatedAt: string;
  metadata?: Record<string, unknown>;
}

export interface SfTeam {
  id: SfTeamId;
  companyId: SfCompanyId;
  name: string;
  description?: string;
  userIds: string[];
  roleIds: string[];
  status: 'active' | 'inactive';
  createdAt: string;
  updatedAt: string;
  metadata?: Record<string, unknown>;
}

export interface SfRole {
  id: SfRoleId;
  name: string;
  permissions: SfPermission[];
  status: 'active' | 'inactive';
  createdAt: string;
  updatedAt: string;
  metadata?: Record<string, unknown>;
}

export interface SfPermission {
  id: string;
  code: string;
  name: string;
  category: string;
  description?: string;
  metadata?: Record<string, unknown>;
}

export interface SfRequisitionList {
  id: string;
  customerId: string;
  name: string;
  description?: string;
  items: SfRequisitionListItem[];
  isShared: boolean;
  sharedAt?: string;
  createdAt: string;
  updatedAt: string;
  metadata?: Record<string, unknown>;
}

export interface SfRequisitionListItem {
  id: string;
  requisitionListId: string;
  productId: SfId;
  sku: string;
  qty: number;
  metadata?: Record<string, unknown>;
}

export interface SfSharedCatalog {
  id: string;
  name: string;
  description?: string;
  type: 'public' | 'private';
  companyIds: string[];
  productIds: SfId[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  metadata?: Record<string, unknown>;
}

export interface SfPurchaseOrder {
  id: string;
  companyId: SfCompanyId;
  customerId: string;
  orderId?: SfOrderId;
  items: SfPurchaseOrderItem[];
  status: 'pending' | 'approved' | 'rejected' | 'ordered';
  total: SfMoney;
  currency: string;
  notes?: string;
  approvedBy?: string;
  approvedAt?: string;
  createdAt: string;
  updatedAt: string;
  metadata?: Record<string, unknown>;
}

export interface SfPurchaseOrderItem {
  id: string;
  purchaseOrderId: string;
  productId: SfId;
  sku: string;
  qty: number;
  unitPrice: SfMoney;
  metadata?: Record<string, unknown>;
}

export interface SfNegotiableQuote {
  id: string;
  customerId: string;
  companyId?: SfCompanyId;
  items: SfQuoteItem[];
  subtotal: SfMoney;
  taxAmount: SfMoney;
  shippingAmount: SfMoney;
  discountAmount: SfMoney;
  grandTotal: SfMoney;
  currency: string;
  status: 'draft' | 'submitted' | 'processing' | 'ordered' | 'expired';
  expiresAt: string;
  proposalId?: string;
  shippingAddress?: SfAddress;
  createdAt: string;
  updatedAt: string;
  metadata?: Record<string, unknown>;
}

export interface SfQuoteItem {
  id: string;
  quoteId: string;
  productId: SfId;
  sku: string;
  name: string;
  qty: number;
  unitPrice: SfMoney;
  rowTotal: SfMoney;
  discountAmount: SfMoney;
  taxAmount?: SfMoney;
  metadata?: Record<string, unknown>;
}

export interface SfStoreCredit {
  id: string;
  customerId: string;
  balance: number;
  currency: string;
  isActive: boolean;
  expiresAt?: string;
  createdAt: string;
  updatedAt: string;
  metadata?: Record<string, unknown>;
}

export interface SfCompanyCredit {
  id: string;
  companyId: SfCompanyId;
  balance: number;
  currency: string;
  creditLimit: number;
  createdAt: string;
  updatedAt: string;
  metadata?: Record<string, unknown>;
}

export interface SfNegotiableCredit {
  id: string;
  companyId: SfCompanyId;
  amount: number;
  currency: string;
  expiresAt: string;
  status: 'pending' | 'approved' | 'rejected' | 'used';
  createdAt: string;
  updatedAt: string;
  metadata?: Record<string, unknown>;
}

export interface SfRecommendation {
  id: string;
  productId: SfId;
  productName: string;
  productSku?: string;
  positions: Array<{
    block: string;
    sortOrder: number;
  }>;
  rules: SfRecommendationRule[];
  metadata?: Record<string, unknown>;
}

export interface SfRecommendationRule {
  id: string;
  name: string;
  conditions?: Record<string, unknown>;
  actions?: Record<string, unknown>;
  isActive: boolean;
  sortOrder: number;
  metadata?: Record<string, unknown>;
}

export interface SfDynamicBlock {
  id: string;
  name: string;
  content: string;
  type: string;
  customerGroupIds?: string[];
  websiteIds?: string[];
  storeIds?: string[];
  sortOrder: number;
  isActive: boolean;
  conditions?: Record<string, unknown>;
  createdAt?: string;
  updatedAt?: string;
  metadata?: Record<string, unknown>;
}

export interface SfCMSPage {
  id: string;
  title: string;
  identifier: string;
  content: string;
  contentHeading: string;
  pageLayout: string;
  layoutUpdateXml?: string;
  customTheme: string;
  customRootTemplate: string;
  customLayoutUpdateXml: string;
  metaKeywords: string;
  metaDescription: string;
  isActive: boolean;
  sortOrder: number;
  parentId?: number;
  path: string;
  websiteIds: string[];
  storeIds: string[];
  createdAt: string;
  updatedAt: string;
  metadata?: Record<string, unknown>;
}

export interface SfCMSBlock {
  id: string;
  title: string;
  identifier: string;
  content: string;
  isActive: boolean;
  sortOrder: number;
  storeIds: string[];
  createdAt: string;
  updatedAt: string;
  metadata?: Record<string, unknown>;
}

export interface SfEvent {
  id: string;
  name: string;
  description?: string;
  startDate: string;
  endDate?: string;
  location?: string;
  type?: string;
  sortOrder: number;
  isActive: boolean;
  sort?: number;
  createdAt: string;
  updatedAt: string;
  metadata?: Record<string, unknown>;
}

export interface SfDirectoryEntry {
  id: string;
  name: string;
  type?: string;
  url?: string;
  metadata?: Record<string, unknown>;
}

export interface SfAffiliate {
  id: string;
  code: string;
  name: string;
  email?: string;
  balance: number;
  currency: string;
  status: 'active' | 'inactive' | 'pending';
  clicks: number;
  orders: number;
  createdAt: string;
  updatedAt: string;
  metadata?: Record<string, unknown>;
}

export interface SfAffiliateReferral {
  id: string;
  affiliateId: string;
  orderId?: SfOrderId;
  customerId?: string;
  amount: number;
  currency: string;
  status: 'pending' | 'paid' | 'canceled';
  createdAt: string;
}