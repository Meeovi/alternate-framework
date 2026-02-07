/* eslint-disable no-param-reassign */
/**
 * M Framework - Flexible backend agnostic framework.
 *
 * Copyright © Meeovi, LTD. All rights reserved.
 * See LICENSE for license details.
 *
 * @license OSL-3.0 (Open Software License ("OSL") v. 3.0)
 * @package mframework/mframework-theme
 * @link https://github.com/meeovi/mframework-theme
*/
import { RootState } from '../../utils/Store/Store.type';

/**
 * Lightweight compatibility layer that provides the minimal store API
 * used across the commerce layer. This intentionally does not implement
 * full Redux semantics — it keeps a mutable `state` object and exposes
 * `getStore`, `getStoreState`, `injectReducers` and a no-op `dispatch`
 * to satisfy legacy imports while migration to Pinia proceeds.
 */

type AnyObject = Record<string, any>;

const legacyState: RootState = {
    ConfigReducer: {},
    CartReducer: {},
    MyAccountReducer: {},
} as unknown as RootState;

const store: AnyObject = {
    asyncReducers: {} as AnyObject,
    // injectReducer will attach the given reducer/state under the key.
    injectReducer(key: string, reducerOrState: any) {
        // prefer plain objects as initial slice state
        (store.asyncReducers as AnyObject)[key] = reducerOrState;
        (legacyState as AnyObject)[key] = reducerOrState;
    },
    replaceReducer() {
        // no-op compatibility
    },
    // Minimal dispatch compatibility: if a function is passed (thunk-like), call it with dispatch
    dispatch(action: any) {
        if (typeof action === 'function') return action(store.dispatch.bind(store));
        // otherwise, do nothing — migrations should replace side-effects with Pinia actions
        return action;
    },
    getState() {
        return legacyState as any;
    },
};

export function configureStore<S, T = typeof store>(s: T): T {
    // no-op for compatibility
    return s;
}

export function noopReducer<T>(state: T): T { return state; }

export const getStore = (): typeof store => store;

export const getStoreState = (): Partial<RootState> => (store.getState() as Partial<RootState>) || {};

export function injectReducers(storeParam: any, reducers: Record<string, any>) {
    Object.entries(reducers).forEach(([name, reducer]) => {
        if (storeParam.injectReducer) storeParam.injectReducer(name, reducer);
    });

    return storeParam;
}

export default getStore;
