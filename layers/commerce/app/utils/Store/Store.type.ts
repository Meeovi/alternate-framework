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
// Minimal compatibility types to decouple from Redux while migrating to Pinia.
type AnyAction = any;
type Reducer = (state: any, action?: any) => any;
type ReducersMapObject = Record<string, Reducer>;
type Store = any;

// Re-export the concrete RootState definitions so all modules importing
// `app/utils/Store/Store.type.ts` see the same expanded shape.
export { ConfigReducerState, CartReducerState, MyAccountReducerState, RootState } from '../../stores/Store.type';

declare global {
    export type ModifiedReduxStore<S> = Store & {
        asyncReducers?: ReducersMapObject;
        injectReducer?: (key: string, reducer: Reducer) => void;
    };
}
