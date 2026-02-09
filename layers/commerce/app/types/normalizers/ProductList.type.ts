/**
 * ScandiPWA - Progressive Web App for Magento
 *
 * Copyright © Scandiweb, Inc. All rights reserved.
 * See LICENSE for license details.
 *
 * @license OSL-3.0 (Open Software License ("OSL") v. 3.0)
 * @package scandipwa/scandipwa-theme
 * @link https://github.com/scandipwa/scandipwa
 */

import { Field, InlineFragment } from '@tilework/opus';

import { ProductType } from 'Component/Product/Product.config';
import { SortDirections } from '../routes/CategoryPage/CategoryPage.config';
import { CategorySortOptions } from '../routes/CategoryPage/CategoryPage.type';
import {
    GQLCurrencyEnum,
    GQLPriceTypeEnum,
    GQLProductStockStatus,
    GQLShipBundleItemsEnum,
} from '../Graphql.type';

import { Product as DomainProduct } from '../domain';

export interface ProductStockItem {
    in_stock: boolean;
    min_sale_qty: number;
    max_sale_qty: number;
    qty_increments: number;
}

export interface NormalizedProductsQueryOutput {
    items: DomainProduct[];
    sort_fields: SortFields;
    filters: Aggregation[];
    total_count: number;
    page_info: SearchResultPageInfo;
}

/**
 * Lightweight normalizer helpers to convert raw product shapes into the
 * canonical `DomainProduct` used throughout the commerce layer. Adapters
 * should implement more thorough mappers; these helpers provide a safe
 * default to accelerate migration.
 */
export function normalizeProduct(raw: any): DomainProduct {
    const id = raw?.id ?? raw?.sku ?? (raw?.uid && String(raw.uid)) ?? '';
    const title = raw?.name ?? raw?.title ?? raw?.product_name ?? '';
    const description = raw?.description ?? raw?.short_description ?? '';
    let price: any = 0;
    if (raw?.price?.final_price?.value != null) price = raw.price.final_price.value;
    else if (raw?.price != null) price = raw.price;
    else if (typeof raw === 'number') price = raw;

    const images: string[] = [];
    if (Array.isArray(raw?.media_gallery_entries)) {
        for (const m of raw.media_gallery_entries) {
            if (m?.file) images.push(m.file);
            else if (m?.url) images.push(m.url);
        }
    }

    const imageObjs = images.map((u) => ({ url: u }));

    // Normalize attributes when available. Adapt to common shapes used by
    // adapters: either an object map or an array of attribute entries.
    let attributes: Record<string, any> | undefined = undefined;
    if (raw?.attributes && !Array.isArray(raw.attributes) && typeof raw.attributes === 'object') {
        attributes = raw.attributes as Record<string, any>;
    } else if (Array.isArray(raw?.attributes)) {
        attributes = {};
        for (const a of raw.attributes) {
            const code = a?.attribute_code ?? a?.attributeCode ?? a?.code ?? a?.name;
            if (!code) continue;
            // Prefer explicit value fields, fall back to label or option lists
            const value = a?.attribute_value ?? a?.value ?? a?.value_string ?? a?.attribute_label ?? a?.label ?? (a?.attribute_options ? a.attribute_options.map((o: any) => o.label) : undefined);
            attributes[code] = value;
        }
    } else if (raw?.s_attributes && Array.isArray(raw.s_attributes)) {
        attributes = {};
        for (const a of raw.s_attributes) {
            const code = a?.attribute_code ?? a?.code;
            if (!code) continue;
            attributes[code] = a?.attribute_value ?? a?.value ?? undefined;
        }
    }

    return {
        id: String(id),
        title,
        description,
        price,
        images: imageObjs,
        attributes,
        raw,
    };
}

export function normalizeProductsQueryOutput(raw: any): NormalizedProductsQueryOutput {
    const items = Array.isArray(raw?.items) ? raw.items.map(normalizeProduct) : [];
    return {
        items,
        sort_fields: raw?.sort_fields ?? { options: [] },
        filters: raw?.filters ?? [],
        total_count: raw?.total_count ?? (items.length || 0),
        page_info: raw?.page_info ?? { current_page: 1, total_pages: 1 },
    };
}

export interface OptimizedProductImage {
    path: string;
    url: string;
}

export interface SwatchData {
    type: string;
    value: string;
}

export interface AttributeWithValueOption {
    label: string;
    value: string;
    swatch_data: SwatchData;
}

export interface AttributeWithValue {
    attribute_id: number;
    attribute_value: string;
    attribute_code: string;
    attribute_label: string;
    attribute_type: string;
    attribute_group_id: string;
    attribute_group_name: string;
    attribute_options: AttributeWithValueOption[];
}

export interface ConfigurableProductOptionsValues {
    value_index: number;
}

export interface ConfigurableProductOptions {
    attribute_code: string;
    values: ConfigurableProductOptionsValues[];
}

export interface SimpleProduct {
    id: number;
    sku: string;
    stock_status: GQLProductStockStatus;
    salable_qty: number;
    stock_item: ProductStockItem;
    thumbnail: OptimizedProductImage;
    attributes: AttributeWithValue[];
    product_links: ProductLink[];
}

export interface ConfigurableVariant {
    product: ProductItem;
}

export interface ConfigurableCartProductFragment {
    configurable_options: ConfigurableProductOptions[];
    variants: ConfigurableVariant[];

}

export interface ProductLink {
    position: number;
    link_type: string;
    linked_product_sku: string;
}

export interface ProductDiscount {
    amount_off: number;
    percent_off: number;
}

export interface Money {
    currency: GQLCurrencyEnum;
    value: number;
}

export interface ProductPrice {
    discount: ProductDiscount;
    final_price: Money;
    final_price_excl_tax: Money;
    regular_price: Money;
    regular_price_excl_tax: Money;
    default_price: Money;
    default_final_price: Money;
    default_final_price_excl_tax: Money;
}

export interface PriceRange {
    minimum_price: ProductPrice;
    maximum_price: ProductPrice;
}

export interface SearchResultPageInfo {
    current_page: number;
    total_pages: number;
}

export interface AggregationOption {
    label: string;
    count: number;
    value_string: string;
    swatch_data: SwatchData;
}

export interface Aggregation {
    name: string;
    request_var: string;
    is_boolean: boolean;
    has_swatch: boolean;
    position: number;
    filter_items: AggregationOption[];
}

export interface SortField {
    value: string;
    label: string;
}

export interface SortFields {
    options: SortField[];
}

export interface TierPrice {
    discount: ProductDiscount;
    final_price: Money;
    quantity: number;
}

export interface CustomizableDateValue {
    price: number;
    priceInclTax: number;
    priceExclTax: number;
    price_type: GQLPriceTypeEnum;
    currency: string;
    sku: string;
}

export interface CustomizableDateOptionFragment {
    value: CustomizableDateValue[];
    product_sku: string;
}

export interface CustomizableFileValue {
    price: number;
    priceInclTax: number;
    priceExclTax: number;
    price_type: GQLPriceTypeEnum;
    currency: string;
    sku: string;
    file_extension: string;
}

export interface CustomizableFieldValue {
    price: number;
    priceInclTax: number;
    priceExclTax: number;
    price_type: GQLPriceTypeEnum;
    currency: string;
    sku: string;
    max_characters: number;
}

export interface CustomizableAreaOptionFragment {
    areaValues: CustomizableFieldValue[];
    product_sku: string;
}

export interface CustomizableFieldOptionFragment {
    fieldValues: CustomizableFieldValue[];
    product_sku: string;
}

export interface CustomizableSelectionValue {
    uid: string;
    option_type_id: number;
    price: number;
    priceInclTax: number;
    priceExclTax: number;
    price_type: GQLPriceTypeEnum;
    currency: string;
    sku: string;
    title: string;
    sort_order: number;
}

export type CustomizableProductFragmentOptionsFields = Array<
InlineFragment<'CustomizableDropDownOption', {
    dropdownValues: CustomizableSelectionValue[];
}>
| InlineFragment<'CustomizableRadioOption', {
    dropdownValues: CustomizableSelectionValue[];
}>
| InlineFragment<'CustomizableCheckboxOption', {
    checkboxValues: CustomizableSelectionValue[];
}>
| InlineFragment<'CustomizableMultipleOption', {
    checkboxValues: CustomizableSelectionValue[];
}>
| InlineFragment<'CustomizableFieldOption', CustomizableFieldOptionFragment>
| InlineFragment<'CustomizableAreaOption', CustomizableAreaOptionFragment>
| InlineFragment<'CustomizableFileOption', {
    fileValues: CustomizableFileValue[];
}>
| InlineFragment<'CustomizableDateOption', CustomizableDateOptionFragment>
| Field<'title', string>
| Field<'required', boolean>
| Field<'sort_order', number>
| Field<'type', string>
| Field<'uid', string>
>;

export interface BaseCustomizableProductFragmentOptions {
    CustomizableDropDownOption: {
        dropdownValues: CustomizableSelectionValue[];
    };
    CustomizableRadioOption: {
        dropdownValues: CustomizableSelectionValue[];
    };
    CustomizableCheckboxOption: {
        checkboxValues: CustomizableSelectionValue[];
    };
    CustomizableMultipleOption: {
        checkboxValues: CustomizableSelectionValue[];
    };
    CustomizableFieldOption: CustomizableFieldOptionFragment;
    CustomizableAreaOption: CustomizableAreaOptionFragment;
    CustomizableFileOption: {
        fileValues: CustomizableFileValue[];
    };
    CustomizableDateOption: CustomizableDateOptionFragment;
    title: string;
    required: boolean;
    sort_order: number;
    type: string;
    uid: string;
}

export type CustomizableProductFragmentOptions = BaseCustomizableProductFragmentOptions
& CustomizableFieldOptionFragment & CustomizableAreaOptionFragment & {
    dropdownValues: CustomizableSelectionValue[];
    checkboxValues: CustomizableSelectionValue[];
    fileValues: CustomizableFileValue[];
};

export interface ComplexTextValue {
    html: string;
}

export interface ProductBundleOption {
    name: string;
    stock_status: GQLProductStockStatus;
    price_range: PriceRange;
    type_id: any;
    dynamic_price: boolean;
}

export interface BundleOption {
    uid: string;
    label: string;
    quantity: number;
    position: number;
    is_default: boolean;
    price: number;
    price_type: GQLPriceTypeEnum;
    can_change_quantity: boolean;
    product: ProductBundleOption;
}

export interface BundleItem {
    uid: string;
    option_id: number;
    title: string;
    required: boolean;
    type: string;
    position: number;
    sku: string;
    options: BundleOption[];
}

export interface BundleOptionSelection {
    selection_id: number;
    final_option_price: number;
    final_option_price_excl_tax: number;
    regular_option_price: number;
    regular_option_price_excl_tax: number;
}

export interface BundlePriceOption {
    option_id: number;
    selection_details: BundleOptionSelection[];
}

export interface BundleProductFragment {
    dynamic_price: boolean;
    dynamic_sku: boolean;
    ship_bundle_items: GQLShipBundleItemsEnum;
    dynamic_weight: boolean;
    items: BundleItem[];
    bundle_options: BundlePriceOption[];
}

export interface UrlRewrite {
    url: string;
}

export interface RatingsBreakdown {
    rating_code: string;
    value: string;
}

export interface ProductReview {
    average_rating: number;
    nickname: string;
    title: string;
    detail: string;
    created_at: string;
    rating_votes: RatingsBreakdown[];
}

export interface ProductReviews {
    items: ProductReview[];
}

export interface ProductMediaGalleryEntriesVideoContent {
    media_type: string;
    video_description: string;
    video_metadata: string;
    video_provider: string;
    video_title: string;
    video_url: string;
}

export interface MediaGalleryEntry {
    id: number;
    file: string;
    label: string;
    position: number;
    disabled: boolean;
    media_type: string;
    types: string[];
    video_content: ProductMediaGalleryEntriesVideoContent;
    thumbnail: { url: string };
    base: { url: string };
    large: { url: string };
}

export interface Breadcrumb {
    category_id: number;
    category_name: string;
    category_level: number;
    category_url: string;
    category_is_active: boolean;
}

export interface CategoryTreeFragment {
    is_active: boolean;
}

export interface CategoryInterface {
    id: string;
    name: string;
    url: string;
    breadcrumbs: Breadcrumb[];
    CategoryTree: CategoryTreeFragment;
}

export type Category = CategoryInterface & CategoryTreeFragment;

export interface DownloadableProductSamples {
    title: string;
    sort_order: number;
    sample_url: string;
}

export interface DownloadableProductLinks {
    sample_url: string;
    sort_order: number;
    title: string;
    id: number;
    uid: string;
    price: number;
}

export interface DownloadableProductFragment {
    links_title: string;
    samples_title: string;
    links_purchased_separately: number;
    downloadable_product_links: DownloadableProductLinks[];
    downloadable_product_samples: DownloadableProductSamples[];
}

export type ProductItemFields = Array<
Field<'uid', string>
| Field<'id', number>
| Field<'sku', string>
| Field<'name', string>
| Field<'type_id', string>
| Field<'stock_status', GQLProductStockStatus>
| Field<'salable_qty', number>
| Field<'stock_item', ProductStockItem>
| Field<'price_range', PriceRange>
| Field<'image', OptimizedProductImage>
| Field<'thumbnail', OptimizedProductImage>
| Field<'small_image', OptimizedProductImage>
| Field<'short_description', ComplexTextValue>
| Field<'special_from_date', string>
| Field<'special_to_date', string>
| Field<'price_tiers', TierPrice, true>
| Field<'attributes', AttributeWithValue, true>
| Field<'url', string>
| Field<'url_rewrites', UrlRewrite, true>
| Field<'review_count', number>
| Field<'rating_summary', number>
| InlineFragment<'CustomizableProductInterface', {
    options: CustomizableProductFragmentOptions[];
}>
| InlineFragment<'BundleProduct', BundleProductFragment>
| Field<'product_links', ProductLink, true>
| Field<'description', ComplexTextValue>
| Field<'media_gallery_entries', MediaGalleryEntry, true>
| InlineFragment<'SimpleProduct', {
    price_tiers: TierPrice[];
}>
| Field<'canonical_url', string>
| Field<'meta_title', string>
| Field<'meta_keyword', string>
| Field<'meta_description', string>
| Field<'categories', CategoryInterface, true>
| Field<'reviews', ProductReviews>
| InlineFragment<'VirtualProduct', {
    price_tiers: TierPrice[];
}>
| InlineFragment<'ConfigurableProduct', ConfigurableProductFragment>
| InlineFragment<'GroupedProduct', {
    items: GroupedProductItem[];
}>
>;

export interface BaseProductItem {
    uid: string;
    id: number;
    sku: string;
    name: string;
    type_id: string;
    stock_status: GQLProductStockStatus;
    salable_qty: number;
    stock_item: ProductStockItem;
    price_range: PriceRange;
    image: OptimizedProductImage;
    thumbnail: OptimizedProductImage;
    small_image: OptimizedProductImage;
    short_description: ComplexTextValue;
    special_from_date: string;
    special_to_date: string;
    price_tiers: TierPrice[];
    attributes: AttributeWithValue[];
    url: string;
    url_rewrites: UrlRewrite[];
    review_count: number;
    rating_summary: number;
    product_links: ProductLink[];
    description: ComplexTextValue;
    media_gallery_entries: MediaGalleryEntry[];
    canonical_url: string;
    meta_title: string;
    meta_keyword: string;
    meta_description: string;
    categories: Category[];
    reviews: ProductReviews;
    CustomizableProductInterface: {
        options: CustomizableProductFragmentOptions[];
    };
    BundleProduct: BundleProductFragment;
    SimpleProduct: {
        price_tiers: TierPrice[];
    };
    VirtualProduct: {
        price_tiers: TierPrice[];
    };
    ConfigurableProduct: ConfigurableProductFragment;
    GroupedProduct: {
        items: GroupedProductItem[];
    };
    DownloadableProduct: DownloadableProductFragment;
}

export type ProductItem = BaseProductItem
& BundleProductFragment
& ConfigurableProductFragment
& DownloadableProductFragment
& {
    options: CustomizableProductFragmentOptions[];
    price_tiers: TierPrice[];
    items: GroupedProductItem[];
};

export interface ProductsQueryOutput {
    items: ProductItem[];
    sort_fields: SortFields;
    filters: Aggregation[];
    total_count: number;
    page_info: SearchResultPageInfo;
}

export interface GroupedProductItem {
    product: ProductItem;
    position: number;
    qty: number;
}

export interface VariantItem {
    product: ProductItem;
}

export interface ConfigurableProductFragment {
    configurable_options: ConfigurableProductOptions[];
    variants: VariantItem[];
}

export interface ProductListOptions {
    isSingleProduct: boolean;
    isPlp: boolean;
    isForWishlist: boolean;
    isForLinkedProducts: boolean;
    noAttributes: boolean;
    noVariants: boolean;
    noVariantAttributes: boolean;
    requireInfo: boolean;
    notRequireInfo: boolean;
    categoryIds: number[];
    args: ProductListOptionArgs;
    isNext?: boolean;
}

export interface ProductListOptionArgs {
    filter?: Partial<ProductAttributeFilterOptions>;
    search?: string;
    currentPage?: number;
    sort?: CategorySortOptions | string;
    pageSize?: number;
}

export interface PriceRangeMap {
    from?: number;
    to?: number;
}

export type AttributeOptionField = Array<
Field<'label', string>
| Field<'value', string>
| Field<'swatch_data', SwatchData>
>;

export interface FilterPriceRange {
    min: number;
    max: number;
}

export interface FilterArgumentMap {
    categoryIds: (id: number | number[]) => ({ category_id: { eq: number | number[] } });
    categoryUrlPath: (url: string) => ({ category_url_path: { eq: string } });
    priceRange: (price: FilterPriceRange) => ({ price: PriceRangeMap });
    productsSkuArray: (sku: string) => ({ sku: { in: string } });
    productSKU: (sku: string) => ({ sku: { eq: string } });
    productID: (id: number) => ({ id: { eq: number } });
    productUrlPath: (url: string) => ({ url_key: { eq: string } });
    customFilters: (filters: Record<string, string>) => Record<string, {
        from?: string;
        to?: string;
        in?: string;
    }>;
    newToDate: (date: string) => ({ news_to_date: { gteq: string } });
    conditions: (conditions: string) => ({ conditions: { eq: string } });
    customerGroupId: (id: number) => ({ customer_group_id: { eq: number } });
}

export interface ProductAttributeCustomFilterOptions {
    category_id?: string;
}

export interface ProductAttributeFilterOptions {
    categoryIds?: number | number[];
    categoryUrlPath?: string;
    priceRange?: FilterPriceRange;
    productsSkuArray?: string[];
    productSKU?: string;
    productID?: number;
    productUrlPath?: string;
    customFilters?: ProductAttributeCustomFilterOptions;
    newToDate?: string;
    conditions?: string;
    customerGroupId?: number;
    price?: number[];
}

export interface ArgumentsMap {
    currentPage: {
        type: string;
        handler: undefined;
    };
    pageSize: {
        type: string;
        handler: (option: number) => number;
    };
    search: {
        type: string;
        handler: (option: string) => string;
    };
    sort: {
        type: string;
        handler: <SortKey extends string>(
            option: { sortKey: SortKey; sortDirection: SortDirections }
        ) => Partial<Record<SortKey, SortDirections>>;
    };
    filter: {
        type: string;
        handler: (initialOptions: ProductAttributeFilterOptions) => Record<string, unknown>;
    };
}
