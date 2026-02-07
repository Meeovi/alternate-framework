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

import { ElementType } from 'react';
// Minimal reducer type alias for compatibility with legacy code.
type Reducer = (state: any, action?: any) => any;

import injectReducers from '../../utils/DynamicReducer/Helper';
import { getStore } from '../../utils/Store';

import { Props, WithReducersResult } from './DynamicReducer.type';

/** @namespace ../../utils/DynamicReducer/Index/withReducers */
export const withReducers = (reducers: Record<string, Reducer>) => (
    WrappedComponent: ElementType,
): WithReducersResult => {
    const injectAndExecute = (props: Props) => {
        injectReducers(getStore(), reducers);

        // eslint-disable-next-line @mframework/mframework-guidelines/jsx-no-props-destruction
        return <WrappedComponent { ...props } />;
    };

    return injectAndExecute;
};

export default { withReducers };
