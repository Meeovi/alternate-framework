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

import { INTERVAL_OF_CHECK } from './Config';

/** @namespace ../../utils/Request/LowPriorityLoad/waitForPriorityLoad */
export const waitForPriorityLoad = () => new Promise((resolve) => {
    function waitForIt(){
        if (window.isPriorityLoaded) {
            resolve(null);

            return;
        }

        setTimeout(waitForIt, INTERVAL_OF_CHECK);
    }

    waitForIt();
});

/** @namespace ../../utils/Request/LowPriorityLoad/setLoadedFlag */
export const setLoadedFlag = () => {
    window.isPriorityLoaded = true;
};
