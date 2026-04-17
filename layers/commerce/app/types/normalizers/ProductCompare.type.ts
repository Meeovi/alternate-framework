/**
 * ScandiPWA - Progressive Web App for Commerce
 *
 * Copyright © Scandiweb, Inc. All rights reserved.
 * See LICENSE for license details.
 *
 * @license OSL-3.0 (Open Software License ("OSL") v. 3.0)
 * @package scandipwa/scandipwa-theme
 * @link https://github.com/scandipwa/scandipwa
 */

import {
    ComplexTextValue,
    GroupedProductItem,
} from './ProductList.type';
import { Product as DomainProduct } from '../domain';

// Normalize a comparable product into a domain-friendly product + compare metadata
export function normalizeComparableProduct(raw: any): ComparableProduct {
    if (!raw) return raw;

    const base: DomainProduct = (raw?.product ? (raw.product as any) : raw) as any;

    return {
        ...base,
        url: raw?.url ?? base?.raw?.url ?? '',
        review_count: Number(raw?.review_count ?? base?.raw?.review_count ?? 0),
        rating_summary: Number(raw?.rating_summary ?? base?.raw?.rating_summary ?? 0),
        description: raw?.description ?? base?.raw?.description ?? { html: '' },
        GroupedProduct: { items: (raw?.GroupedProduct?.items ?? base?.raw?.GroupedProduct?.items ?? []) as GroupedProductItem[] },
    } as ComparableProduct;
}

export function normalizeCompareList(raw: any): CompareList {
    if (!raw) return raw;
    const items = Array.isArray(raw?.items) ? raw.items.map((it: any) => ({
        product: normalizeComparableProduct(it.product ?? it),
        attributes: Array.isArray(it?.attributes) ? it.attributes.map((a: any) => ({ value: a?.value ?? a?.attribute_value, code: a?.code ?? a?.attribute_code })) : [],
    })) : [];

    return {
        uid: raw?.uid ?? raw?.id ?? '',
        item_count: raw?.item_count ?? items.length,
        attributes: Array.isArray(raw?.attributes) ? raw.attributes.map((a: any) => ({ label: a?.label ?? a?.attribute_label ?? '', code: a?.code ?? a?.attribute_code ?? '' })) : [],
        items,
    } as CompareList;
}

export interface ProductId {
    product: {
        id: number;
    };
}

export interface ComparableAttribute {
    label: string;
    code: string;
}

export interface ComparableItemAttribute {
    value: string;
    code: string;
}

export type ComparableProduct = Omit<DomainProduct, 'description'> & {
    url: string;
    review_count: number;
    rating_summary: number;
    description: ComplexTextValue;
    GroupedProduct: {
        items: GroupedProductItem[];
    };
}

export interface ComparableItem {
    product: ComparableProduct;
    attributes: ComparableItemAttribute[];
}

export interface CompareList {
    uid: string;
    item_count: number;
    attributes: ComparableAttribute[];
    items: ComparableItem[];
}

export interface AssignCompareListToCustomerOutput {
    result: boolean;
    compare_list: CompareList;
}
