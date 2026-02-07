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

import { UrlRewritePageType } from '../../routes/UrlRewrites/UrlRewrites.config';
import ProductReducer from '../../stores/Product/Product.reducer';
import ProductListReducer from '../../stores/ProductList/ProductList.reducer';
import BrowserDatabase from '../../utils/BrowserDatabase';
import { isMobile } from '../../utils/Mobile';
import getStore, { injectReducers } from '../../utils/Store';

import CategoryPreload from './CategoryPreload';
import ProductPreload from './ProductPreload';

injectReducers(getStore(), {
    ProductReducer,
    ProductListReducer,
});

const { actionName: { type = '' } = {} } = window;

export const criticalChunkLoad = {
    CategoryChunk: {
        test: type === UrlRewritePageType.CATEGORY,
        importChunk: () => CategoryPreload.preloadProducts(),
    },
    CmsChunk: {
        test: type === UrlRewritePageType.CMS_PAGE,
        importChunk: () => {
            const isAndroid = isMobile.android();
            const isIos = isMobile.iOS() && isMobile.safari();

            if ((isAndroid || isIos)
                && !isMobile.standaloneMode()
                && !BrowserDatabase.getItem('postpone_installation')
                && !BrowserDatabase.getItem('app_installed')
            ) {
                window.isInstallPromptAvailable = true;
            }

            const {
                actionName: {
                    cmsPage: {
                        content = '',
                    } = {},
                } = {},
            } = window;

            if (!content.trim().length) {
                window.isPriorityLoaded = true;
            }
        },
    },
    ProductChunk: {
        test: type === UrlRewritePageType.PRODUCT,
        importChunk: () => ProductPreload.preloadProduct(),
    },
};

export const importBooster = Object.values(criticalChunkLoad).find(({ test }) => test);

if (!importBooster) {
    window.isPriorityLoaded = true;
} else {
    window.isPriorityLoaded = false;
    window.isPrefetchValueUsed = true;
    importBooster.importChunk();
}
