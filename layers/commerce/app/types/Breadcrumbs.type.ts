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

import { LinkType } from './Router.type';

// Support for comtabilitiy

export const BreadcrumbType = PropTypes.shape({
    url: LinkType,
    name: PropTypes.string,
});

export const BreadcrumbsType = PropTypes.arrayOf(BreadcrumbType);
