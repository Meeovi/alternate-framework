/* eslint-disable import/prefer-default-export */
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

/** @namespace ../../utils/Manipulations/Array/range */
export const range = (start: number, end: number): Array<number> => {
    const length = end - start + 1;

    return Array.from({ length }, (_, i) => start + i);
};
