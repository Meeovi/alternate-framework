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

import { CategoryDisplayMode } from '../routes/CategoryPage/CategoryPage.config';
import { GQLUrlRewriteEntityTypeEnum } from '../types/Graphql.type';

export interface UrlRewritesOutput {
    sku: string;
    type: GQLUrlRewriteEntityTypeEnum;
    id: number;
    display_mode: CategoryDisplayMode;
    sort_by: string;
}

export interface UrlRewritesQueryOptions {
    urlParam: string;
}

export function normalizeUrlRewriteResponse(raw: any): UrlRewritesOutput | null {
    if (!raw) return null;
    // GraphQL urlResolver may return the object directly or wrap it under
    // urlResolver property depending on response shape.
    const payload = raw?.urlResolver ?? raw;
    if (!payload) return null;
    return {
        sku: payload?.sku ?? payload?.product_sku ?? '',
        type: payload?.type ?? payload?.entity_type ?? (payload?.is_category ? 'CATEGORY' : 'PRODUCT'),
        id: Number(payload?.id ?? payload?.entity_id ?? 0),
        display_mode: payload?.display_mode ?? payload?.mode ?? 'PRODUCTS',
        sort_by: payload?.sort_by ?? payload?.sort ?? '',
    } as UrlRewritesOutput;
}
