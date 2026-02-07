export type StockStatusType = string;
// Keep runtime PropTypes implementation below; avoid duplicate TS declarations
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

import PropTypes from 'prop-types';

import { StockStatus } from 'Component/Product/Stock.config';

// Support for comtabilitiy

// eslint-disable-next-line import/prefer-default-export
export const StockStatusType = PropTypes.oneOf(Object.values(StockStatus));
