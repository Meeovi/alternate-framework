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
import { SortDirections } from '../../types/routes/CategoryPage/CategoryPage.config';
import ProductListDispatcher from '../../stores/ProductList/ProductList.dispatcher';
import history from '../../utils/History';
import getStore from '../../utils/Store';
import { getQueryParam } from '../../utils/Url';

/** @namespace ../../utils/Preload/CategoryPreload */
export class CategoryPreload {
    productListOptions = (): Partial<ProductListOptions> => ({
        isNext: false,
        isPlp: true,
        noAttributes: false,
        noVariants: false,
            args: {
            sort: getQueryParam('sortKey', history.location) || 'position',
            filter: {
                priceRange: this.getSelectedPriceRangeFromUrl(),
                customFilters: this.getSelectedFiltersFromUrl(),
                categoryIds: window.actionName?.id,
            },
            search: '',
            pageSize: 24,
            currentPage: this.getPageFromUrl(),
        },
    });

    getPageFromUrl() {
        const { location } = history;

        return +(getQueryParam('page', location) || 1);
    }

    getSelectedFiltersFromUrl() {
        const { location } = history;
        const selectedFiltersString = (getQueryParam('customFilters', location, false) || '').split(';');

        return selectedFiltersString.reduce((acc, filter) => {
            if (!filter) {
                return acc;
            }
            const [key, value] = filter.split(':');

            if (!key || value === undefined) {
                return acc;
            }

            return { ...acc, [key]: value.split(',') };
        }, {});
    }

    getSelectedPriceRangeFromUrl() {
        const { location } = history;
        const min = +getQueryParam('priceMin', location);
        const max = +getQueryParam('priceMax', location);

        return { min, max };
    }

    dispatch = getStore().dispatch;

    preloadProducts() {
        ProductListDispatcher.handleData(this.dispatch, this.productListOptions());
    }
}

export default new CategoryPreload();
