export type LinkType = string;
export type LocationType = string;
export type UrlRewriteType = string;
// Runtime PropTypes are defined below; keep file as a module for compatibility
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

// Support for comtabilitiy

export const LocationType = PropTypes.shape({
    pathname: PropTypes.string,
    search: PropTypes.string,
    // eslint-disable-next-line react/forbid-prop-types
    state: PropTypes.object,
    hash: PropTypes.string,
    key: PropTypes.string,
});

export const HistoryType = PropTypes.shape({
    length: PropTypes.number,
    action: PropTypes.string,
    location: LocationType,
});

export const MatchType = PropTypes.shape({
    path: PropTypes.string,
    url: PropTypes.string,
    // eslint-disable-next-line react/forbid-prop-types
    params: PropTypes.object,
    isExact: PropTypes.bool,
});

export const UrlRewriteType = PropTypes.shape({
    id: PropTypes.number,
    type: PropTypes.string,
    sku: PropTypes.string,
    notFound: PropTypes.bool,
});

export const LinkType = PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.shape({
        pathname: PropTypes.string,
    }),
]);

export const NavigationStateType = PropTypes.shape(
    {
        name: PropTypes.string.isRequired,
        title: PropTypes.string,
    },
);

export const NavigationStateHistoryType = PropTypes.shape({
    navigationStateHistory: PropTypes.arrayOf(NavigationStateType),
    navigationState: NavigationStateType,
});
