/* eslint-disable import/prefer-default-export */
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

import { Query } from '@tilework/opus';

import { prepareQuery } from '../../utils/Query';
import { executePost } from '../../utils/Request/Request';

/** @namespace ../../utils/Request/../../normalizers/fetchQuery */
export const fetchQuery = <S extends string, T, IsArray extends boolean = false>(
    rawQueries: Query<S, T, boolean> | Query<S, T, boolean>[],
): Promise<Record<S, IsArray extends false ? T : T[]>> => {
    const queries = rawQueries instanceof Query ? [rawQueries] : rawQueries;

    return executePost(prepareQuery(queries));
};
