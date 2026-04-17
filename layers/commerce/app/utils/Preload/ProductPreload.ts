/**
 * M Framework - Flexible backend agnostic framework.
 *
 * Copyright © Meeovi, LTD. All rights reserved.
 * See LICENSE for license details.
 *
 * @license OSL-3.0 (Open Software License ("OSL") v. 3.0)
 * @package mframework/mframework
 * @link https://github.com/meeovi/mframework
 */

import type {
    ProductListOptions
} from '../../types/normalizers/ProductList.type';
import ProductDispatcher from '../../stores/Product/Product.dispatcher';
import getStore from '../../utils/Store';

/** @namespace ../../utils/Preload/ProductPreload */
export class ProductPreload {
    options: Partial<ProductListOptions> = {
        isSingleProduct: true,
        args: { filter: { productID: window.actionName?.id } },
    };

    preloadProduct() {
        ProductDispatcher.handleData(getStore().dispatch, this.options);
    }
}

export default new ProductPreload();
