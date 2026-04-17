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

export interface Store {
    city: string;
    country: string;
    description: string;
    name: string;
    phone: string;
    pickup_location_code: string;
    postcode: string;
    region: string;
    street: string[];
    extension_attributes?: {
        attribute_code: string;
        value: string;
    }[];
}

export interface DomainStore {
    id?: string;
    name: string;
    address: {
        street: string[];
        city?: string;
        region?: string;
        postcode?: string;
        country?: string;
    };
    phone?: string;
    code?: string;
    raw?: any;
}

export function normalizeStore(raw: any): DomainStore {
    if (!raw) return raw;
    return {
        id: raw?.id ?? raw?.pickup_location_code ?? raw?.code ?? undefined,
        name: raw?.name ?? raw?.store_name ?? '',
        address: {
            street: Array.isArray(raw?.street) ? raw.street : (raw?.address?.street ? (Array.isArray(raw.address.street) ? raw.address.street : [raw.address.street]) : []),
            city: raw?.city ?? raw?.address?.city,
            region: raw?.region ?? raw?.address?.region,
            postcode: raw?.postcode ?? raw?.address?.postcode,
            country: raw?.country ?? raw?.address?.country,
        },
        phone: raw?.phone ?? raw?.telephone,
        code: raw?.pickup_location_code ?? raw?.code,
        raw,
    } as DomainStore;
}
