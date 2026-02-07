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

import Field from './Field';

/** @namespace ../../utils/../../normalizers/Fragment */
export class Fragment extends Field {
    __construct(name: string): void {
        super.__construct(name);
        (this as any).name = `... on ${name}`;
    }
}

export default Fragment;
