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

// Minimal reducer type alias for compatibility with legacy code.
type Reducer = (state: any, action?: any) => any;

/**
 * @param store
 * @param reducers
 */
export default function injectToReducers(
    store: any,
    reducers: Record<string, Reducer>,
): void {
    Object.keys(reducers).forEach((key) => {
        if (store.asyncReducers && store.injectReducer && !Reflect.has(store.asyncReducers, key)) {
            // eslint-disable-next-line no-param-reassign
            store.asyncReducers[key] = reducers[key];
            store.injectReducer(key, reducers[key]);
        }
    });
}
