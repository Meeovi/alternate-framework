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

import { GQLCurrencyEnum } from '../Graphql.type';
import { Order as DomainOrder, CartItem as DomainCartItem, Product as DomainProduct } from '../domain';

export interface CustomerDownloadableProduct {
    order_id: string;
    order_increment_id: number;
    date: string;
    status: string;
    download_url: string;
    link_title: string;
    remaining_downloads: number;
    title: string;
}

export interface PaymentMethodAdditionalData {
    name: string;
    value: string;
}

export interface OrderPaymentMethod {
    name: string;
    type: string;
    purchase_number: string;
    additional_data: PaymentMethodAdditionalData;
}

export interface Money {
    value?: string;
    currency?: GQLCurrencyEnum;
}

export interface BundleOption {
    title: string;
    qty: number;
    price: number;
}

export interface OrderProductSelectedOption {
    label: string;
    value: string;
    items: BundleOption[];
    linkItems: string[];
}

export interface BaseOrderItemProduct {
    product_name: string;
    product_sku: string;
    product_sale_price: Money;
}

export interface CheckoutUserInputError {
    code: string;
    message: string;
    path: string;
}

export interface SalesCommentItem {
    timestamp: string;
    message: string;
}

export interface Discount {
    label: string;
    amount: Money;
}

export interface TaxItem {
    rate: number;
    title: string;
    amount: Money;
}

export interface ShippingHandling {
    amount_excluding_tax: Money;
    amount_including_tax: Money;
    discounts: Discount[];
    total_amount: Money;
    taxes: TaxItem[];
}

export interface OrderTotal {
    grand_total: Money;
    discounts: Discount[];
    base_grand_total: Money;
    subtotal: Money;
    total_shipping: Money;
    total_tax: Money;
    shipping_handling: ShippingHandling;
    taxes: TaxItem[];
}

export interface ShipmentTracking {
    carrier: string;
    number: string;
    title: string;
}

export interface ShipmentItemInterface {
    quantity_shipped: number;
    product_name: string;
    product_sku: string;
    product_sale_price: Money;
    product_url_key: string;
}

export interface OrderShipment {
    id: string;
    number: string;
    comments: SalesCommentItem[];
    tracking: ShipmentTracking[];
    items: ShipmentItemInterface[];
}

export interface OrderItemProduct {
    product_url_key: string;
    quantity_ordered: number;
    quantity_shipped: number;
    quantity_refunded: number;
    quantity_canceled: number;
    quantity_returned: number;
    entered_options: OrderProductSelectedOption[];
    selected_options: OrderProductSelectedOption[];
    row_subtotal: Money;
    product_name: string;
    product_sku: string;
    product_sale_price: Money;
}

export interface RefundItem {
    quantity_refunded: number;
    product_name: string;
    product_sku: string;
    product_sale_price: Money;
    order_item: OrderItemProduct;
    row_subtotal: Money;
    discounts: Discount[];
    product_url_key: string;
}

export interface CreditMemo {
    id: string;
    number: string;
    comments: SalesCommentItem[];
    items: RefundItem[];
    total: OrderTotal;
}

export interface InvoiceItem {
    quantity_invoiced: number;
    row_subtotal: Money;
    product_name: string;
    product_sku: string;
    product_sale_price: Money;
    product_url_key: string;
}

export interface Invoice {
    id: string;
    number: string;
    comments: SalesCommentItem[];
    items: InvoiceItem[];
    total: OrderTotal;
}

export interface OrderAddress {
    city: string;
    country_id: number;
    firstname: string;
    lastname: string;
    postcode: string;
    region: string;
    region_id: number;
    telephone: string;
    vat_id: string;
    street: string[];
}

export interface OrderItem {
    id: string;
    increment_id: string;
    created_at: string;
    order_date: string;
    status: string;
    can_reorder: boolean;
    rss_link: string;
    total: OrderTotal;
    carrier: string;
    shipments: OrderShipment[];
    items: OrderItemProduct[];
    invoices: Invoice[];
    credit_memos: CreditMemo[];
    shipping_address: OrderAddress;
    billing_address: OrderAddress;
    payment_methods: OrderPaymentMethod[];
    shipping_method: string;
    comments: SalesCommentItem[];
}

/**
 * Minimal order normalizer: converts a raw order object into the canonical
 * `DomainOrder` used by the commerce layer. This is intentionally permissive
 * and maps only commonly-used fields (id/number/items/total/status/created_at).
 */
export function normalizeOrder(raw: any): DomainOrder {
    if (!raw) return raw;
    const id = raw?.id ?? raw?.order_id ?? raw?.increment_id ?? '';
    const number = raw?.increment_id ?? raw?.order_number ?? raw?.number ?? '';
    const items: DomainCartItem[] = Array.isArray(raw?.items)
        ? raw.items.map((it: any) => ({
            id: String(it?.id ?? it?.item_id ?? it?.uid ?? ''),
            sku: it?.sku ?? it?.product_sku ?? it?.product?.sku,
            quantity: it?.quantity ?? it?.qty ?? it?.quantity_ordered ?? 0,
            product: it?.product ? {
                id: String(it.product?.id ?? it.product?.sku ?? it.product?.uid ?? ''),
                sku: it.product?.sku,
                title: it.product?.name ?? it.product?.title ?? it.product?.product_name,
                price: (it.product?.price && (it.product.price.final_price?.value ?? it.product.price)) ?? it.price ?? 0,
                images: Array.isArray(it.product?.media_gallery_entries)
                    ? it.product.media_gallery_entries.map((m: any) => ({ url: m.file ?? m.url }))
                    : []
            } as DomainProduct : undefined,
            raw: it,
        })) : [];

    const total = raw?.total ?? raw?.grand_total ?? raw?.total_amount ?? (raw?.prices?.grand_total?.value ?? undefined);

    return {
        id: String(id),
        number,
        items,
        total,
        status: raw?.status ?? raw?.state,
        created_at: raw?.created_at ?? raw?.order_date,
        raw,
    };
}

export interface SearchResultPageInfo {
    current_page: number;
    page_size: number;
    total_pages: number;
}

export interface CustomerOrders {
    total_count: number;
    items: OrderItem[];
    page_info: SearchResultPageInfo;
}

export interface OrdersOptions {
    orderId: number;
    page: number;
}

export interface ReorderOutput {
    userInputErrors: CheckoutUserInputError[];
}
