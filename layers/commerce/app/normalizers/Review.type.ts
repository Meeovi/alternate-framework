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

export interface ReviewRatingValue {
    option_id: string;
    value: string;
}

export interface ReviewRatingItem {
    rating_id: number;
    rating_code: string;
    rating_options: ReviewRatingValue[];
}

export interface CreateProductReviewOutput {
    review: {
        nickname: string;
    };
}

import type { Review as DomainReview } from '../types/domain';

export function normalizeReview(raw: any): DomainReview {
    if (!raw) return raw;
    return {
        id: String(raw?.id ?? raw?.review_id ?? raw?.uid ?? ''),
        title: raw?.title ?? raw?.nickname ?? '',
        detail: raw?.detail ?? raw?.text ?? raw?.comment ?? '',
        rating: (raw?.rating ?? raw?.rating_summary ?? raw?.average_rating) as number | undefined,
        created_at: raw?.created_at ?? raw?.createdAt ?? raw?.date,
        author: raw?.author ?? raw?.nickname ?? undefined,
        raw,
    } as DomainReview;
}
