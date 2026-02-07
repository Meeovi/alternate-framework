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

import { FieldData, FieldValue } from './Form.type';

/**
 * Returns name: value pair object for form output.
 * @param fields (Array|Object)
 * @returns {{}}
 * @namespace ../../utils/Form/Transform/transformToNameValuePair
 */
export const transformToNameValuePair = <T>(
    fields: Record<string, FieldData> | FieldData[],
): T => {
    const filteredFields: Record<string, FieldValue> = {};
    const arrayFormat = !Array.isArray(fields) ? Object.values(fields) : fields;

    arrayFormat.forEach(({ value, name }) => {
        filteredFields[name] = value;
    });

    return filteredFields as unknown as T;
};

export default transformToNameValuePair;
