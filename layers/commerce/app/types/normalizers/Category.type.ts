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

export interface CmsBlock {
    content: string;
    disabled: boolean;
    title: string;
    identifier: string;
}

export interface Breadcrumb {
    category_name: string;
    category_level: number;
    category_url: string;
    category_is_active: boolean;
}

export interface CategoryTree {
    id: number | string;
    url: string;
    name: string;
    image: string;
    url_key: string;
    url_path: string;
    is_active: boolean;
    meta_title: string;
    description: string;
    canonical_url: string;
    product_count: number;
    meta_keywords: string;
    default_sort_by: string;
    meta_description: string;
    landing_page: number;
    display_mode: string;
    is_anchor: boolean;
    cms_block: CmsBlock;
    breadcrumbs: Breadcrumb[];
}

export interface Category extends CategoryTree {
    children: CategoryTree[];
}

export interface CategoryQueryOptions {
    categoryIds: number;
    isSearchPage?: boolean;
}

// Lightweight normalizer for category objects. Adapters can provide
// richer implementations; this helper maps common fields into a stable
// Category shape used by the commerce layer.
export function normalizeCategory(raw: any): Category {
    if (!raw) return raw;
    return {
        id: raw?.id ?? raw?.category_id ?? raw?.uid ?? '',
        url: raw?.url ?? raw?.url_key ?? raw?.url_path ?? '',
        name: raw?.name ?? raw?.label ?? raw?.category_name ?? '',
        image: raw?.image ?? raw?.thumbnail ?? '',
        url_key: raw?.url_key ?? raw?.url ?? '',
        url_path: raw?.url_path ?? raw?.url_key ?? '',
        is_active: raw?.is_active ?? raw?.active ?? true,
        meta_title: raw?.meta_title ?? raw?.title ?? '',
        description: raw?.description ?? raw?.meta_description ?? '',
        canonical_url: raw?.canonical_url ?? raw?.canonical ?? '',
        product_count: raw?.product_count ?? raw?.products_count ?? 0,
        meta_keywords: raw?.meta_keywords ?? raw?.keywords ?? '',
        default_sort_by: raw?.default_sort_by ?? raw?.defaultSortBy ?? '',
        meta_description: raw?.meta_description ?? raw?.description ?? '',
        landing_page: raw?.landing_page ?? raw?.page ?? 0,
        display_mode: raw?.display_mode ?? raw?.mode ?? '',
        is_anchor: raw?.is_anchor ?? raw?.anchor ?? false,
        cms_block: raw?.cms_block ?? raw?.cms ?? null,
        breadcrumbs: Array.isArray(raw?.breadcrumbs) ? raw.breadcrumbs : (raw?.breadcrumb ? [raw.breadcrumb] : []),
    } as Category;
}
