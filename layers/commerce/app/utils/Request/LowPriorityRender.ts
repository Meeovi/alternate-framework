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

import { lazy, useEffect, useState } from 'react';
import type { ComponentType } from 'react';

import { EV_PRIORITY_LOAD_END } from './Config';
import { waitForPriorityLoad } from './LowPriorityLoad';

/** @namespace ../../utils/Request/LowPriorityRender/lowPriorityLazy */
export const lowPriorityLazy = (callback: () => Promise<{ default: ComponentType<any> }>) => lazy(async () => {
    await waitForPriorityLoad();

    const ev = new Event(EV_PRIORITY_LOAD_END);
    document.dispatchEvent(ev);

    return callback();
});

/** @namespace ../../utils/Request/LowPriorityRender/AfterPriority */

export function AfterPriority(
    { children, fallback }: { children: JSX.Element; fallback?: JSX.Element },
): JSX.Element {
    const [isPriorityLoaded, setIsPriorityLoaded] = useState(window.isPriorityLoaded);

    function onPriorityLoad() {
        setIsPriorityLoaded(true);
    }

    useEffect(() => {
        document.addEventListener(EV_PRIORITY_LOAD_END, onPriorityLoad, { once: true });

        return () => {
            document.removeEventListener(EV_PRIORITY_LOAD_END, onPriorityLoad);
        };
    }, []);

    if (!isPriorityLoaded && fallback) {
        return fallback;
    }

    return children;
}
