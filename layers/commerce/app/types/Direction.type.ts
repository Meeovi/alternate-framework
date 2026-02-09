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

import {
    Directions,
} from 'Component/ChevronIcon/ChevronIcon.config';
import { SortDirections } from './routes/CategoryPage/CategoryPage.config';

// Support for comtabilitiy

export const DirectionType = PropTypes.oneOf([Directions.RIGHT, Directions.LEFT, Directions.TOP, Directions.BOTTOM]);

export const SortDirectionType = PropTypes.oneOf(Object.values(SortDirections));
