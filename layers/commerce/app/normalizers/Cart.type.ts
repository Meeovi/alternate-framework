/**
 * ScandiPWA - Progressive Web App for Magento
 *
 * Copyright © Scandiweb, Inc. All rights reserved.
 * See LICENSE for license details.
 *
 * @license OSL-3.0 (Open Software License ("OSL") v. 3.0)
 * @package scandipwa/scandipwa
 * @link https://github.com/scandipwa/scandipwa
 */

import { GQLCurrencyEnum, GQLProductStockItem } from '../types/Graphql.type';

import {
    AttributeWithValue,
    ConfigurableCartProductFragment,
    ConfigurableProductOptions,
    ConfigurableVariant,
    OptimizedProductImage,
    ProductLink,
    ProductStockItem,
} from './ProductList.type';

import { Cart as DomainCart, CartItem as DomainCartItem, Product as DomainProduct } from '../types/domain';

export interface UserErrors {
    message: string;
    code: string;
}

export interface Money {
    currency: GQLCurrencyEnum;
    value: number;
}

export interface Discount {
    label: string;
    amount: Money;
}

export interface AppliedTax {
    label: string;
    percent: number;
    amount: Money;
}

export interface CartPrices {
    applied_rule_ids: string;
    coupon_code: string;
    quote_currency_code: string;
    grand_total: Money;
    subtotal_including_tax: Money;
    subtotal_excluding_tax: Money;
    subtotal_with_discount_excluding_tax: Money;
    discount: Discount;
    applied_taxes: AppliedTax[];
}

export interface AvailableShippingMethod {
    available: boolean;
    method_code: string;
    carrier_code: string;
    carrier_title: string;
    error_message: string;
}

export interface CartAddress {
    city: string;
    country: { code : string };
    firstname: string;
    lastname: string;
    postcode: string;
    region: Region;
    telephone: string;
    vat_id: string;
    email: string;
    street: string;
}

export interface SelectedShippingMethod {
    amount_incl_tax: number;
    carrier_code: string;
    carrier_title: string;
    method_code: string;
    method_title: string;
    tax_amount: number;
    amount: Money;
    address: CartAddress;
}

export interface Region {
    label: string;
    region_id: number;
}

export interface CartShippingAddress {
    available_shipping_methods: AvailableShippingMethod[];
    selected_shipping_method: SelectedShippingMethod;
    customer_notes: string;
}

export interface MinimumOrderAmount {
    minimum_order_amount_reached: boolean;
    minimum_order_description: string;
}

export interface CartItem {
    id: number;
    uid: string;
    sku: string;
    quantity: number;
    product: CartItemProduct;
    prices: CartItemPrices;
    DownloadableCartItem: CartDownloadableItem;
    BundleCartItem: CartBundleItem;
    ConfigurableCartItem: CartConfigurableItem;
    VirtualCartItem: CartVirtualItem;
    SimpleCartItem: CartSimpleItem;
    links: CartDownloadableProductLink[];
    samples: CartDownloadableProductSample[];
    downloadable_customizable_options: CartCustomizableOption[];
    bundle_options: CartBundleOption[];
    bundle_customizable_options: CartCustomizableOption[];
    configurable_options: CartConfigurableOption[];
    configurable_customizable_options: CartCustomizableOption[];
    virtual_customizable_options: CartCustomizableOption[];
    simple_customizable_options: CartCustomizableOption[];
    customizable_options: CartCustomizableOption[];
}

export interface CartItemProduct {
    uid: string;
    id: number;
    sku: string;
    name: string;
    type_id: string;
    stock_status: GQLProductStockItem;
    url: string;
    salable_qty: number;
    stock_item: ProductStockItem;
    thumbnail: OptimizedProductImage;
    ConfigurableProduct: ConfigurableCartProductFragment;
    attributes: AttributeWithValue;
    product_links: ProductLink;
    configurable_options: ConfigurableProductOptions[];
    variants: ConfigurableVariant[];
}

export interface CartItemPrices {
    price: Money;
    row_total: Money;
    row_total_including_tax: Money;
    discounts: Money;
    total_item_discount: Money;
}

export interface CartDownloadableProductLink {
    id: number;
    title: string;
    sort_order: number;
    price: number;
}

export interface CartDownloadableProductSample {
    id: number;
    title: string;
}

export interface CartCustomizableOptionValue {
    id: number;
    label: string;
    value: string;
}

export interface CartCustomizableOption {
    id: number;
    label: string;
    type: string;
    sort_order: number;
    is_required: boolean;
    values: CartCustomizableOptionValue[];
}

export interface CartDownloadableItem {
    links: CartDownloadableProductLink[];
    samples: CartDownloadableProductSample[];
    downloadable_customizable_options: CartCustomizableOption[];
}

export interface CartBundleOptionValue {
    id: number;
    label: string;
    quantity: number;
    price: number;
}

export interface CartBundleOption {
    id: number;
    label: string;
    type: string;
    values: CartBundleOptionValue[];
}

export interface CartBundleItem {
    bundle_options: CartBundleOption[];
    bundle_customizable_options: CartCustomizableOption[];
}

export interface CartConfigurableOption {
    id: number;
    option_label: string;
    value_label: string;
}

export interface CartConfigurableItem {
    configurable_options: CartConfigurableOption[];
    configurable_customizable_options: CartCustomizableOption[];
}

export interface CartVirtualItem {
    virtual_customizable_options: CartCustomizableOption;
}

export interface CartSimpleItem {
    simple_customizable_options: CartCustomizableOption;
}

export interface CartTotals {
    id: string;
    email: string;
    prices: Partial<CartPrices>;
    shipping_addresses: CartShippingAddress[];
    minimum_order_amount: MinimumOrderAmount;
    items: CartItem[];
    total_quantity: number;
    is_virtual: boolean;
    is_in_store_pickup_available: boolean;
}

export interface CartDisplayConfig {
    display_tax_in_price: string;
    display_tax_in_subtotal: string;
    display_tax_in_shipping_amount: string;
    include_tax_in_order_total: boolean;
    display_full_tax_summary: boolean;
    display_zero_tax_subtotal: boolean;
}

/**
 * Lightweight normalizer: convert raw cart shapes into the canonical domain `Cart`.
 * Adapters should provide more complete mappers; this helper is a convenience for
 * migration and testing.
 */
export function normalizeCart(raw: any): DomainCart {
    const id = raw?.id ?? raw?.cart_id ?? raw?.uid ?? '';
    const email = raw?.email ?? raw?.customer?.email;
    const items: DomainCartItem[] = Array.isArray(raw?.items)
        ? raw.items.map((it: any) => ({
            id: String(it?.id ?? it?.uid ?? ''),
            sku: it?.sku ?? it?.product?.sku,
            quantity: it?.quantity ?? it?.qty ?? 0,
            product: it?.product ? {
                id: String(it.product.id ?? it.product.sku ?? it.product.uid ?? ''),
                title: it.product.name ?? it.product.title ?? it.product.product_name,
                price: (it.product.price && (it.product.price.final_price?.value ?? it.product.price)) ?? it.price ?? 0,
                images: Array.isArray(it.product.media_gallery_entries)
                    ? it.product.media_gallery_entries.map((m: any) => ({ url: m.file ?? m.url }))
                    : []
            } as DomainProduct : undefined,
            raw: it,
        })) : [];

    return {
        id: String(id),
        email,
        items,
        total_quantity: raw?.total_quantity ?? raw?.items?.length ?? items.length,
        prices: raw?.prices ?? raw?.totals ?? undefined,
        raw,
    };
}

export interface AppliedTaxItem {
    rates: AppliedTax[];
}
