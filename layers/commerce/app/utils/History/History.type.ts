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

import { CategoryDisplayMode } from '../../types/routes/CategoryPage/CategoryPage.config';
import { IndexedProduct } from '../../utils/Product/Product.type';

export interface HistoryState {
    popupOpen?: boolean;
    page?: number | Partial<IndexedProduct> | undefined;
    product?: Partial<IndexedProduct>;
    isForgotPassword?: boolean;
    isFromLocked?: boolean;
    editPassword?: boolean;
    category?: number | boolean;
    isFromEmailChange?: boolean;
    prevCategoryId?: number;
    stack?: string[];
    firstName?: string;
    lastName?: string;
    email?: string;
    overlayOpen?: boolean;
    displayMode?: CategoryDisplayMode;
}
