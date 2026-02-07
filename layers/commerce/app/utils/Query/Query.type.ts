/**
 * M Framework - Flexible backend agnostic framework.
 *
 * Copyright © Meeovi, LTD. All rights reserved.
 * See LICENSE for license details.
 *
 * @license OSL-3.0 (Open Software License ("OSL") v. 3.0)
 * @package mframework/mframework-theme
 * @link https://github.com/meeovi/mframework
 */

export enum FieldType {
    MUTATION = 'mutation',
    QUERY = 'query',
}

export interface FieldArgument {
    name: string;
    type: string;
    value: unknown;
}

export interface PreparedRequest {
    query: string;
    variables: unknown;
}
