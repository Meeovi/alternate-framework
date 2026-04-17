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

import { CategoryDisplayMode } from '../routes/CategoryPage/CategoryPage.config';

export interface MenuItem {
    url: string;
    title: string;
    item_id: string;
    position: number;
    parent_id: number;
    category_id: number;
    display_mode: CategoryDisplayMode;
}

export function normalizeMenuItems(raw: any): MenuItem[] {
    if (!raw) return [];
    if (Array.isArray(raw)) {
        return raw.map((it: any) => ({
            url: it?.url ?? it?.link ?? '',
            title: it?.title ?? it?.label ?? it?.name ?? '',
            item_id: String(it?.item_id ?? it?.id ?? ''),
            position: Number(it?.position ?? 0),
            parent_id: Number(it?.parent_id ?? it?.parent ?? 0),
            category_id: Number(it?.category_id ?? it?.cat_id ?? 0),
            display_mode: it?.display_mode ?? it?.mode ?? 'PRODUCTS',
        } as MenuItem));
    }
    // If the payload contains an items key, map that
    if (Array.isArray(raw?.items)) return normalizeMenuItems(raw.items);
    return [];
}
