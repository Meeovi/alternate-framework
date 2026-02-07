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

import { LocationType } from './Router.type';

// Support for comtabilitiy

export const MenuItemType = PropTypes.shape({
    item_id: PropTypes.string,
    is_active: PropTypes.bool,
    parent_id: PropTypes.number,
    position: PropTypes.number,
    title: PropTypes.string,
    item_class: PropTypes.string,
    icon: PropTypes.string,
    url: LocationType,
    cms_page_identifier: PropTypes.string,
    category_id: PropTypes.number,
});

// @ts-ignore
MenuItemType.children = PropTypes.objectOf(MenuItemType);

export const MenuType = PropTypes.shape({
    menu_id: PropTypes.string,
    is_active: PropTypes.bool,
    css_class: PropTypes.string,
    items: PropTypes.arrayOf(MenuItemType),
});
