/**
 * M Framework - Flexible backend agnostic framework.
 *
 * Copyright © Meeovi, LTD. All rights reserved.
 * See LICENSE for license details.
 *
 * @license OSL-3.0 (Open Software License ("OSL") v. 3.0)
 * @package mframework/mframework-theme
 * @link https://github.com/meeovi/mframework
 */

import { Country } from '../../types/normalizers/Region.type';

export interface ZippopotamResponseResult {
    city: string;
    region: string;
    regionAbbr: string;
}

export interface FormattedRegion {
    country?: string;
    region?: string | null;
}

export interface CountryOption extends Country {
    name: string;
    value: string;
}
