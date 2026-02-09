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

export interface CmsPageFields {
    title: string;
    content: string;
    page_width: string;
    content_heading: string;
    meta_title: string;
    meta_description: string;
    meta_keywords: string;
}

export interface CmsPageQueryOptions {
    id: number;
    url_key: string;
    identifier: string;
}

export function normalizeCmsPage(raw: any): CmsPageFields | null {
    if (!raw) return null;
    const fields: CmsPageFields = {
        title: raw?.title ?? raw?.page_title ?? '',
        content: raw?.content ?? raw?.content_html ?? raw?.body ?? '',
        page_width: raw?.page_width ?? raw?.width ?? 'full',
        content_heading: raw?.content_heading ?? raw?.heading ?? '',
        meta_title: raw?.meta_title ?? raw?.title ?? '',
        meta_description: raw?.meta_description ?? raw?.description ?? '',
        meta_keywords: raw?.meta_keywords ?? raw?.keywords ?? '',
    };
    return fields;
}
