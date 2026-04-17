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

import type {
    MenuItem
} from '../../types/normalizers/Menu.type';
import { CategoryDisplayMode } from '../../types/routes/CategoryPage/CategoryPage.config';
import type {
    Merge
} from '../../types/Common.type';

export interface MenuLocation {
    pathname: string;
    search: string;
    state: {
        category?: number;
        page?: boolean;
        displayMode?: CategoryDisplayMode;
    };
}

export type FormattedMenuItem = Merge<
Omit<MenuItem, 'cms_page_identifier' | 'url_type' | 'category_id' | 'display_mode'>,
{
    url: MenuLocation | string;
    children: Record<string, FormattedMenuItem>;
}>;

export enum MenuItemType {
    TYPE_CUSTOM_URL,
    TYPE_CMS_PAGE,
    TYPE_CATEGORY,
}
